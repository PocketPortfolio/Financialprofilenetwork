# Day-14 Wave 1 Review — Filled 2026-08-10

**Owners:** CEO · CCO · Head of Marketing  
**Review date:** 2026-08-10  
**Full report:** [growth-day14-calibration-2026-08-10.md](./growth-day14-calibration-2026-08-10.md)

---

## 1. Triad (vs Active Users — retired)

| KPI | Pre-sprint / Week 0 | Day 14 | Pass? |
| --- | ---: | ---: | --- |
| Human Quality Sessions (≥30s or ≥1 key event) | Not board north star; eng ~2.3s | Proxy: organic 15s / AI 30s / home 37s; raw AU still noisy | **Partial** — quality ↑, not triad-clean |
| Broker Import Conversions (`csv_import_success`) | Low vs import impressions | Import landings show KE (ghostfolio 10, T212 7); event total 39 thin | **Partial** |
| Paid API Keys (DU / Founders / Corporate) | £0 in SOS | £0 attributed revenue in GA snapshot | **Fail** (confirm Stripe offline) |

---

## 2. Brand SERP

| Check | Status |
| --- | --- |
| Homepage title/schema live | Assumed live from Wave 1 |
| `/login` indexed | Brand login query present (8 clicks) |
| Brand query CTR movement | `pocket portfolio` 4.28% CTR; `pocketfolio` 0.34% — **mixed** |

---

## 3. Import SERP

| Check | Status |
| --- | --- |
| Top-10 GSC URL Inspection submitted | Marketing to confirm |
| CTR vs 0.72% baseline (directional) | **Several pass** (ghostfolio 3.30%, IB 0.94%, T212 1.15%); TR/WS/eToro fail |
| Above-fold dropzone converting | Proxy KE on import landings — **yes when traffic arrives** |

---

## 4. Open Portfolio doctrine

| Check | Status |
| --- | --- |
| how-to/research `noindex, follow` | Shipped Wave 1 |
| Farm cron paused | PR #100 hygiene |
| Four pillars indexable | Shipped; **0 Learn GSC clicks** in export |
| Blog farm share of impressions declining | Blog still **39/53** Open clicks — **not declining enough** |

---

## 5. Stripe funnel (PR #90)

| Check | Status |
| --- | --- |
| `GA4_MEASUREMENT_PROTOCOL_SECRET` set in Vercel | Done 2026-07-27 |
| Secret registered in GA4 Admin for `G-9FQ2NBHY7H` | **Still verify** — conversions not visible |
| `developer_utility_conversion` events visible | **Not in snapshot** |
| 401 → `/sponsor` → paid key path documented | **Traffic live** (3,964 bot_gate; 4,008 /sponsor) |

---

## 6. Wave 2 go / no-go

| Motion | Owner | Go? | Notes |
| --- | --- | --- | --- |
| ICP geo acquisition (UK/US/DE/CA/AU) | CCO | **NO** | SERP mix still farm-led |
| Enterprise / Design Partner outbound | CCO | **YES** | Sales-led |
| AI citation engine | Head of AI & Community | **YES** | Sessions ↑; push Learn |
| Cloudflare / Vercel WAF ASN | Eng | **HOLD/MONITOR** | Already GREEN on Vercel |

**Decision (CEO):** Continue to **Day-28 (2026-08-24)**. Defense held. Growth gap open. Hybrid monetization **not** declared repaired.  
**Date:** 2026-08-10
