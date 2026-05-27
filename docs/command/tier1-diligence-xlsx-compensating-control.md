---
id: TIER1-DILIGENCE-XLSX-CC
title: xlsx (SheetJS) — Accepted Risk & Compensating Controls
status: DILIGENCE_ANNEX
branch: infra/diligence-hardening
last_updated: 2026-05-27
roles: [CSO, Head of Engineering, Procurement-facing]
---

# xlsx (SheetJS) — Compensating Control Statement

## Advisory summary

| Field | Value |
|-------|--------|
| Package | `xlsx` (^0.18.5) |
| npm audit severity | **High** (2 advisories) |
| CWE | CWE-1321 (Prototype Pollution), ReDoS |
| Upstream fix | **None available** at time of diligence hardening |
| Production exposure | **Client-side and Node import path only** — not a public unauthenticated server parser |

## Why we cannot patch without breaking product logic

`xlsx` is the only supported path for Excel (`.xlsx`/`.xls`) broker exports in `@pocket-portfolio/importer` and the optional Google Drive Excel export lane. npm audit reports **no fix available**; forced major-version substitution would alter parsing semantics across 15+ broker adapters and break the published OSS contract.

**Decision:** Accept residual risk with **layered compensating controls** rather than a breaking dependency swap during the diligence window.

## Compensating controls (verifiable in repo)

### 1. Bounded input surface

Excel parsing occurs only after the user selects a file in the browser or an authenticated export path — never on an anonymous public API:

- `packages/importer/src/io/csvFrom.ts` — reads `ArrayBuffer` from user upload; inline comment documents known vulns and trusted-source constraint.
- `app/api/import/parse/route.ts` — **disabled** (503); no server-side SheetJS ingress in production.
- Primary ingestion is **CSV-first**; Excel is a convenience path converted immediately to CSV text before adapter logic runs.

### 2. Sanitization-by-construction (downstream of parse)

Before any network egress or LLM context:

- Universal header sanitization: control-char stripping, zero-width removal, 120-char header cap (`packages/importer/src/universal/sanitize.ts`).
- Cell truncation and suspicious-cell detection (injection phrases, oversized base64-like payloads).
- Adversarial schema detection (`packages/importer/src/universal/adversarial.ts`).
- Automated tests: `tests/unit/import/universal-hardening.spec.ts`.

### 3. Inference boundary isolation

Parsed broker data never reaches `/api/ai/chat` as raw rows. Pocket Analyst receives only `buildPortfolioContext()` aggregates (totals + top-10 holdings) — see `docs/command/tier1-inference-boundary-annex.md`.

### 4. Supply-chain visibility

SBOM includes `xlsx` with full dependency graph: `npm run sbom` → `docs/seed/phase2-evidence/sbom-cyclonedx.json`.

### 5. Monitoring & remediation path

| Milestone | Action |
|-----------|--------|
| Diligence window | Document + test coverage (this annex) |
| Post-close | Evaluate `exceljs` or SheetJS Pro fork behind feature flag in `packages/importer` only |
| Ongoing | `npm audit` in CI; flag if upstream publishes patched `xlsx` |

## Procurement-facing language (verbatim-safe)

> **SheetJS (`xlsx`) residual risk:** npm reports high-severity prototype-pollution and ReDoS advisories with no upstream patch. We do not expose SheetJS on anonymous server endpoints. Excel uploads are parsed client-side (or in disabled server routes), immediately normalized through a deterministic sanitization pipeline, and never forwarded as raw ledger rows to cloud inference. Portfolio AI context is aggregate-only by construction. A CycloneDX SBOM inventories the dependency; remediation is tracked on our supply-chain hardening branch.

## Evidence references

| Mechanism | Path |
|-----------|------|
| Excel → CSV conversion | `packages/importer/src/io/csvFrom.ts` |
| Header/cell sanitization | `packages/importer/src/universal/sanitize.ts` |
| Adversarial detection | `packages/importer/src/universal/adversarial.ts` |
| Server parse disabled | `app/api/import/parse/route.ts` |
| Context egress cap | `app/lib/ai/contextBuilder.ts` |
| Adversarial unit tests | `tests/unit/import/universal-hardening.spec.ts` |
