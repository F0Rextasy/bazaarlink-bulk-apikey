'use strict';
/**
 * Screens a slice of the proxy pool for live, distinct exits that reach the
 * BazaarLink API, and checkpoints the result. Short-lived by design: it exits
 * after `--chunk` proxies so a long sweep is a series of cheap processes rather
 * than one long-lived one.
 *
 *   node screen.js --chunk 200
 *   node screen.js --chunk 200 --want 90   # stop early once this many live exits exist
 *
 * Exit code: 0 = pool has more to screen, 2 = pool exhausted, 3 = want reached.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadProxyList, createAgent, label } = require('./proxy');

const API = 'api.bazaarlink.ai';
const OUT = path.join(__dirname, '..');
const QUEUE_FILE = `${OUT}/outputs/exit-queue.json`;
const POOLS = [
  process.env.BAZAARLINK_PROXIES || path.join(__dirname, '..', 'proxies.txt'),
  path.join(__dirname, '..', 'proxies.txt'),
].filter(Boolean);

const args = { chunk: 200, want: 0, conc: 12 };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--chunk') args.chunk = Number(process.argv[++i]);
  else if (process.argv[i] === '--want') args.want = Number(process.argv[++i]);
  else if (process.argv[i] === '--conc') args.conc = Number(process.argv[++i]);
}

function via(proxy, { host, path: p, timeoutMs = 12000 }) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: host, path: p, agent: createAgent(proxy),
      headers: { 'user-agent': 'curl/8.4.0', accept: '*/*' }, timeout: timeoutMs,
    }, (res) => {
      let d = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

function loadPool() {
  const all = [];
  const seen = new Set();
  for (const f of POOLS) {
    if (!fs.existsSync(f)) continue;
    for (const p of loadProxyList(f)) {
      const id = `${p.protocol}://${p.host}:${p.port}`;
      if (seen.has(id)) continue;
      seen.add(id);
      all.push({ ...p, id });
    }
  }
  return all;
}

(async () => {
  fs.mkdirSync(`${OUT}/outputs`, { recursive: true });
  const queue = fs.existsSync(QUEUE_FILE) ? JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')) : { cursor: 0, egresses: [], entries: [] };
  const pool = loadPool();
  const seenEgress = new Set(queue.entries.map((e) => e.egress));

  // exits already spent on an account do not count toward the target
  const stateFile = `${OUT}/outputs/state.json`;
  const spent = new Set(fs.existsSync(stateFile)
    ? JSON.parse(fs.readFileSync(stateFile, 'utf8')).filter((a) => a.egress).map((a) => a.egress)
    : []);
  const unused = queue.entries.filter((e) => !spent.has(e.egress)).length;
  if (args.want && unused >= args.want) { console.log(`queue already has ${unused} unused exits`); process.exit(3); }
  if (queue.cursor >= pool.length) { console.log(`pool exhausted at ${queue.cursor}/${pool.length}`); process.exit(2); }

  const start = queue.cursor;
  const slice = pool.slice(start, start + args.chunk);
  console.log(`screening pool[${start}..${start + slice.length}) of ${pool.length}, concurrency ${args.conc}`);

  let done = 0;
  const add = async (proxy) => {
    const ip = await via(proxy, { host: 'api.ipify.org', path: '/?format=json' });
    if (ip.error || ip.status !== 200) { done++; return; }
    let egress;
    try { egress = JSON.parse(ip.body).ip; } catch { done++; return; }
    if (seenEgress.has(egress)) { done++; return; }
    const api = await via(proxy, { host: API, path: '/v1/models', timeoutMs: 18000 });
    done++;
    if (api.error || api.status !== 200) return;
    seenEgress.add(egress);
    queue.entries.push({ proxy: proxy.id, egress });
    console.log(`  + ${egress} via ${label(proxy)} (${done}/${slice.length})`);
  };

  let i = 0;
  await Promise.all(Array.from({ length: Math.min(args.conc, slice.length) }, async () => {
    while (i < slice.length) await add(slice[i++]);
  }));


  queue.cursor = start + slice.length;
  queue.egresses = [...seenEgress];
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log(`chunk done: cursor=${queue.cursor}/${pool.length} live exits=${queue.entries.length} (${unused} unused)`);

  if (queue.cursor >= pool.length) process.exit(2);
  if (args.want && unused >= args.want) process.exit(3);
  process.exit(0);
})();