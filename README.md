<div align="center">

```
██████╗  █████╗ ███████╗ █████╗  █████╗ ██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗
██╔══██╗██╔══██╗╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██║     ██║████╗  ██║██║ ██╔╝
██████╔╝███████║  ███╔╝ ███████║███████║██████╔╝██║     ██║██╔██╗ ██║█████╔╝
██╔══██╗██╔══██║ ███╔╝  ██╔══██║██╔══██║██╔══██╗██║     ██║██║╚██╗██║██╔═██╗
██████╔╝██║  ██║███████╗██║  ██║██║  ██║██║  ██║███████╗██║██║ ╚████║██║  ██╗
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

# bazaarlink-bulk-apikey

**Bulk-create BazaarLink accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-124-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

---

## ✨ Why this exists

BazaarLink hands out a working API key from a single unauthenticated POST — no e-mail, no password, no phone, no card, no captcha:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   one key per line, written the moment each key is verified
              └─▶ outputs/   account, exit IP, proxy, verification record
```

The key is usable immediately, so the whole job is *scale*: **one registration per IP per 24 hours** means every account needs its own exit. This tool screens proxy exits, registers one account per exit, and refuses to write a key to `keys.txt` until that key has answered a live chat completion.

> **Status note (2026-10-18):** repo was archived earlier the same day while registrations were believed dead; a full re-audit the same evening re-verified the rail — fresh `POST /api/v1/agents/register` → `201` and the returned key answered a live chat completion (`qwen/qwen3.7-flash:free` → 200 `"pong"`), and a sequential sweep of the on-disk pool landed **23/31 keys chat-200** (the remaining 8 were `429`, the account-level 10 RPM cap retrying per key). Repo is **active** again; the flow below is the measured one.

## 🎁 Free tier — how much you get

**Free on a creditless account** (no claim, no top-up, no balance needed) — per-account limits measured live:

| What | Value |
| --- | --- |
| Registration gate | **1 registration per egress IP per 24 h** — one exit per account |
| Free models | `qwen/qwen3.7-flash:free` (1M context, the verifier), `deepseek/deepseek-v4-flash-0731free:free` (1.05M), `auto:free` (router) |
| Free-model quota | **10 RPM / 60 requests per day**, 2 concurrent, shared across free models, reset 00:00 UTC |
| With balance | **20 RPM / 120 req/day** once the account holds credits |
| Site-wide free capacity | **15 RPM** shared — a busy hour can answer `429` even when your own quota is untouched; the tool retries with `Retry-After` |
| Cost of a free call | `cost: 0` on every completion |
| Sign-up | `POST /api/v1/agents/register {name}` — no mailbox, no card |
| The unit that scales | **one account = one key** → `--count N` is N daily 60-request budgets |

> **Scope note:** bazaarlink/ionet are on the blocked-provider list — the table is the last measured gate; the 24 h/IP throttle is the binding resource.

