---
title: "Part 9: Privacy-First Analytics — Aggregating Loop Velocity"
date: "2026-06-05"
tags: ["engineering", "analytics", "firebase", "privacy", "admin", "stripe"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-09.png"
series: "Sovereign Engineering"
---

# Measuring Loop Velocity Without Portfolio Rows

`/admin/analytics` is an **operator console**—revenue, referrals, npm packages, viral email blast stats, Pocket Analyst usage **metadata**. It is **not** a SQL console into user holdings.

---

## API surface: `GET /api/admin/analytics`

`app/api/admin/analytics/route.ts` aggregates many subsystems in one response (time range via `?range=`). Notable bundles:

- **Stripe** — subscription / checkout signals keyed by price IDs (`SPONSOR_PRICE_IDS`, `FOUNDERS_CLUB_PRICE_IDS`).
- **Referrals** — `getReferralData(startDate)` over `referralEvents` (clicks, conversions, by campaign, by source).
- **Viral moment** — `getViralMomentBlastMetrics` + `viralMomentEmailBlast` object including `viral_moment_v1` conversion rollups when campaign data exists.
- **NPM** — download signals for scoped packages (`NPM_PACKAGES` array).
- **Pocket Analyst** — events come from `toolUsage` writes (see Part 1) — flags like `hadAttachment`, not prompt text.

The **UI** is `app/admin/analytics/page.tsx` — tables and cards for humans, not raw Firestore dumps.

---

## What “zero-PII analytics” actually means here

We **minimize** sensitive fields in product telemetry:

- Referral events carry **codes** and **campaign tags**, not tickers.
- Analyst logs carry **uid/tier/booleans**, not `context` strings.

We **do not** claim zero identifiers: **UIDs** exist wherever Firebase auth does.

---

## GA4 vs admin

**GA4** answers **marketing acquisition** (active users, sources). **Admin API** answers **product operations** (paid tiers, referral funnel, blast performance). Use both; **never conflate** without labels (Part 4).

---

*Part 9 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**
