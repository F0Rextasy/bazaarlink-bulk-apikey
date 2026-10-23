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

**批量创建 BazaarLink 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-124-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

BazaarLink 只需一个未经身份验证的 POST 请求就能发放一个可用的 API 密钥 —— 无需邮箱、无需密码、无需手机号、无需银行卡、无需验证码：

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   每行一个密钥，每个密钥一经验证即刻写入
              └─▶ outputs/   账户、出口 IP、代理、验证记录
```

密钥可立即使用，因此整个任务的关键在于*规模*：**每个 IP 每 24 小时只能注册一次**，这意味着每个账户都需要自己的出口。本工具会筛选代理出口，为每个出口注册一个账户，并且在密钥通过一次实时聊天补全验证之前，拒绝将其写入 `keys.txt`。

> **历史说明：** 该提供商自 2026-10-18 起已被列入工作区黑名单。以下流程按实测保留 —— 如果上游日后恢复注册，相同的步骤依然适用。

## 🎁 免费额度 —— 你能获得多少

**无余额账户免费可用**（无需领取、无需充值、无需余额）—— 实测的每账户限制：

| 项目 | 值 |
| --- | --- |
| 注册门槛 | **每个出口 IP 每 24 小时 1 次注册** —— 每个账户一个出口 |
| 免费模型 | `qwen/qwen3.7-flash:free`（1M 上下文，验证器）、`deepseek/deepseek-v4-flash-0731free:free`（1.05M）、`auto:free`（路由器） |
| 免费模型配额 | **10 RPM / 每天 60 次请求**，2 个并发，免费模型共享，UTC 00:00 重置 |
| 有余额时 | 账户持有额度后为 **20 RPM / 每天 120 次请求** |
| 全站免费容量 | 共享 **15 RPM** —— 即使你自己的配额未用尽，高峰时段也可能返回 `429`；本工具会依据 `Retry-After` 重试 |
| 一次免费调用的成本 | 每次补全均为 `cost: 0` |
| 注册 | `POST /api/v1/agents/register {name}` —— 无需邮箱，无需银行卡 |
| 可扩展的单元 | **一个账户 = 一个密钥** → `--count N` 即 N 份每天 60 次请求的预算 |

> **范围说明：** bazaarlink/ionet 在受限提供商名单上 —— 上表是最后一次实测的门槛；24 小时/IP 限流是约束性资源。

> 💡 免费额度由 BazaarLink 设定，可能发生变化。请在 [bazaarlink.ai](https://bazaarlink.ai) 查看实时数据 —— 并让工具自身的门槛来判定：

```bash
node src/cli.js --verify-only     # keys.txt 中的每个密钥都会用真实聊天调用重新测试
```

## 🤖 模型 —— 全部 124 个

`GET https://api.bazaarlink.ai/v1/models` 返回 **124 个模型**；随附于 [`models.json`](models.json)（或规范布局中的 `src/models.json`）的目录是从一个实时密钥抓取的。

| 无余额账户免费可用 | 说明 |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M 上下文，文本+图像+视频 —— **此处的验证器** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M，文本 —— 免费 |
| `auto:free` | 自动挑选免费模型的路由器 |

| 付费（同一密钥，需要额度 —— 零加价） | 示例 |
| --- | --- |
| 110+ 个 id | `gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-5.6-luna`、`claude-opus-5`、`claude-sonnet-5.5`、`claude-fable-5.1`、`gemini-3.8-flash`、`gemini-3.7-flash`、`grok-4.7`、`kimi-k3`、`glm-5.3`、`deepseek-v4-pro`、`qwen3.8-max` 以及其余共 124 个 |

对一个密钥的实时探测（正是验证器所做的事）：

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 如何使用 API

基础 URL 为 **`https://api.bazaarlink.ai/v1`** —— 兼容 OpenAI。

**任意 SDK / curl**

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

**任何支持自定义基础 URL 的智能体**（Cursor、OpenCode、Kilo Code 等）：将基础 URL 设为 `https://api.bazaarlink.ai/v1`，粘贴一个密钥，从上面的表格中任选一个 id。在无余额密钥上调用免费模型会返回 `cost: 0`。

