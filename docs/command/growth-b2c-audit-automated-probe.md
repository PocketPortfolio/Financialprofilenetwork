# Pocket B2C growth audit — automated probe output

_Generated 2026-05-29T15:45:11.827Z · production GET probes · https://www.pocketportfolio.app_

## Phase 1 — Sitemap index (36-stream invariant)
- Index HTTP: **200**
- Child `<loc>` count: **36**
- shard `sitemap-static-v3.xml`: ✓
- shard `sitemap-imports-v3.xml`: ✓
- shard `sitemap-tools-v3.xml`: ✓
- shard `sitemap-blog-v3.xml`: ✓
- Ticker shards: **16**/16
- Risk shards: **16**/16
- **Result:** PASS — 36 child streams

## Phase 1 — Path-scoped Pocket → Open (redirect sanity)
- `/architecture`: PASS (308 → https://www.openportfolio.co.uk/architecture)
- `/press/abba-lawal`: PASS (308 → https://www.openportfolio.co.uk/press/abba-lawal)
- `/` (manual): PASS (200)
- `/press` (follow): PASS

## Phase 1 — Sample Pocket money URLs (200 expected)
- `/for/advisors`: **200** ✓
- `/tools`: **200** ✓
- `/learn/json-finance`: **200** ✓
- `/cheapest-portfolio-tracker-no-subscription`: **200** ✓

## Phase 0 — Manual / Growth-owned (NOT RUN HERE)
- GSC property verification + Coverage dashboard snapshot
- GA4 hostname-filter view + KPI baseline export (organic branded vs non-branded)
- Release tag SSOT on `main` (git/Vercel)

## Phase 2 — Repo hint (glossary vs static sitemap)
- Cross-check `app/learn/*/page.tsx` (Pocket glossary slugs) vs `app/sitemap-static.ts` after each glossary ship; rebuild `npm run build:sitemaps` before indexing assertions.
- Sovereign learn pillars intentionally Open-canonical — omitting them from Pocket static sitemap is expected.

## Phase 3 — Manual
- UK SERP grid + competitor velocity spreadsheet
- GA4 exploration: verify advisor_tool funnel events in Explorations