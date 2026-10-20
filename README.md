<div align="center">

```
███████╗ ██████╗ ██████╗ ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗   ██╗
██╔════╝██╔═████╗██╔══██╗██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝
█████╗  ██║██╔██║██████╔╝█████╗   ╚███╔╝    ██║   ███████║███████╗ ╚████╔╝
██╔══╝  ████╔╝██║██╔══██╗██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║  ╚██╔╝
██║     ╚██████╔╝██║  ██║███████╗██╔╝ ██╗   ██║   ██║  ██║███████║   ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝
```

# bazaarlink-bulk-apikey

**Mint [BazaarLink](https://bazaarlink.ai) accounts over REST — one account, one API key, verified live, exported one per line.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [✅ Verified](#-verified-working--every-key-is-tested) · [🤖 Models & free tier](#-models--free-tier) · [🧭 How it works](#-how-it-works) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

---

> **Mint as many accounts/keys as you need — there is no cap.** `--count N` (default `30`)
> accepts any N; the number is simply how many accounts this run should create.

## ✨ Why this exists

BazaarLink hands out a working API key from a single unauthenticated POST — no email, no password, no
phone, no card, no captcha:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   one key per line, written the moment each key is verified
              └─▶ outputs/   account, exit IP, proxy, verification record
                     │
                     ▼
     POST /v1/chat/completions  (qwen/qwen3.7-flash:free)  →  200, "pong", cost 0
```

The key is usable immediately, so the whole job is *scale*: **one registration per IP per 24 hours**
means every account needs its own exit. This tool screens proxy exits, registers one account per exit,
and refuses to write a key to `keys.txt` until that key has answered a live chat completion.

## 🤖 Models & free tier

`GET /v1/models` returns **124 models**, and every key reaches all of them.

**Free on a creditless account** (no claim, no top-up, no balance needed):

| Model | Context | Input |
| --- | --- | --- |
| `qwen/qwen3.7-flash:free` | 1M | text + image + video — the one used for verification here |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M | text |
| `auto:free` | — | router that picks a free model |

**Paid** (same key, needs credits — zero markup over provider list price): `gpt-5.6-sol`,
`gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`,
`gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`,
`qwen3.8-max`, and 110 more — the full 124-model catalogue is in [`models.json`](models.json).

**Free-tier limits, measured per account:** **10 RPM / 60 requests per day**, 2 concurrent, shared
across the free models, reset 00:00 UTC — and **20 RPM / 120 requests per day** once the account holds
a balance. On top of that the free models share a **site-wide capacity of 15 RPM**, so a busy hour can
answer `429` even when your own quota is untouched; the tool retries those with the server's
`Retry-After`. There is no charge for free-model calls (`cost: 0` on every completion).

**Want more of it?** The quota is per account, and `--count N` gives you N accounts — each with its own
daily 60 requests, its own concurrency and its own free-model windows. The only real resource is fresh
proxy exits.

> Each agent account comes with a **7-day claim token**. Claiming it in a browser attaches the account
> to a real login, which is what you need before adding credits or claiming the referral rebate.

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🛠 Quick start

```bash
git clone https://github.com/F0Rextasy/bazaarlink-bulk-apikey.git
cd bazaarlink-bulk-apikey

# 1) put your proxies next to the repo, one per line
#    http://host:port | socks5://host:port | host:port
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) go
node src/launcher.js          # interactive: mint / verify / screen / settings
# or directly:
node src/cli.js --count 30    # any N — 30 is just the default sample
```

Output lands in `keys.txt` (one key per line) and is mirrored to `%USERPROFILE%\bazaarlink-keys.txt`.

### 🖱️ The launcher

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ███████╗ ██████╗ ██████╗ ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗   ██╗  ║
║  ██╔════╝██╔═████╗██╔══██╗██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝  ║
║  █████╗  ██║██╔██║██████╔╝█████╗   ╚███╔╝    ██║   ███████║███████╗ ╚████╔╝   ║
║  ██╔══╝  ████╔╝██║██╔══██╗██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║  ╚██╔╝    ║
║  ██║     ╚██████╔╝██║  ██║███████╗██╔╝ ██╗   ██║   ██║  ██║███████║   ██║     ║
║  ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝     ║
║  bazaarlink-bulk-apikey                                                       ║
║  one BazaarLink account per key — any number                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  github.com/F0Rextasy · x.com/bigbullapp

  1) Mint keys      — screen exits, register accounts, verify keys
  2) Verify keys    — re-check every key with a live completion
  3) Screen proxies — test your proxy list for usable exits
  4) Settings       — show what this launcher remembers
  5) Help           — CLI options and notes
  q) Quit
```