## 🛠 快速开始

```bash
git clone https://github.com/F0Rextasy/bazaarlink-bulk-apikey.git
cd bazaarlink-bulk-apikey

# 1) your proxy list — one per line (http://host:port | socks5://host:port | host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) go
node src/launcher.js      # interactive: mint / verify / screen / settings

# or directly:
node src/cli.js --count 30    # any N — 30 is just the default sample
```

输出写入 `keys.txt`（每行一个密钥），并镜像到 `%USERPROFILE%\\bazaarlink-keys.txt`。只有在 `qwen/qwen3.7-flash:free` 上的实时 `POST /v1/chat/completions` 返回 `200` 且 `cost: 0` 之后，密钥才会被写入。

### 🖱️ 启动器

启动器是 `src/launcher.js`；它驱动的扁平脚本（`src/cli.js`、`src/run.js`、`src/screen.js`、`src/verify.js`）也可自行接受相同的标志。它会把你的回答记录在 `launcher.config.json` 中，并用正确的标志运行 CLI。`node src/launcher.js` 会显示 mint / verify / screen / settings；标题栏会预览 `proxies.txt` 中有多少出口以及磁盘上有多少密钥。

## ✅ 已验证可用 —— 每个密钥都经过测试

这不是一份“大概能用”的清单。写入 `keys.txt` 的每个密钥都先经过实时 API 验证：

| 检查 | 结果 |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201**，返回 `api_key` |
| 不同的出口 IP | **30/30 个账户 —— 无账户共享出口**（实测） |
| `POST /v1/chat/completions`（`qwen/qwen3.7-flash:free`） | **30/30 → HTTP 200**，真实补全 `content: "pong"`，`cost: 0` |
| `GET /v1/models` | **200**，124 个模型 |

随时重新检查整个列表：

```bash
node src/cli.js --verify-only        # verify any unproven key
node src/cli.js --verify-only --all  # re-verify every key from scratch
```

> **质量门槛。** 此处的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （失效密钥绝不发布）。路由器组合在模型层面遵循同样的规则：只有当模型返回
> `chat-200` 且能调用工具时，条目才会被添加 —— 不支持工具的模型、失效的密钥或
> 失效的提供商会直接被丢弃而非添加。可随时重新运行验证步骤；
> 失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 筛选 | `screen.js` → `proxies.txt` ──探测──▶ 可用且不同的出口 → `outputs/exit-queue.json` | 每个出口每 24 小时最多使用一次 |
| 注册 | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| 验证 | `POST https://api.bazaarlink.ai/v1/chat/completions`（`qwen/qwen3.7-flash:free`） | 可存活的门槛 —— 带 `Retry-After` 的 `429` 会重试 |
| 持久化 | `keys.txt` + `outputs/state.json` + 提供商镜像 `%USERPROFILE%\\bazaarlink-keys.txt` | 运行会做检查点：重跑会从上次中断处继续 |

## ⚙️ CLI 选项

```bash
node src/cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node src/cli.js --verify-only [--all]     # re-verify unproven / all keys
node src/cli.js --screen --chunk 200      # only screen your proxy list
node src/cli.js --help
```

| 选项 | 默认值 | 含义 |
| --- | --- | --- |
| `--count N` | `30` | 要创建多少个账户 —— **任意 N**，没有上限 |
| `--chunk N` | `120` | 每轮筛选的代理行数 |
| `--rounds N` | `30` | 筛选 → 铸造 → 验证的最大轮数 |
| `--model m` | `qwen/qwen3.7-flash:free` | 用于实时验证的模型 |
| `--no-verify` | 关闭 | 跳过补全检查（不推荐） |

底层脚本（`src/screen.js`、`src/mint.js`、`src/verify.js`、`src/run.js`）接受相同的标志，可单独运行。所有数据路径（`proxies.txt`、`keys.txt`、`outputs/`）都位于**仓库根目录**，即 `src/` 的上一级。