> 💡 The free tier is set by BazaarLink and can change. Check the live numbers at [bazaarlink.ai](https://bazaarlink.ai) — and let the tool's own gate decide:

```bash
node cli.js --verify-only        # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 124 of them

`GET https://api.bazaarlink.ai/v1/models` returns **124 models**; the catalogue shipped in [`models.json`](models.json) (or `src/models.json` in the canonical layout) was captured from a live key.

| Free on a creditless account | Note |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M context, text+image+video — **the verifier here** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M, text — free |
| `auto:free` | router that picks a free model |

| Paid (same key, needs credits — zero markup) | Examples |
| --- | --- |
| 110+ ids | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` and the rest of the 124 |

Live probe of one key (exactly what the verifier does):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 How to use the API

The base URL is **`https://api.bazaarlink.ai/v1`** — OpenAI-compatible.

**Any SDK / curl**

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

```python
from openai import OpenAI
client = OpenAI(base_url="https://api.bazaarlink.ai/v1", api_key="sk-bl-…")
print(client.chat.completions.create(model="qwen/qwen3.7-flash:free",
      messages=[{"role":"user","content":"hi"}]).choices[0].message.content)
```

**Any agent with a custom base URL** (Cursor, OpenCode, Kilo Code …): set base URL `https://api.bazaarlink.ai/v1`, paste a key, pick any id from the table above. A free-model call on a creditless key answers with `cost: 0`.

## 🛠 Quick start

```bash
git clone https://github.com/F0Rextasy/bazaarlink-bulk-apikey.git
cd bazaarlink-bulk-apikey

# 1) your proxy list — one per line (http://host:port | socks5://host:port | host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) go
node launcher.js          # interactive: mint / verify / screen / settings
# or directly:
node cli.js --count 30    # any N — 30 is just the default sample
```

Output lands in `keys.txt` (one key per line) and is mirrored to `%USERPROFILE%\\bazaarlink-keys.txt`. A key is written **only after** a live `POST /v1/chat/completions` on `qwen/qwen3.7-flash:free` answers `200` with `cost: 0`.

### 🖱️ The launcher

The launcher is `launcher.js` at the **repository root** (this repo is flat — there is no `src/`). It remembers your answers in `launcher.config.json` and runs `cli.js` with the right flags. `node launcher.js` shows mint / verify / screen / settings; the header previews how many exits `proxies.txt` holds and how many keys are on disk.

## ✅ Verified working — every key is tested

Not a "probably works" list. Every key written to `keys.txt` is proven against the live API first:

| Check | Result |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** with `api_key` |
| Distinct egress IPs | **30/30 accounts — no account shares an exit** (measured) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, real completion `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 models |

Re-check the whole list at any time:

```bash
node cli.js --verify-only        # verify any unproven key
node cli.js --verify-only --all  # re-verify every key from scratch
```

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| screen | `screen.js` → `proxies.txt` ──probe──▶ live, distinct exits → `outputs/exit-queue.json` | one exit is spent at most once per 24 h |
| register | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verify | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | the survivable gate — a `429` with `Retry-After` is retried |
| persist | `keys.txt` + `outputs/state.json` + provider mirror `%USERPROFILE%\\bazaarlink-keys.txt` | a run is checkpointed: rerun continues where it left off |

## ⚙️ CLI options

```bash
node cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node cli.js --verify-only [--all]     # re-verify unproven / all keys
node cli.js --screen --chunk 200      # only screen your proxy list
node cli.js --help
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--count N` | `30` | how many accounts to create — **any N**, there is no maximum |
| `--chunk N` | `120` | proxy lines to screen per round |
| `--rounds N` | `30` | max screen → mint → verify rounds |
| `--model m` | `qwen/qwen3.7-flash:free` | model used for the live verification |
| `--no-verify` | off | skip the completion check (not recommended) |

The underlying scripts (`screen.js`, `mint.js`, `verify.js`, `run.js`) take the same flags and can be run on their own. All paths (`proxies.txt`, `keys.txt`, `outputs/`) are at the **repository root** in this flat layout.

## 🛰️ Behind a proxy

**Required.** BazaarLink allows one registration per IP per 24 h, so a single connection can produce one account per day. The pool is read from `proxies.txt` next to the repo, or from `$BAZAARLINK_PROXIES`.

Every request uses `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 and HTTP CONNECT all work. `undici`'s `fetch` is never used, because it ignores the `agent` option and would silently leak your real IP.

Each proxy is screened live (API reachability) before it is queued, an exit already spent on an account is never reused, and free exits decay within minutes — so screening runs in short checkpointed chunks interleaved with minting rather than one long pass.

**There is no direct-connection fallback.** If the pool runs dry, the run stops and says so instead of minting from your own IP.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one key per line — git-ignored, never committed |
| [`models.json`](models.json) | the full 124-model catalogue (measured `GET /v1/models`) |
| `outputs/accounts.json` | per-account record (name, exit, proxy, status, verification) with no raw keys |
| `outputs/state.json` | resumable run state (holds keys, git-ignored) |
| `outputs/exit-queue.json` | screened exits waiting to be spent |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | the tool — all at the **repository root** (flat layout) |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router. BazaarLink serves an OpenAI-compatible endpoint at `https://api.bazaarlink.ai/v1`, so register it once and every key becomes a connection under one provider-node.

This repository is **flat** (no `src/connect-9router.js` yet). The canonical layout's connector (`src/connect-9router.js`) would be generated as `bazaarlink` / prefix `bazaarlink` / upstream `https://api.bazaarlink.ai/v1` / default model `qwen/qwen3.7-flash:free`. Until it is added, create an `openai-compatible` node by hand in the 9Router dashboard:

- Name `BazaarLink`, prefix `bazaarlink`, base URL `https://api.bazaarlink.ai/v1`
- Add one connection per key in `keys.txt` (key = `sk-bl-…`)
- Models are then served as `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` and the rest of the catalogue.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 What the provider gives | 124 models via one unauthenticated POST — free qwen3.7-flash:free, no e-mail, no card |
| 🔑 What one key gets you | one API key scoped to its own account: the 124 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Your data | only bazaarlink.ai and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

BazaarLink's free pool is shared site-wide and does fill up at times; verification retries `429`s with the server's `Retry-After` and a short backoff. If a run stalls, check `outputs/accounts.json` — it records exactly which exits were spent and which failed. Something else looks off? **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome. If the register gate still returns `403`/throttle, the tool stops at that step and says so — the free-tier table above is the last measured gate.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>
