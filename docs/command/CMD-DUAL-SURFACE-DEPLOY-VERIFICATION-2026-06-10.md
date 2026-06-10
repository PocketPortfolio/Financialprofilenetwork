# Ground Truth Codebase & Invariant Verification Audit

**Directive ID:** CMD-DUAL-SURFACE-DEPLOY-2026-06-10  
**Related:** CMD-B2C-GROWTH-2026-06-10-R1  
**Status:** **POST-CORRECTION VERIFICATION PASS · METRICS QUARANTINE REMAINS**  
**Assessed:** 10 June 2026  
**Auditor:** Monorepo Systems Auditor (repo scan, zero narrative)  
**Surfaces:** `www.pocketportfolio.app` (B2C) · `www.openportfolio.co.uk` (B2B)

---

## Prompt Corrections Applied Before Scan

| Original prompt assumption | Corrected path |
| --- | --- |
| Header in `OpenLandingClient.tsx` | **`app/open/_components/OpenNavbar.tsx`** via `app/open/layout.tsx` |
| A/B constants in `retail-landing-ab.ts` | **`lib/landing-retail-variant.ts`** (authoritative booleans) |
| Directive ID `CMD-B2B-DEPLOY-2026-06-10` | Renamed **dual-surface** deploy gate (B2B nav + B2C pSEO) |

---

## Working Tree Delta (This Pass)

| File | Change |
| --- | --- |
| `lib/canonical-claims.ts` | Removed **Sovereign Stack** from `OPEN_NAV` header array |
| `app/lib/brokers/config.ts` | Comment **50 → 57** brokers |
| `app/import/[broker]/page.tsx` | Jargon purge + **50 → 57** comments |
| `app/lib/pseo/content.ts` | Retail ticker templates (prior pass) |
| `app/s/[symbol]/page.tsx` | Retail metadata fallback (prior pass) |
| `app/sitemap-imports.ts` | **57 brokers** comment (prior pass) |

---

## Vector 1 — B2B Header & Funnel Navigation Leak Audit

**Component:** `app/open/_components/OpenNavbar.tsx` → `OPEN_NAV` from `lib/canonical-claims.ts`

### Header Text Links Array (post-correction)

```ts
export const OPEN_NAV = [
  { label: 'Architecture', href: '/architecture' },
  { label: 'Blog', href: '/blog' },
] as const;
```

| String | In header DOM? | Result |
| --- | --- | --- |
| Design Challenge | No | **[VERIFIED REPO TRUTH]** |
| Tier 1 | No | **[VERIFIED REPO TRUTH]** |
| BIP | No | **[VERIFIED REPO TRUTH]** |
| Sovereign Stack | No (removed from `OPEN_NAV`) | **[VERIFIED REPO TRUTH]** |

### Footer Verification (`app/open/_components/OpenFooter.tsx`)

Institutional pathways rendered at footer via `OPEN_LANDING_FOOTER_PATHWAYS`:

```ts
{ label: 'Tier 1 Design Partnership', href: '/tier1designpartner' },
{ label: 'Design Challenge', href: '/designchallenge' },
{ label: 'Board of Investors (BIP)', href: '/board-of-investors' },
{ label: 'Sovereign AI Grant', href: '/sovereign-ai-grant' },
```

Plus low-profile utility links: **Sovereign Stack**, **Local-First**, Architecture, Blog, Pocket cross-link.

| Pathway | Footer-only? | Result |
| --- | --- | --- |
| Tier 1 Design Partnership | Yes | **[VERIFIED REPO TRUTH]** |
| Design Challenge | Yes | **[VERIFIED REPO TRUTH]** |
| Board of Investors (BIP) | Yes | **[VERIFIED REPO TRUTH]** |
| Sovereign Stack | Yes (footer; removed from header) | **[VERIFIED REPO TRUTH]** |

---

## Vector 2 — B2C Ticker pSEO & Jargon Purge Verification

### Global grep: `"Sovereign Infrastructure"` under `app/`

**0 matches** → **[VERIFIED REPO TRUTH]**

### `app/lib/pseo/content.ts`

