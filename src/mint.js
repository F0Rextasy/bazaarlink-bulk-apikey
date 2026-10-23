'use strict';
/**
 * BazaarLink account mint — one account per distinct proxy exit.
 *
 * BazaarLink allows 1 agent registration per IP per 24h, so every account needs
 * its own exit. Exits are screened separately by `screen.js` (free proxies
 * rot within minutes, so screening is a fresh, checkpointed step) and this
 * script walks that queue, registering one account per exit.
 *
 * `--count N` takes any N — 30 is this repo's verified sample, not a cap. Mint
 * as many accounts as you need; there is no built-in maximum.
 *
 *   node mint.js                  # 30 accounts (default sample size)
 *   node mint.js --count 200      # 200 accounts, or any other number
 *
 * Egress: every request goes through https.request + createAgent(parseProxy(p)).
 * undici's fetch ignores `agent`, so it is never used. There is no direct
 * connection fallback — the run stops and says so when the exit queue runs dry.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseProxy, loadProxyList, createAgent, label } = require('./proxy');
const { redactAccounts } = require('./redact');

process.on('unhandledRejection', (e) => { console.error('UNHANDLED_REJECTION', e); process.exit(1); });
process.on('uncaughtException', (e) => { console.error('UNCAUGHT_EXCEPTION', e); process.exit(1); });

const API = 'api.bazaarlink.ai';
const REGISTER_PATH = '/api/v1/agents/register';
const OUT = path.join(__dirname, '..');
const QUEUE_FILE = `${OUT}/outputs/exit-queue.json`;
const DEFAULT_COUNT = 30;

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

// ------------------------------------------------------------------- args

function parseArgs(argv) {
  const a = { count: DEFAULT_COUNT, model: 'qwen/qwen3.7-flash:free', verify: true };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--count') a.count = Number(argv[++i]);
    else if (k === '--model') a.model = argv[++i];
    else if (k === '--no-verify') a.verify = false;
  }
  if (!Number.isFinite(a.count) || a.count < 1) throw new Error('--count must be a positive number');
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------------- http

function request(proxy, { path: p, method = 'GET', headers = {}, body, timeoutMs = 30000 }) {
  return new Promise((resolve) => {
    const payload = body == null ? null : Buffer.from(body);
    const req = https.request({
      hostname: API,
      path: p,
      method,
      agent: createAgent(proxy),
      headers: {
        'user-agent': 'curl/8.4.0',
        accept: '*/*',
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

// --------------------------------------------------------------- register

