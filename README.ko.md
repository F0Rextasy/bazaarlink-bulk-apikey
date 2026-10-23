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

**자동 생성된 API 키로 BazaarLink 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-124-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

BazaarLink는 인증이 필요 없는 단 한 번의 POST로 작동하는 API 키를 발급합니다 — 이메일도, 비밀번호도, 전화번호도, 카드도, 캡차도 필요 없습니다:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   한 줄에 키 하나, 각 키가 검증되는 즉시 기록됨
              └─▶ outputs/   계정, 출구 IP, 프록시, 검증 기록
```

키는 즉시 사용할 수 있으므로, 핵심은 *규모*입니다: **IP당 24시간에 한 번의 등록**이라는 제약 때문에 모든 계정은 자체 출구(exit)가 필요합니다. 이 도구는 프록시 출구를 선별하고, 출구마다 계정 하나를 등록하며, 해당 키가 실제 채팅 완성을 응답할 때까지 `keys.txt`에 키를 기록하지 않습니다.

> **과거 기록:** 이 제공자는 2026-10-18부로 워크스페이스 차단 목록에 올랐습니다. 아래 흐름은 측정된 그대로 유지됩니다 — 업스트림이 나중에 등록을 복원하면 동일한 단계가 적용됩니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**크레딧 없는 계정에서 무료** (청구, 충전, 잔액 불필요) — 계정당 한도는 실시간으로 측정:

| 항목 | 값 |
| --- | --- |
| 등록 제한 | **송신 IP당 24시간에 1회 등록** — 계정당 출구 하나 |
| 무료 모델 | `qwen/qwen3.7-flash:free` (1M 컨텍스트, 검증기), `deepseek/deepseek-v4-flash-0731free:free` (1.05M), `auto:free` (라우터) |
| 무료 모델 할당량 | **10 RPM / 하루 60회 요청**, 동시 2개, 무료 모델 간 공유, 00:00 UTC에 초기화 |
| 잔액 보유 시 | 계정에 크레딧이 있으면 **20 RPM / 하루 120회 요청** |
| 사이트 전체 무료 용량 | **15 RPM** 공유 — 본인 할당량이 그대로여도 혼잡한 시간대에는 `429`가 반환될 수 있음; 도구는 `Retry-After`로 재시도 |
| 무료 호출 비용 | 모든 완성에서 `cost: 0` |
| 가입 | `POST /api/v1/agents/register {name}` — 메일함도, 카드도 불필요 |
| 확장 단위 | **계정 하나 = 키 하나** → `--count N`은 N개의 일일 60회 요청 예산 |

> **범위 참고:** bazaarlink/ionet은 차단된 제공자 목록에 있습니다 — 위 표는 마지막으로 측정된 제한이며, 24시간/IP 스로틀이 실질적인 제약 자원입니다.

> 💡 무료 티어는 BazaarLink가 설정하며 변경될 수 있습니다. 실시간 수치는 [bazaarlink.ai](https://bazaarlink.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하도록 하세요:

```bash
node src/cli.js --verify-only     # keys.txt의 모든 키가 실제 채팅 호출로 재검증됨
```

## 🤖 모델 — 124개 전부

`GET https://api.bazaarlink.ai/v1/models`는 **124개 모델**을 반환합니다; [`models.json`](models.json) (또는 정식 레이아웃에서는 `src/models.json`)에 포함된 카탈로그는 실제 키에서 캡처한 것입니다.

| 크레딧 없는 계정에서 무료 | 비고 |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M 컨텍스트, 텍스트+이미지+비디오 — **여기서의 검증기** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M, 텍스트 — 무료 |
| `auto:free` | 무료 모델을 선택하는 라우터 |

| 유료 (동일 키, 크레딧 필요 — 마크업 없음) | 예시 |
| --- | --- |
| 110개 이상의 id | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` 및 나머지 124개 |

키 하나의 실시간 프로브 (검증기가 하는 것과 정확히 동일):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 API 사용 방법

베이스 URL은 **`https://api.bazaarlink.ai/v1`** 입니다 — OpenAI 호환.

