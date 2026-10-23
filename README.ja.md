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

**自動生成された API キーで BazaarLink アカウントを一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-124-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

BazaarLink は、認証不要の単一の POST から動作する API キーを発行します — メールも、パスワードも、電話番号も、カードも、キャプチャも不要です:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   1 行に 1 キー、各キーが検証された瞬間に書き込まれる
              └─▶ outputs/   アカウント、出口 IP、プロキシ、検証記録
```

キーは即座に使用可能なので、作業のすべては*スケール*です: **1 IP につき 24 時間に 1 回の登録**ということは、各アカウントに独自の出口が必要だということです。このツールはプロキシの出口をスクリーニングし、出口ごとに 1 つのアカウントを登録し、そのキーが実際のチャット補完に応答するまで `keys.txt` にキーを書き込みません。

> **履歴メモ:** このプロバイダは 2026-10-18 時点でワークスペースのブロックリストに載っています。以下のフローは実測どおりに保たれています — 上流が後に登録を復活させた場合も同じ手順が適用されます。

## 🎁 無料枠 — どれだけ得られるか

**クレジットなしのアカウントで無料**（クレーム、チャージ、残高不要）— アカウントごとの制限を実測:

| 項目 | 値 |
| --- | --- |
| 登録ゲート | **1 出口 IP につき 24 時間に 1 回の登録** — アカウントごとに 1 つの出口 |
| 無料モデル | `qwen/qwen3.7-flash:free`（1M コンテキスト、検証用）、`deepseek/deepseek-v4-flash-0731free:free`（1.05M）、`auto:free`（ルーター） |
| 無料モデルのクォータ | **10 RPM / 1 日 60 リクエスト**、同時 2、無料モデル間で共有、00:00 UTC にリセット |
| 残高ありの場合 | アカウントにクレジットがあれば **20 RPM / 1 日 120 リクエスト** |
| サイト全体の無料容量 | **15 RPM** 共有 — 自分のクォータが未使用でも、混雑時には `429` が返ることがあります。ツールは `Retry-After` でリトライします |
| 無料呼び出しのコスト | すべての補完で `cost: 0` |
| サインアップ | `POST /api/v1/agents/register {name}` — メールボックス不要、カード不要 |
| スケールする単位 | **1 アカウント = 1 キー** → `--count N` は N 個の 1 日 60 リクエストの予算 |

> **範囲の注記:** bazaarlink/ionet はブロック対象プロバイダのリストに載っています — この表は最後に実測されたゲートです。24 時間/IP のスロットルが拘束リソースです。

> 💡 無料枠は BazaarLink が設定するもので、変更される可能性があります。最新の数値は [bazaarlink.ai](https://bazaarlink.ai) で確認してください — そしてツール自身のゲートに判断を委ねてください:

```bash
node src/cli.js --verify-only     # keys.txt のすべてのキーが実際のチャット呼び出しで再テストされます
```

## 🤖 モデル — そのすべて 124 個

`GET https://api.bazaarlink.ai/v1/models` は **124 モデル**を返します。[`models.json`](models.json)（または正規レイアウトでは `src/models.json`）に同梱されているカタログは、実際のキーから取得されました。

| クレジットなしのアカウントで無料 | 備考 |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M コンテキスト、テキスト+画像+動画 — **ここでの検証用** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M、テキスト — 無料 |
| `auto:free` | 無料モデルを選ぶルーター |

| 有料（同じキー、クレジットが必要 — マークアップなし） | 例 |
| --- | --- |
| 110+ の id | `gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-5.6-luna`、`claude-opus-5`、`claude-sonnet-5.5`、`claude-fable-5.1`、`gemini-3.8-flash`、`gemini-3.7-flash`、`grok-4.7`、`kimi-k3`、`glm-5.3`、`deepseek-v4-pro`、`qwen3.8-max` および残りの 124 |

1 つのキーのライブプローブ（検証が行うこととまったく同じ）:

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 API の使い方

ベース URL は **`https://api.bazaarlink.ai/v1`** です — OpenAI 互換。

**任意の SDK / curl**

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

**カスタムベース URL を持つ任意のエージェント**（Cursor、OpenCode、Kilo Code など）: ベース URL を `https://api.bazaarlink.ai/v1` に設定し、キーを貼り付け、上の表から任意の id を選びます。クレジットなしのキーでの無料モデル呼び出しは `cost: 0` で応答します。

## 🛠 クイックスタート

