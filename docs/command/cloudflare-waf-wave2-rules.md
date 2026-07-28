# Edge WAF — Wave 2 Cost Gate (Vercel-first · Cloudflare when proxied)

**Owner:** Head of Product Engineering  
**RFC:** `wave2-engineering-rfc-2026-07-28.md` Pillar 2  
**Status (2026-07-28):** Production DNS for `www.pocketportfolio.app` resolves to **Vercel** (`216.150.*`, `Server: Vercel`, **no `cf-ray`**). Cloudflare Custom Rules cannot intercept traffic that never hits Cloudflare.

## Ship-blocking doctrine

Preaching operational cost reduction while paying Vercel for every bot invoke is unacceptable. Edge challenge **must** run before serverless billing.

| Path | When to use | Script |
| --- | --- | --- |
| **A — Vercel Firewall (NOW)** | DNS is Vercel-direct (current prod) | `node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish` |
| **B — Cloudflare WAF** | After orange-cloud DNS proxy + `cf-ray` present | `node scripts/ops-deploy-cloudflare-waf-wave2.mjs` |

### Deploy Path A (immediate)

```powershell
$env:VERCEL_TOKEN = "<token with Firewall write on pocket-portfolio-app>"
node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish
```

Token: https://vercel.com/account/tokens  
Verify: Vercel → pocket-portfolio-app → Firewall → Custom Rules → “Wave2 — Challenge datacenter ASNs on metered APIs”

### Deploy Path B (after Cloudflare proxy)

1. Point `pocketportfolio.app` / `openportfolio.co.uk` DNS through Cloudflare (orange cloud) with Vercel as origin.
2. Confirm: `curl -sI https://www.pocketportfolio.app | findstr /i cf-ray`
3. Run: `CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ZONE_ID=… node scripts/ops-deploy-cloudflare-waf-wave2.mjs`

---

## Rule 1 — Datacenter scrapers on ticker API (primary)

**Name:** `Wave2 — Challenge datacenter ASNs on ticker API`

**Expression:**

```text
(http.request.uri.path contains "/api/tickers/" or http.request.uri.path eq "/api/quote" or http.request.uri.path contains "/api/price/" or http.request.uri.path contains "/api/dividend")
and ip.geoip.asnum in {16509 14618 15169 396982 8075 14061 20473 24940 16276 13335 63949}
and not http.user_agent contains "Googlebot"
and not http.user_agent contains "bingbot"
```

**Action:** `Managed Challenge` (Turnstile / JS challenge)

**Rationale:** Drops AWS (16509), GCP (15169/396982), Azure (8075), DigitalOcean (14061), Hetzner (24940), OVH (16276), Vultr (20473), Cloudflare (13335), Linode/Akamai (63949) scrapers before Vercel serverless invocation. **Enterprise allowlist: Googlebot + Bingbot only.**

---

## Rule 2 — Symbol farm HTML (Wave 2.1 — required)

**Name:** `Wave2.1 — Challenge datacenter ASN on symbol farm`

**Expression:**

```text
(http.request.uri.path eq "/s" or http.request.uri.path contains "/s/")
and ip.geoip.asnum in {16509 14618 15169 396982 8075 14061 20473 24940 16276 63949}
and not http.user_agent contains "Googlebot"
and not http.user_agent contains "bingbot"
```

**Action:** `Managed Challenge`

**Companion deny:** known automation UAs (`python-requests`, `curl/`, `GPTBot`, `Bytespider`, …) on `/s/*` and metered APIs → **Block**. App middleware (`lib/bot-gate.ts`) also 307/401 any non-Google/Bing crawler and any Mozilla spoof missing `Sec-Fetch-*`.

---

## Rule 3 — Block raw API for known bad bots (optional hard block)

**Name:** `Wave2 — Block empty-UA API scrapers`

**Expression:**

```text
(http.request.uri.path contains "/api/tickers/" or http.request.uri.path eq "/api/quote")
and (http.user_agent eq "" or http.user_agent eq "-")
```

**Action:** `Block`

---

## ASN reference (aligns with `lib/bot-gate.ts`)

| ASN | Provider |
| --- | --- |
| 16509 | Amazon (AWS) |
| 14618 | Amazon |
| 15169 | Google |
| 396982 | Google Cloud |
| 8075 | Microsoft Azure |
| 14061 | DigitalOcean |
| 20473 | Vultr |
| 24940 | Hetzner |
| 16276 | OVH |
| 13335 | Cloudflare (workers — use with care) |
| 63949 | Linode / Akamai |

---

## Deploy checklist

- [ ] Confirm DNS proxied through Cloudflare (orange cloud)
- [ ] Deploy Rule 1 in **Log** mode for 24h; review Security Events
- [ ] Switch Rule 1 to **Managed Challenge**
- [ ] Compare Vercel function invocation count (7-day baseline vs post-deploy)
- [ ] Document false positives; add paid customer IP allowlist if needed

---

## Terraform sketch (optional)

```hcl
resource "cloudflare_ruleset" "wave2_datacenter_api" {
  zone_id = var.zone_id
  name    = "Wave2 datacenter API challenge"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "managed_challenge"
    expression  = "(http.request.uri.path contains \"/api/tickers/\" and ip.geoip.asnum in {16509 14061 15169 8075 63949 24940 16276}) and not http.user_agent contains \"Googlebot\""
    description = "Wave2 — challenge datacenter scrapers on ticker API"
    enabled     = true
  }
}
```

Adjust `zone_id` for `pocketportfolio.app` and `openportfolio.co.uk` if separate zones.
