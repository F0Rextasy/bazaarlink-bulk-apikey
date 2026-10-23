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

**Массовое создание аккаунтов BazaarLink с автоматически сгенерированными API-ключами — OpenAI-совместимый инференс + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-124-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

BazaarLink выдаёт рабочий API-ключ по одному неаутентифицированному POST-запросу — без e-mail, пароля, телефона, карты и капчи:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   один ключ на строку, записывается в момент проверки каждого ключа
              └─▶ outputs/   аккаунт, выходной IP, прокси, запись проверки
```

Ключ можно использовать сразу, поэтому вся задача сводится к *масштабу*: **одна регистрация на IP за 24 часа** означает, что каждому аккаунту нужен собственный выход. Этот инструмент отбирает выходные прокси, регистрирует по одному аккаунту на каждый выход и не записывает ключ в `keys.txt`, пока этот ключ не ответит на живой запрос чат-комплишена.

> **Историческая справка:** провайдер находится в блок-листе рабочего пространства с 2026-10-18. Приведённый ниже процесс сохранён в измеренном виде — если в будущем провайдер восстановит регистрации, те же шаги будут применимы.

## 🎁 Бесплатный тариф — сколько вы получаете

**Бесплатно на аккаунте без кредитов** (без claim, без пополнения, без баланса) — лимиты на аккаунт, измеренные в реальном времени:

| Что | Значение |
| --- | --- |
| Ограничение регистрации | **1 регистрация на исходящий IP за 24 ч** — один выход на аккаунт |
| Бесплатные модели | `qwen/qwen3.7-flash:free` (контекст 1M, верификатор), `deepseek/deepseek-v4-flash-0731free:free` (1.05M), `auto:free` (роутер) |
| Квота бесплатных моделей | **10 RPM / 60 запросов в день**, 2 одновременных, общая для бесплатных моделей, сброс в 00:00 UTC |
| С балансом | **20 RPM / 120 запросов в день**, когда на аккаунте есть кредиты |
| Общая бесплатная ёмкость сайта | **15 RPM** общих — в час пик может прийти `429`, даже если ваша собственная квота не тронута; инструмент повторяет запрос с `Retry-After` |
| Стоимость бесплатного вызова | `cost: 0` на каждом комплишене |
| Регистрация | `POST /api/v1/agents/register {name}` — без почты, без карты |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` — это N дневных бюджетов по 60 запросов |

> **Примечание о области применения:** bazaarlink/ionet находятся в списке заблокированных провайдеров — таблица отражает последнее измеренное ограничение; троттлинг 24 ч/IP является определяющим ресурсом.

