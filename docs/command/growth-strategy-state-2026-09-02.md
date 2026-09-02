# Command Growth Report

**Date:** 2 Sep 2026  
**Sources:** Live Growth HUD pull (`/admin/telemetry` APIs) · GSC `sc-domain:pocketportfolio.app` · GA4 property `501238770` · Stripe first-party  
**Period:** GSC/GA4 last 28 days (5 Aug – 2 Sep 2026)  
**Status:** Post Day-28 · **Commercial gate not met**

---

## Executive verdict

The growth strategy is **half working**.

| Pillar | Status |
|---|---|
| **Defense (de-farm, bot-gate, perimeter)** | **On track** — indexed pages down, farm share falling, clicks declining on purpose |
| **Offense (import/brand SERP, wedge quality)** | **Not on track** — import still ~1% of GSC clicks; one import lander broken |
| **Commercial (paid Stripe keys)** | **Failed** — **0** live paid keys, **£0 MRR** |
| **Geo ads** | **Correctly frozen** — do not unfreeze to chase GSC volume |

**North star unchanged:** paid Stripe keys ≥1. Not waitlist, demo, exec PDF, or raw GSC clicks.

---

## Scoreboard (live)

| Metric | Target | Current | Pass? |
|---|---:|---:|---|
| Paid Stripe keys | ≥1 | **0** | ❌ |
| MRR (GBP) | >£0 | **£0** | ❌ |
| Farm GSC query click share | <50% trending | **73.7%** (was ~84%) | ❌ improving |
| Import GSC query click share | toward 15% | **1.0%** | ❌ |
| Brand GSC query click share | rising | **16.6%** | ⚠️ small win |
| GSC total clicks (28d) | not the pin | **501** (283 → 129 first7 vs last7) | ✅ expected decline |
| `csv_import_success` (GA4 28d) | product signal | **17** | ⚠️ real but thin |
| ChatGPT sessions (GA4 28d) | citation signal | **221** (~139s avg) | ✅ working |

**Page-level GSC mix** (ahead of query lag): farm pages **~41%** of clicks · import pages **~12%**.

---

## Search (GSC)

### Performance

- **501 clicks** · **11,580 impressions** · **4.3% CTR** · avg position **~5.0**
- Daily clicks stepped down after mid-Aug as de-farm took effect (**283 → 129** per 7-day window)

### Query face (still farm-dominated, improving)

| Query | Clicks | Bucket |
|---|---:|---|
| xvlxx | 178 | farm |
| xinxx | 121 | farm |
| pocket portfolio | 40 | brand |
| pocket folio login | 21 | brand |
| vhxxx | 14 | farm |

Import signal queries exist but tiny (e.g. ghostfolio import data: 1 click).

### Indexing (Page indexing report, ~28 Aug)

| State | Count | Read |
|---|---:|---|
| Indexed | **~4.7K** | Down from ~17K — **by design** |
| Not indexed | **~57K** | Mostly crawl/noindex/robots — **not mass outage** |
| noindex | ~3.7K | Farm `/s/*` outside Top-100 allowlist — **working** |
| robots.txt | ~6.7K | `/api/`, `/admin/`, etc. — **intentional** |
| Server error 5xx | ~169 | Stale Pocket→Open blog crawls (≤May); **live today 307→200** |

**Command read:** The indexing cliff (~9 Aug) and falling click line are **the de-farm working**, not brand collapse. Do not re-index farm tickers to “fix” the chart.

---

## Analytics (GA4, 28d)

### Traffic quality (buyers vs noise)

| Source / medium | Sessions | Engaged | Avg time |
|---|---:|---:|---:|
| bot_gate / 401 | 5,721 | 6 | 0.4s |
| (direct) | 3,335 | 1,833 | 24s |
| google / organic | 644 | 234 | 75s |
| chatgpt.com / ai-assistant | 221 | 144 | **139s** |

**bot_gate dominates volume** — perimeter working, not acquisition.

