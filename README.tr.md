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

**Otomatik oluşturulan API anahtarlarıyla toplu BazaarLink hesabı oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-124%20served-412991?style=for-the-badge)](https://bazaarlink.ai/en/docs)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-124-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

BazaarLink, tek bir kimlik doğrulaması gerektirmeyen POST isteğiyle çalışan bir API anahtarı verir — e-posta yok, parola yok, telefon yok, kart yok, captcha yok:

```
POST https://api.bazaarlink.ai/api/v1/agents/register   {"name":"api-mint-001-x7f2qa"}
   │
   └──▶ 201 { "api_key": "sk-bl-…", "claim_token": "…", "free_model": "auto:free" }
              │
              ├─▶ keys.txt   her satırda bir anahtar, her anahtar doğrulandığı anda yazılır
              └─▶ outputs/   hesap, çıkış IP'si, proxy, doğrulama kaydı
```

Anahtar hemen kullanılabilir, yani tüm iş *ölçeklendirmedir*: **IP başına 24 saatte bir kayıt** demek, her hesabın kendi çıkışına ihtiyacı olduğu anlamına gelir. Bu araç proxy çıkışlarını tarar, her çıkış için bir hesap kaydeder ve o anahtar canlı bir sohbet tamamlama isteğine yanıt verene kadar `keys.txt` dosyasına anahtar yazmayı reddeder.

> **Tarihsel not:** sağlayıcı 2026-10-18 itibarıyla çalışma alanı engel listesindedir. Aşağıdaki akış ölçüldüğü gibi korunmuştur — sağlayıcı ileride kayıtları yeniden açarsa aynı adımlar geçerlidir.

## 🎁 Ücretsiz katman — ne kadar alırsınız

**Kredisiz bir hesapta ücretsiz** (talep yok, bakiye yükleme yok, bakiye gerekmez) — hesap başına canlı ölçülen limitler:

| Ne | Değer |
| --- | --- |
| Kayıt kapısı | **Çıkış IP'si başına 24 saatte 1 kayıt** — hesap başına bir çıkış |
| Ücretsiz modeller | `qwen/qwen3.7-flash:free` (1M bağlam, doğrulayıcı), `deepseek/deepseek-v4-flash-0731free:free` (1.05M), `auto:free` (yönlendirici) |
| Ücretsiz model kotası | **10 RPM / günde 60 istek**, 2 eşzamanlı, ücretsiz modeller arasında paylaşılır, 00:00 UTC'de sıfırlanır |
| Bakiyeyle | Hesapta kredi olduğunda **20 RPM / günde 120 istek** |
| Site geneli ücretsiz kapasite | **15 RPM** paylaşılır — yoğun bir saatte kendi kotanız dokunulmamış olsa bile `429` yanıtı gelebilir; araç `Retry-After` ile yeniden dener |
| Ücretsiz çağrının maliyeti | Her tamamlamada `cost: 0` |
| Kayıt | `POST /api/v1/agents/register {name}` — posta kutusu yok, kart yok |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N`, N adet günlük 60 istek bütçesidir |

> **Kapsam notu:** bazaarlink/ionet engellenen sağlayıcı listesindedir — tablo son ölçülen kapıdır; 24 saat/IP kısıtlaması bağlayıcı kaynaktır.

> 💡 Ücretsiz katman BazaarLink tarafından belirlenir ve değişebilir. Güncel sayıları [bazaarlink.ai](https://bazaarlink.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # keys.txt içindeki her anahtar gerçek bir sohbet çağrısıyla yeniden test edilir
```

## 🤖 Modeller — 124'ünün tamamı

`GET https://api.bazaarlink.ai/v1/models` **124 model** döndürür; [`models.json`](models.json) içinde (veya kanonik düzende `src/models.json`) bulunan katalog canlı bir anahtardan alınmıştır.

| Kredisiz hesapta ücretsiz | Not |
| --- | --- |
| `qwen/qwen3.7-flash:free` | 1M bağlam, metin+görüntü+video — **buradaki doğrulayıcı** |
| `deepseek/deepseek-v4-flash-0731free:free` | 1.05M, metin — ücretsiz |
| `auto:free` | ücretsiz bir model seçen yönlendirici |

| Ücretli (aynı anahtar, kredi gerektirir — sıfır fark) | Örnekler |
| --- | --- |
| 110+ kimlik | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `claude-opus-5`, `claude-sonnet-5.5`, `claude-fable-5.1`, `gemini-3.8-flash`, `gemini-3.7-flash`, `grok-4.7`, `kimi-k3`, `glm-5.3`, `deepseek-v4-pro`, `qwen3.8-max` ve 124'ün geri kalanı |

Bir anahtarın canlı testi (doğrulayıcının tam olarak yaptığı şey):

```bash
curl https://api.bazaarlink.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-bl-…" -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":16}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.bazaarlink.ai/v1`** — OpenAI uyumlu.

**Herhangi bir SDK / curl**

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

**Özel temel URL kullanan herhangi bir ajan** (Cursor, OpenCode, Kilo Code …): temel URL'yi `https://api.bazaarlink.ai/v1` olarak ayarlayın, bir anahtar yapıştırın, yukarıdaki tablodan herhangi bir kimlik seçin. Kredisiz bir anahtarla ücretsiz model çağrısı `cost: 0` ile yanıt verir.

## 🛠 Hızlı başlangıç

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

Çıktı `keys.txt` dosyasına düşer (her satırda bir anahtar) ve `%USERPROFILE%\\bazaarlink-keys.txt` dosyasına yansıtılır. Bir anahtar, `qwen/qwen3.7-flash:free` üzerinde canlı bir `POST /v1/chat/completions` isteği `cost: 0` ile `200` yanıtı verene kadar **ancak ondan sonra** yazılır.

### 🖱️ Başlatıcı

Başlatıcı `src/launcher.js` dosyasıdır; yönlendirdiği düz betikler (`src/cli.js`, `src/run.js`, `src/screen.js`, `src/verify.js`) aynı bayrakları kendi başlarına kabul eder. Yanıtlarınızı `launcher.config.json` dosyasında hatırlar ve CLI'yi doğru bayraklarla çalıştırır. `node src/launcher.js` mint / verify / screen / settings seçeneklerini gösterir; başlık, `proxies.txt` dosyasının kaç çıkış içerdiğini ve diskte kaç anahtar olduğunu önizler.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

"Muhtemelen çalışır" listesi değil. `keys.txt` dosyasına yazılan her anahtar önce canlı API'ye karşı kanıtlanır:

| Kontrol | Sonuç |
| --- | --- |
| `POST /api/v1/agents/register` | `api_key` ile **HTTP 201** |
| Farklı çıkış IP'leri | **30/30 hesap — hiçbir hesap bir çıkışı paylaşmıyor** (ölçüldü) |
| `POST /v1/chat/completions` (`qwen/qwen3.7-flash:free`) | **30/30 → HTTP 200**, gerçek tamamlama `content: "pong"`, `cost: 0` |
| `GET /v1/models` | **200**, 124 model |

Tüm listeyi istediğiniz zaman yeniden kontrol edin:

```bash
node src/cli.js --verify-only        # verify any unproven key
node src/cli.js --verify-only --all  # re-verify every key from scratch
```

> **Kalite kapıları.** Buradaki her anahtar `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` testini geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtı veriyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> hatalar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BazaarLink page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.bazaarlink.ai/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| tarama | `screen.js` → `proxies.txt` ──yokla──▶ canlı, farklı çıkışlar → `outputs/exit-queue.json` | bir çıkış 24 saatte en fazla bir kez harcanır |
| kayıt | `POST https://api.bazaarlink.ai/api/v1/agents/register {name}` | `201 {api_key, claim_token, free_model}` |
| doğrulama | `POST https://api.bazaarlink.ai/v1/chat/completions` (`qwen/qwen3.7-flash:free`) | hayatta kalınabilir kapı — `Retry-After` içeren bir `429` yeniden denenir |
| kalıcılaştırma | `keys.txt` + `outputs/state.json` + sağlayıcı yansıması `%USERPROFILE%\\bazaarlink-keys.txt` | bir çalıştırma kontrol noktasına alınır: yeniden çalıştırma kaldığı yerden devam eder |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N                 # screen exits → mint → verify (any N, default 30)
node src/cli.js --verify-only [--all]     # re-verify unproven / all keys
node src/cli.js --screen --chunk 200      # only screen your proxy list
node src/cli.js --help
```

| Seçenek | Varsayılan | Anlamı |
| --- | --- | --- |
| `--count N` | `30` | oluşturulacak hesap sayısı — **herhangi bir N**, maksimum yok |
| `--chunk N` | `120` | tur başına taranacak proxy satırı |
| `--rounds N` | `30` | maksimum tara → oluştur → doğrula turu |
| `--model m` | `qwen/qwen3.7-flash:free` | canlı doğrulama için kullanılan model |
| `--no-verify` | kapalı | tamamlama kontrolünü atla (önerilmez) |

Temel betikler (`src/screen.js`, `src/mint.js`, `src/verify.js`, `src/run.js`) aynı bayrakları kabul eder ve kendi başlarına çalıştırılabilir. Tüm veri yolları (`proxies.txt`, `keys.txt`, `outputs/`) **depo kökünde**, `src/` klasörünün bir üst seviyesindedir.

## 🛰️ Proxy arkasında

**Gerekli.** BazaarLink, IP başına 24 saatte bir kayda izin verir, yani tek bir bağlantı günde bir hesap üretebilir. Havuz, deponun yanındaki `proxies.txt` dosyasından veya `$BAZAARLINK_PROXIES` ortam değişkeninden okunur.

Her istek `https.request` + `createAgent(parseProxy(line))` kullanır — SOCKS4/4a, SOCKS5 ve HTTP CONNECT çalışır. `undici`'nin `fetch`'i asla kullanılmaz, çünkü `agent` seçeneğini yok sayar ve gerçek IP'nizi sessizce sızdırır.

Her proxy kuyruğa alınmadan önce canlı olarak taranır (API erişilebilirliği), bir hesap için harcanmış bir çıkış asla yeniden kullanılmaz ve ücretsiz çıkışlar dakikalar içinde bozulur — bu nedenle tarama, tek uzun geçiş yerine kısa kontrol noktalı parçalar halinde oluşturma ile iç içe çalışır.

**Doğrudan bağlantı yedeği yoktur.** Havuz tükenirse, çalıştırma kendi IP'nizden oluşturmak yerine durur ve bunu bildirir.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | her satırda bir anahtar — git tarafından yok sayılır, asla işlenmez |
| [`models.json`](models.json) | tam 124 modellik katalog (ölçülen `GET /v1/models`) |
| `outputs/accounts.json` | hesap başına kayıt (ad, çıkış, proxy, durum, doğrulama), ham anahtar içermez |
| `outputs/state.json` | devam ettirilebilir çalıştırma durumu (anahtarları tutar, git tarafından yok sayılır) |
| `outputs/exit-queue.json` | harcanmayı bekleyen taranmış çıkışlar |
| `src/cli.js` · `src/launcher.js` · `src/mint.js` · `src/screen.js` · `src/verify.js` · `src/run.js` · `src/proxy.js` | araç — `src/` betikleri tutar, veri dosyaları depo kökünde kalır |

## 🔌 9Router'a bağlanın

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir. BazaarLink, `https://api.bazaarlink.ai/v1` adresinde OpenAI uyumlu çıkarım sunar, bu nedenle bağlayıcı **bir `openai-compatible` sağlayıcı düğümü** kaydeder (önek `bazaarlink`) ve `keys.txt` içindeki her anahtarı bir bağlantı olarak ekler — `bazaarlink-001`, `bazaarlink-002`, … Yeniden çalıştırmak etkisizdir (idempotent).

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`. Modeller daha sonra `bazaarlink/<model id>` olarak sunulur — `bazaarlink/qwen/qwen3.7-flash:free`, `bazaarlink/deepseek/deepseek-v4-flash-0731free:free`, `bazaarlink/auto:free` — her bağlantı arasında yük dengelenir:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute'a bağlanın

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir. Bağlayıcı orada da aynı işi yapar — bir `openai-compatible` düğümü (önek `bazaarlink`), `keys.txt` içindeki her anahtar için bir bağlantı:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "BazaarLink"`, `--prefix bazaarlink`, `--base-url https://api.bazaarlink.ai/v1`, `--model qwen/qwen3.7-flash:free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"bazaarlink/qwen/qwen3.7-flash:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **BazaarLink** — [bazaarlink.ai](https://bazaarlink.ai) |
| 🎁 Sağlayıcının verdikleri | Tek bir kimlik doğrulaması gerektirmeyen POST ile 124 model — ücretsiz qwen3.7-flash:free, e-posta yok, kart yok |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktada 124 model kimliği, planınızın limitlerinde. Kota **hesapta** yaşar, bu yüzden bu araç anahtar başına bir hesap oluşturur |
| 🌐 API şekli | OpenAI uyumlu: `POST https://api.bazaarlink.ai/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca bazaarlink.ai ve yapılandırdığınız gelen kutusu arka ucuyla iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

BazaarLink'in ücretsiz havuzu site genelinde paylaşılır ve zaman zaman dolar; doğrulama, `429` yanıtlarını sunucunun `Retry-After` değeri ve kısa bir geri çekilme ile yeniden dener. Bir çalıştırma takılırsa `outputs/accounts.json` dosyasını kontrol edin — hangi çıkışların harcandığını ve hangilerinin başarısız olduğunu tam olarak kaydeder. Başka bir şey ters görünüyor mu? Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır. Engel listesi kapısı hâlâ `403`/kısıtlama döndürüyorsa, araç o adımda durur ve bunu bildirir — yukarıdaki ücretsiz katman tablosu son ölçülen kapıdır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 bazaarlink-bulk-apikey katkıda bulunanlar

</div>