```bash
git clone https://github.com/F0Rextasy/bazaarlink-bulk-apikey.git
cd bazaarlink-bulk-apikey

# 1) プロキシリスト — 1 行に 1 つ (http://host:port | socks5://host:port | host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) 実行
node launcher.js          # 対話式: mint / verify / screen / settings

# または直接:
node cli.js --count 30    # 任意の N — 30 は単なるデフォルトのサンプル
```

出力は `keys.txt`（1 行に 1 キー）に書き込まれ、`%USERPROFILE%\\bazaarlink-keys.txt` にミラーされます。キーは `qwen/qwen3.7-flash:free` への実際の `POST /v1/chat/completions` が `cost: 0` で `200` を返した**後にのみ**書き込まれます。

### 🖱️ ランチャー

ランチャーは**リポジトリのルート**にある `launcher.js` です（このリポジトリはフラットです — `src/` はありません）。回答を `launcher.config.json` に記憶し、適切なフラグで `cli.js` を実行します。`node launcher.js` は mint / verify / screen / settings を表示します。ヘッダーには `proxies.txt` が保持する出口の数と、ディスク上にあるキーの数がプレビューされます。

## ✅ 検証済みで動作 — すべてのキーがテストされています

「おそらく動作する」リストではありません。`keys.txt` に書き込まれるすべてのキーは、まず実際の API に対して証明されます:

| チェック | 結果 |
| --- | --- |
| `POST /api/v1/agents/register` | `api_key` を含む **HTTP 201** |
| 異なる出口 IP | **30/30 アカウント — 出口を共有するアカウントはなし**（実測） |
| `POST /v1/chat/completions`（`qwen/qwen3.7-flash:free`） | **30/30 → HTTP 200**、実際の補完 `content: "pong"`、`cost: 0` |
| `GET /v1/models` | **200**、124 モデル |

リスト全体はいつでも再チェックできます:

```bash
node cli.js --verify-only        # 未証明のキーを検証
node cli.js --verify-only --all  # すべてのキーをゼロから再検証
```

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前に実際の `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` に応答し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダは追加されずに除外されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (アカウントごとに 1 アドレス)                                  アカウントごとに新しいアドレス
   │
   ├─▶ サインアップ: BazaarLink ページ → メールアドレス → inbox からのコード / リンク
   ├─▶ セッション: アカウントの Cookie またはアクセストークンを取得
   ├─▶ キー発行: アカウントのキーエンドポイント → 平文キーが一度だけ返される (即座にディスクに書き込み)
   └─▶ ライブ証明: POST https://api.bazaarlink.ai/v1/chat/completions → 実際のコンテンツ = キーが有効
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| screen | `screen.js` → `proxies.txt` ──probe──▶ 有効で異なる出口 → `outputs/exit-queue.json` | 1 つの出口は 24 時間に最大 1 回だけ消費される |
| register | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verify | `POST https://api.bazaarlink.ai/v1/chat/completions`（`qwen/qwen3.7-flash:free`） | 生き残るゲート — `Retry-After` 付きの `429` はリトライされる |
| persist | `keys.txt` + `outputs/state.json` + プロバイダミラー `%USERPROFILE%\\bazaarlink-keys.txt` | 実行はチェックポイント化される: 再実行すると中断したところから続行 |

## ⚙️ CLI オプション

```bash
node cli.js --count N                 # 出口をスクリーニング → mint → verify (任意の N、デフォルト 30)
node cli.js --verify-only [--all]     # 未証明 / すべてのキーを再検証
node cli.js --screen --chunk 200      # プロキシリストのスクリーニングのみ
node cli.js --help
```

| オプション | デフォルト | 意味 |
| --- | --- | --- |
| `--count N` | `30` | 作成するアカウント数 — **任意の N**、最大値はありません |
| `--chunk N` | `120` | 1 ラウンドあたりにスクリーニングするプロキシ行数 |
| `--rounds N` | `30` | screen → mint → verify の最大ラウンド数 |
| `--model m` | `qwen/qwen3.7-flash:free` | ライブ検証に使用するモデル |
| `--no-verify` | off | 補完チェックをスキップ（非推奨） |

基盤となるスクリプト（`screen.js`、`mint.js`、`verify.js`、`run.js`）は同じフラグを受け取り、単独で実行できます。すべてのパス（`proxies.txt`、`keys.txt`、`outputs/`）は、このフラットレイアウトでは**リポジトリのルート**にあります。