### Conversion events (leading, not revenue)

| Event | Count | Note |
|---|---:|---|
| csv_import_success | **17** | Real product use; not a CRM list |
| developer_utility_conversion | **1** | MP smoke test — **not a payment** |
| newsroom_briefing_click / advisor_tool | **0** in HUD window | Funnel not firing at scale |

### Import / enterprise landings

| Landing | Sessions | Avg engagement |
|---|---:|---:|
| /import/ghostfolio | 41 | **100s** ✅ |
| /import/interactive-brokers | 26 | **0.2s** ❌ broken wedge |
| /import/trade-republic | 18 | **137s** ✅ |
| /import/trading212 | 6 | **239s** ✅ (small n) |
| /tier1designpartner | 5 | 2s |

---

## What shipped and is holding

- **De-farm:** Top-100 allowlist · farm `/s/*` → `noindex,follow` · bot-gate on metered surfaces
- **Growth HUD:** `/admin/telemetry` on Production — standing Command view (GSC + GA4 + Stripe)
- **Post-import CTA:** Developer Utility checkout path (not stacked Founders modal)
- **Ads:** Geo ads remain **frozen** (correct)
- **Dual surface:** Open blog farm noindex doctrine; Pocket→Open 307 on legacy blog posts

---

## Gaps (ranked)

1. **No paid revenue** — board pin still 0 keys after Day-28 (24 Aug).
2. **SERP mix lag** — farm queries still 74%; import 1% vs 15% ambition.
3. **IBKR import lander** — 26 sessions, 0.2s engagement = product bug, not marketing problem.
4. **Crawl hygiene** — ~15K `track-*-risk` URLs still in sitemaps; fights de-farm narrative.
5. **Brand CTR waste** — `pocketfolio`: 2,862 impressions, 11 clicks (0.4% CTR).
6. **Measurement gap** — HUD = Search Analytics only; Index Coverage + GA4 Realtime not in standing view; Open GSC still 403 to growth SA.
7. **False signal** — do not brief `developer_utility_conversion = 1` as revenue.

---

## Org roles — current posture

| Role | Hold | Act now |
|---|---|---|
| **CEO** | Ads freeze · de-farm · pin = Stripe keys | Do not redefine success as GSC volume or indexed count |
| **CCO** | Monitor GSC mix decline as intentional | **Close ≥1 paid key** — only unresolved board item |
| **CPO** | DU post-import path shipped | **Fix `/import/interactive-brokers` lander** this week |
| **Head of Marketing** | No farm CTR storytelling | Force-index `/import/*` wedges · brand misspelling CTR pass |
| **Head of Product Eng** | No SEO rollback | Trim risk sitemaps · add Open GSC + Realtime to HUD |
| **Head of AI** | Citation push to `/import/*` + `/learn/*` | Track ChatGPT → import → contact (secondary to Stripe) |
| **Creative** | No new farm content | Import/DU creative only when CCO has live close thread |

---

## Recommended actions (next 7 days)

**Must**

1. CCO: hand-close **≥1** Developer Utility / Founders / Corporate subscription.
2. CPO + Eng: diagnose and fix **IBKR import lander** bounce.
3. Marketing: GSC URL Inspection on **Ghostfolio → T212 → IBKR → TR → Moomoo** (if not already validated).

**Should**

4. Eng: remove or allowlist **risk sitemap** URLs (~15K).
5. Marketing: title/meta pass on high-impression brand misspellings.
6. Eng: grant growth SA on **Open GSC** property.

**Do not**

7. Unfreeze geo ads.
8. Request indexing on farm `/s/xinxx`-class URLs.
9. Treat falling total clicks or indexed-page count as failure.

---

## Standing instrumentation

- **Command view:** https://www.pocketportfolio.app/admin/telemetry (admin sign-in)
- **Refresh cadence:** weekly Command review from HUD; no CSV cycle
- **Next report trigger:** first paid Stripe key **or** material mix shift (farm <60% on 28d window)

