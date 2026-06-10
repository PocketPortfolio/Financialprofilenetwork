# Command Team Resolution: B2C Growth Audit Calibration (Amended)
**Directive ID:** CMD-B2C-GROWTH-2026-06-10-R1  
**Status:** **APPROVED MARCHING ORDERS · OPEN WORK ITEMS GATED**  
**Assessed:** 10 June 2026  
**Target Surface:** `https://www.pocketportfolio.app/`

---

## Executive Summary

This document serves as the final, repo-calibrated amendment to the Pocket Portfolio B2C Growth Audit. It establishes approved marching orders for traditional Search (SEO), Answer Engines (AEO), and Generative Search (GEO). 

All metrics, file paths, and structural definitions below are strictly calibrated to the repository state as of June 2026. Marketing copy variations must remain bound to these engineering invariants.

---

## 1. Technical SEO & Programmatic Infrastructure

Our search discovery is driven entirely by the **36 Programmatic Sitemap Streams** configured in `public/sitemap.xml` and enforced via `scripts/growth-b2c-pocket-audit.mjs`. 

### Dynamic Route Inventory & Keyword Capture

| Stream Vector | True Repository Path | Target Scale |
| :--- | :--- | :--- |
| **Programmatic Tickers** | `app/tools/track/[ticker]/page.tsx`<br>`app/s/[symbol]/page.tsx` | Active ticker definitions |
| **Broker Import Landers** | `app/import/[broker]/page.tsx` | **57 public landers** (`SUPPORTED_BROKERS` in `app/lib/brokers/config.ts`) |
| **Dynamic Tool Engines** | `app/tools/[conversion_pair]/page.tsx`<br>Static routes (e.g., `app/tools/risk-calculator`) | Core utility calculators |
| **Advisor Matrix** | `app/for/advisors/page.tsx` | B2B2C landing pathways |

### Structural Invariants
*   **Root Schema Configuration:** The root JSON-LD schema is **`WebApplication`**, injected via `getHomePageSchema()` inside the global `app/layout.tsx`. No `DataCatalog` schema exists in the codebase.
*   **Nested Schema Assets:** Localized `SoftwareApplication` nodes are nested within the structural `HowTo` code on individual `/import/[broker]` routes and `track/[ticker]` pages.

---

## 2. Structural Integrity & Optimization Horizons

### Warning 01: Hydration Gating & Money Page SSR (Maintain & Extend)
The landing page relies on a client-side hydration gate (`app/landing/LandingVariantGate.tsx` using `'use client'`), which obscures the CSV "aha moment" from basic search crawlers. To mitigate this, engineering must strictly protect and extend the Server-Side Rendering (SSR) perimeter on high-leverage money paths:

*   **Current Production SSR:** `/import/[broker]` and `/tools/track/[ticker]` cleanly deliver pre-rendered server components with baked-in metadata and FAQ/HowTo JSON-LD.
*   **Engineering Backlog (Q3/Q4):** Transition the `/tools` hub, `/import` hub, and individual standalone calculator views away from complete `'use client'` dependence toward hybrid server-compositions.

### Warning 02: Structural Copy Divergence & Jargon Leakage
The retail A/B testing infrastructure (`landing_retail_ia_2026`) utilizes clean, outcome-focused language via `lib/landing-retail-copy.ts`. However, technical development jargon still leaks across our programmatic search surfaces:

*   **The Exposure Surface:** Both `app/lib/pseo/content.ts` (H1/titles) and the metadata fallback blocks inside `app/s/[symbol]/page.tsx` hardcode the phrase *"Sovereign Infrastructure"*. 
*   **Action Directive:** The CPO and Creative team are assigned an open work item to perform a comprehensive copy pass across these specific components. The language must match retail-friendly positioning (e.g., *"Track [Ticker] Risk"*) without modifying underlying route states.

---

## 3. Telemetry, Metrics, & Invariant Enforcement

*   **Static Manifest Automation:** The synchronization of `public/llms.txt` on `npm run build` via `scripts/build-llms-txt.ts` remains active. It is protected by the CI drift guard layout configured in `.github/workflows/seo-validation.yml`.
*   **Metrics Baseline Quarantine:** The metrics frozen inside `NUMBERS_SNAPSHOT` (**4,669 MAU** / **9,389 npm downloads** under `asOf: 2026-04-20`) are historical baselines. They must not be publicized as real-time platform telemetry. Marketing is blocked from syndicating these numbers externally until a Q3 data pull refreshes the static registry.
*   **Organic Growth Target:** The targeted **+35% QoQ non-branded organic session** growth remains an unverified programme baseline (`growth-b2c-pocket-market-acceleration-programme.md`). Growth team retains ownership of the outstanding GSC/GA4 baseline data export.

---

## 4. Execution Assured

| Assignment | Owner | Mandate |
| :--- | :--- | :--- |
| **PSEO Template Softening** | Head of AI + Creative | Strip "Sovereign Infrastructure" from `content.ts` and `app/s/[symbol]/page.tsx`. |
| **Data Tracking Isolation** | Product Engineering | Protect the `/admin/analytics` cohort tracking loops from state mutation. |
| **Receipt Token Update** | Head of Marketing | Pull updated GA4/NPM metrics before lifting the outbound marketing freeze. |