The launcher remembers your answers in `launcher.config.json` and runs the CLI with the right flags.

### 🧭 How it works

```
src/screen.js  →  proxies.txt  ──probe──▶ live, distinct exits  →  outputs/exit-queue.json
src/mint.js    →  one POST per queued exit  ──▶  201 + api_key  →  outputs/state.json (key on disk at once)
src/verify.js  →  POST /v1/chat/completions on every unproven key  ──▶  keys.txt (only proven keys)
src/run.js     →  drives the three in checkpointed rounds until --count accounts exist
```

Every phase is a separate short-lived process, so a run that is interrupted never loses work — rerun
and it continues from the checkpoint.

## ✅ Verified working — every key is tested

Not a "probably works" list. Every key written to `keys.txt` is proven against the live API first:

| Check | Result |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** with `api_key` |
| Distinct egress IPs | **30/30 accounts — no account shares an exit** |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, real completion `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 models |

Re-check the whole list at any time:

```bash
node src/cli.js --verify-only        # verify anything not yet proven
node src/cli.js --verify-only --all  # re-verify every key from scratch
# or a single key:
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## ⚙️ CLI options

```bash
node src/cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node src/cli.js --verify-only [--all]     # re-verify unproven / all keys
node src/cli.js --screen --chunk 200      # only screen your proxy list
node src/cli.js --help
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--count N` | `30` | how many accounts to create — **any N**, there is no maximum |
| `--chunk N` | `120` | proxy lines to screen per round |
| `--rounds N` | `40` | max screen → mint → verify rounds |
| `--model m` | `qwen/qwen3.7-flash:free` | model used for the live verification |
| `--no-verify` | off | skip the completion check (not recommended) |

The underlying scripts (`src/screen.js`, `src/mint.js`, `src/verify.js`, `src/run.js`) take the same
flags and can be run on their own.

## 🛰️ Behind a proxy

**Required.** BazaarLink allows one registration per IP per 24h, so a single connection can produce one
account per day. The pool is read from `proxies.txt` next to the repo, or from `$BAZAARLINK_PROXIES`.

Every request uses `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 and HTTP
CONNECT all work. `undici`'s `fetch` is never used, because it ignores the `agent` option and would
silently leak your real IP.

Each proxy is screened live (API reachability) before it is queued, an exit already spent on an account
is never reused, and free exits decay within minutes — so screening runs in short checkpointed chunks
interleaved with minting rather than one long pass.

**There is no direct-connection fallback.** If the pool runs dry, the run stops and says so instead of
minting from your own IP.

## 📄 Files

| Path | Contents |
| --- | --- |
| `src/` | the CLI, the launcher, the four scripts (`screen.js`, `mint.js`, `verify.js`, `run.js`) and the proxy + redaction modules — plain Node, no dependencies |
| `keys.txt` | one key per line — git-ignored, never committed |
| [`models.json`](models.json) | the full 124-model catalogue |
| `outputs/accounts.json` | per-account record (name, exit, proxy, status, verification) with no raw keys |
| `outputs/state.json` | resumable run state (holds keys, git-ignored) |
| `outputs/exit-queue.json` | screened exits waiting to be spent |

## 🐞 Issues

BazaarLink's free pool is shared site-wide and does fill up at times; verification retries `429`s with
the server's `Retry-After` and a short backoff. If a run stalls, check `outputs/accounts.json` — it
records exactly which exits were spent and which failed. Something else looks off?
**[Open an issue](https://github.com/F0Rextasy/bazaarlink-bulk-apikey/issues)** with the command you
ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE). BazaarLink's own terms and rate limits apply to whatever you do
with the keys; use this for your own accounts.

<div align="center">

**[github.com/F0Rextasy](https://github.com/F0Rextasy)** · **[x.com/bigbullapp](https://x.com/bigbullapp)**

</div>
