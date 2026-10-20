#!/usr/bin/env node
'use strict';

/**
 * Interactive launcher for the CLI.
 *
 * It asks for the options people most often get wrong, remembers the answers
 * in `launcher.config.json`, and then runs the CLI with the right flags —
 * including the proxy list, which is the setting needed most and guessed least.
 *
 * Usage: node launcher.js            (menu)
 *        node launcher.js --help
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const CONFIG = path.join(__dirname, '..', 'launcher.config.json');
const CLI = path.join(__dirname, 'cli.js');

const defaults = {
  count: 30,
  chunk: 200,
  proxyFile: process.env.BAZAARLINK_PROXIES || 'proxies.txt',
};

function loadConfig() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) };
  } catch (e) {
    return { ...defaults };
  }
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n');
  } catch (e) {
    console.error(`  ! could not write ${path.basename(CONFIG)}: ${e.message}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question, fallback) =>
  new Promise((resolve) => {
    const hint = fallback ? ` [${String(fallback).slice(0, 30)}${String(fallback).length > 30 ? '…' : ''}]` : '';
    rl.question(`  ${question}${hint}: `, (answer) => resolve(answer.trim() || fallback || ''));
  });

function run(args) {
  console.log('');
  const res = spawnSync(process.execPath, [CLI, ...args], { windowsHide: true, cwd: __dirname, stdio: 'inherit' });
  if (res.status !== 0) console.log(`  ! exited with code ${res.status}`);
}

const BANNER_LOGO = String.raw`
███████╗ ██████╗ ██████╗ ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗   ██╗
██╔════╝██╔═████╗██╔══██╗██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝
█████╗  ██║██╔██║██████╔╝█████╗   ╚███╔╝    ██║   ███████║███████╗ ╚████╔╝
██╔══╝  ████╔╝██║██╔══██╗██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║  ╚██╔╝
██║     ╚██████╔╝██║  ██║███████╗██╔╝ ██╗   ██║   ██║  ██║███████║   ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝
`;

function banner() {
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const lines = BANNER_LOGO.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const width = Math.max(...lines.map((l) => [...l].length));
  const pad = (s) => s + ' '.repeat(width - [...s].length);
  const inner = width + 4;
  console.log('');
  console.log(`${cyan}╔${'═'.repeat(inner)}╗${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  for (const line of lines) console.log(`${cyan}║${reset}  ${bold}${pad(line)}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}║${reset}  ${pad('bazaarlink-bulk-apikey')}  ${cyan}║${reset}`);
  console.log(`${cyan}║${reset}  ${dim}${pad('one BazaarLink account per key — any number')}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}╚${'═'.repeat(inner)}╝${reset}`);
  console.log(`  ${dim}github.com/F0Rextasy · x.com/bigbullapp${reset}`);
  console.log('');
}

async function mintFlow(cfg) {
  cfg.count = parseInt(await ask('How many accounts/keys do you want (any number)', cfg.count), 10) || cfg.count;
  cfg.chunk = parseInt(await ask('Proxy exits to screen per round', cfg.chunk), 10) || cfg.chunk;
  cfg.proxyFile = await ask('Proxy list file (one proxy per line)', cfg.proxyFile);
  saveConfig(cfg);

  if (!fs.existsSync(path.resolve(__dirname, '..', cfg.proxyFile)) && !fs.existsSync(cfg.proxyFile)) {
    console.log(`  ! ${cfg.proxyFile} not found — put one proxy per line there first`);
    console.log('    (http://host:port, socks5://host:port or host:port)');
    return;
  }
  process.env.BAZAARLINK_PROXIES = cfg.proxyFile;
  run(['--count', String(cfg.count), '--chunk', String(cfg.chunk)]);
}

async function verifyFlow(cfg) {
  cfg.proxyFile = await ask('Proxy list file', cfg.proxyFile);
  saveConfig(cfg);
  process.env.BAZAARLINK_PROXIES = cfg.proxyFile;
  const all = await ask('Re-verify every key from scratch? (y/N)', 'N');
  run(['--verify-only', ...(/^y/i.test(all) ? ['--all'] : [])]);
}

async function screenFlow(cfg) {
  cfg.chunk = parseInt(await ask('How many proxy lines to screen now', cfg.chunk), 10) || cfg.chunk;
  saveConfig(cfg);
  const proxies = fs.readdirSync(path.resolve(__dirname, '..')).filter((f) => /^prox/.test(f));
  console.log(`  proxy files next to the repo: ${proxies.join(', ') || '(none)'}`);
  run(['--screen', '--chunk', String(cfg.chunk)]);
}

async function main() {
  const cfg = loadConfig();
  banner();
  console.log('  1) Mint keys      — screen exits, register accounts, verify keys');
  console.log('  2) Verify keys    — re-check every key with a live completion');
  console.log('  3) Screen proxies — test your proxy list for usable exits');
  console.log('  4) Settings       — show what this launcher remembers');
  console.log('  5) Help           — CLI options and notes');
  console.log('  q) Quit\n');
  const choice = (await ask('Choose', '1')).toLowerCase();

  if (choice === '1') await mintFlow(cfg);
  else if (choice === '2') await verifyFlow(cfg);
  else if (choice === '3') await screenFlow(cfg);
  else if (choice === '4') console.log('\n' + JSON.stringify(cfg, null, 2));
  else if (choice === '5') run(['--help']);
  rl.close();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Interactive launcher: run `node launcher.js` and pick a menu item.');
  process.exit(0);
}

main().catch((e) => {
  console.error('[fatal]', e.message);
  process.exit(1);
});
