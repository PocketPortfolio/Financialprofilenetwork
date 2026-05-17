---
id: PP-GROWTH-B2C-AUDIT-REPORT-2026-05-17
title: Pocket B2C growth programme — consolidated audit report (execution pass)
status: TECH_EXECUTION_PASS
programme_phase: PHASE_1_COMPLETE_TECH · PHASE_0_3_MANUAL_OUTSTANDING
last_updated: 2026-05-17
---

# Pocket B2C growth programme — consolidated audit report

This report records **what was executed from the repo vs production** versus **what remains Growth / Command manual work**. “Execute all phases” in engineering terms means: **automated verification**, **artifact updates**, and **explicit backlog** — not replacing Google Search Console, GA4 UI, or SERP tooling.

---

## Executive summary

| Phase | Engineering execution | Status |
|-------|----------------------|--------|
| **0 — Baseline & governance** | GSC verification, GA4 hostname views, KPI CSV export, release tagging | **Outstanding** (requires Google accounts + Command) |
| **1 — Technical SEO & index** | 36-stream sitemap PASS; redirect probes PASS; sample URLs 200 | **PASS** (see automated probe) |
| **2 — Programmatic & glossary** | `/learn/json-finance` added to `app/sitemap-static.ts`; ticker/risk thin-content sampling | **Partial** — deploy `build:sitemaps`; thin-content audit backlog |
| **3 — SERP / competitors / advisor** | Advisor funnel **instrumented in code** (`advisor_tool` analytics); SERP grid | **Partial** — instrument code ✓; GA4 dashboard validation + competitors manual |

---

## Automated probe (re-run anytime)

```bash
npm run audit:growth-b2c-pocket
```

Artifact: `docs/command/growth-b2c-audit-automated-probe.md` (overwritten each run).

**Latest production highlights:**

- `https://www.pocketportfolio.app/sitemap.xml` → **36** child sitemaps (`*-v3.xml`): static, imports, tools, blog, 16× tickers, 16× risk.
- `/architecture` → **308** → `https://www.openportfolio.co.uk/architecture` (path-scoped migration ✓).
- `/press/abba-lawal` → **308** → Open founder dossier ✓.
- `/press` → **200** on Pocket ✓.
- `/`, `/for/advisors`, `/tools`, `/learn/json-finance`, `/cheapest-portfolio-tracker-no-subscription` → **200** ✓.

---

## Phase 0 checklist (assign to Growth / Command)

1. **P0-2 GSC:** Confirm Pocket property; submit `https://www.pocketportfolio.app/sitemap.xml`; export Coverage top issues (PDF or screenshot archive).
2. **P0-3 GA4:** Explorer / report filtered by **hostname** `www.pocketportfolio.app`; exclude Open hosts from B2C KPIs.
3. **P0-4 KPI baseline:** Export last 28d / last quarter: organic sessions (branded vs non-branded dimension), advisor_tool funnel counts.
4. **P0-1 SSOT:** Tag `main` post-merge for audit trail (e.g. `audit-b2c-2026-05-17`).

---

## Phase 2 — Engineering backlog (prioritized)

| Priority | Item |
|----------|------|
| **P0** | Ship `app/sitemap-static.ts` **json-finance** URL + run **`npm run build:sitemaps`** in CI/deploy so **production** `sitemap-static-v3.xml` includes it (until deploy, live HTML may exist without sitemap row). |
| **P1** | Sample **50** random ticker + **50** risk URLs from sitemap shards; score thin/boilerplate; template tweaks if duplicate meta dominates. |
| **P1** | Internal linking audit script (hub → leaf) — optional future automation. |
| **P2** | Lighthouse / CrUX field data on money URLs (`npm run test:lighthouse` where CI permits). |

---

## Phase 3 — Advisor funnel (code verification)

`app/for/advisors/AdvisorTool.tsx` emits **`advisor_tool`** events via `app/lib/analytics/tools.ts`:

- Page view / funnel stage landing  
- Interactions (`logo_upload`)  
- Success + PDF **download_start**  
- Errors (`invalid_file_type`, `pdf_generation_failed`, etc.)

**Remainder:** Growth validates events in **GA4 DebugView / Explorations** and maps them to programme §2 “instrumentation maturity.”

---

## Phase 3 — SERP & competitors (manual)

- Lock **approved keyword set** (5–10) using Search Console + Keyword Planner before chasing “private wealth terminal.”
- Build competitor **content velocity** table (3–5 UK wealth-tech / tracker sites): publishing cadence, DR/backlinks snapshot (Ahrefs/Semrush if licensed).

---

## Programme SSOT

Ratified scope & metrics: `docs/command/growth-b2c-pocket-market-acceleration-programme.md`

---

**Technical Lead sign-off (engineering slice):** Phase **1** automated gates **green** on production; Phase **0 / 3** marketing slices **not substitute-able by repo access**. Deploy glossary sitemap row + complete Phase 0 exports for full programme closure.