## 🛰️ プロキシの背後で

**必須。** BazaarLink は 1 IP につき 24 時間に 1 回の登録を許可するため、単一の接続では 1 日 1 アカウントしか生成できません。プールはリポジトリの隣の `proxies.txt`、または `$BAZAARLINK_PROXIES` から読み込まれます。

すべてのリクエストは `https.request` + `createAgent(parseProxy(line))` を使用します — SOCKS4/4a、SOCKS5、HTTP CONNECT のすべてが動作します。`undici` の `fetch` は決して使用されません。これは `agent` オプションを無視し、実際の IP を黙って漏洩するからです。

各プロキシはキューに入れる前にライブで（API 到達性を）スクリーニングされ、すでにアカウントに消費された出口は決して再利用されず、無料の出口は数分で減衰します — そのためスクリーニングは、1 回の長いパスではなく、短いチェックポイント化されたチャンクで minting と交互に実行されます。

**直接接続のフォールバックはありません。** プールが枯渇すると、実行は停止し、自分の IP から mint する代わりにその旨を報告します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行に 1 キー — git 無視、決してコミットされない |
| [`models.json`](models.json) | 完全な 124 モデルのカタログ（実測 `GET /v1/models`） |
| `outputs/accounts.json` | アカウントごとの記録（名前、出口、プロキシ、ステータス、検証）、生のキーは含まない |
| `outputs/state.json` | 再開可能な実行状態（キーを保持、git 無視） |
| `outputs/exit-queue.json` | 消費待ちのスクリーニング済み出口 |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | ツール — すべて**リポジトリのルート**（フラットレイアウト） |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです。BazaarLink は `https://api.bazaarlink.ai/v1` で OpenAI 互換の推論を提供するため、コネクタは **1 つの `openai-compatible` プロバイダノード**（プレフィックス `bazaarlink`）を登録し、`keys.txt` のすべてのキーを接続としてアタッチします — `bazaarlink-001`、`bazaarlink-002`、… 再実行は冪等です。

```bash
node src/connect-9router.js                    # keys.txt のすべてのキー
node src/connect-9router.js --model <id>       # 接続のデフォルトモデルを固定
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "BazaarLink"`、`--prefix bazaarlink`、`--base-url https://api.bazaarlink.ai/v1`、`--model qwen/qwen3.7-flash:free`。モデルは `bazaarlink/<model id>` として提供されます — `bazaarlink/qwen/qwen3.7-flash:free`、`bazaarlink/deepseek/deepseek-v4-flash-0731free:free`、`bazaarlink/auto:free` — すべての接続間で負荷分散されます:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです。コネクタはそこで同じ仕事をします — 1 つの `openai-compatible` ノード（プレフィックス `bazaarlink`）、`keys.txt` のキーごとに 1 つの接続:

```bash
node src/connect-omniroute.js                  # keys.txt のすべてのキー
node src/connect-omniroute.js --model <id>     # 接続のデフォルトモデルを固定
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "BazaarLink"`、`--prefix bazaarlink`、`--base-url https://api.bazaarlink.ai/v1`、`--model qwen/qwen3.7-flash:free`。

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダ | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 プロバイダが提供するもの | 認証不要の単一の POST で 124 モデル — 無料の qwen3.7-flash:free、メール不要、カード不要 |
| 🔑 1 つのキーで得られるもの | 独自のアカウントにスコープされた 1 つの API キー: 以下のエンドポイントで 124 のモデル id を、プランの制限で利用可能。クォータは**アカウント**に存在するため、このツールがキーごとに 1 つのアカウントを作成するのです |
| 🌐 API の形 | OpenAI 互換: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは bazaarlink.ai と、設定した inbox バックエンドのみ。キーはあなたのマシンに留まります |

## 🐞 問題報告

BazaarLink の無料プールはサイト全体で共有されており、時に満杯になります。検証はサーバーの `Retry-After` と短いバックオフで `429` をリトライします。実行が停滞した場合は `outputs/accounts.json` を確認してください — どの出口が消費され、どれが失敗したかが正確に記録されています。他に何かおかしいですか？ 実行したコマンドと正確な出力を添えて **[issue を開いてください](../../issues)**。PR も歓迎します。ブロックリストのゲートが依然として `403`/スロットルを返す場合、ツールはそのステップで停止し、その旨を報告します — 上の無料枠の表が最後に実測されたゲートです。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>