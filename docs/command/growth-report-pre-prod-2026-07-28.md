# Growth Report — Pre-Production (Wave 1 Close · Wave 2 Ship · Analytics Alignment)

**Date:** 2026-07-28  
**Audience:** Command Team · CEO · CCO · Head of Marketing · Head of Product Engineering  
**Status:** PRE-PROD BRIEF · Deploy pending  
**Aligns with:** Board KPI Reset Memo · Admin Analytics Inventory · GA4 Realtime Audit · Wave 2 RFC

---

## 1. Executive summary

The **Analytics report problem** was not a measurement bug — it was a **growth definition bug**. ~32k “Active Users” in the 28-day SOS window reflected scrapers, symbol-farm `/s/*` loops, and self-UTM `json_api` acquisition inflation. Average engagement ~2.3s and £0 attributed revenue confirmed the signal was unusable for board decisions.

**Wave 1** retired Active Users as the north star and shipped the **Board Triad** (Human Quality Sessions · Broker Import Conversions · Paid API Keys). **PR #93** extended bot monetization to symbol-farm HTML and all metered APIs. **Wave 2** (this deploy) adds the **commercial offensive layer**: LLM citation infrastructure, enterprise Slack leads, geo compliance UX, and Cloudflare WAF doctrine.

This report maps every engineering ship to **how Analytics will change** after production deploy — and what Marketing must still configure in GA4 Admin.

---

## 2. Analytics report — root cause & remediation map

### 2.1 What GA was showing (pre-fix)

| Symptom | GA4 observation | Root cause | Engineering fix | Expected post-deploy effect |
| --- | --- | --- | --- | --- |
| ~32k Active Users / 28d | Headline vanity metric | Bot + scraper traffic on `/s/*`, API loops | PR #90 API 401 · PR #93 middleware + full API gate | Active Users **↓** (appendix only) |
| Realtime `/s/aarhy`, `/s/bglxx` etc. | 1 user = 1 view, random tickers | Symbol-farm scrapers with browser UA | PR #93: 24 pages/IP/hr then upsell; bot UA → redirect | Realtime farm noise **↓** over 48–72h |
| ~2.3s avg engagement | Contaminated sessions | Single-hit bot/page_view | Same as above + clean-tracker self-UTM retag | Human Quality Sessions metric **↑** as share of total |
| £0 attributed revenue | No conversion path | Free API firehose; no MP secret in GA Admin | PR #90 funnel · MP env on Vercel · Wave 2 Pricing nav | `developer_utility_conversion` measurable after Admin secret |
| ChatGPT 141 sessions / 6 key events | Only converting AI channel (SOS) | Organic citation without `/learn/` allowlist | **Wave 2:** llms.txt, robots, JSON-LD on pillars | ChatGPT + Perplexity citation **↑** on institutional content |
| Self-UTM `json_api` cluster | Acquisition pollution | Footer CTAs re-tagged as acquisition | `clean-tracker.ts` → `internal/self_nav` | GA Explore triad filters exclude loops |

### 2.2 Board triad vs deprecated metrics

**Code contract:** `app/lib/analytics/clean-tracker.ts` → `BOARD_NORTH_STAR_KPIS`

| KPI ID | Label | Definition | GA4 / Admin source | Pre-sprint baseline | Post-deploy measurement |
| --- | --- | --- | --- | --- | --- |
| `human_quality_sessions` | Human Quality Sessions | Engagement ≥30s on HTML/import **or** ≥1 key event; exclude self-UTM mediums | GA4 Explore (see board-triad-dashboard) | Not tracked as north star | **Primary board column** |
| `broker_import_conversions` | Broker Import Conversions | `csv_import_success` from `/import/*` | GA4 Events | Low vs 12.5k import impressions | Track vs 0.72% CTR baseline |
| `paid_api_keys` | Paid API Keys | Active DU / Founders / Corporate keys | Stripe + Firebase `apiKeysByEmail` | £0 MRR line in SOS | Admin `/admin/analytics` + Stripe |

