---
id: OP-GSC-EVENTS-PHASE0-2026-09-21
title: Phase 0 — GSC connection + conversion events + claim purge
status: ACTIVE
date: 2026-09-21
owners: [Platform (R), Marketing (A), Eng (C), CCO (I)]
---

# Phase 0 measurement foundation

## 1. Google Search Console (operator action)

Connect property **`https://www.openportfolio.co.uk`** (URL-prefix or Domain) to the workspace Search Console account used for Command reviews.

Separate property for **`https://www.pocketportfolio.app`** — do not mix Open wealth-tech queries with Pocket consumer noise.

**Baseline dump (first connect):**
- Top queries / pages (28d + 3m)
- Index coverage / excluded reasons
- Referring domains (Links report)

Store exports under `docs/command/_transfer/gsc/` with date stamp (do not commit secrets).

**Exit criteria:** GSC live; Marketing can pull non-brand impressions for wealth-tech AI custody queries.

## 2. Conversion events (shipped in product)

| Event | Where | Purpose |
|-------|-------|---------|
| `homepage_diligence_cta_clicked` | OpenLandingClient | Primary CTA |
| `homepage_architecture_clicked` | OpenLandingClient | Secondary path |
| `homepage_form_started` | OpenContactForm | Form funnel |
| `homepage_form_submitted` | OpenContactForm | Lead capture |
| `homepage_faq_opened` | OpenLandingClient | AEO engagement |
| `qualified_opportunity` | `trackQualifiedOpportunity` | CRM stage (CCO) |

Leads persist to Firestore `open_portfolio_contact_leads` with `pipelineStage` default `inquiry`.

## 3. Publish-readiness checklist

- [x] Homepage title ≤60: `BYOC AI Infrastructure for Wealth-Tech | Open Portfolio`
- [x] Architecture title: `Sovereign AI Architecture for Wealth-Tech | Open Portfolio`
- [x] Canonicals on institutional learn pages
- [x] Open sitemap includes new cluster URLs via `OPEN_ALIAS_ROUTES`
- [x] Residual SOC 2 chrome purged from ComplianceBanner US path
- [x] `llms.txt` SSOT = `lib/llms-feed.ts` (rebuild on deploy)
- [x] Dilution postgres topics excluded from Open listing + noindex helper

## 4. Failure stop

Do not publish additional cluster pages while GSC, conversion events, or claim ledger ownership is unresolved. Claim ledger v1: `docs/command/claim-to-evidence-ledger-v1-2026-09-21.md`.