**모든 SDK / curl**

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

**커스텀 베이스 URL을 지원하는 모든 에이전트** (Cursor, OpenCode, Kilo Code …): 베이스 URL을 `https://api.bazaarlink.ai/v1`로 설정하고, 키를 붙여넣고, 위 표에서 아무 id나 선택하세요. 크레딧 없는 키로 무료 모델을 호출하면 `cost: 0`으로 응답합니다.

## 🛠 빠른 시작

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

출력은 `keys.txt` (한 줄에 키 하나)에 저장되고 `%USERPROFILE%\\bazaarlink-keys.txt`에 미러링됩니다. 키는 `qwen/qwen3.7-flash:free`에 대한 실제 `POST /v1/chat/completions`가 `cost: 0`과 함께 `200`을 응답한 **후에만** 기록됩니다.

### 🖱️ 런처

런처는 `src/launcher.js`입니다; 런처가 구동하는 개별 스크립트(`src/cli.js`, `src/run.js`, `src/screen.js`, `src/verify.js`)는 자체적으로 동일한 플래그를 받습니다. 런처는 답변을 `launcher.config.json`에 기억하고 올바른 플래그로 CLI를 실행합니다. `node src/launcher.js`는 mint / verify / screen / settings를 표시하며, 헤더에는 `proxies.txt`에 몇 개의 출구가 있는지와 디스크에 몇 개의 키가 있는지 미리 보여줍니다.

## ✅ 검증된 작동 — 모든 키가 테스트됨

"아마 작동할 것" 목록이 아닙니다. `keys.txt`에 기록된 모든 키는 먼저 실제 API에 대해 입증됩니다:

| 검사 | 결과 |
| --- | --- |
| `POST /api/v1/agents/register` | `api_key`와 함께 **HTTP 201** |
| 서로 다른 송신 IP | **30/30 계정 — 출구를 공유하는 계정 없음** (측정됨) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, 실제 완성 `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124개 모델 |

전체 목록을 언제든 재확인:

```bash
node src/cli.js --verify-only        # verify any unproven key
node src/cli.js --verify-only --all  # re-verify every key from scratch
```

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실제 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 조합도 모델 수준에서 동일한 규칙을 따릅니다: 항목은
> **모델이 `chat-200`을 응답하고 도구 호출이 가능한 경우에만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키, 죽은 제공자는 추가되지 않고 제거됩니다. 검증 단계를 언제든 다시 실행하세요;
> 실패는 보고되며, 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| screen | `screen.js` → `proxies.txt` ──probe──▶ live, distinct exits → `outputs/exit-queue.json` | 출구 하나는 24시간에 최대 한 번만 소비됨 |
| register | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verify | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | 견딜 수 있는 게이트 — `Retry-After`가 있는 `429`는 재시도됨 |
| persist | `keys.txt` + `outputs/state.json` + 제공자 미러 `%USERPROFILE%\\bazaarlink-keys.txt` | 실행은 체크포인트됨: 재실행 시 중단된 지점부터 계속 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node src/cli.js --verify-only [--all]     # re-verify unproven / all keys
node src/cli.js --screen --chunk 200      # only screen your proxy list
node src/cli.js --help
```

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `--count N` | `30` | 생성할 계정 수 — **임의의 N**, 최대값 없음 |
| `--chunk N` | `120` | 라운드당 선별할 프록시 줄 수 |
| `--rounds N` | `30` | 최대 screen → mint → verify 라운드 수 |
| `--model m` | `qwen/qwen3.7-flash:free` | 실제 검증에 사용되는 모델 |
| `--no-verify` | off | 완성 검사 건너뛰기 (권장하지 않음) |

기반 스크립트(`src/screen.js`, `src/mint.js`, `src/verify.js`, `src/run.js`)는 동일한 플래그를 받으며 단독으로 실행할 수 있습니다. 모든 데이터 경로(`proxies.txt`, `keys.txt`, `outputs/`)는 **저장소 루트**에 있으며, `src/`보다 한 단계 위입니다.

