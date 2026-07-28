# Command Team Growth Report — Wave 1–2 Ship Complete

**Date:** 2026-07-28  
**Status:** PRODUCTION LIVE · EDGE COST GATE GREEN · 14-DAY OBSERVATION OPEN  
**Audience:** Command Team · Org Chart (CEO · CCO · CPO · Marketing · Product Eng · AI & Community · Creative Studios)  
**Authority:** Board KPI Reset Memo · Wave 2 Engineering RFC · Analytics contamination remediation

---

## 1. Executive verdict (for CMD1 / CMD2)

| Question | Answer |
| --- | --- |
| Did we stop steering on ghost Active Users? | **Yes.** Board Triad is the only north star. |
| Is Wave 2 live? | **Yes.** PR #95 on production. |
| Are we still paying Vercel for datacenter scrapers on metered APIs? | **No — ship gate GREEN.** Vercel Firewall ASN challenge live (PR #96 / rule Enabled). |
| Can we spend ICP geo ads now? | **No.** Frozen until Day-14 review (**2026-08-10**). |
| What closes the revenue measurement loop? | Marketing registers GA4 MP secret for `G-9FQ2NBHY7H`. |

**One-line narrative for the Board:**  
We replaced a contaminated 32k Active Users story with a defensible growth machine — human sessions, broker imports, paid API keys — and we no longer subsidize scrapers with serverless spend.

---

## 2. What shipped (production evidence)

| PR | Date | Ship | Growth / cost effect |
| --- | --- | --- | --- |
| **#90** | Prior | Hybrid API hard gate | Scraper → 401 + Developer Utility upsell |
| **#91** | 2026-07-27 | Wave 1 commercial SEO, triad docs, OP pillars, import dropzone | Brand/import SERP + KPI doctrine |
| **#92** | 2026-07-27 | OP farm `noindex` hotfix | Crawl budget → institutional pillars |
| **#93** | 2026-07-28 | Full bot gate (`/s/*` + tickers/quote/price/dividend) | Bot HTML redirect · API 401 |
| **#94** | 2026-07-28 | Nav **Pricing** (was Utility), heart removed | Industry-standard monetization CTA |
| **#95** | 2026-07-28 | Wave 2: llms feeds, robots, JSON-LD, Slack leads, geo banner | AI citation + enterprise pipeline + geo UX |
| **#96** | 2026-07-28 | Firewall cost-gate confirmation | **Edge ASN challenge GREEN** |

### Edge cost — why GREEN matters

Production DNS is **Vercel-direct** (no `cf-ray`). Cloudflare Custom Rules cannot intercept that traffic. We published a **Vercel Firewall** rule instead:

- **Name:** Wave2 Challenge datacenter ASN metered APIs  
- **Match:** path `^/api/(tickers/|quote|price/|dividend)` **AND** datacenter ASN (AWS, GCP, Azure, DO, Hetzner, OVH, Vultr, Linode)  
- **Action:** Challenge (before serverless invocation)  
- **Verify:** `npx vercel@latest firewall rules list --expand` → Enabled  

App-layer gates (PR #93) remain defense-in-depth for browser-spoofing bots and non-ASN paths.

---

## 3. Analytics alignment (the report that drove the pivot)

### Problem (SOS / GA Realtime)

| Contaminated signal | Reality |
| --- | --- |
| ~32k Active Users / 28d | Scrapers + `/s/*` farm + self-UTM loops |
| ~2.3s avg engagement | Single-hit bots, not humans |
| £0 attributed revenue | Free firehose; no measurable paid funnel in GA |
| Realtime random tickers (`/s/aarhy`…) | Programmatic farm crawls |

### Solution — Board Triad only

| KPI | Definition | Owner of weekly number |
| --- | --- | --- |
| **Human Quality Sessions** | Engagement ≥30s **or** ≥1 key event; exclude self-UTM mediums | Head of Marketing |
| **Broker Import Conversions** | `csv_import_success` | Marketing + Product Eng (event integrity) |
| **Paid API Keys** | Active Developer Utility / Founders / Corporate (not Code Supporter) | CCO + Eng |

**Retired as headline:** Active Users, raw `/s/*` Realtime counts, API hit volume.

**Code contract:** `app/lib/analytics/clean-tracker.ts` → `BOARD_NORTH_STAR_KPIS`

---

## 4. Growth architecture (truthful funnel)

```
ACQUISITION                         ACTIVATION                      MONETIZATION
─────────────                       ──────────                      ────────────
Organic GSC (brand/import)    →   Human Quality Session (≥30s) →  csv_import_success
ChatGPT / Perplexity / OAI    →   /learn/* pillars + llms.txt  →  contact → BIP / Tier 1
Pricing CTA → /sponsor        →   Developer Utility checkout   →  Paid API key + MP event

DEFENSIVE (not growth — exclude from triad)
Scraper / datacenter ASN  →  Vercel Firewall Challenge / 401 / 307
Self-UTM loops            →  clean-tracker → internal/self_nav
```

---

## 5. Org chart — ownership matrix

Aligned to `docs/command/roles/*`.

| Role | Mandate touchpoint | Wave 1–2 ownership | Next 14 days |
| --- | --- | --- | --- |
| **CEO** | Mission, capital, board narrative | Enforces triad-only board packs; Day-14 go/no-go | Chair 2026-08-10 review; no vanity MAU in packs |
| **CCO** | GTM, enterprise, API monetization | Paid API Keys KPI; BIP/enterprise Slack path | Pipeline on OP contact leads; freeze geo spend until Day-14 |
| **CPO** | Product vision, UX trust | Pricing nav + geo compliance UX ratified | Watch import activation quality vs volume |
| **Head of Product Engineering** | Infra, APIs, cost | Bot gate · Wave 2 ship · **Firewall GREEN** | Monitor Firewall Analytics; Slack env if missing |
| **Head of Marketing** | Demand, positioning, attribution | Triad weekly sheet; GSC brand/import; Pricing copy | **GA4 MP secret**; GSC URL Inspection; weekly triad log |
| **Head of AI & Community** | AI deployment, citation, brand face | Wave 2 llms/robots/JSON-LD for ChatGPT channel | Track AI referral sessions on `/learn/*`; citation narrative |
| **Head of Creative Studios** | Brand SERP creative | Brand SERP tracking support | Assist GSC / creative for import CTR lift |

---

## 6. Open actions (not engineering blockers)

| # | Action | Owner | Blocks |
| --- | --- | --- | --- |
| 1 | Register Measurement Protocol secret in GA4 Admin (`G-9FQ2NBHY7H`) matching Vercel `GA4_MEASUREMENT_PROTOCOL_SECRET` | Marketing + Eng | Visibility of `developer_utility_conversion` |
| 2 | GSC URL Inspection: `/`, `/login`, top-10 `/import/*`, four `/learn/*` pillars | Marketing | SERP velocity |
| 3 | Set `SLACK_ENTERPRISE_LEADS_WEBHOOK_URL` on Vercel (or confirm `FEEDBACK_P0_WEBHOOK_URL` fallback) | Eng / CCO | Real-time enterprise alerts |
| 4 | Fill weekly triad in `board-triad-dashboard-wave1.md` | Marketing | Day-14 decision quality |
| 5 | Optional later: Cloudflare orange-cloud DNS for dual-edge WAF | Eng / DevOps | Only after cost baseline on Vercel Firewall |

**Still frozen until 2026-08-10:** paid ICP geo acquisition (UK/US/DE/CA/AU).

---

## 7. 14-day observation window

| Milestone | Date | Success signal |
| --- | --- | --- |
| Observation start | 2026-07-28 | Wave 2 + Firewall live |
| Week 1 triad | 2026-08-03 | Bot Realtime ↓ · Human Quality Sessions baseline |
| Week 2 / Day-14 review | 2026-08-10 | Triad filled · import CTR vs 0.72% · AI referral on pillars · Wave 2 motion go/no-go |

**Template:** `docs/command/wave1-day14-review-2026-08-10.md`

---

## 8. Role-specific one-pagers

### CEO
- Board packs: **Triad only**. Active Users appendix at most.  
- Capital story: we cut scrapers’ free ride and edge-challenged datacenter API abuse.  
- Decision date: **2026-08-10**.

### CCO
- Monetization path: scraper 401 → Pricing/sponsor → Stripe → paid key.  
- Enterprise: Open contact → Firestore + Slack.  
- Do **not** invent a £49 SKU; Developer Utility = Feature Voter prices.

### CPO / Product Eng
- Surfaces: Pricing nav, geo compliance banner, bot/API gates, Firewall GREEN.  
- Re-verify: `node scripts/ops-publish-vercel-firewall-wave2.mjs` → GREEN.

### Marketing
- Own GA4 Explore triad + GSC sheets.  
- Priority #1: MP secret in GA4 Admin.  
- Language: **Pricing**, not Utility.

### Head of AI & Community
- ChatGPT was the converting AI channel (SOS: 141 sessions / 6 key events).  
- Live assets: `/llms.txt`, `/llms-full.txt`, `/learn/*` allowlisted for OAI-SearchBot; `/api/` disallowed.  
- Cite pillars, not ticker JSON.

### Creative Studios
- Support brand/import SERP creative and CTR tracking sheets.

---

## 9. Production smoke (Command can verify)

| Surface | Check |
| --- | --- |
| Pocket | https://www.pocketportfolio.app/llms.txt |
| Pocket | https://www.pocketportfolio.app/llms-full.txt |
| Pocket | https://www.pocketportfolio.app/robots.txt (OAI-SearchBot + `/learn/`) |
| Pocket | https://www.pocketportfolio.app/learn/sovereign-ai-architecture |
| Open | https://www.openportfolio.co.uk/llms.txt |
| Open | https://www.openportfolio.co.uk/ |
| Cost gate | Vercel → Firewall → Wave2 Challenge rule **Enabled** |

---

## 10. Document index

| Doc | Use |
| --- | --- |
| This report | Command / org weekly truth |
| `board-kpi-reset-memo-2026-07-27.md` | Triad law |
| `board-triad-dashboard-wave1.md` | Weekly numbers |
| `wave1-day14-review-2026-08-10.md` | Day-14 decision |
| `wave2-engineering-rfc-2026-07-28.md` | Engineering doctrine |
| `cloudflare-waf-wave2-rules.md` | Edge WAF (Vercel-first) |
| `growth-report-pre-prod-2026-07-28.md` | Pre-merge engineering brief (superseded by this for status) |
| `docs/command/roles/*.md` | Org mandates |

---

## 11. Command verdict

| Gate | Status |
| --- | --- |
| Wave 1 defense (hygiene + bot/API monetization) | ✅ LIVE |
| Wave 2 offense (citation · enterprise Slack · geo) | ✅ LIVE |
| Edge cost gate (no paying for datacenter API bots) | ✅ **GREEN** |
| Enterprise crawler allowlist (Google + Bing only) | ✅ App gate + Firewall Wave 2.1 |
| Measurement loop (GA4 MP Admin) | ⏳ Marketing |
| Paid geo spend | 🔒 Until 2026-08-10 |

**Recommendation:** Accept this report as the Command Team growth baseline. Execute open Marketing actions. Reconvene **2026-08-10** with filled triad — then decide geo spend and Wave 2.1 (BYOC sandbox, CRM enrichment).