> 💡 Бесплатный тариф устанавливается BazaarLink и может меняться. Проверяйте актуальные цифры на [bazaarlink.ai](https://bazaarlink.ai) — и пусть собственный контроль инструмента решает:

```bash
node src/cli.js --verify-only     # каждый ключ в keys.txt перепроверяется реальным вызовом чата
```

## 🤖 Модели — все 124

`GET https://api.bazaarlink.ai/v1/models` возвращает **124 модели**; каталог, поставляемый в [`models.json`](models.json) (или `src/models.json` в канонической раскладке), был снят с живого ключа.

| Бесплатно на аккаунте без кредитов | Примечание |
| --- | --- |
| `qwen/qwen3.7-flash:free` | контекст 1M, текст+изображение+видео — **верификатор здесь** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M, текст — бесплатно |
| `auto:free` | роутер, выбирающий бесплатную модель |

| Платные (тот же ключ, нужны кредиты — нулевая наценка) | Примеры |
| --- | --- |
| 110+ id | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` и остальные из 124 |

Живая проверка одного ключа (именно то, что делает верификатор):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 Как использовать API

Базовый URL — **`https://api.bazaarlink.ai/v1`** — совместим с OpenAI.

**Любой SDK / curl**

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

**Любой агент с пользовательским базовым URL** (Cursor, OpenCode, Kilo Code …): задайте базовый URL `https://api.bazaarlink.ai/v1`, вставьте ключ, выберите любой id из таблицы выше. Вызов бесплатной модели на ключе без кредитов отвечает с `cost: 0`.

## 🛠 Быстрый старт

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

Результат попадает в `keys.txt` (один ключ на строку) и дублируется в `%USERPROFILE%\\bazaarlink-keys.txt`. Ключ записывается **только после** того, как живой `POST /v1/chat/completions` на `qwen/qwen3.7-flash:free` ответит `200` с `cost: 0`.

### 🖱️ Лаунчер

Лаунчер — это `launcher.js` в **корне репозитория** (этот репозиторий плоский — здесь нет `src/`). Он запоминает ваши ответы в `launcher.config.json` и запускает `cli.js` с нужными флагами. `node launcher.js` показывает mint / verify / screen / settings; в заголовке отображается, сколько выходов содержит `proxies.txt` и сколько ключей на диске.

## ✅ Проверено в работе — каждый ключ протестирован

Это не список «вероятно работает». Каждый ключ, записанный в `keys.txt`, сначала подтверждён на живом API:

| Проверка | Результат |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** с `api_key` |
| Различные исходящие IP | **30/30 аккаунтов — ни один аккаунт не делит выход** (измерено) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, реальный комплишен `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 модели |

Перепроверить весь список можно в любой момент:

```bash
node cli.js --verify-only        # verify any unproven key
node cli.js --verify-only --all  # re-verify every key from scratch
```

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Перезапускайте шаг проверки в любое время;
> сбои сообщаются, но никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| отбор | `screen.js` → `proxies.txt` ──probe──▶ живые, различные выходы → `outputs/exit-queue.json` | один выход расходуется не более одного раза за 24 ч |
| регистрация | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| проверка | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | выживаемый контроль — `429` с `Retry-After` повторяется |
| сохранение | `keys.txt` + `outputs/state.json` + зеркало провайдера `%USERPROFILE%\\bazaarlink-keys.txt` | запуск чекпоинтится: повторный запуск продолжает с места остановки |

## ⚙️ Опции CLI

```bash
node cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node cli.js --verify-only [--all]     # re-verify unproven / all keys
node cli.js --screen --chunk 200      # only screen your proxy list
node cli.js --help
```

| Опция | По умолчанию | Значение |
| --- | --- | --- |
| `--count N` | `30` | сколько аккаунтов создать — **любое N**, максимума нет |
| `--chunk N` | `120` | строк прокси для отбора за раунд |
| `--rounds N` | `30` | максимум раундов screen → mint → verify |
| `--model m` | `qwen/qwen3.7-flash:free` | модель, используемая для живой проверки |
| `--no-verify` | выкл. | пропустить проверку комплишена (не рекомендуется) |

Базовые скрипты (`screen.js`, `mint.js`, `verify.js`, `run.js`) принимают те же флаги и могут запускаться самостоятельно. Все пути (`proxies.txt`, `keys.txt`, `outputs/`) находятся в **корне репозитория** в этой плоской раскладке.

## 🛰️ За прокси

**Обязательно.** BazaarLink допускает одну регистрацию на IP за 24 ч, поэтому одно соединение может создать один аккаунт в день. Пул читается из `proxies.txt` рядом с репозиторием или из `$BAZAARLINK_PROXIES`.

Каждый запрос использует `https.request` + `createAgent(parseProxy(line))` — работают SOCKS4/4a, SOCKS5 и HTTP CONNECT. `fetch` из `undici` никогда не используется, потому что он игнорирует опцию `agent` и молча утечёт ваш реальный IP.

Каждый прокси проверяется вживую (доступность API) прежде чем попасть в очередь, выход, уже израсходованный на аккаунт, никогда не переиспользуется, а бесплатные выходы деградируют за минуты — поэтому отбор идёт короткими чекпоинтируемыми порциями, чередуясь с созданием ключей, а не одним длинным проходом.

**Резервного варианта с прямым подключением нет.** Если пул исчерпан, запуск останавливается и сообщает об этом, вместо того чтобы создавать ключи с вашего собственного IP.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один ключ на строку — игнорируется git, никогда не коммитится |
| [`models.json`](models.json) | полный каталог из 124 моделей (измеренный `GET /v1/models`) |
| `outputs/accounts.json` | запись по каждому аккаунту (имя, выход, прокси, статус, проверка) без сырых ключей |
| `outputs/state.json` | возобновляемое состояние запуска (содержит ключи, игнорируется git) |
| `outputs/exit-queue.json` | отобранные выходы, ожидающие расхода |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | инструмент — всё в **корне репозитория** (плоская раскладка) |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый, OpenAI-совместимый роутер. BazaarLink предоставляет OpenAI-совместимый инференс по адресу `https://api.bazaarlink.ai/v1`, поэтому коннектор регистрирует **один узел-провайдер `openai-compatible`** (префикс `bazaarlink`) и прикрепляет каждый ключ из `keys.txt` как соединение — `bazaarlink-001`, `bazaarlink-002`, … Повторный запуск идемпотентен.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Значения по умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Затем модели подаются как `bazaarlink/<model id>` — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — с балансировкой нагрузки по всем соединениям:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый, OpenAI-совместимый роутер. Коннектор выполняет ту же работу там — один узел `openai-compatible` (префикс `bazaarlink`), одно соединение на каждый ключ в `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Значения по умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 Что даёт провайдер | 124 модели через один неаутентифицированный POST — бесплатный qwen3.7-flash:free, без e-mail, без карты |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 124 id моделей на указанном ниже эндпоинте, в пределах лимитов вашего тарифа. Квота живёт на **аккаунте**, именно поэтому этот инструмент создаёт по одному аккаунту на ключ |
| 🌐 Форма API | Совместим с OpenAI: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Ваши данные | связь только с bazaarlink.ai и настроенным вами бэкендом inbox; ключи остаются на вашей машине |

## 🐞 Проблемы

Бесплатный пул BazaarLink общий для всего сайта и временами заполняется; проверка повторяет `429` с серверным `Retry-After` и коротким бэкоффом. Если запуск застопорился, проверьте `outputs/accounts.json` — там точно записано, какие выходы были израсходованы, а какие не сработали. Что-то ещё выглядит не так? **[Откройте issue](../../issues)** с командой, которую вы запускали, и точным выводом; PR приветствуются. Если контроль блок-листа всё ещё возвращает `403`/троттлинг, инструмент останавливается на этом шаге и сообщает об этом — таблица бесплатного тарифа выше отражает последнее измеренное ограничение.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>