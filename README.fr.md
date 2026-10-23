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

**Créez en masse des comptes BazaarLink avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Niveau gratuit](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-124-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

BazaarLink délivre une clé API fonctionnelle à partir d'un simple POST non authentifié — pas d'e-mail, pas de mot de passe, pas de téléphone, pas de carte, pas de captcha :

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   une clé par ligne, écrite au moment où chaque clé est vérifiée
              └─▶ outputs/   compte, IP de sortie, proxy, enregistrement de vérification
```

La clé est utilisable immédiatement, donc tout l'enjeu est l'*échelle* : **une inscription par IP toutes les 24 heures** signifie que chaque compte a besoin de sa propre sortie. Cet outil filtre les sorties proxy, inscrit un compte par sortie et refuse d'écrire une clé dans `keys.txt` tant que cette clé n'a pas répondu à une complétion de chat en direct.

> **Note historique :** le fournisseur figure sur la liste de blocage de l'espace de travail depuis le 2026-10-18. Le flux ci-dessous est conservé tel que mesuré — si l'amont rétablit plus tard les inscriptions, les mêmes étapes s'appliquent.

## 🎁 Niveau gratuit — ce que vous obtenez

**Gratuit sur un compte sans crédit** (aucune réclamation, aucune recharge, aucun solde nécessaire) — limites par compte mesurées en direct :

| Quoi | Valeur |
| --- | --- |
| Barrière d'inscription | **1 inscription par IP de sortie toutes les 24 h** — une sortie par compte |
| Modèles gratuits | `qwen/qwen3.7-flash:free` (contexte 1M, le vérificateur), `deepseek/deepseek-v4-flash-0731free:free` (1,05M), `auto:free` (routeur) |
| Quota des modèles gratuits | **10 RPM / 60 requêtes par jour**, 2 en simultané, partagé entre les modèles gratuits, réinitialisé à 00:00 UTC |
| Avec solde | **20 RPM / 120 req/jour** une fois que le compte détient des crédits |
| Capacité gratuite à l'échelle du site | **15 RPM** partagés — une heure chargée peut répondre `429` même quand votre propre quota est intact ; l'outil réessaie avec `Retry-After` |
| Coût d'un appel gratuit | `cost: 0` sur chaque complétion |
| Inscription | `POST /api/v1/agents/register {name}` — pas de boîte mail, pas de carte |
| L'unité qui passe à l'échelle | **un compte = une clé** → `--count N` correspond à N budgets quotidiens de 60 requêtes |

> **Note de portée :** bazaarlink/ionet figurent sur la liste des fournisseurs bloqués — le tableau correspond à la dernière barrière mesurée ; la limitation de 24 h/IP est la ressource contraignante.

> 💡 Le niveau gratuit est défini par BazaarLink et peut changer. Vérifiez les chiffres en direct sur [bazaarlink.ai](https://bazaarlink.ai) — et laissez la barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # chaque clé de keys.txt est retestée avec un véritable appel de chat
```

## 🤖 Modèles — les 124

`GET https://api.bazaarlink.ai/v1/models` renvoie **124 modèles** ; le catalogue fourni dans [`models.json`](models.json) (ou `src/models.json` dans la disposition canonique) a été capturé à partir d'une clé en direct.

| Gratuit sur un compte sans crédit | Remarque |
| --- | --- |
| `qwen/qwen3.7-flash:free` | Contexte 1M, texte+image+vidéo — **le vérificateur ici** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1,05M, texte — gratuit |
| `auto:free` | routeur qui choisit un modèle gratuit |

| Payant (même clé, nécessite des crédits — zéro marge) | Exemples |
| --- | --- |
| 110+ ids | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` et le reste des 124 |

Test en direct d'une clé (exactement ce que fait le vérificateur) :

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 Comment utiliser l'API

L'URL de base est **`https://api.bazaarlink.ai/v1`** — compatible OpenAI.

**N'importe quel SDK / curl**

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

**N'importe quel agent avec une URL de base personnalisée** (Cursor, OpenCode, Kilo Code …) : définissez l'URL de base `https://api.bazaarlink.ai/v1`, collez une clé, choisissez n'importe quel id du tableau ci-dessus. Un appel à un modèle gratuit sur une clé sans crédit répond avec `cost: 0`.

## 🛠 Démarrage rapide

```bash
git clone https://github.com/F0Rextasy/bazaarlink-bulk-apikey.git
cd bazaarlink-bulk-apikey

# 1) votre liste de proxys — un par ligne (http://host:port | socks5://host:port | host:port)
printf 'socks5://127.0.0.1:1080\n' > proxies.txt

# 2) c'est parti
node launcher.js          # interactif : mint / verify / screen / settings

# ou directement :
node cli.js --count 30    # n'importe quel N — 30 n'est que l'échantillon par défaut
```

La sortie atterrit dans `keys.txt` (une clé par ligne) et est mise en miroir dans `%USERPROFILE%\\bazaarlink-keys.txt`. Une clé n'est écrite **qu'après** qu'un `POST /v1/chat/completions` en direct sur `qwen/qwen3.7-flash:free` a répondu `200` avec `cost: 0`.

### 🖱️ Le lanceur

Le lanceur est `launcher.js` à la **racine du dépôt** (ce dépôt est à plat — il n'y a pas de `src/`). Il mémorise vos réponses dans `launcher.config.json` et exécute `cli.js` avec les bons drapeaux. `node launcher.js` affiche mint / verify / screen / settings ; l'en-tête prévisualise combien de sorties contient `proxies.txt` et combien de clés sont sur le disque.

## ✅ Vérifié fonctionnel — chaque clé est testée

Pas une liste « ça marche probablement ». Chaque clé écrite dans `keys.txt` est d'abord prouvée contre l'API en direct :

| Vérification | Résultat |
| --- | --- |
| `POST /api/v1/agents/register` | **HTTP 201** avec `api_key` |
| IP de sortie distinctes | **30/30 comptes — aucun compte ne partage une sortie** (mesuré) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, complétion réelle `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 modèles |

Revérifiez toute la liste à tout moment :

```bash
node cli.js --verify-only        # vérifier toute clé non prouvée
node cli.js --verify-only --all  # revérifier chaque clé depuis zéro
```

> **Barrières de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons de routeurs suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans prise en charge des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais masqués.

## 🧭 Comment ça marche

```
inbox (une adresse par compte)                                   une adresse fraîche par compte
   │
   ├─▶ inscription : page BazaarLink → adresse e-mail → code / lien depuis l'inbox
   ├─▶ session : les cookies ou le jeton d'accès du compte en main
   ├─▶ création de clé : le point de terminaison de clé du compte → clé en clair renvoyée une fois (écrite sur le disque immédiatement)
   └─▶ preuve en direct : POST https://api.bazaarlink.ai/v1/chat/completions → contenu réel = la clé est vivante
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| filtrer | `screen.js` → `proxies.txt` ──sonde──▶ sorties vivantes et distinctes → `outputs/exit-queue.json` | une sortie est dépensée au plus une fois par 24 h |
| inscrire | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| vérifier | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | la barrière de survie — un `429` avec `Retry-After` est réessayé |
| persister | `keys.txt` + `outputs/state.json` + miroir du fournisseur `%USERPROFILE%\\bazaarlink-keys.txt` | une exécution est sauvegardée par points de contrôle : relancer reprend là où elle s'est arrêtée |

## ⚙️ Options CLI

```bash
node cli.js --count N                 # filtrer les sorties → créer → vérifier (n'importe quel N, défaut 30)
node cli.js --verify-only [--all]     # revérifier les clés non prouvées / toutes les clés
node cli.js --screen --chunk 200      # filtrer uniquement votre liste de proxys
node cli.js --help
```

| Option | Défaut | Signification |
| --- | --- | --- |
| `--count N` | `30` | combien de comptes créer — **n'importe quel N**, il n'y a pas de maximum |
| `--chunk N` | `120` | lignes de proxy à filtrer par tour |
| `--rounds N` | `30` | nombre max de tours filtrer → créer → vérifier |
| `--model m` | `qwen/qwen3.7-flash:free` | modèle utilisé pour la vérification en direct |
| `--no-verify` | désactivé | ignorer la vérification de complétion (non recommandé) |

Les scripts sous-jacents (`screen.js`, `mint.js`, `verify.js`, `run.js`) acceptent les mêmes drapeaux et peuvent être exécutés seuls. Tous les chemins (`proxies.txt`, `keys.txt`, `outputs/`) sont à la **racine du dépôt** dans cette disposition à plat.

## 🛰️ Derrière un proxy

**Requis.** BazaarLink autorise une inscription par IP toutes les 24 h, donc une seule connexion peut produire un compte par jour. Le pool est lu depuis `proxies.txt` à côté du dépôt, ou depuis `$BAZAARLINK_PROXIES`.

Chaque requête utilise `https.request` + `createAgent(parseProxy(line))` — SOCKS4/4a, SOCKS5 et HTTP CONNECT fonctionnent tous. Le `fetch` d'`undici` n'est jamais utilisé, car il ignore l'option `agent` et divulguerait silencieusement votre véritable IP.

Chaque proxy est filtré en direct (accessibilité de l'API) avant d'être mis en file, une sortie déjà dépensée pour un compte n'est jamais réutilisée, et les sorties gratuites se dégradent en quelques minutes — c'est pourquoi le filtrage s'exécute en courts segments avec points de contrôle entrelacés avec la création plutôt qu'en une seule longue passe.

**Il n'y a pas de repli en connexion directe.** Si le pool s'épuise, l'exécution s'arrête et le signale au lieu de créer depuis votre propre IP.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé par ligne — ignoré par git, jamais commité |
| [`models.json`](models.json) | le catalogue complet des 124 modèles (mesuré via `GET /v1/models`) |
| `outputs/accounts.json` | enregistrement par compte (nom, sortie, proxy, statut, vérification) sans clés brutes |
| `outputs/state.json` | état d'exécution reprenable (contient les clés, ignoré par git) |
| `outputs/exit-queue.json` | sorties filtrées en attente d'être dépensées |
| `cli.js` · `launcher.js` · `mint.js` · `screen.js` · `verify.js` · `run.js` · `proxy.js` | l'outil — tous à la **racine du dépôt** (disposition à plat) |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI. BazaarLink sert une inférence compatible OpenAI à `https://api.bazaarlink.ai/v1`, donc le connecteur enregistre **un nœud fournisseur `openai-compatible`** (préfixe `bazaarlink`) et attache chaque clé de `keys.txt` comme connexion — `bazaarlink-001`, `bazaarlink-002`, … Le relancer est idempotent.

```bash
node src/connect-9router.js                    # chaque clé de keys.txt
node src/connect-9router.js --model <id>       # épingler le modèle par défaut de la connexion
```

Défauts : `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Les modèles sont alors servis sous la forme `bazaarlink/<model id>` — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — répartis en charge sur chaque connexion :

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Connexion à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI. Le connecteur fait le même travail ici — un nœud `openai-compatible` (préfixe `bazaarlink`), une connexion par clé de `keys.txt` :

```bash
node src/connect-omniroute.js                  # chaque clé de keys.txt
node src/connect-omniroute.js --model <id>     # épingler le modèle par défaut de la connexion
```

Défauts : `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 Ce que le fournisseur offre | 124 modèles via un seul POST non authentifié — qwen3.7-flash:free gratuit, pas d'e-mail, pas de carte |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 124 ids de modèles sur le point de terminaison ci-dessous, aux limites de votre forfait. Le quota réside sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | Compatible OpenAI : `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Vos données | seuls bazaarlink.ai et le backend d'inbox que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Le pool gratuit de BazaarLink est partagé à l'échelle du site et se remplit parfois ; la vérification réessaie les `429` avec le `Retry-After` du serveur et un court délai d'attente. Si une exécution bloque, consultez `outputs/accounts.json` — il enregistre exactement quelles sorties ont été dépensées et lesquelles ont échoué. Autre chose semble anormal ? **[Ouvrez un ticket](../../issues)** avec la commande que vous avez exécutée et la sortie exacte ; les PR sont bienvenues. Si la barrière de la liste de blocage renvoie encore `403`/une limitation, l'outil s'arrête à cette étape et le signale — le tableau du niveau gratuit ci-dessus correspond à la dernière barrière mesurée.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey contributors

</div>