---

**Bottom line for Command:** We successfully **cleaned the SEO perimeter** and **stopped optimizing for farm vanity**. We have **not** converted product signal (17 imports, strong ChatGPT sessions, decent Ghostfolio/TR landings) into **paid keys**. Defense is working; offense and commercial close are the open work.

---

## Locked priority stack (CMD1/CMD2 · 2 Sep 2026)

**Status:** EXECUTING · Rotated from perimeter defense to commercial offense.

### P0 — Must (this week)

| # | Owner | Action | Status |
|---:|---|---|---|
| 1 | **CCO** | Close **≥1** paid Stripe key from **live warm pipeline** only. GA4 import events are anonymous — no IndexedDB outreach. | 🔴 Open |
| 2 | **CPO + Eng** | Fix `/import/interactive-brokers` lander — target **>60s** engagement (Ghostfolio/TR baseline). | 🟡 Shipped P0 hotfix (Flex guide + lazy importer) — verify in GA4 |
| 3 | **Marketing** | GSC URL Inspection: force-index Ghostfolio, T212, IBKR, TR, Moomoo. Import 15% = **QoQ**, not 7-day. | 🔴 Manual — checklist below |

### P1 — Should (this week)

| # | Owner | Action | Status |
|---:|---|---|---|
| 4 | **Eng** | Purge ~15K `track-*-risk` URLs from sitemap index. | 🟡 Removed from `build-static-sitemaps.ts` — run `npm run build:sitemaps` on deploy |
| 5 | **Eng** | Grant growth SA **Restricted** on `sc-domain:openportfolio.co.uk` GSC property. | 🔴 Google Search Console admin (manual) |
| 6 | **Marketing** | Brand misspelling title/meta pass (`pocketfolio`, `pocket folio login`). | 🟡 Homepage `siteConfig` updated |
| 7 | **Head of AI** | Refresh `llms.txt` with import wedges + `@pocket-portfolio/importer` receipts. | 🟡 `lib/llms-feed.ts` updated — run `npm run build:llms` on deploy |

### Holds (do not)

- Geo ads frozen until paid conversion on organic.
- No farm re-index (`/s/xinxx`-class URLs).
- Falling GSC clicks / ~4.7K indexed = de-farm working as designed.
- Do not treat `developer_utility_conversion = 1` as revenue (MP smoke).

### Marketing GSC URL Inspection checklist

1. https://www.pocketportfolio.app/import/ghostfolio  
2. https://www.pocketportfolio.app/import/trading212  
3. https://www.pocketportfolio.app/import/interactive-brokers  
4. https://www.pocketportfolio.app/import/trade-republic  
5. https://www.pocketportfolio.app/import/moomoo  

### Open GSC SA grant (Eng / CEO)

In Google Search Console → **openportfolio.co.uk** domain property → Settings → Users and permissions → Add  
`firebase-adminsdk-fbsvc@pocket-portfolio-67fa6.iam.gserviceaccount.com` (or `GOOGLE_GROWTH_SA_CLIENT_EMAIL`) as **Restricted**.

### Code calibration truths

| Claim | Truth |
|---|---|
| Post-import DU routing | Already shipped via `postImportDeveloperUtilityHref` |
| CCO “17 import users” outreach | **Hard pass** — local-first privacy |
| IBKR 0.2s bounce | Product/intent fix, not instant SERP recovery |
| Import 15% GSC share | Quarterly horizon |

### Final role directives

- **CCO:** 100% on closing active pipeline nodes. Sole board metric = paid Stripe keys ≥1.  
- **CPO + Eng:** IBKR P0 shipped; monitor GA4 lander engagement; deploy sitemap + llms rebuild.  
- **Marketing + AI:** URL Inspection + brand meta; ChatGPT citation via llms.txt import receipts.

**Category leadership = paid conversion on clean architecture — not vanity search volume.**