async function register(proxy, egress, index) {
  const name = `api-mint-${String(index + 1).padStart(3, '0')}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await request(proxy, {
    path: REGISTER_PATH,
    method: 'POST',
    body: JSON.stringify({ name, description: 'OpenAI-compatible API access' }),
    timeoutMs: 40000,
  });
  let json = null;
  try { json = JSON.parse(res.body); } catch { /* body kept raw */ }
  return {
    name,
    egress,
    proxy: label(proxy),
    status: res.error ? `ERR:${res.error}` : res.status,
    key: json?.api_key || json?.apiKey || json?.key || null,
    raw: json ? undefined : String(res.body).slice(0, 400),
    retryAfter: res.headers?.['retry-after'],
  };
}

// ----------------------------------------------------------------- verify

/** A key counts as verified only on 200 with real content, not on a bare 200. */
async function verifyKey(key, model, proxy, attempts = 3) {
  let last = { ok: false, status: 'n/a', content: null, body: '' };
  for (let i = 0; i < attempts; i++) {
    const res = await request(proxy, {
      path: '/v1/chat/completions',
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
        max_tokens: 16,
        temperature: 0,
      }),
      headers: { authorization: `Bearer ${key}` },
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
    last = { ok: status === 200 && !!content, status, content, cost, body: res.error || res.body.slice(0, 300) };
    if (last.ok) return last;
    if (status === 429) { await sleep((Number(res.headers?.['retry-after'] || 20)) * 1000 + 3000); continue; }
    if (String(status).startsWith('ERR')) { await sleep(4000); continue; } // dead proxy, try again once
    return last;
  }
  return last;
}

async function listModels(key, proxy) {
  const res = await request(proxy, { path: '/v1/models', headers: { authorization: `Bearer ${key}` }, timeoutMs: 40000 });
  try { return JSON.parse(res.body); } catch { return { error: res.error || res.body.slice(0, 300) }; }
}

// ------------------------------------------------------------------ main

(async () => {
  const args = parseArgs(process.argv);
  const log = console.log;

  fs.mkdirSync(`${OUT}/outputs`, { recursive: true });
  const keysFile = `${OUT}/keys.txt`;
  const stateFile = `${OUT}/outputs/state.json`;
  const queueFile = QUEUE_FILE;

  const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : [];
  if (!fs.existsSync(queueFile)) {
    log(`no exit queue yet — run: node ${path.basename(__dirname)}/screen.js --chunk 200`);
    process.exit(1);
  }
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const spentEgress = new Set(state.filter((a) => a.egress).map((a) => a.egress));

  const have = state.filter((a) => a.key).length;
  log(`accounts on disk: ${have}; target: ${args.count}; unused exits queued: ${queue.entries.filter((e) => !spentEgress.has(e.egress)).length}`);
  if (have >= args.count) { log('target already reached'); }

  // every exit touched this run is retired from the queue: spent on an account,
  // or dead by the time we got to it — either way it must not be retried
  const attempted = new Set();
  const retire = () => {
    queue.entries = queue.entries.filter((e) => !attempted.has(e.egress));
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
  };

  for (const entry of queue.entries) {
    if (state.filter((a) => a.key).length >= args.count) break;
    if (spentEgress.has(entry.egress)) { attempted.add(entry.egress); continue; }

    const proxy = parseProxy(entry.proxy);
    const acct = await register(proxy, entry.egress, state.length);
    attempted.add(entry.egress);

    if (!acct.key) {
      log(`FAIL exit=${entry.egress} via ${label(proxy)} status=${acct.status}${acct.retryAfter ? ` retry-after=${acct.retryAfter}` : ''} ${acct.raw || ''}`);
      state.push(acct);
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      retire();
      continue;
    }

    acct.keyMasked = `${acct.key.slice(0, 8)}…${acct.key.slice(-4)}`;
    state.push(acct);
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2)); // key hits disk immediately
    spentEgress.add(entry.egress);
    retire();
    log(`ok ${state.filter((a) => a.key).length}/${args.count} exit=${entry.egress} via ${label(proxy)} key=${acct.keyMasked}`);

    if (args.verify) {
      const v = await verifyKey(acct.key, args.model, proxy);
      acct.verify = v;
      log(`     verify ${v.ok ? 'OK' : 'FAIL'} status=${v.status} content=${JSON.stringify(v.content)} cost=${v.cost}${v.ok ? '' : ` ${v.body}`}`);
      if (deadVerdict(v.status, v.ok)) recordDeadKey(acct.key, `chat ${v.status}`);
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }
    await sleep(1500);
  }
  retire();

  const withKey = state.filter((a) => a.key);
  const uniqKeys = [...new Set(withKey.map((a) => a.key))];
  // never blank keys.txt: a run that minted nothing must not destroy earlier keys
  if (uniqKeys.length) fs.writeFileSync(keysFile, uniqKeys.map((k) => `${k}\n`).join('')); // rebuilt + deduped, never appended twice
  const verified = withKey.filter((a) => a.verify?.ok);
  log(`\naccounts=${uniqKeys.length} verified=${verified.length} distinct_exits=${new Set(withKey.map((a) => a.egress)).size}`);

  // state.json holds raw keys exactly like keys.txt; the readable record does not
  fs.writeFileSync(`${OUT}/outputs/accounts.json`, JSON.stringify(redactAccounts(state), null, 2));

  const sample = withKey.find((a) => a.verify?.ok);
  if (sample) {
    try {
      const entry = queue.entries.find((e) => e.egress === sample.egress);
      const fallback = loadProxyList(process.env.BAZAARLINK_PROXIES || path.join(__dirname, '..', 'proxies.txt'))[0];
      const models = await listModels(sample.key, parseProxy(entry ? entry.proxy : fallback.raw));
      fs.writeFileSync(`${OUT}/outputs/models.json`, JSON.stringify(models, null, 2));
      log(`models: ${(models?.data || []).length}`);
    } catch (e) { log(`models lookup skipped: ${e.message}`); }
  }

  if (uniqKeys.length) {
    try {
      fs.copyFileSync(keysFile, path.join(process.env.USERPROFILE || '.', 'bazaarlink-keys.txt'));
      log(`mirrored -> %USERPROFILE%\\bazaarlink-keys.txt (${uniqKeys.length} lines)`);
    } catch (e) { log(`mirror failed: ${e.message}`); }
  }
})();