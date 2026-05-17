---
id: PP-GROWTH-B2C-PROGRAMME-2026-05
title: Pocket B2C — market acceleration & growth audit programme (ratified)
status: RATIFIED_WITH_AMENDMENTS
programme_phase: TECH_EXECUTION_PASS_2026_05_17
last_updated: 2026-05-17
---

# Pocket B2C growth audit — Unified Command ratification (with technical amendments)

This document is the **single SSOT** for the approved **Pocket-only** growth audit programme. It incorporates **mandatory corrections** from Technical Lead review so squads do not mis-test routing or sign impossible success criteria.

---

## 1. Binding technical clarification (do not paraphrase away)

**Primary Pocket canonical traffic stays on Pocket.**

- **`www.pocketportfolio.app`** (and apex consolidation to `www` / HTTPS on **Pocket hosts only**) is the normal consumer surface.
- Migration to Open is **`path-scoped`**: `next.config.js` emits **301** from Pocket hosts to **`https://www.openportfolio.co.uk{path}`** **only** for paths listed in **`OPEN_ALIAS_POCKET_TO_OPEN_PATHS`** (synced with B2B aliasing; **`/press`** excluded for the consumer hub).

**Auditors must not** describe this as “primary Pocket canonical traffic migrating to Open.” That false framing invalidates crawl and GSC interpretation.

---

## 2. Success metrics — revised numeric definitions (Command-approved intent, TL-precise wording)

| Goal | Definition | Notes |
|------|------------|--------|
| **Organic discovery** | **Δ non-branded organic sessions (Pocket hostname)** ≥ **+35%** quarter-over-quarter | **Guardrails:** (a) define segment in GA4 with **`hostname = www.pocketportfolio.app`**; (b) exclude Open hosts; (c) enforce **minimum monthly session floor** (e.g. 500+) before QoQ is scored, or report confidence interval; (d) **fallback milestone:** +15% QoQ **plus** agreed leading-indicator wins (e.g. impressions on target queries) if baseline is volatile. |
| **SERP placement** | **Top 5 (UK)** for an **agreed primary intent term** | **Before locking:** validate query in Search Console / Keyword Planner (volume, SERP type, whether compound queries outperform “private wealth terminal”). Maintain a **small approved keyword set** (5–10); primary term is chosen from that list, not assumed. |
| **Advisor funnel** | **100% instrumentation maturity** — every defined step in `/for/advisors` fires a named analytics event (landing → engagement → PDF/tool completion as applicable), with **dashboard verification** | **Not** “100% lead conversion” (impossible). Optional **Phase 2 CVR target** is set **after** baseline conversion is measured (numeric, benchmarked). |

---

## 3. Scope boundary

- **Pocket-only** for routine audit work: **`pocketportfolio.app`** / **`www.pocketportfolio.app`**.
- **Open Portfolio cross-check** only via **formal engineering escalation** (e.g. citation conflict, unexpected shared equity on `/press` or redirects).

---

## 4. Ownership matrix — Phase 0 (Week 1)

| ID | Task | Owner |
|----|------|--------|
| **P0-1** | Production SSOT: releases tagged from **`main`**; deploy pipeline matches canonical repo state | Eng Lead / DevOps |
| **P0-2** | GSC: Pocket property verification; **`https://www.pocketportfolio.app/sitemap.xml`** submitted; top issues logged | Growth / SEO |
| **P0-3** | GA4: hostname / reporting view isolates **Pocket** from **Open** traffic | Growth / Data |
| **P0-4** | KPI baseline doc: branded vs non-branded organic, advisor funnel events (once instrumented) | Command + Growth |

**Phase 0 exit:** baseline captured + KPI definitions signed; Phase 1 crawl/index work authorised.

---

## 5. Linear epic (reference structure)

**Epic:** `[GROWTH-B2C] Pocket Portfolio market dominance & indexation audit`

### Story 1 — `[GROWTH-B2C-01]` Technical SEO & 36-stream index validation (P0)

- Confirm **`https://www.pocketportfolio.app/sitemap.xml`** lists **36** child streams (static, imports, tools, blog, 16× tickers, 16× risks) per `scripts/build-static-sitemaps.ts` / production behaviour.
- Production crawl: document **4xx/5xx** and **bad redirect chains** on core money URLs.
- Rich Results / structured data: **representative sample** of consumer templates passes validation (do not assert “every page flawless” unless inventory is explicitly in scope).

### Story 2 — `[GROWTH-B2C-02]` Programmatic glossary & content completeness (P0)

- Ticker/risk template sample for thin/boilerplate risk.
- Confirm glossary URLs staged for spider discovery — including **`/learn/realised-vs-unrealised`** and **`/learn/dollar-cost-averaging`** in **`app/sitemap-static.ts`** (artifact parity).
- Internal linking map: hubs (`/tools`, import surfaces, `/learn`) → programmatic leaves.

### Story 3 — `[GROWTH-B2C-03]` Advisor funnel & SERP competitiveness (P1)

- Competitor content velocity snapshot (3–5 UK peers).
- Full **`/for/advisors`** funnel instrumentation per §2.
- AEO spot-check: Pocket messaging consistency with **local-first / zero warehouse ledger** positioning.

---

## 6. In-repo engineering artefacts (already aligned)

- Dual-surface routing: **`middleware.ts`**, **`next.config.js`**, **`lib/canonical-claims.ts`** (`OPEN_ALIAS_ROUTES`, Pocket→Open path list).
- Pocket **36-stream** sitemap build; Open dynamic sitemap + Open-category blog URLs (**`lib/blog-sitemap-entries.ts`**).
- Split **`llms.txt`** manifests (Pocket vs Open) and CI drift guard where configured.

---

## 7. Technical Lead operational verdict

Programme **approved** for execution **with §1–2 amendments binding**. Phase **0** is **authorised**. Squads assign Linear keys and begin baseline ingestion.

**Build for purpose. Verify on artifact. Reciprocate the signal.**
