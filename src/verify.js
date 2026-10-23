'use strict';
/**
 * Re-verifies every account key in `outputs/state.json` that is not yet proven,
 * each through a live proxy exit. Kept separate from `mint.js` so a long run can
 * be interrupted and verification resumed without re-minting anything.
 *
 *   node verify.js            # verify every unverified key
 *   node verify.js --all      # re-verify every key from scratch
 *   node verify.js --model qwen/qwen3.7-flash:free
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseProxy, loadProxyList, createAgent, label } = require('./proxy');
const { redactAccounts } = require('./redact');

const API = 'api.bazaarlink.ai';
const OUT = path.join(__dirname, '..');

/** Dead keys leave keys.txt and are parked here — repo root, like keys.txt. */
const KEYS_DEAD_FILE = path.join(OUT, 'keys-dead.txt');
/** A verdict only a dead key can answer — 0 (transport), 429 and 5xx are excluded. */
const deadVerdict = (status, ok) => !ok && status !== 0 && status !== 429 && status < 500;
/** key<TAB>reason<TAB>ISO date, one line per dead key, parked next to keys.txt. */
function recordDeadKey(key, reason) {
  try {
    fs.appendFileSync(KEYS_DEAD_FILE, `${key}\t${String(reason).replace(/\s+/g, ' ').slice(0, 100)}\t${new Date().toISOString()}\n`);
  } catch (e) { /* diagnostics must never break the run */ }
}
const POOLS = [
  process.env.BAZAARLINK_PROXIES || path.join(__dirname, '..', 'proxies.txt'),
  path.join(__dirname, '..', 'proxies.txt'),
].filter(Boolean);

const args = { model: 'qwen/qwen3.7-flash:free', all: false };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--model') args.model = process.argv[++i];
  else if (process.argv[i] === '--all') args.all = true;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function request(proxy, { path: p, method = 'GET', headers = {}, body, timeoutMs = 45000 }) {
  return new Promise((resolve) => {
    const payload = body == null ? null : Buffer.from(body);
    const req = https.request({
      hostname: API, path: p, method, agent: createAgent(proxy),
      headers: {
        'user-agent': 'curl/8.4.0', accept: '*/*',
        ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
        ...headers,
      },
      timeout: timeoutMs,
    }, (res) => {
      let d = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve({ error: e.message }));
    if (payload) req.write(payload);
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

/** Any live proxy will do for verification — verification is not IP-limited. */
let poolCursor = 0;

/** Any live proxy will do — verification is not IP-limited. Screens in parallel, keeping a cursor. */
async function liveProxy(pool) {
  const CONC = 20;
  for (let attempt = 0; attempt < 15; attempt++) {
    if (poolCursor >= pool.length) poolCursor = 0;
    const batch = [];
    while (batch.length < CONC && batch.length + poolCursor <= pool.length) batch.push(pool[poolCursor++]);
    if (!batch.length) { poolCursor = 0; continue; }
    const results = await Promise.all(batch.map((p) => request(p, { path: '/v1/models', timeoutMs: 12000 })
      .then((r) => (r.error || r.status !== 200 ? null : p))));
    const hit = results.find(Boolean);
    if (hit) return hit;
  }
  return null;
}

(async () => {
  const stateFile = `${OUT}/outputs/state.json`;
  if (!fs.existsSync(stateFile)) { console.log('no accounts minted yet — run mint.js first'); return; }
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const keys = state.filter((a) => a.key && (args.all || !a.verify?.ok));
  if (!keys.length) { console.log('nothing to verify'); return; }
  console.log(`verifying ${keys.length} key(s) on ${args.model}`);

  const pool = loadPool();
  let ok = 0;

  for (const [i, acct] of keys.entries()) {
    let result = { ok: false, status: 'n/a', content: null, body: 'no proxy' };
    for (let attempt = 0; attempt < 4; attempt++) {
      const proxy = await liveProxy(pool);
      if (!proxy) { result = { ok: false, status: 'no-proxy', content: null, body: 'proxy pool exhausted' }; break; }
      const res = await request(proxy, {
        path: '/v1/chat/completions',
        method: 'POST',
        body: JSON.stringify({
          model: args.model,
          messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
          max_tokens: 16,
          temperature: 0,
        }),
        headers: { authorization: `Bearer ${acct.key}` },
        timeoutMs: 60000,
      });
      const status = res.error ? `ERR:${res.error}` : res.status;
      let content = null;
      let cost = null;
      try {
        const j = JSON.parse(res.body);
        content = j?.choices?.[0]?.message?.content ?? null;
        cost = j?.usage?.cost ?? null;
      } catch { /* keep null */ }
      result = { ok: status === 200 && !!content, status, content, cost, body: res.error || res.body.slice(0, 200), via: label(proxy) };
      if (deadVerdict(status, result.ok)) recordDeadKey(acct.key, `chat ${status}`);
      if (result.ok || status === 401 || status === 403) break;
      if (status === 429) { await sleep((Number(res.headers?.['retry-after'] || 20)) * 1000 + 3000); continue; }
    }
    acct.verify = result;
    if (result.ok) ok++;
    console.log(`${i + 1}/${keys.length} ${acct.keyMasked || acct.key.slice(0, 8) + '…'} -> ${result.ok ? 'OK' : 'FAIL'} ${result.status} ${JSON.stringify(result.content)}${result.ok ? '' : ` ${result.body}`}`);
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    await sleep(1200);
  }

  const all = state.filter((a) => a.key);
  console.log(`\nverified ${ok}/${keys.length} this run; ${all.filter((a) => a.verify?.ok).length}/${all.length} keys proven overall`);
  fs.writeFileSync(`${OUT}/outputs/accounts.json`, JSON.stringify(redactAccounts(state), null, 2));
})();