```ts
const title = `Track ${symbol} Risk & Volatility — Portfolio Analysis | Pocket Portfolio`;
const h1 = `Track ${symbol} Risk & Volatility`;
```

→ **[VERIFIED REPO TRUTH]**

### `app/s/[symbol]/page.tsx` — metadata fallback

```ts
title: `Track ${symbol} Risk & Volatility (No Login) | Pocket Portfolio`,
description: `Track ${symbol} in your portfolio. Import broker CSVs in your browser...`,
```

→ **[VERIFIED REPO TRUTH]**

### Residual jargon — `/import/` and `/tools/`

| Phrase | `/import/` | `/tools/` |
| --- | --- | --- |
| `Sovereign Infrastructure` | None | None |
| `Verified Ingestion Schema` | None (post-correction) | None |
| `local-first engine` | None (post-correction) | None |

→ **[VERIFIED REPO TRUTH]**

---

## Vector 3 — Telemetry Invariant & Metric Quarantine Check

**File:** `lib/canonical-claims.ts` → `NUMBERS_SNAPSHOT`

| Row ID | Value | `asOf` | Result |
| --- | --- | --- | --- |
| TRAC-01 | 9389 | `2026-04-20` | **[DRIFT DETECTED]** — stale; Marketing refresh pending |
| TRAC-07 | 4669 | `2026-04-20` | **[DRIFT DETECTED]** — stale; outbound syndication gated |

**Deploy implication:** Code deploy may proceed; **external growth syndication remains blocked** until `NUMBERS_SNAPSHOT` is refreshed with June 2026 receipts.

---

## Vector 4 — Ingestion & Broker Config Counting

**File:** `app/lib/brokers/config.ts` → `BROKER_CONFIG` top-level keys

| Check | Count | Result |
| --- | --- | --- |
| `SUPPORTED_BROKERS` keys | **57** | **[VERIFIED REPO TRUTH]** |
| `app/sitemap-imports.ts` comment | `57 brokers — SUPPORTED_BROKERS` | **[VERIFIED REPO TRUTH]** |
| Stale "50 brokers" comments | None remaining | **[VERIFIED REPO TRUTH]** |

---

## Vector 5 — A/B Testing Gating & Hydration State

**Authoritative file:** `lib/landing-retail-variant.ts`

| Constant | Value | Result |
| --- | --- | --- |
| `LANDING_AB_IS_ACTIVE` | `true` | **[VERIFIED REPO TRUTH]** |
| `LANDING_AB_TRAFFIC_SPLIT_PERCENT` | `100` | **[VERIFIED REPO TRUTH]** |
| `LANDING_VARIANT_TEST_ID` | `landing_retail_ia_2026` | **[VERIFIED REPO TRUTH]** |

**Hydration boundary:** `app/landing/LandingVariantGate.tsx` line 1 → `'use client'` with `Suspense` shell.

→ **[VERIFIED REPO TRUTH]**

**Canonical un-branched:** Middleware assigns variant via cookie only (`no ?variant= in HTML`). Root metadata canonical (`https://www.pocketportfolio.app/`) when `NEXT_PUBLIC_BRAND_V2=true`.

→ **[VERIFIED REPO TRUTH]**

---

## Deploy Gate Matrix (Final)

| Gate | Status |
| --- | --- |
| B2B header funnel isolation | **PASS** |
| B2C pSEO jargon purge | **PASS** |
| Import lander jargon purge | **PASS** |
| Broker count SSOT (57) | **PASS** |
| A/B + canonical invariants | **PASS** |
| `NUMBERS_SNAPSHOT` freshness | **FAIL** — quarantine holds |
| Lint + typecheck | **PASS** |

---

## Executive Disposition

**Code deploy authorized** for structural/positioning corrections. **Outbound acceleration gated** on Marketing `NUMBERS_SNAPSHOT` refresh (TRAC-01 / TRAC-07).

**Remaining Q3/Q4 backlog (non-blocking):** hybrid SSR for `/tools` hub, `/import` hub, standalone calculator shells (`CMD-B2C-GROWTH-2026-06-10-R1` §2).
