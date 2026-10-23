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

**Crea cuentas de BazaarLink en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-124-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

BazaarLink entrega una clave API funcional a partir de un único POST sin autenticación — sin correo electrónico, sin contraseña, sin teléfono, sin tarjeta, sin captcha:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   una clave por línea, escrita en el momento en que cada clave se verifica
              └─▶ outputs/   cuenta, IP de salida, proxy, registro de verificación
```

La clave es utilizable de inmediato, así que todo el trabajo es *escala*: **un registro por IP cada 24 horas** significa que cada cuenta necesita su propia salida. Esta herramienta filtra las salidas de proxy, registra una cuenta por salida y se niega a escribir una clave en `keys.txt` hasta que esa clave haya respondido a una finalización de chat en vivo.

> **Nota histórica:** el proveedor está en la lista de bloqueo del espacio de trabajo a partir del 2026-10-18. El flujo a continuación se mantiene tal como se midió — si el upstream restaura los registros más adelante, se aplican los mismos pasos.

## 🎁 Nivel gratuito — cuánto obtienes

**Gratis en una cuenta sin crédito** (sin reclamar, sin recargar, sin saldo necesario) — límites por cuenta medidos en vivo:

| Qué | Valor |
| --- | --- |
| Puerta de registro | **1 registro por IP de salida cada 24 h** — una salida por cuenta |
| Modelos gratuitos | `qwen/qwen3.7-flash:free` (contexto de 1M, el verificador), `deepseek/deepseek-v4-flash-0731free:free` (1.05M), `auto:free` (enrutador) |
| Cuota de modelos gratuitos | **10 RPM / 60 solicitudes por día**, 2 concurrentes, compartidas entre los modelos gratuitos, se restablece a las 00:00 UTC |
| Con saldo | **20 RPM / 120 solicitudes/día** una vez que la cuenta tiene créditos |
| Capacidad gratuita de todo el sitio | **15 RPM** compartidas — una hora de mucha actividad puede responder `429` incluso cuando tu propia cuota está intacta; la herramienta reintenta con `Retry-After` |
| Coste de una llamada gratuita | `cost: 0` en cada finalización |
| Registro | `POST /api/v1/agents/register {name}` — sin buzón, sin tarjeta |
| La unidad que escala | **una cuenta = una clave** → `--count N` son N presupuestos diarios de 60 solicitudes |

> **Nota de alcance:** bazaarlink/ionet están en la lista de proveedores bloqueados — la tabla es la última puerta medida; el límite de 24 h/IP es el recurso vinculante.

> 💡 El nivel gratuito lo establece BazaarLink y puede cambiar. Consulta los números en vivo en [bazaarlink.ai](https://bazaarlink.ai) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 124

`GET https://api.bazaarlink.ai/v1/models` devuelve **124 modelos**; el catálogo incluido en [`models.json`](models.json) (o `src/models.json` en la disposición canónica) se capturó a partir de una clave en vivo.

| Gratis en una cuenta sin crédito | Nota |
| --- | --- |
| `qwen/qwen3.7-flash:free` | contexto de 1M, texto+imagen+vídeo — **el verificador aquí** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M, texto — gratis |
| `auto:free` | enrutador que elige un modelo gratuito |

| De pago (misma clave, necesita créditos — sin margen) | Ejemplos |
| --- | --- |
| Más de 110 ids | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` y el resto de los 124 |

Prueba en vivo de una clave (exactamente lo que hace el verificador):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 Cómo usar la API

La URL base es **`https://api.bazaarlink.ai/v1`** — compatible con OpenAI.

**Cualquier SDK / curl**

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

**Cualquier agente con una URL base personalizada** (Cursor, OpenCode, Kilo Code …): establece la URL base `https://api.bazaarlink.ai/v1`, pega una clave, elige cualquier id de la tabla anterior. Una llamada a un modelo gratuito con una clave sin crédito responde con `cost: 0`.

## 🛠 Inicio rápido

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

La salida llega a `keys.txt` (una clave por línea) y se refleja en `%USERPROFILE%\\bazaarlink-keys.txt`. Una clave se escribe **solo después** de que un `POST /v1/chat/completions` en vivo sobre `qwen/qwen3.7-flash:free` responda `200` con `cost: 0`.

### 🖱️ El lanzador

El lanzador es `src/launcher.js`; los scripts planos que controla (`src/cli.js`, `src/run.js`, `src/screen.js`, `src/verify.js`) aceptan los mismos flags por su cuenta. Recuerda tus respuestas en `launcher.config.json` y ejecuta el CLI con los flags correctos. `node src/launcher.js` muestra mint / verify / screen / settings; el encabezado previsualiza cuántas salidas contiene `proxies.txt` y cuántas claves hay en disco.

## ✅ Verificado y funcionando — cada clave se prueba

No es una lista de "probablemente funciona". Cada clave escrita en `keys.txt` se comprueba primero contra la API en vivo:

| Comprobación | Resultado |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** con `api_key` |
| IPs de salida distintas | **30/30 cuentas — ninguna cuenta comparte salida** (medido) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, finalización real `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 modelos |

Vuelve a comprobar toda la lista en cualquier momento:

```bash
node src/cli.js --verify-only        # verify any unproven key
node src/cli.js --verify-only --all  # re-verify every key from scratch
```

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del enrutador siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación en cualquier momento;
> los fallos se informan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| screen | `screen.js` → `proxies.txt` ──probe──▶ salidas vivas y distintas → `outputs/exit-queue.json` | una salida se gasta como máximo una vez cada 24 h |
| register | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verify | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | la puerta superviviente — un `429` con `Retry-After` se reintenta |
| persist | `keys.txt` + `outputs/state.json` + espejo del proveedor `%USERPROFILE%\\bazaarlink-keys.txt` | una ejecución tiene puntos de control: volver a ejecutar continúa donde se dejó |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node src/cli.js --verify-only [--all]     # re-verify unproven / all keys
node src/cli.js --screen --chunk 200      # only screen your proxy list
node src/cli.js --help
```

| Opción | Predeterminado | Significado |
| --- | --- | --- |
| `--count N` | `30` | cuántas cuentas crear — **cualquier N**, no hay máximo |
| `--chunk N` | `120` | líneas de proxy a filtrar por ronda |
| `--rounds N` | `30` | rondas máximas de screen → mint → verify |
| `--model m` | `qwen/qwen3.7-flash:free` | modelo usado para la verificación en vivo |
| `--no-verify` | desactivado | omite la comprobación de finalización (no recomendado) |

Los scripts subyacentes (`src/screen.js`, `src/mint.js`, `src/verify.js`, `src/run.js`) aceptan los mismos flags y pueden ejecutarse por su cuenta. Todas las rutas de datos (`proxies.txt`, `keys.txt`, `outputs/`) están en la **raíz del repositorio**, un nivel por encima de `src/`.

## 🛰️ Detrás de un proxy

**Obligatorio.** BazaarLink permite un registro por IP cada 24 h, así que una sola conexión puede producir una cuenta al día. El grupo se lee de `proxies.txt` junto al repositorio, o de `$BAZAARLINK_PROXIES`.

Cada solicitud usa `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 y HTTP CONNECT funcionan todos. El `fetch` de `undici` nunca se usa, porque ignora la opción `agent` y filtraría silenciosamente tu IP real.

Cada proxy se filtra en vivo (accesibilidad a la API) antes de ponerse en cola, una salida ya gastada en una cuenta nunca se reutiliza, y las salidas gratuitas decaen en minutos — por eso el filtrado se ejecuta en fragmentos cortos con puntos de control intercalados con la creación, en lugar de una sola pasada larga.

**No hay respaldo de conexión directa.** Si el grupo se agota, la ejecución se detiene y lo indica en lugar de crear desde tu propia IP.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave por línea — ignorada por git, nunca confirmada |
| [`models.json`](models.json) | el catálogo completo de 124 modelos (medido con `GET /v1/models`) |
| `outputs/accounts.json` | registro por cuenta (nombre, salida, proxy, estado, verificación) sin claves en bruto |
| `outputs/state.json` | estado de ejecución reanudable (contiene claves, ignorado por git) |
| `outputs/exit-queue.json` | salidas filtradas en espera de ser gastadas |
| `src/cli.js` · `src/launcher.js` · `src/mint.js` · `src/screen.js` · `src/verify.js` · `src/run.js` · `src/proxy.js` | la herramienta — `src/` contiene los scripts, los archivos de datos permanecen en la raíz del repositorio |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un enrutador autoalojado y compatible con OpenAI. BazaarLink sirve inferencia compatible con OpenAI en `https://api.bazaarlink.ai/v1`, así que el conector registra **un nodo de proveedor `openai-compatible`** (prefijo `bazaarlink`) y adjunta cada clave de `keys.txt` como una conexión — `bazaarlink-001`, `bazaarlink-002`, … Volver a ejecutarlo es idempotente.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Valores predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Los modelos se sirven entonces como `bazaarlink/<model id>` — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — con balanceo de carga entre todas las conexiones:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un enrutador autoalojado y compatible con OpenAI. El conector hace el mismo trabajo allí — un nodo `openai-compatible` (prefijo `bazaarlink`), una conexión por clave en `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Valores predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 Qué da el proveedor | 124 modelos mediante un único POST sin autenticación — qwen3.7-flash:free gratis, sin correo electrónico, sin tarjeta |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 124 ids de modelo en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con bazaarlink.ai y el backend de buzón que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

El grupo gratuito de BazaarLink es compartido por todo el sitio y a veces se llena; la verificación reintenta los `429` con el `Retry-After` del servidor y un breve retroceso. Si una ejecución se atasca, revisa `outputs/accounts.json` — registra exactamente qué salidas se gastaron y cuáles fallaron. ¿Algo más parece ir mal? **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PR son bienvenidos. Si la puerta de la lista de bloqueo sigue devolviendo `403`/limitación, la herramienta se detiene en ese paso y lo indica — la tabla del nivel gratuito de arriba es la última puerta medida.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>