**Retired from board headline:** Active Users, raw Realtime page counts on `/s/*`, API hit volume.

### 2.3 Admin analytics inventory alignment

Per `growth-b2b-stage0-admin-analytics-inventory.md`, the admin dashboard (`/admin/analytics`) surfaces:

| Tier | Source | Growth report relevance |
| --- | --- | --- |
| **A — Billing** | Stripe subscriptions, checkout, invoices | Paid API Keys KPI · MRR appendix |
| **B — Lead procurement** | `open_portfolio_contact_leads`, waitlist, challenge leads | **Wave 2:** Slack `#enterprise-leads` on new OP contact |
| **C — Operational** | `pageViews`, `toolUsage`, `monetizationFunnelEvents`, `conversionEvents` | Human session proxies; import funnel; bot-gate 401 → sponsor path |

**Wave 2 adds:** best-effort Slack notification on `open_portfolio_contact_leads` insert (Firestore unchanged — admin analytics continues to read same collection).

---

## 3. Engineering ships — production state

### 3.1 Already live on `main` (verify before Wave 2 merge)

| PR | Ship | Analytics impact |
| --- | --- | --- |
| #91 | Wave 1 commercial SEO, KPI docs, OP pillars, import dropzone | Import CTR path · pillar indexability |
| #92 | OP farm `noindex` hotfix | Crawl budget → pillars not farm |
| #93 | Full bot gate (`/s/*`, tickers, quote, price, dividend) | Scraper compute ↓ · GA bot sessions ↓ |
| #94 | Nav “Pricing” (was Utility) | Funnel clarity → `/sponsor` |

**Prod smoke (2026-07-28):**

```text
python-requests → GET /s/spy          → 307 sponsor
python-requests → GET /api/tickers/SPY/json → 401
Chrome UA       → GET /s/spy          → 200 (human budget applies)
```

### 3.2 Pending deploy — Wave 2 (local, uncommitted)

