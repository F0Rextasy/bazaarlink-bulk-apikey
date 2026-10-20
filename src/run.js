'use strict';
/**
 * Drives screen → mint → verify until `--count` accounts exist.
 *
 * Free proxy exits rot within minutes, so each round screens a fresh slice of
 * the pool, mints whatever accounts that slice supports, and verifies any key
 * left unproven. Each phase is a separate short-lived process, so an
 * interrupted round never loses work: every step checkpoints to disk.
 *
 *   node run.js                 # 30 accounts (default sample size)
 *   node run.js --count 200     # any N — there is no built-in maximum
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..');
const args = { count: 30, chunk: 120, rounds: 40 };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--count') args.count = Number(process.argv[++i]);
  else if (process.argv[i] === '--chunk') args.chunk = Number(process.argv[++i]);
  else if (process.argv[i] === '--rounds') args.rounds = Number(process.argv[++i]);
}
if (!Number.isFinite(args.count) || args.count < 1) {
  console.error('--count must be a positive number');
  process.exit(2);
}

const run = (script, argv) => spawnSync(process.execPath, [path.join(__dirname, script), ...argv], {
  windowsHide: true,
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

const accountsOnDisk = () => {
  const f = `${OUT}/outputs/state.json`;
  if (!fs.existsSync(f)) return 0;
  return JSON.parse(fs.readFileSync(f, 'utf8')).filter((a) => a.key).length;
};

const queueSize = () => {
  const f = `${OUT}/outputs/exit-queue.json`;
  if (!fs.existsSync(f)) return 0;
  const q = JSON.parse(fs.readFileSync(f, 'utf8'));
  const stateFile = `${OUT}/outputs/state.json`;
  const spent = new Set(fs.existsSync(stateFile)
    ? JSON.parse(fs.readFileSync(stateFile, 'utf8')).filter((a) => a.egress).map((a) => a.egress)
    : []);
  return q.entries.filter((e) => !spent.has(e.egress)).length;
};

for (let round = 1; round <= args.rounds; round++) {
  const have = accountsOnDisk();
  if (have >= args.count) { console.log(`\ndone: ${have} account(s) >= ${args.count}`); break; }
  console.log(`\n=== round ${round}: ${have}/${args.count} accounts, ${queueSize()} unused exits queued ===`);

  // verify first: unproven keys from earlier rounds get proven while exits are fresh
  run('verify.js', ['--model', 'qwen/qwen3.7-flash:free']);

  if (accountsOnDisk() >= args.count) break;

  const need = args.count - accountsOnDisk();
  if (queueSize() < need * 2) {
    const s = run('screen.js', ['--chunk', String(args.chunk), '--conc', '10', '--want', String(need * 2)]);
    if (s.status === 2) console.log('proxy pool exhausted');
  }

  run('mint.js', ['--count', String(args.count), '--model', 'qwen/qwen3.7-flash:free']);
}

const finalHave = accountsOnDisk();
const stateFile = `${OUT}/outputs/state.json`;
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : [];
const keys = state.filter((a) => a.key);
const verified = keys.filter((a) => a.verify?.ok);
console.log(`\n=== final: accounts=${keys.length} verified=${verified.length} distinct_exits=${new Set(keys.map((a) => a.egress)).size} (target ${args.count}, got ${finalHave}) ===`);
process.exit(finalHave >= args.count ? 0 : 1);