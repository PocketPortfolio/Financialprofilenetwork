# Day-14 Growth Calibration — Post Sovereign AI / Wave 1–2

**Date:** 2026-08-10  
**Status:** DEFENSE VALUE PROVEN · GROWTH GAP STILL OPEN · GEO ADS REMAIN FROZEN  
**Audience:** Command Team (CEO · CCO · CPO · Marketing · Product Eng · AI & Community · Creative Studios)  
**Windows:**  
- **GA4 Pocket:** 2026-07-13 → 2026-08-09 (28d overlapping pre/post Wave ship)  
- **GSC Pocket + Open:** chart through 2026-08-08 (export dated 2026-08-10)  
**Baseline:** Growth SOS / Hybrid Monetization Plan · Command org report 2026-07-28  
**Ship reference:** Wave 1–2 defense+offense (PRs #90–#96, farm pause #100) · PLG teaser #109 · API 402 #110 (late in window)

---

## 1. Executive verdict (CEO chair)

| Question | Answer |
| --- | --- |
| Did Wave 1–2 **defense** create measurable value? | **Yes.** Contaminated Active Users ↓; engagement quality ↑; bot_gate is redirecting scrapers into `/sponsor`. |
| Did we close the **growth gap** (SERP mix, import/brand, triad outcomes)? | **No.** Pocket GSC clicks remain **~90% farm queries** / **~78% `/s/*` pages**. |
| Are we on track for Hybrid Monetization *outcomes*? | **Partially.** Funnel **plumbing** works (401 → sponsor landings). **Paid API Keys** and import-scale activation are **not yet proven** in GA (£0 attributed revenue; triad not board-ready). |
| Unfreeze ICP geo ads (UK/US/DE/CA/AU)? | **No — HOLD.** Same gate as 2026-07-28. Growth mix not clean enough to buy traffic. |
| Open Portfolio institutional pipeline? | **Not proven.** GSC clicks tiny; **0** Learn-pillar clicks in export; blog still dominates Open SERP. |

**One-line for the Board:**  
We repaired the **measurement and perimeter mess**; we have **not** yet repaired the **acquisition mix**. Defense is paying off. Offense needs another calibration cycle before paid geo.

---

## 2. Two gaps — updated (do not conflate)

| Gap | Pocket | Open | Day-14 status |
| --- | --- | --- | --- |
| **Engineering / ops** (bots, cost, farm pause, Learn hub, firewall, PLG teaser, API 402) | Shipped | Shipped | **Closed** |
| **Growth outcomes** (SERP mix, brand/import CTR, quality sessions, paid keys, enterprise leads) | Farm still ~80–90% of organic clicks | Pillars live; **no Learn GSC clicks**; brand nascent | **Still open** |

Accurate Command line (unchanged doctrine, new evidence):  
We closed the **engineering perimeter**. We have **not** closed the **growth gap** until Board Triad + post-ship GSC mix move.

---

## 3. SOS baseline → Day-14 (Pocket GA4)

| Signal | SOS / pre-repair | Day-14 window (Jul 13–Aug 9) | Read |
| --- | ---: | ---: | --- |
| Active users (28d) | ~32,000 | **25,747** | **↓ ~20%** — expected; scrapers no longer inflate MAU |
| Avg engagement / active user | ~2.3s | **5.0s** | **↑ quality** — humans heavier in the mix |
| Key events (28d) | Low / noisy | **39** | Still thin; conversion loop incomplete |
| Attributed revenue | £0 | **£0** | Monetization **not** visible in GA yet |
| `bot_gate / 401` sessions | n/a | **3,964** | Defense **working** — bots land on sponsor path |
| Organic Search sessions | Contaminated mix | **807** · 15.0s eng · **27** key events | Best-quality major channel |
| AI Assistant sessions | ChatGPT ~141 / 6 KE (SOS) | **185** · 30.0s eng · **3** KE | Sessions **↑**; key events **↓** — citation path not yet converting harder |
| Top landing `/sponsor` | n/a | **4,008** sessions · **0.16s** eng · 0 KE | Almost entirely gate redirects — **not** buyers |
| Top landing `/` | Sparse | **322** · **37s** · **10** KE | Real human home interest |
| Landing `/import/ghostfolio` | — | **36** · **36s** · **10** KE | Strong activation proxy when humans arrive |
| Landing `/import/trading212` | — | **11** · **70s** · **7** KE | High intent when present |

**Landing mix warning:** Listed landings still show heavy `/s/*` farm sessions (~17k of listed rows) plus suspicious `/dashboard` new-user flood (~3.5k). Defense reduced *headline* MAU but **Realtime/landing contamination is not gone**.

---

## 4. GSC — Pocket (post Wave vs pre)

### 4.1 Traffic volume (Chart.csv)

| Period | Days | Clicks | Clicks/day | Avg CTR | Avg position |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pre ship (≤ Jul 27) | 16 | 477 | 29.8 | 2.30% | 7.8 |
| Post ship (≥ Jul 28) | 12 | 418 | **34.8** | 2.39% | 7.9 |
| Last 7 (Aug 2–8) | 7 | 268 | **38.3** | **2.64%** | **7.5** |

**Lift:** modest **clicks/day ↑** and CTR ↑ late window — **not** a SERP mix win.

### 4.2 Query / page mix (still farm-dominated)

| Bucket | Clicks | Share |
| --- | ---: | ---: |
| Farm-heuristic queries (`xinxx`, `xvlxx`, `*xx`, obscure tickers) | 610 | **89.6%** |
| Brand (`pocket portfolio` / folio variants) | 59 | **8.7%** |
| Import-ish queries | 10 | **1.5%** |
| `/s/*` pages | 718 / 924 | **77.7%** |
| `/import/*` pages | 82 | 8.9% |
| Home | 80 | 8.7% |

Top queries still: **xinxx (214)**, **xvlxx (209)** vs **pocket portfolio (26)**.

### 4.3 Import SERP vs 0.72% CTR baseline

| Page | Clicks | Impr | CTR | vs 0.72% |
| --- | ---: | ---: | ---: | --- |
| `/import/ghostfolio` | 37 | 1,121 | **3.30%** | **Pass (directional)** |
| `/import/trading212` | 7 | 609 | 1.15% | Pass |
| `/import/interactive-brokers` | 8 | 847 | 0.94% | Pass |
| `/import/moomoo` | 5 | 400 | 1.25% | Pass |
| `/import/trade-republic` | 7 | 1,088 | 0.64% | Fail |
| `/import/wealthsimple` | 3 | 806 | 0.37% | Fail |
| `/import/etoro` | 3 | 471 | 0.64% | Fail |

**Read:** Ghostfolio + a few brokers show **CTR repair**. Volume is still tiny vs farm. Import is a **wedge**, not the click majority.

### 4.4 Brand SERP

| Query | Clicks | Impr | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| pocket portfolio | 26 | 607 | 4.28% | 4.7 |
| pocket folio | 11 | 1,147 | 0.96% | 3.5 |
| pocket folio login | 8 | 709 | 1.13% | 3.2 |
| pocketfolio | 7 | 2,052 | 0.34% | 4.8 |

Brand **exists** but is drowned by farm SERP share. Login/brand CTR still weak on high-impression misspellings.

---

## 5. GSC — Open Portfolio

| Period | Clicks/day | Impr | Avg CTR | Avg pos |
| --- | ---: | ---: | ---: | ---: |
| Pre Jul 28 | 1.4 | 5,168 | 0.42% | 23.1 |
| Post Jul 28 | **2.6** | 5,694 | 0.55% | 24.8 |
| Full 28d | 1.9 | 10,862 | 0.48% | 23.8 |

| Page class | Clicks |
| --- | ---: |
| Home | 9 |
| Blog | **39** |
| `/learn` pillars | **0** |

Brand queries: `open portfolio` 3 clicks; `openportfolio` 2.  
`sovereign ai` shows **impressions, 0 clicks**, position ~80.

**Read:** Gateway credibility ≠ institutional SERP win. Offense (llms / pillars) needs citation + sales motion, not ads.

---

## 6. Hybrid Monetization Plan — on track?

| Plan intent | Evidence | Status |
| --- | --- | --- |
| Stop free API firehose / bot cost | `bot_gate/401` → 3,964 sessions; AU ↓; later API 402 (#110) | **On track (defense)** |
| Scraper → Developer Utility checkout | `/sponsor` #1 landing (4,008) | **Traffic yes / conversion unproven** |
| Same-origin humans keep product | Organic + home + import engagement healthy when human | **On track** |
| Paid API Keys north star | £0 revenue; MP conversion not visible in snapshot | **Off track (measurement + sales)** |
| Import activation | Ghostfolio CTR ↑; high eng on import landings | **Early wedge — scale missing** |
| Clean analytics doctrine | Triad law live; raw AU still tempting in Firebase overview | **Process risk** |

**Conclusion:** Hybrid plan is **on track for perimeter repair**, **not yet on track for monetized growth outcomes**. Do not declare the “growth mess” closed.

---

## 7. Org — hands on deck (next 14 days)

| Role | Day-14 finding | Immediate mandate |
| --- | --- | --- |
| **CEO** | Defense narrative OK; growth narrative not | Keep triad-only board packs; **deny geo spend**; schedule Day-28 |
| **CCO** | Sponsor volume without paid keys | Stripe + Firebase paid-key count weekly; OP contact / Pioneer pipeline audit; outbound OK, ads frozen |
| **CPO** | Farm still acquisition face | Prioritize human teaser quality vs farm SEO debt; import UX retention |
| **Head of Product Eng** | Gates working; dashboard landing anomaly | Investigate `/dashboard` new-user flood; confirm Firewall GREEN; watch 402/PLG post Aug 7 |
| **Head of Marketing** | Farm SERP share unchanged at board level | GSC URL Inspection brand+import; kill farm-query glorification in reporting; **register GA4 MP secret** if still pending |
| **Head of AI & Community** | AI sessions ↑, KE ↓; Open Learn 0 clicks | Citation push to `/learn/*` + llms; track ChatGPT → pillar → contact |
| **Head of Creative Studios** | Brand misspell CTR weak | Creative for “pocket folio / login” SERP; import broker cards |

---

## 8. Decision register (fill in live review)

| Motion | Decision | Owner |
| --- | --- | --- |
| ICP geo ads UK/US/DE/CA/AU | **NO-GO / FROZEN** | CEO + CCO |
| Enterprise / Design Partner outbound | **GO** (sales-led, not ads) | CCO |
| AI citation engine doubling-down | **GO** | AI & Community |
| Additional farm `noindex` / de-index pass | **GO — evaluate** | Eng + Marketing |
| Declare Hybrid Monetization “growth mess repaired” | **NO** | CEO |

**CEO decision:** Growth calibration = **continue observation to Day-28 (2026-08-24)** with defense held and offense measured on triad + SERP *mix*, not raw clicks.

---

## 9. Sources

- GA4: Landing page, Traffic acquisition, Reports snapshot, Firebase overview, Generate leads overview (export windows Jul 13–Aug 9)  
- GSC: `pocketportfolio.app-Performance-on-Search-2026-08-10/*`  
- GSC: `openportfolio.co.uk-Performance-on-Search-2026-08-10/*`  
- Doctrine: `growth-report-command-org-2026-07-28.md`, Hybrid Monetization Plan, Board Triad memo  
- Template: `wave1-day14-review-2026-08-10.md`

---

## 10. Command scorecard

| Gate | Status |
| --- | --- |
| Wave 1–2 engineering perimeter | ✅ Live / value visible |
| Edge / bot monetization funnel traffic | ✅ Visible (`bot_gate`, `/sponsor`) |
| Board Triad outcomes (HQ sessions / imports / paid keys) | ❌ Incomplete / not board-grade |
| Pocket SERP mix de-farmed | ❌ Fail (~90% farm queries) |
| Open Learn / institutional GSC | ❌ Fail (0 Learn clicks) |
| ICP geo spend | ⛔ Frozen |
| Hybrid Monetization “growth mess repaired” | ❌ Not yet — **defense yes, growth no** |
