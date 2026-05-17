---
id: OP-GROWTH-B2B-OPEN-MAPPED-2026-05-17
title: B2B Open Market Acceleration Programme — strategic ingestion layout (evaluation record)
status: EVALUATION_RECORD
deployment: NOT_CLEARED_FOR_PRODUCTION
programme_owner: CTO_AND_DELIVERY
last_updated: 2026-05-17
---

# Open Portfolio (`www.openportfolio.co.uk`) — B2B market acceleration programme

**Governance:** **CTO and Delivery** own execution of this programme. Technical Lead alignment is recorded inline below.

This document is **evaluation-grade only**. It does **not** authorize production deployment by itself; merge and release follow normal engineering gates (`main`, CI, Vercel).

---

## Alignment confirmation (Technical Lead — artifact-bound)

The Command amendments below match repository reality and prior technical review:

- **`app/api/admin/analytics/route.ts`** must **not** be described as “zero cloud-side operational data”; it aggregates **billing (Stripe)**, **lead/intake (Firestore paths wired in-route)**, and **usage/telemetry** (capped scans). **Retention and lawful basis** are Delivery/Product/legal concerns documented explicitly—not asserted by rhetoric alone.
- **`ppi-meter/1`** has **no in-repo implementation** located via codebase search; treat as **roadmap vocabulary only** until a named implementation lands and is reviewed.
- **Canonical URLs for B2B-facing artefacts** should prefer **`https://www.openportfolio.co.uk`** (especially **`/designchallenge`**); scrub stale **`pocketportfolio.app/designchallenge`** references **where those artefacts are institution-facing** (docs, decks, outbound).
- **Trust metrics in AEO/GEO outputs** remain **`lib/canonical-claims.ts` SSOT** (including Whale Watch / managed-infrastructure context lines)—no improvised figures in procurement decks.

---

## 1. Admin analytics realism — governed tiers (B2B-3 revised)

We classify internal-facing aggregation accessed via **`app/api/admin/analytics/route.ts`** into **three governed tiers** for inventory + procurement honesty:

| Tier | Examples (non-exhaustive) | Governance expectation |
|------|---------------------------|------------------------|
| **Billing metadata** | Stripe objects configured in-route (plans/prices), subscription summaries where wired | Finance truth + PCI/host responsibilities unchanged |
| **Lead procurement** | Open Portfolio contact / challenge-related analytics surfaced to admins where coded | Retention + lawful basis documented in ops privacy annex |
| **Operational tracking** | Firestore-backed counters (tool usage, page views, funnels) subject to scan caps / circuit breakers | Purpose limitation + minimisation review |

**Explicit retract:** We do **not** claim “blanket absence” of operational or lead-category data in cloud systems where this route reads Firestore or Stripe.

**Stage 0 annex (collections + APIs):** [`growth-b2b-stage0-admin-analytics-inventory.md`](growth-b2b-stage0-admin-analytics-inventory.md)

---

## 2. `ppi-meter/1` classification

**Downgraded to roadmap vocabulary.** Not an audit-ready compliance claim until implemented and reviewed in the monorepo.

---

## 3. Master redirect & canonical URL clean pass (B2B-6)

- **Buyer-canonical** engineering narrative URLs live on **`www.openportfolio.co.uk`** per **`OPEN_ALIAS_ROUTES`** / middleware / redirects.
- **Submission SSOT:** GitHub **Discussions #49** remains the referenced submission thread in repo literature—verify links remain live.
- **Hygiene task:** remove or replace **stale Pocket-domain** developer URLs in **B2B-facing** documentation sets where they imply Pocket is the canonical enterprise surface.

---

## 4. SEO / AEO / GEO matrix (artifact-accurate)

| Layer | Intent channel | In-repo anchor |
|-------|----------------|----------------|
| **SEO** | Enterprise engineering queries | **`OPEN_ALIAS_ROUTES`** + **`GET /open/sitemap.xml`** (`app/open/sitemap-static.ts`); dynamic Open sitemap + Open-category blog partition (`lib/blog-sitemap-entries.ts`) |
| **AEO** | Vendor screening via conversational engines | SSOT constants **`lib/canonical-claims.ts`** only |
| **GEO** | Model scrapers | **`public/open/llms.txt`** generated via **`npm run build:llms`** / **`scripts/build-llms-txt.ts`**; served on Open host via middleware rewrite rules |

---

## 5. B2C isolation guardrail (zero casual refactor)

> **B2C non-interference invariant:** B2B squads **must not** edit **`OPEN_ALIAS_POCKET_TO_OPEN_PATHS`** or **`app/sitemap-static.ts`** for **convenience** or **local optimisation**.
>
> Any intentional dual-surface routing change affecting those surfaces requires **Delivery-managed engineering PR**, **`npm run audit:growth-b2c-pocket`**, and **`vitest run tests/unit/canonical-claims.spec.ts`** (plus lint/typecheck per release discipline).

*Legitimate enterprise migrations that **must** extend the Pocket→Open path list remain allowed **only** through that gated change process—not via marketing-owned edits.*

---

## 6. Staged execution order

```
STAGE 0 — Telemetry classify → inventory admin analytics categories + retention notes
STAGE 1 — Canonical scrub → B2B-facing docs/decks point at www.openportfolio.co.uk
STAGE 2 — AEO/GEO lock → build:llms drift CI + SSOT figure parity
STAGE 3 — Dashboard reviews → GSC Open property + GA4 hostname segments + Growth reporting
```

**Stage artefacts:** Stage 0 annex [`growth-b2b-stage0-admin-analytics-inventory.md`](growth-b2b-stage0-admin-analytics-inventory.md) · Stage 2 playbook [`growth-b2b-stage2-aeo-geo-ssot.md`](growth-b2b-stage2-aeo-geo-ssot.md) · Stage 3 dashboards [`growth-b2b-stage3-dashboard-playbook.md`](growth-b2b-stage3-dashboard-playbook.md)

---

## 7. Immediate engineering probes (non-deploying)

- **`npm run audit:open-404`** — host-aware Open routing smoke (local dev per script README).
- **`npm run audit:growth-b2c-pocket`** — regression guard after **any** shared routing PR touching Pocket indexation.
- **`npm run audit:b2b-open`** — optional Open-host smoke (sitemap + sample URLs); see Stage 3 playbook.

---

## Regression gates (shared routing / dual-surface config)

Any PR touching **`next.config.js`** `OPEN_ALIAS_POCKET_TO_OPEN_PATHS`, **`app/sitemap-static.ts`**, middleware host aliases, or Open sitemap composition **must** pass:

1. `npm run lint` && `npm run typecheck`
2. `npx vitest run tests/unit/canonical-claims.spec.ts`
3. `npm run audit:growth-b2c-pocket`

If **`public/open/llms.txt`** or **`public/llms.txt`** changes are implied by claim edits: run **`npm run build:llms`** and keep [`.github/workflows/seo-validation.yml`](../../.github/workflows/seo-validation.yml) green.

---

**Standing directive:** Initialize **Stage 0** under **CTO / Delivery** ownership; Command receives status via fortnightly readouts.

**Build for purpose. Verify on artifact. Reciprocate the signal.**
