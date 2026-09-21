---
id: OP-HOMEPAGE-DILIGENCE-RECEIPTS-2026-09-21
title: Homepage Diligence Lock — Phase 0 proof-strip receipts
status: ACTIVE
date: 2026-09-21
owners: [Engineering, Head of AI]
governance: docs/command/claims-vs-codebase-calibration.md §6b
---

# Proof-strip receipts (Phase 0 hard gate)

Written Eng receipts for homepage proof-strip metrics. Head of AI must countersign before production publish of numeric claims.

## Adapter count

| Field | Value |
|-------|-------|
| Claim | **19 dedicated broker adapters** |
| Source | `packages/importer/SCHEMA.md` (“Registry: … 19 dedicated adapters”) |
| Code | `packages/importer/src/registry.ts` |
| SSOT | `SDK.brokerAdapterCount = 19` in `lib/canonical-claims.ts` |
| Publish language | “19 dedicated broker adapters” — **not** “19+” on the homepage |

## License

| Field | Value |
|-------|-------|
| Claim | Open-source **MIT** ingestion SDK |
| Package | `@pocket-portfolio/importer` |
| Source | `packages/importer/package.json` → `"license": "MIT"` |
| SSOT | `SDK.license = 'MIT'` in `lib/canonical-claims.ts` |
| Publish language | “MIT-licensed `@pocket-portfolio/importer`” |

## Production / harness wording

| Field | Value |
|-------|-------|
| Approved | Pocket Portfolio is the **live consumer harness** that stress-tests the same ingestion substrate under real export variability |
| Dropped from homepage social proof | “live production traffic” as a standalone metric claim |
| Founder credential | Keep NGV £7B prior-role wording only with explicit “not an Open Portfolio customer claim” qualifier (see `OPEN_LANDING_COPY.moat.socialProofBody`) |

## Head of AI sign-off

- [ ] Adapter count language approved
- [ ] MIT license language approved
- [ ] Harness / traffic wording approved (or qualitative fallback)

**Eng attestation (2026-09-21):** Receipts above match repository SSOT. Numeric proof strip cleared for staging with the publish language in this file.
