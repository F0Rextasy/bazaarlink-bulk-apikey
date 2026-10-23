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

**BazaarLink-Konten in großen Mengen erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Konnektor.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-124-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

BazaarLink gibt einen funktionierenden API-Schlüssel aus einem einzigen nicht authentifizierten POST heraus — keine E-Mail, kein Passwort, kein Telefon, keine Karte, kein Captcha:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   ein Schlüssel pro Zeile, geschrieben sobald jeder Schlüssel verifiziert ist
              └─▶ outputs/   Konto, Exit-IP, Proxy, Verifizierungsdatensatz
```

Der Schlüssel ist sofort nutzbar, also geht es bei der ganzen Sache um *Skalierung*: **eine Registrierung pro IP pro 24 Stunden** bedeutet, dass jedes Konto einen eigenen Exit benötigt. Dieses Tool prüft Proxy-Exits, registriert ein Konto pro Exit und weigert sich, einen Schlüssel in `keys.txt` zu schreiben, bis dieser Schlüssel eine Live-Chat-Vervollständigung beantwortet hat.

> **Historische Anmerkung:** Der Anbieter steht seit dem 18.10.2026 auf der Blockliste des Arbeitsbereichs. Der untenstehende Ablauf ist so beibehalten, wie er gemessen wurde — falls das Upstream später Registrierungen wiederherstellt, gelten dieselben Schritte.

## 🎁 Kostenlose Stufe — wie viel du bekommst

**Kostenlos auf einem Konto ohne Guthaben** (kein Claim, kein Aufladen, kein Guthaben nötig) — pro Konto live gemessene Limits:

| Was | Wert |
| --- | --- |
| Registrierungs-Gate | **1 Registrierung pro Egress-IP pro 24 h** — ein Exit pro Konto |
| Kostenlose Modelle | `qwen/qwen3.7-flash:free` (1M Kontext, der Verifizierer), `deepseek/deepseek-v4-flash-0731free:free` (1,05M), `auto:free` (Router) |
| Kontingent für kostenlose Modelle | **10 RPM / 60 Anfragen pro Tag**, 2 gleichzeitig, gemeinsam über kostenlose Modelle, Reset 00:00 UTC |
| Mit Guthaben | **20 RPM / 120 Anf./Tag**, sobald das Konto Guthaben hält |
| Website-weite kostenlose Kapazität | **15 RPM** gemeinsam — eine stark ausgelastete Stunde kann `429` zurückgeben, selbst wenn dein eigenes Kontingent unberührt ist; das Tool wiederholt mit `Retry-After` |
| Kosten eines kostenlosen Aufrufs | `cost: 0` bei jeder Vervollständigung |
| Registrierung | `POST /api/v1/agents/register {name}` — kein Postfach, keine Karte |
| Die Einheit, die skaliert | **ein Konto = ein Schlüssel** → `--count N` sind N tägliche 60-Anfragen-Budgets |

> **Umfangshinweis:** bazaarlink/ionet stehen auf der Liste der blockierten Anbieter — die Tabelle ist das zuletzt gemessene Gate; die 24-h/IP-Drosselung ist die bindende Ressource.

> 💡 Die kostenlose Stufe wird von BazaarLink festgelegt und kann sich ändern. Prüfe die Live-Zahlen auf [bazaarlink.ai](https://bazaarlink.ai) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # jeder Schlüssel in keys.txt wird mit einem echten Chat-Aufruf erneut getestet
```

## 🤖 Modelle — alle 124 davon

`GET https://api.bazaarlink.ai/v1/models` gibt **124 Modelle** zurück; der Katalog, der in [`models.json`](models.json) (oder `src/models.json` im kanonischen Layout) mitgeliefert wird, wurde von einem Live-Schlüssel erfasst.

| Kostenlos auf einem Konto ohne Guthaben | Hinweis |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M Kontext, Text+Bild+Video — **der Verifizierer hier** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1,05M, Text — kostenlos |
| `auto:free` | Router, der ein kostenloses Modell auswählt |