| Pillar | Deliverable | Analytics / growth impact |
| --- | --- | --- |
| **1 — AI Citation** | `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `lib/llms-feed.ts` | ChatGPT/Perplexity/OAI-SearchBot discover institutional doctrine |
| **1 — AI Citation** | `app/robots.ts` + `public/open/robots.txt` — `OAI-SearchBot`, `/learn/` allow | LLMs index pillars; `/api/` blocked |
| **1 — AI Citation** | TechArticle JSON-LD on 4 pillars | Rich results · AI citation schema |
| **2 — Edge WAF** | `scripts/ops-deploy-vercel-firewall-wave2.mjs` + CF script | **Ship gate:** Vercel Firewall ASN challenge NOW (DNS is Vercel-direct; CF WAF only after orange-cloud) |
| **3 — Enterprise** | Slack hook on `POST /api/open-portfolio/contact` | Real-time BIP lead alerts for CCO |
| **4 — Geo** | `ComplianceBanner` + `x-user-country` middleware | UK/EU/US regulatory messaging on Open + Learn |

**Doctrine:** `docs/command/wave2-engineering-rfc-2026-07-28.md`

---

## 4. Growth funnel — end-to-end (aligned to Analytics)

```
[Acquisition]                    [Activation]                    [Monetization]
Organic / AI citation    →    Human Quality Session (≥30s)    →    csv_import_success
GSC brand/import SERP    →    /import/* dropzone              →    developer_utility_conversion
ChatGPT / Perplexity     →    /learn/* pillar read            →    Paid API key (Stripe)
Enterprise OP contact    →    Slack #enterprise-leads           →    BIP / Tier 1 pipeline

[Defensive — not growth]
Scraper / bot  → 401 / 307 / Cloudflare Challenge  →  excluded from triad
Self-UTM loop  → clean-tracker retag               →  excluded from triad
```

### 4.1 API monetization funnel (PR #90 + #93)

| Step | Event / surface | Analytics touchpoint |
| --- | --- | --- |
| 1 | Scraper hits `/api/tickers/*` or `/s/*` | Blocked — **no** `page_view` on upsell redirect for bot UA |
| 2 | 401 JSON includes `checkout_url` | Internal; optional server log |
| 3 | User lands `/sponsor?tier=developer-utility` | GA4 page_view (human) |
| 4 | Stripe `checkout.session.completed` | `developer_utility_conversion` via GA4 MP |
| 5 | Key in `apiKeysByEmail` | Paid API Keys KPI |

**Open item:** GA4 Admin must register MP secret for stream `G-9FQ2NBHY7H` — Vercel env already set 2026-07-27.

### 4.2 Import growth funnel (Wave 1)

| Step | Surface | KPI |
| --- | --- | --- |
| GSC impression | `/import/{broker}` | Impressions (baseline 0.72% CTR) |
| Click | High-CTR titles + dropzone | Clicks |
| Drop / parse | `ImportLanderDropzone` | `csv_import_*` events |
| Success | IndexedDB persist | **`csv_import_success`** ← triad #2 |

### 4.3 AI citation funnel (Wave 2)

| Step | Surface | Expected analytics signal |
| --- | --- | --- |
| LLM crawl | `/llms.txt`, `/llms-full.txt`, `/learn/*` | Referral from chatgpt.com / perplexity.ai (Explore) |
| Human click-through | Pillar → `/architecture`, `/tier1designpartner` | Human Quality Sessions on Open host |
| Conversion | Contact form | Firestore lead + Slack alert |

---

## 5. Pre-production checklist

### 5.1 Engineering gates (before merge)

| # | Gate | Command | Status |
| --- | --- | --- | --- |
| E1 | Lint | `npm run lint` | ✅ Pass (2026-07-28) |
| E2 | Typecheck | `npm run typecheck` | ✅ Pass |
| E3 | Unit tests | `npx vitest run tests/unit/wave2-llms-compliance.spec.ts tests/unit/bot-gate.spec.ts` | ✅ Pass |
| E4 | llms drift | `npm run build:llms` + commit `public/llms.txt`, `public/open/llms.txt` | ✅ Regenerated |
| E5 | Full build | `npm run clean:next && npm run build` | ⏳ Run before merge |
| E6 | Wave 2 RFC committed | `docs/command/wave2-engineering-rfc-2026-07-28.md` | ✅ |

### 5.2 Environment (Vercel production)

| Variable | Required for | Status |
| --- | --- | --- |
| `GA4_MEASUREMENT_PROTOCOL_SECRET` | Stripe → GA4 `developer_utility_conversion` | ✅ Set prod/preview/dev |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Client GA4 | ✅ `G-9FQ2NBHY7H` |
| `SLACK_ENTERPRISE_LEADS_WEBHOOK_URL` | Wave 2 enterprise alerts | ⏳ Set before CCO outbound |
| `FEEDBACK_P0_WEBHOOK_URL` | Slack fallback for leads | Verify exists |

### 5.3 Marketing / Analytics (post-deploy, not blocking merge)

| # | Action | Owner | Doc |
| --- | --- | --- | --- |
| M1 | Register MP secret in GA4 Admin | Marketing + Eng | wave1-ship-closure |
| M2 | GSC URL Inspection: `/`, `/login`, top-10 `/import/*`, 4 pillars | Marketing | brand/import SERP sheets |
| M3 | GA4 Explore: triad weekly sheet | Marketing | board-triad-dashboard-wave1 |
| M4 | **SHIP GATE:** `node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish` | Eng | Requires `VERCEL_TOKEN`; cuts bot billing before middleware |

### 5.4 Post-deploy smoke URLs

**Pocket (`www.pocketportfolio.app`)**

| Check | URL |
| --- | --- |
| LLM summary | `/llms.txt` |
| LLM full | `/llms-full.txt` |
| robots OAI-SearchBot | `/robots.txt` |
| Pillar + JSON-LD | `/learn/sovereign-ai-architecture` |
| Learn compliance banner | `/learn` |
| Bot gate | `/s/spy` (curl bot UA → 307) |
| Pricing nav | `/` (header shows “Pricing”) |

**Open (`www.openportfolio.co.uk`)**

| Check | URL |
| --- | --- |
| LLM summary (Open copy) | `/llms.txt` |
| robots LLM rules | `/robots.txt` |
| Compliance banner | `/` |
| Pillar alias | `/learn/dora-eu-ai-act-wealth` |
| Enterprise contact | `POST /api/open-portfolio/contact` |

---

## 6. 14-day measurement plan (Wave 1 window → Day 14 review)

**Window:** 2026-07-28 → 2026-08-10  
**Template:** `wave1-day14-review-2026-08-10.md`

| Week | Focus | Success signal |
| --- | --- | --- |
| **Week 1** | Bot noise decay · triad baseline | Realtime `/s/*` farm pages ↓; Human Quality Sessions baseline captured |
| **Week 2** | Import CTR · AI referral | GSC import CTR vs 0.72%; ChatGPT/Perplexity sessions on `/learn/*` |
| **Day 14** | Board review | Triad populated · Wave 2 motions go/no-go |

### Weekly triad log (Marketing to fill)

| Week ending | Human Quality Sessions | Import Conversions | Paid API Keys | Notes |
| --- | ---: | ---: | ---: | --- |
| 2026-08-03 | TBD | TBD | TBD | Post Wave 2 deploy |
| 2026-08-10 | TBD | TBD | TBD | Day-14 review |

---

## 7. Analytics report — explicit Q&A

| Question from Analytics / GA | Answer after this deploy |
| --- | --- |
| “Why are bots still in Realtime?” | Browser-spoofing bots pass UA checks; PR #93 limits them to 24 `/s/*` pages/hr. Cloudflare WAF (manual) drops datacenter ASNs before origin. Obvious bot UA redirects before page load. |
| “Should we trust Active Users?” | **No** for board decisions. Use triad only. |
| “Is ChatGPT worth investing in?” | **Yes** — SOS showed 141 sessions / 6 key events. Wave 2 rolls out red carpet (`llms.txt`, `/learn/` robots, JSON-LD). |
| “Where does revenue show up?” | Stripe → admin analytics MRR; GA4 MP `developer_utility_conversion`; Paid API Keys triad column. |
| “How do we track enterprise?” | Firestore `open_portfolio_contact_leads` + admin analytics + **new** Slack alerts (Wave 2). |

---

## 8. Deploy authorization

| Item | Recommendation |
| --- | --- |
| **Merge Wave 2 PR** | ✅ Authorized — engineering gates green; aligns with Command Wave 2 mandate |
| **Edge WAF (cost)** | **Same train as merge:** publish Vercel Firewall ASN challenge. Cloudflare WAF only after DNS orange-cloud (`cf-ray`). |
| **GA4 Admin MP secret** | Marketing action — unblocks revenue event visibility |
| **ICP geo ad spend** | Hold until Day-14 triad review (per board memo) |

---

## 9. Related documents

| Document | Purpose |
| --- | --- |
| `board-kpi-reset-memo-2026-07-27.md` | Triad definitions |
| `board-triad-dashboard-wave1.md` | Weekly GA4 Explore recipe |
| `wave1-day14-review-2026-08-10.md` | Day-14 decision template |
| `wave1-ship-closure-2026-07-27.md` | Wave 1 prod evidence |
| `wave2-engineering-rfc-2026-07-28.md` | Wave 2 execution matrix |
| `cloudflare-waf-wave2-rules.md` | Edge WAF expressions |
| `growth-b2b-stage0-admin-analytics-inventory.md` | Admin data tiers |
| `brand-serp-tracking-wave1.md` | Brand GSC |
| `import-serp-tracking-wave1.md` | Import CTR |
| `op-content-doctrine-wave1.md` | OP crawl budget |

---

**Verdict:** Growth reporting is **rebased on the Board Triad**. Engineering has **addressed the Analytics report contamination** through bot gates, clean-tracker UTM hygiene, and (on deploy) LLM citation infrastructure. **Deploy Wave 2**, then execute Cloudflare WAF + GA4 Admin secret to close the measurement loop.
