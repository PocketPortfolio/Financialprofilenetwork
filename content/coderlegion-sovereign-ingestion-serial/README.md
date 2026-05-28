# CoderLegion — Sovereign Ingestion & Stateless Inference Serial

Publication-ready Markdown for CoderLegion (YAML frontmatter + body).  
**Manifest:** [`../coderlegion-sovereign-ingestion-serial.md`](../coderlegion-sovereign-ingestion-serial.md)  
**Governance:** [`../../docs/command/claims-vs-codebase-calibration.md`](../../docs/command/claims-vs-codebase-calibration.md)

## Glossary

- **Bounded portfolio context:** Output of `buildPortfolioContext` in `app/lib/ai/contextBuilder.ts` — totals + top-N holdings, fixed template.
- **Stateless inference:** `POST /api/ai/chat` does not persist the portfolio context string; quota/metadata may use Firestore/KV.
- **Dual surface:** Pocket B2C + Open B2B in **one** deployment; host-aware routing in `middleware.ts` + `lib/canonical-claims.ts`.
- **Edge Compiler (term of art):** Same as `buildPortfolioContext` — deterministic client-side reduction before the network hop.

## Covers

- **PNG (OG/social):** `public/book-assets/sovereign-ingestion-covers/ing-01.png` … `ing-12.png`
- **SVG (source):** `images/ing-NN-cover.svg`
- **Regenerate:** `node scripts/generate-sovereign-ingestion-cover-pngs.mjs`

Background **`#09090b`**, accent **`#f59e0b`** — no fintech-blue (`#0070f3`) in payload areas.