| Kostenpflichtig (gleicher Schlüssel, benötigt Guthaben — kein Aufschlag) | Beispiele |
| --- | --- |
| 110+ IDs | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` und der Rest der 124 |

Live-Test eines Schlüssels (genau das, was der Verifizierer tut):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 Die API verwenden

Die Basis-URL ist **`https://api.bazaarlink.ai/v1`** — OpenAI-kompatibel.

**Jedes SDK / curl**

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

**Jeder Agent mit einer benutzerdefinierten Basis-URL** (Cursor, OpenCode, Kilo Code …): setze die Basis-URL auf `https://api.bazaarlink.ai/v1`, füge einen Schlüssel ein, wähle eine beliebige ID aus der obigen Tabelle. Ein Aufruf eines kostenlosen Modells mit einem Konto ohne Guthaben antwortet mit `cost: 0`.

## 🛠 Schnellstart

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

Die Ausgabe landet in `keys.txt` (ein Schlüssel pro Zeile) und wird nach `%USERPROFILE%\\bazaarlink-keys.txt` gespiegelt. Ein Schlüssel wird **erst dann** geschrieben, wenn ein Live-`POST /v1/chat/completions` auf `qwen/qwen3.7-flash:free` mit `200` und `cost: 0` antwortet.

### 🖱️ Der Launcher

Der Launcher ist `launcher.js` im **Repository-Stammverzeichnis** (dieses Repo ist flach — es gibt kein `src/`). Er merkt sich deine Antworten in `launcher.config.json` und führt `cli.js` mit den richtigen Flags aus. `node launcher.js` zeigt mint / verify / screen / settings; die Kopfzeile zeigt eine Vorschau, wie viele Exits `proxies.txt` enthält und wie viele Schlüssel auf der Festplatte liegen.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

Keine „funktioniert wahrscheinlich"-Liste. Jeder in `keys.txt` geschriebene Schlüssel wird zuerst gegen die Live-API bewiesen:

| Prüfung | Ergebnis |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** mit `api_key` |
| Unterschiedliche Egress-IPs | **30/30 Konten — kein Konto teilt sich einen Exit** (gemessen) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, echte Vervollständigung `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 Modelle |

Überprüfe die gesamte Liste jederzeit erneut:

```bash
node cli.js --verify-only        # verify any unproven key
node cli.js --verify-only --all  # re-verify every key from scratch
```

> **Qualitäts-Gates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt`
> geschrieben wurde (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel
> auf Modellebene: Ein Eintrag wird **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools
> aufrufen kann** — ein Modell ohne Tool-Unterstützung, ein toter Schlüssel oder ein toter Anbieter wird
> verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus; Fehler werden
> gemeldet, nie versteckt.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| screen | `screen.js` → `proxies.txt` ──probe──▶ live, distinct exits → `outputs/exit-queue.json` | ein Exit wird höchstens einmal pro 24 h verbraucht |
| register | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verify | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | das überlebbare Gate — ein `429` mit `Retry-After` wird wiederholt |
| persist | `keys.txt` + `outputs/state.json` + Anbieter-Spiegel `%USERPROFILE%\\bazaarlink-keys.txt` | ein Lauf wird mit Checkpoints versehen: ein erneuter Lauf setzt dort fort, wo er aufgehört hat |

## ⚙️ CLI-Optionen

```bash
node cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node cli.js --verify-only [--all]     # re-verify unproven / all keys
node cli.js --screen --chunk 200      # only screen your proxy list
node cli.js --help
```

| Option | Standard | Bedeutung |
| --- | --- | --- |
| `--count N` | `30` | wie viele Konten erstellt werden sollen — **beliebiges N**, es gibt kein Maximum |
| `--chunk N` | `120` | Proxy-Zeilen, die pro Runde geprüft werden |
| `--rounds N` | `30` | max. Runden aus screen → mint → verify |
| `--model m` | `qwen/qwen3.7-flash:free` | Modell, das für die Live-Verifizierung verwendet wird |
| `--no-verify` | aus | die Vervollständigungsprüfung überspringen (nicht empfohlen) |

Die zugrunde liegenden Skripte (`screen.js`, `mint.js`, `verify.js`, `run.js`) akzeptieren dieselben Flags und können eigenständig ausgeführt werden. Alle Pfade (`proxies.txt`, `keys.txt`, `outputs/`) liegen in diesem flachen Layout im **Repository-Stammverzeichnis**.

## 🛰️ Hinter einem Proxy

**Erforderlich.** BazaarLink erlaubt eine Registrierung pro IP pro 24 h, sodass eine einzelne Verbindung ein Konto pro Tag erzeugen kann. Der Pool wird aus `proxies.txt` neben dem Repo oder aus `$BAZAARLINK_PROXIES` gelesen.

Jede Anfrage verwendet `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 und HTTP CONNECT funktionieren alle. `undici`s `fetch` wird nie verwendet, weil es die `agent`-Option ignoriert und still deine echte IP preisgeben würde.

Jeder Proxy wird live geprüft (API-Erreichbarkeit), bevor er in die Warteschlange kommt, ein bereits für ein Konto verbrauchter Exit wird nie wiederverwendet, und kostenlose Exits verfallen innerhalb von Minuten — daher läuft das Screening in kurzen, mit Checkpoints versehenen Abschnitten, die mit dem Minting verschachtelt sind, statt in einem langen Durchlauf.

**Es gibt keinen Direktverbindungs-Fallback.** Wenn der Pool leerläuft, stoppt der Lauf und sagt es, statt von deiner eigenen IP zu minten.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein Schlüssel pro Zeile — von Git ignoriert, nie committet |
| [`models.json`](models.json) | der vollständige 124-Modell-Katalog (gemessenes `GET /v1/models`) |
| `outputs/accounts.json` | Datensatz pro Konto (Name, Exit, Proxy, Status, Verifizierung) ohne Rohschlüssel |
| `outputs/state.json` | fortsetzbarer Laufzustand (enthält Schlüssel, von Git ignoriert) |
| `outputs/exit-queue.json` | geprüfte Exits, die darauf warten, verbraucht zu werden |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | das Tool — alle im **Repository-Stammverzeichnis** (flaches Layout) |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router. BazaarLink bietet OpenAI-kompatible Inferenz unter `https://api.bazaarlink.ai/v1` an, daher registriert der Konnektor **einen `openai-compatible`-Provider-Node** (Präfix `bazaarlink`) und hängt jeden Schlüssel in `keys.txt` als Verbindung an — `bazaarlink-001`, `bazaarlink-002`, … Ein erneuter Lauf ist idempotent.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Modelle werden dann als `bazaarlink/<model id>` bereitgestellt — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — lastverteilt über alle Verbindungen:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router. Der Konnektor erledigt dort dieselbe Aufgabe — ein `openai-compatible`-Node (Präfix `bazaarlink`), eine Verbindung pro Schlüssel in `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 Was der Anbieter gibt | 124 Modelle über einen einzigen nicht authentifizierten POST — kostenloses qwen3.7-flash:free, keine E-Mail, keine Karte |
| 🔑 Was ein Schlüssel dir bringt | einen API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 124 Modell-IDs am untenstehenden Endpunkt, zu den Limits deines Tarifs. Das Kontingent liegt beim **Konto**, genau deshalb erstellt dieses Tool ein Konto pro Schlüssel |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Deine Daten | nur bazaarlink.ai und das von dir konfigurierte Inbox-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Der kostenlose Pool von BazaarLink wird website-weit geteilt und füllt sich zeitweise; die Verifizierung wiederholt `429`s mit dem `Retry-After` des Servers und einem kurzen Backoff. Wenn ein Lauf hängen bleibt, prüfe `outputs/accounts.json` — dort ist genau festgehalten, welche Exits verbraucht wurden und welche fehlgeschlagen sind. Sieht etwas anderes seltsam aus? **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und der exakten Ausgabe; PRs sind willkommen. Wenn das Blocklisten-Gate weiterhin `403`/Drosselung zurückgibt, stoppt das Tool an diesem Schritt und sagt es — die obige Tabelle der kostenlosen Stufe ist das zuletzt gemessene Gate.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>