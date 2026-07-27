# Board Triad Dashboard — Wave 1 (Operational Sheet)

**Owner:** Head of Marketing (weekly) · CCO (revenue column) · Eng (event integrity)  
**Baseline window:** 2026-07-28 → 2026-08-10 (14 days)  
**Memo:** [board-kpi-reset-memo-2026-07-27.md](./board-kpi-reset-memo-2026-07-27.md)

## Instructions

1. Do **not** put Active Users in the primary columns.
2. Pull Human Quality Sessions from GA4 Explore: engagement ≥30s OR ≥1 key event; exclude known self-UTM mediums.
3. Import conversions = `csv_import_success` count.
4. Paid API keys = Firebase/Stripe count for featureVoter + foundersClub + corporateSponsor only.

## Weekly log

| Week ending | Human Quality Sessions | Broker Import Conversions (`csv_import_success`) | Paid API Keys (DU/Founders/Corporate) | Notes |
| --- | ---: | ---: | ---: | --- |
| 2026-08-03 | TBD | TBD | TBD | Wave 1 week 1 |
| 2026-08-10 | TBD | TBD | TBD | Day-14 review |

## Pre-sprint snapshot (from SOS brief, 28d ending ~2026-07-25)

| Metric | Value | Status |
| --- | --- | --- |
| Active Users (deprecated) | ~32,319 | Do not report as north star |
| Engagement (avg) | ~2.3s | Contaminated |
| Attributed revenue | £0 | Baseline |
| Google organic share | ~1.9% of sessions | Context only |

## GA4 Explore recipe (Marketing)

- Metric: Sessions where `engagementTimeMsec >= 30000` OR `eventCount` for key events ≥ 1
- Dimension filter: exclude `utm_medium` in self-UTM cluster (see `SELF_UTM_MEDIUMS` in `app/lib/analytics/clean-tracker.ts`)
- Segment: hostname `pocketportfolio.app` / `www.pocketportfolio.app` for Pocket triad
