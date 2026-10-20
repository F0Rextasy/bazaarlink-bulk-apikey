#!/usr/bin/env node
'use strict';

/**
 * bazaarlink-bulk-apikey — one BazaarLink account per key, any number of them.
 *
 * Usage:
 *   node cli.js --count N                 screen exits, mint, verify (default 30, no cap)
 *   node cli.js --verify-only             re-verify every key not yet proven
 *   node cli.js --verify-only --all       re-verify every key from scratch
 *   node cli.js --screen --chunk 200      only screen proxy exits
 *   node cli.js --help
 *
 * Everything routes through an HTTP(S)/SOCKS proxy from your pool file
 * (`proxies.txt` next to this repo, or BAZAARLINK_PROXIES); there is no direct
 * fallback. `--count` takes any number — 30 is just the default sample.
 */
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(require('fs').readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8').split('## ⚙️')[1] || 'see README.md');
  process.exit(0);
}

const child = args.includes('--screen')
  ? ['screen.js', ...args.filter((a) => a !== '--screen')]
  : args.includes('--verify-only')
    ? ['verify.js', ...args.filter((a) => a !== '--verify-only')]
    : ['run.js', ...args];

const res = spawnSync(process.execPath, [path.join(__dirname, child[0]), ...child.slice(1)], {
  windowsHide: true,
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
process.exit(res.status ?? 0);