## 🛰️ 在代理之后

**必需。** BazaarLink 允许每个 IP 每 24 小时注册一次，因此单个连接每天只能产生一个账户。代理池从仓库旁的 `proxies.txt` 读取，或从 `$BAZAARLINK_PROXIES` 读取。

每个请求都使用 `https.request` + `createAgent(parseProxy(line))` —— SOCKS4/4a、SOCKS5 和 HTTP CONNECT 均可工作。绝不使用 `undici` 的 `fetch`，因为它会忽略 `agent` 选项，从而静默泄露你的真实 IP。

每个代理在入队前都会经过实时筛选（API 可达性），已用于某个账户的出口绝不会被重用，而免费出口会在几分钟内衰减 —— 因此筛选以短的检查点分块进行，与铸造交错，而非一次长时间遍历。

**没有直连回退。** 如果代理池耗尽，运行会停止并明确说明，而不是从你自己的 IP 铸造。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个密钥 —— 已被 git 忽略，绝不提交 |
| [`models.json`](models.json) | 完整的 124 个模型目录（实测 `GET /v1/models`） |
| `outputs/accounts.json` | 每账户记录（名称、出口、代理、状态、验证），不含原始密钥 |
| `outputs/state.json` | 可恢复的运行状态（含密钥，已被 git 忽略） |
| `outputs/exit-queue.json` | 已筛选、等待使用的出口 |
| `src/cli.js` · `src/launcher.js` · `src/mint.js` · `src/screen.js` · `src/verify.js` · `src/run.js` · `src/proxy.js` | 工具本体 —— `src/` 存放脚本，数据文件保留在仓库根目录 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器。BazaarLink 在 `https://api.bazaarlink.ai/v1` 提供兼容 OpenAI 的推理，因此该连接器注册**一个 `openai-compatible` 提供商节点**（前缀 `bazaarlink`），并将 `keys.txt` 中的每个密钥附加为一个连接 —— `bazaarlink-001`、`bazaarlink-002`……重复运行是幂等的。

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "BazaarLink"`、`--prefix bazaarlink`、`--base-url https://api.bazaarlink.ai/v1`、`--model qwen/qwen3.7-flash:free`。随后模型以 `bazaarlink/<model id>` 形式提供 —— `bazaarlink/qwen/qwen3.7-flash:free`、`bazaarlink/deepseek/deepseek-v4-flash-0731free:free`、`bazaarlink/auto:free` —— 在所有连接间负载均衡：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器。该连接器在那里做同样的工作 —— 一个 `openai-compatible` 节点（前缀 `bazaarlink`），`keys.txt` 中每个密钥一个连接：

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "BazaarLink"`、`--prefix bazaarlink`、`--base-url https://api.bazaarlink.ai/v1`、`--model qwen/qwen3.7-flash:free`。

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 一个密钥能给你带来什么

| | |
| --- | --- |
| 🏢 提供商 | **BazaarLink** —— [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 提供商提供什么 | 通过一个未经身份验证的 POST 提供 124 个模型 —— 免费 qwen3.7-flash:free，无需邮箱，无需银行卡 |
| 🔑 一个密钥能给你带来什么 | 一个作用域为其自身账户的 API 密钥：下方端点上的 124 个模型 id，受你套餐的限制。配额存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 bazaarlink.ai 和你配置的收件箱后端；密钥保留在你的机器上 |

## 🐞 问题

BazaarLink 的免费池是全站共享的，有时确实会满；验证会依据服务器的 `Retry-After` 和短暂退避重试 `429`。如果运行停滞，请检查 `outputs/accounts.json` —— 它准确记录了哪些出口已被使用、哪些失败。还有其他不对劲的地方？请**[提交 issue](../../issues)**，附上你运行的命令和确切输出；欢迎 PR。如果黑名单门槛仍返回 `403`/限流，工具会在该步骤停止并明确说明 —— 上面的免费额度表是最后一次实测的门槛。

## 📄 许可证

MIT © 2026 —— 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>