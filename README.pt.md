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

**Crie contas BazaarLink em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Camada gratuita](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-124-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isso existe

O BazaarLink entrega uma chave de API funcional a partir de um único POST não autenticado — sem e-mail, sem senha, sem telefone, sem cartão, sem captcha:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   uma chave por linha, gravada no momento em que cada chave é verificada
              └─▶ outputs/   conta, IP de saída, proxy, registro de verificação
```

A chave é utilizável imediatamente, então todo o trabalho é *escala*: **um registro por IP a cada 24 horas** significa que cada conta precisa da sua própria saída. Esta ferramenta triagem as saídas de proxy, registra uma conta por saída e se recusa a gravar uma chave em `keys.txt` até que essa chave tenha respondido a uma conclusão de chat ao vivo.

> **Nota histórica:** o provedor está na lista de bloqueio do workspace a partir de 2026-10-18. O fluxo abaixo é mantido conforme medido — se o upstream posteriormente restaurar os registros, os mesmos passos se aplicam.

## 🎁 Camada gratuita — quanto você recebe

**Grátis em uma conta sem créditos** (sem claim, sem recarga, sem saldo necessário) — limites por conta medidos ao vivo:

| O quê | Valor |
| --- | --- |
| Portão de registro | **1 registro por IP de saída a cada 24 h** — uma saída por conta |
| Modelos gratuitos | `qwen/qwen3.7-flash:free` (contexto de 1M, o verificador), `deepseek/deepseek-v4-flash-0731free:free` (1,05M), `auto:free` (roteador) |
| Cota de modelos gratuitos | **10 RPM / 60 requisições por dia**, 2 simultâneas, compartilhadas entre modelos gratuitos, reset às 00:00 UTC |
| Com saldo | **20 RPM / 120 req/dia** assim que a conta tiver créditos |
| Capacidade gratuita do site | **15 RPM** compartilhados — uma hora movimentada pode responder `429` mesmo quando sua própria cota está intacta; a ferramenta tenta novamente com `Retry-After` |
| Custo de uma chamada gratuita | `cost: 0` em toda conclusão |
| Cadastro | `POST /api/v1/agents/register {name}` — sem caixa de correio, sem cartão |
| A unidade que escala | **uma conta = uma chave** → `--count N` são N orçamentos diários de 60 requisições |

> **Nota de escopo:** bazaarlink/ionet estão na lista de provedores bloqueados — a tabela é o último portão medido; o limite de 24 h/IP é o recurso vinculante.

> 💡 A camada gratuita é definida pelo BazaarLink e pode mudar. Confira os números ao vivo em [bazaarlink.ai](https://bazaarlink.ai) — e deixe o próprio portão da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 124

`GET https://api.bazaarlink.ai/v1/models` retorna **124 modelos**; o catálogo incluído em [`models.json`](models.json) (ou `src/models.json` no layout canônico) foi capturado de uma chave ao vivo.

| Grátis em uma conta sem créditos | Observação |
| --- | --- |
| `qwen/qwen3.7-flash:free` | contexto de 1M, texto+imagem+vídeo — **o verificador aqui** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1,05M, texto — grátis |
| `auto:free` | roteador que escolhe um modelo gratuito |

| Pagos (mesma chave, precisa de créditos — zero markup) | Exemplos |
| --- | --- |
| 110+ ids | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` e o resto dos 124 |

Teste ao vivo de uma chave (exatamente o que o verificador faz):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 Como usar a API

A URL base é **`https://api.bazaarlink.ai/v1`** — compatível com OpenAI.

**Qualquer SDK / curl**

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

**Qualquer agente com URL base personalizada** (Cursor, OpenCode, Kilo Code …): defina a URL base `https://api.bazaarlink.ai/v1`, cole uma chave, escolha qualquer id da tabela acima. Uma chamada de modelo gratuito em uma chave sem créditos responde com `cost: 0`.

## 🛠 Início rápido

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

A saída vai para `keys.txt` (uma chave por linha) e é espelhada em `%USERPROFILE%\\bazaarlink-keys.txt`. Uma chave é gravada **somente depois** que um `POST /v1/chat/completions` ao vivo em `qwen/qwen3.7-flash:free` responder `200` com `cost: 0`.

### 🖱️ O launcher

O launcher é `launcher.js` na **raiz do repositório** (este repositório é plano — não há `src/`). Ele lembra suas respostas em `launcher.config.json` e executa `cli.js` com as flags corretas. `node launcher.js` mostra mint / verify / screen / settings; o cabeçalho pré-visualiza quantas saídas `proxies.txt` contém e quantas chaves estão no disco.

## ✅ Verificado e funcionando — toda chave é testada

Não é uma lista de "provavelmente funciona". Toda chave gravada em `keys.txt` é comprovada contra a API ao vivo primeiro:

| Verificação | Resultado |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** com `api_key` |
| IPs de saída distintos | **30/30 contas — nenhuma conta compartilha uma saída** (medido) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, conclusão real `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 modelos |

Reveja a lista inteira a qualquer momento:

```bash
node cli.js --verify-only        # verify any unproven key
node cli.js --verify-only --all  # re-verify every key from scratch
```

> **Portões de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). Combinações de roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e puder chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são relatadas, nunca ocultadas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| triagem | `screen.js` → `proxies.txt` ──probe──▶ saídas vivas e distintas → `outputs/exit-queue.json` | uma saída é gasta no máximo uma vez a cada 24 h |
| registro | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| verificação | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | o portão sobrevivível — um `429` com `Retry-After` é repetido |
| persistência | `keys.txt` + `outputs/state.json` + espelho do provedor `%USERPROFILE%\\bazaarlink-keys.txt` | uma execução é checkpointada: reexecutar continua de onde parou |

## ⚙️ Opções da CLI

```bash
node cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node cli.js --verify-only [--all]     # re-verify unproven / all keys
node cli.js --screen --chunk 200      # only screen your proxy list
node cli.js --help
```

| Opção | Padrão | Significado |
| --- | --- | --- |
| `--count N` | `30` | quantas contas criar — **qualquer N**, não há máximo |
| `--chunk N` | `120` | linhas de proxy a triar por rodada |
| `--rounds N` | `30` | máximo de rodadas de triagem → mint → verificação |
| `--model m` | `qwen/qwen3.7-flash:free` | modelo usado para a verificação ao vivo |
| `--no-verify` | desativado | pula a verificação de conclusão (não recomendado) |

Os scripts subjacentes (`screen.js`, `mint.js`, `verify.js`, `run.js`) aceitam as mesmas flags e podem ser executados por conta própria. Todos os caminhos (`proxies.txt`, `keys.txt`, `outputs/`) estão na **raiz do repositório** neste layout plano.

## 🛰️ Atrás de um proxy

**Obrigatório.** O BazaarLink permite um registro por IP a cada 24 h, então uma única conexão pode produzir uma conta por dia. O pool é lido de `proxies.txt` ao lado do repositório, ou de `$BAZAARLINK_PROXIES`.

Toda requisição usa `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 e HTTP CONNECT funcionam. O `fetch` do `undici` nunca é usado, porque ele ignora a opção `agent` e vazaria silenciosamente seu IP real.

Cada proxy é triado ao vivo (acessibilidade à API) antes de ser enfileirado, uma saída já gasta em uma conta nunca é reutilizada, e saídas gratuitas decaem em minutos — então a triagem roda em pequenos blocos checkpointados intercalados com a criação, em vez de uma longa passagem única.

**Não há fallback de conexão direta.** Se o pool secar, a execução para e avisa, em vez de criar a partir do seu próprio IP.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave por linha — ignorado pelo git, nunca commitado |
| [`models.json`](models.json) | o catálogo completo de 124 modelos (`GET /v1/models` medido) |
| `outputs/accounts.json` | registro por conta (nome, saída, proxy, status, verificação) sem chaves brutas |
| `outputs/state.json` | estado de execução retomável (contém chaves, ignorado pelo git) |
| `outputs/exit-queue.json` | saídas triadas aguardando para serem gastas |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | a ferramenta — tudo na **raiz do repositório** (layout plano) |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI. O BazaarLink serve inferência compatível com OpenAI em `https://api.bazaarlink.ai/v1`, então o conector registra **um nó de provedor `openai-compatible`** (prefixo `bazaarlink`) e anexa cada chave em `keys.txt` como uma conexão — `bazaarlink-001`, `bazaarlink-002`, … Reexecutá-lo é idempotente.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Os modelos são então servidos como `bazaarlink/<model id>` — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — com balanceamento de carga entre todas as conexões:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI. O conector faz o mesmo trabalho lá — um nó `openai-compatible` (prefixo `bazaarlink`), uma conexão por chave em `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 O que o provedor dá | 124 modelos via um único POST não autenticado — qwen3.7-flash:free grátis, sem e-mail, sem cartão |
| 🔑 O que uma chave te dá | uma chave de API limitada à sua própria conta: os 124 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, que é exatamente por que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Seus dados | apenas bazaarlink.ai e o backend de caixa de entrada que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

O pool gratuito do BazaarLink é compartilhado em todo o site e às vezes fica cheio; a verificação repete `429`s com o `Retry-After` do servidor e um breve backoff. Se uma execução travar, verifique `outputs/accounts.json` — ele registra exatamente quais saídas foram gastas e quais falharam. Algo mais parece errado? **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos. Se o portão da lista de bloqueio ainda retornar `403`/throttle, a ferramenta para nessa etapa e avisa — a tabela da camada gratuita acima é o último portão medido.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>