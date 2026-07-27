# Board KPI Reset Memo — Wave 1 Commercial Offense

**From:** CEO (mandate) · CCO (revenue triad)  
**To:** Command Team · Marketing · Product Engineering  
**Date:** 2026-07-27  
**Status:** EFFECTIVE IMMEDIATELY · Active Users retired as board north star  
**Related code contract:** `app/lib/analytics/clean-tracker.ts` → `BOARD_NORTH_STAR_KPIS`

---

## 1. Mandate

Raw Google Analytics **Active Users** is deprecated as a primary board metric.

The 28-day SOS window showed ~32k “active users,” ~2.3s engagement, 99.96% new, and **£0** attributed revenue. That figure was contaminated by scrapers and self-UTM `json_api` loops. PR #90 closed the free ticker API firehose. Continuing to steer on Active Users would reintroduce ghost growth into executive decisions.

**Effective this reporting cycle:** the board pack reports only the triad below. Active Users may appear in an appendix as a hygiene/context metric, never as the headline.

---

## 2. North-star triad (definitions)

| KPI | Definition | Source of truth | Exclusions |
| --- | --- | --- | --- |
| **Human Quality Sessions** | Unique sessions with engagement time ≥ **30 seconds** on HTML / import surfaces, **or** ≥ 1 key event | GA4 Explore / internal board sheet; self-UTM sessions already retagged by clean-tracker | Pure API hits; sessions with only self-UTM acquisition mediums (`semantic_footer`, `sticky_prompt`, `live_preview_lead`, `bridge_cta`, `symbol_layout`, `json_api`, etc.) |
| **Broker Import Conversions** | Successful local CSV imports | GA4 `csv_import_success` (and related `csv_import_*`) from `/import/*` and dashboard import | Demo-only parses that never persist (unless product later marks them as conversions) |
| **Paid API Keys / Developer Utility** | Active billable keys for **Developer Utility** (`featureVoter`), **Founders Club**, and **Corporate** | Stripe + Firebase `apiKeysByEmail` | **Code Supporter** (tip SKU — not firehose MRR); unpaid / revoked keys |

Do **not** invent a phantom £49 SKU in board copy. Developer Utility maps to existing Feature Voter Stripe prices.

---

## 3. Reporting cadence

| Cadence | Owner | Output |
| --- | --- | --- |
| Weekly (Mon) | Marketing + Eng | Triad snapshot vs prior week |
| Biweekly board | CEO + CCO | 1-page triad + narrative (no MAU headline) |
| Day 14 Wave 1 review | CEO + CCO + Marketing | Triad + brand/import GSC CTR + OP prune status → Wave 2 go/no-go |

---

## 4. CCO revenue appendix

- **API monetization funnel (PR #90):** unauthenticated scraper → `401` + Developer Utility `checkout_url` → `/sponsor?tier=developer-utility` → Stripe `checkout.session.completed` → `apiKeysByEmail` + `developer_utility_conversion` event.
- **Board MRR line:** sum of active Developer Utility / Founders / Corporate subscriptions only.
- **ICP geo spend (UK/US/DE/CA/AU), enterprise outbound, AI citation engine:** Wave 2 — paused until Day-14 review.

---

## 5. Ownership

| Action | Owner |
| --- | --- |
| Enforce memo in board packs | CEO |
| Revenue triad + Stripe key counts | CCO |
| GA Explore filters / CTR sheets | Head of Marketing |
| Event integrity (`csv_import_*`, `developer_utility_conversion`) | Head of Product Engineering |
| Brand / import SERP tracking (14-day window) | Head of Marketing + Creative Studios |

---

## 6. Exit criteria (Workstream 01)

- [ ] Next board pack has **zero** Active Users as primary KPI  
- [ ] Triad definitions match `BOARD_NORTH_STAR_KPIS` in code  
- [ ] Marketing can produce a weekly triad sheet without vanity MAU  

**Command directive:** Hand this memo to owners. Brand SERP + Import GSC workstreams may proceed in parallel (Days 1–3).
