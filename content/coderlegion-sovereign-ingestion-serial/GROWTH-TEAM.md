# Growth Team — Sovereign Ingestion Serial (CoderLegion)

**Cadence:** Sunday @ **10:00 UTC**  
**Duration:** 12 weeks (12 posts)  
**Governance:** `docs/command/claims-vs-codebase-calibration.md`  
**Manifest:** [`../coderlegion-sovereign-ingestion-serial.md`](../coderlegion-sovereign-ingestion-serial.md)

---

## Schedule (copy to calendar)

| # | Date (Sun) | Time UTC | File |
|---|------------|----------|------|
| 1 | 2026-05-25 | 10:00 | 01-invariant-boundaries-dual-surface.md |
| 2 | 2026-06-01 | 10:00 | 02-sanitization-by-construction.md |
| 3 | 2026-06-08 | 10:00 | 03-stateless-inference-pipeline.md |
| 4 | 2026-06-15 | 10:00 | 04-persistence-honesty-hybrid-data.md |
| 5 | 2026-06-22 | 10:00 | 05-standardizing-ingestion-interface.md |
| 6 | 2026-06-29 | 10:00 | 06-continuous-evaluation-harness.md |
| 7 | 2026-07-06 | 10:00 | 07-deflationary-unit-economics-edge.md |
| 8 | 2026-07-13 | 10:00 | 08-limited-scope-processor-posture.md |
| 9 | 2026-07-20 | 10:00 | 09-engineering-search-moat.md |
| 10 | 2026-07-27 | 10:00 | 10-preventing-strategic-drift.md |
| 11 | 2026-08-03 | 10:00 | 11-local-first-ux-narrative.md |
| 12 | 2026-08-10 | 10:00 | 12-sovereign-financial-interaction-workflow.md |

---

## Pre-publish checklist (each post)

- [ ] **Calibration pass** — no prohibited phrases (zero server, AI never sees data, IndexedDB vault for all users).
- [ ] **cover_image** → `https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-NN.png`
- [ ] **Series** YAML: `Sovereign Ingestion & Stateless Inference`
- [ ] **Tables:** HTML `<table>` where matrices appear
- [ ] **CTA:** Sovereign Intelligence book + Open Portfolio + Try Pocket
- [ ] **Part 8:** legal disclaimer visible; no contract language without sign-off
- [ ] **Part 10:** gate commands unchanged vs `deploy-production-gates.md`

---

## Covers

Regenerate all twelve: `node scripts/generate-sovereign-ingestion-cover-pngs.mjs`  
Output: `public/book-assets/sovereign-ingestion-covers/` + SVG source in `images/`

---

## Do not conflict with other serials

| Serial | Cadence |
|--------|---------|
| Sovereign Intelligence | Mon/Wed |
| Universal LLM Import | Tue/Thu |
| Sovereign Engineering | Fri |
| **Sovereign Ingestion** | **Sun** |