## 🛰️ 프록시 뒤에서

**필수입니다.** BazaarLink는 IP당 24시간에 한 번의 등록만 허용하므로, 단일 연결로 하루에 계정 하나를 생성할 수 있습니다. 풀은 저장소 옆의 `proxies.txt` 또는 `$BAZAARLINK_PROXIES`에서 읽습니다.

모든 요청은 `https.request` + `createAgent(parseProxy(line))`를 사용합니다 — SOCKS4/4a, SOCKS5, HTTP CONNECT 모두 작동합니다. `undici`의 `fetch`는 절대 사용되지 않습니다. 이는 `agent` 옵션을 무시하고 실제 IP를 조용히 노출시키기 때문입니다.

각 프록시는 대기열에 오르기 전에 실제로 선별되며(API 도달 가능성), 이미 계정에 소비된 출구는 재사용되지 않고, 무료 출구는 몇 분 내에 소멸합니다 — 따라서 선별은 한 번의 긴 패스가 아니라 민팅과 교차하며 짧은 체크포인트 청크로 실행됩니다.

**직접 연결 폴백은 없습니다.** 풀이 고갈되면 실행이 중단되고 자체 IP로 민팅하는 대신 그렇게 알립니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 키 하나 — git 무시됨, 절대 커밋되지 않음 |
| [`models.json`](models.json) | 전체 124개 모델 카탈로그 (측정된 `GET /v1/models`) |
| `outputs/accounts.json` | 계정별 기록 (이름, 출구, 프록시, 상태, 검증) — 원시 키 없음 |
| `outputs/state.json` | 재개 가능한 실행 상태 (키 보유, git 무시됨) |
| `outputs/exit-queue.json` | 소비를 기다리는 선별된 출구 |
| `src/cli.js` · `src/launcher.js` · `src/mint.js` · `src/screen.js` · `src/verify.js` · `src/run.js` · `src/proxy.js` | 도구 — `src/`는 스크립트를 담고, 데이터 파일은 저장소 루트에 유지됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다. BazaarLink는 `https://api.bazaarlink.ai/v1`에서 OpenAI 호환 추론을 제공하므로, 커넥터는 **하나의 `openai-compatible` 제공자 노드** (접두사 `bazaarlink`)를 등록하고 `keys.txt`의 모든 키를 연결로 붙입니다 — `bazaarlink-001`, `bazaarlink-002`, … 재실행은 멱등적입니다.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. 모델은 `bazaarlink/<model id>`로 제공됩니다 — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — 모든 연결에 걸쳐 로드 밸런싱됩니다:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다. 커넥터는 여기서도 동일한 작업을 수행합니다 — 하나의 `openai-compatible` 노드 (접두사 `bazaarlink`), `keys.txt`의 키마다 연결 하나:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 제공자가 주는 것 | 인증 없는 단 한 번의 POST로 124개 모델 — 무료 qwen3.7-flash:free, 이메일도 카드도 불필요 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 한정된 API 키 하나: 아래 엔드포인트의 124개 모델 id를 플랜 한도 내에서 사용. 할당량은 **계정**에 있으므로, 이 도구가 키마다 계정 하나를 생성하는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 데이터 | bazaarlink.ai와 설정한 인박스 백엔드만 접촉되며; 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

BazaarLink의 무료 풀은 사이트 전체에서 공유되며 때때로 가득 찹니다; 검증은 서버의 `Retry-After`와 짧은 백오프로 `429`를 재시도합니다. 실행이 멈추면 `outputs/accounts.json`을 확인하세요 — 어떤 출구가 소비되었고 어떤 것이 실패했는지 정확히 기록합니다. 다른 문제가 보이나요? 실행한 명령과 정확한 출력을 포함해 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다. 차단 목록 게이트가 여전히 `403`/스로틀을 반환하면, 도구는 해당 단계에서 중단하고 그렇게 알립니다 — 위의 무료 티어 표가 마지막으로 측정된 제한입니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>