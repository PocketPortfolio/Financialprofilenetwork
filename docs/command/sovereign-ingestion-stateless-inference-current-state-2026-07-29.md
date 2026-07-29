---
id: OP-CURRENT-STATE-SOVEREIGN-INGESTION-2026-07-29
title: Sovereign Ingestion & Stateless Inference — Current State (Innovation Brief)
status: ENGINEERING_SSOT_SNAPSHOT
audience: [Engineering, Technical Writing, Product, Open Portfolio procurement]
governance_ssot: docs/command/claims-vs-codebase-calibration.md
book_refs:
  - https://www.pocketportfolio.app/book/universal-llm-import
  - https://www.pocketportfolio.app/book/sovereign-intelligence
last_updated: 2026-07-29
p0_status: CLOSED
---

# Sovereign Ingestion & Stateless Inference — Current State

**Purpose.** Accelerate innovation by stating what is **shipped and verifiable**, what is **architecturally ready but incomplete**, and where narrative/docs drift from code. Dual-surface truth: **Pocket Portfolio** (B2C harness) and **Open Portfolio** (B2B/procurement) share **one monorepo, one deployment, host-aware routing**.

**Canonical books (product narrative):**

- [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import) — source: `docs/book/UNIVERSAL-LLM-IMPORT-BOOK.md`
- [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) — source: `docs/book/SOVEREIGN-INTELLIGENCE-BOOK.md`

**Governance SSOT:** `docs/command/claims-vs-codebase-calibration.md`  
**Engineering record:** `docs/IP-TECHNICAL-MECHANISMS.md`  
**Serial curriculum:** `docs/command/sovereign-ingestion-stateless-inference-12-part-blueprint.md`

---

## 1. One-sentence architecture

**Ingest locally → normalize to OpenBrokerCSV semantics → aggregate in the browser → send a bounded snapshot to a forgetful inference handler.**

```text
Broker CSV/Excel (device)
  → @pocket-portfolio/importer  [adapters | Smart Mapping]
  → NormalizedTrade[] / OpenBrokerCSV-shaped rows
  → Guest: localStorage | Auth: Firebase authority
  → buildPortfolioContext()     [totals + top-10]
  → POST /api/ai/chat           [stream; no portfolio payload store]
  → optional Firestore/KV       [quota + analytics metadata only]
```

Do **not** claim: “AI never sees data,” “zero server footprint,” “IndexedDB is the database,” or two separate production apps.

---

## 2. Dual surface — roles, not forks

| Surface | Host | Job today |
|---------|------|-----------|
| **Pocket Portfolio** | `www.pocketportfolio.app` | Live CSV import UX, Ask AI / Pocket Analyst, adversarial harness for messy real exports |
| **Open Portfolio** | `www.openportfolio.co.uk` | Procurement narrative, OpenBrokerCSV / SDK story, host rewrites to `app/open/*` |

Shared substrate: same importer package, same `/api/ai/*` handlers, same middleware dual-host rules (`middleware.ts`, `lib/canonical-claims.ts`).

---

## 3. Sovereign Ingestion — technical realities

### 3.1 SDK plumbing (`@pocket-portfolio/importer` v1.1.3)

`SDK.version` in `lib/canonical-claims.ts` is **1.1.3** (drift-guarded against `packages/importer/package.json`).

| Export / surface | Role |
|------------------|------|
| `parseCSV(file, locale?, brokerId?)` | Detect (first 2KB) or force adapter → `ParseResult` |
| `detectBroker` / `detectBrokerFromSample` / `ADAPTERS` | Registry of **19** deterministic adapters |
| `parseUniversal` / `inferMapping` / `genericParse` | Smart Mapping path for unknown schemas |
| `SYNONYMS` / `normalizeHeader` | Client fuzzy header pre-pass |
| Types | `NormalizedTrade`, `BrokerId`, `UniversalMapping`, `RequiresMappingResult`, … |

**Registered adapters (registry order):** Trading212, IBKR Flex, Schwab, Vanguard, E\*TRADE, Fidelity, Freetrade, IG, Saxo, Interactive Investor, Revolut, Coinbase, Kraken, Binance, DEGIRO, Koinly, TurboTax, Ghostfolio, Sharesight.

**Product UI:** `app/components/CSVImporter.tsx` → known broker or interstitial → `parseUniversal` → `ColumnMappingModal`. SEO landings under `app/import/[broker]/` include marketing routes (e.g. robinhood/etoro) that resolve via **Smart Import**, not dedicated adapters.

### 3.2 Universal / “LLM Import” pipeline (as shipped)

Aligned with the Universal LLM Import book:

1. Full file parsed **on device**.
2. Heuristic synonym mapping; confidence gate **0.9**.
3. Below threshold → `REQUIRES_MAPPING` (headers, sample rows, proposed mapping; raw CSV stays client-side).
4. Optional cloud assist: client may POST **headers + ≤3 sample rows** to `/api/ai/map-csv` when `ENABLE_LLM_IMPORT` / `NEXT_PUBLIC_ENABLE_LLM_IMPORT` is on.
5. Sanitize / adversarial checks in `packages/importer/src/universal/*` before any cloud call.
6. **Server (when flag on):** Gemini → OpenAI `generateObject` → synonym heuristic; mapping values validated against exact headers. Flag off → 403.

### 3.3 OpenBrokerCSV

| Artifact | State |
|----------|--------|
| Repo-root `SCHEMA.md` | Exists — points to package SSOT |
| `packages/importer/SCHEMA.md` | **Landed** — OpenBrokerCSV interchange + `NormalizedTrade` conversion table |
| Runtime model | `NormalizedTrade` (`type`/`qty`) ↔ interchange (`action`/`quantity`) — documented, not renamed |
| Marketing | `/openbrokercsv` (+ Open host alias) |

### 3.4 Partner / OSS surface

Shipped as **MIT npm package + docs/landings**, not a partner REST platform or plugin marketplace. Alias npm packages in `canonical-claims` `PACKAGES` re-export discovery against the same core. Contributor loop: GitHub / `README-OSS-WORKFLOW.md` — not a runtime extension economy.

---

## 4. Stateless Inference — technical realities

### 4.1 Context engine

`buildPortfolioContext(trades, positions?)` in `app/lib/ai/contextBuilder.ts`:

- Fixed schema text: totals, trade count, invested / value / unrealized P/L, **top 10** holdings (ticker, shares, currency, value, allocation %, P/L %).
- By construction: **no raw ledger rows, no account IDs, no broker names** on this path.
- Book design target ≈ **≤4K tokens**; typical output is far smaller. **Not** enforced by a TypeScript token validator today.

Call sites: dashboard → `PocketAnalystProvider`; advisor briefing via `useClientBriefing` (same chat API).

### 4.2 Inference handler

`POST /api/ai/chat` (`app/api/ai/chat/route.ts`):

| Aspect | Reality |
|--------|---------|
| Auth | Firebase ID token required |
| Body | `message`, `context`, optional `attachedContent` |
| Persistence of portfolio/message | **None** — payload used to build prompt + stream |
| Persisted metadata | Quota (`aiUsage` / KV), `toolUsage` analytics |
| Models | Gemini first (flash free / pro paid); OpenAI fallback via Vercel AI SDK `streamText` |
| Free quota | **20 / 30 days** |
| Attachments | Paid only; server cap **60_000** chars; transient for the request |
| Quotes | Symbol hints → `/api/quote` injected into system prompt |

**Client:** `AskAIModal` uses manual `fetch` + `ReadableStream`. Primary Gemini path is **raw Generative Language API**, not `@ai-sdk/react` / `useChat` (deps present; Ask AI path largely unused).

### 4.3 Related AI routes

| Route | Status |
|-------|--------|
| `GET /api/ai/usage` | Free-tier used/limit |
| `POST /api/ai/map-csv` | Flag-gated; **Gemini → OpenAI → heuristic** when `ENABLE_LLM_IMPORT=true` |
| `app/agent/outreach.ts` | `generateObject` — sales tooling, not Pocket Analyst |

---

## 5. Books vs codebase — calibration matrix

| Book / claim theme | Code reality | Innovation note |
|--------------------|--------------|-----------------|
| Heuristic-first, LLM optional for mapping | **Shipped:** Gemini then OpenAI behind `ENABLE_LLM_IMPORT`; heuristic fallback | Ops: set flag in env to enable cloud assist |
| Headers + 3 rows egress | Implemented in client `inference.ts` + server sanitize | Keep as hard privacy invariant |
| Confidence 0.9 / REQUIRES_MAPPING | Shipped | Persist mappings per broker fingerprint = UX unlock (P1) |
| Sanitized snapshot / Split Brain | `contextBuilder` + chat route match | Add hard token/size validator if “last K trades” features land |
| Stateless chat | Matches route header + IP doc | Do not market “zero DB writes” — quota/analytics write |
| Gemini grounding / Search | Quotes via `/api/quote`; not full Search-grounding product | Distinct from book “Google Mode” aspiration |
| Autonomous agents (SI Ch.10) | Not production | Keep as roadmap; do not imply shipped agent loop |
| Robinhood / eToro as adapters | README/package honesty: **Smart Import**; Open copy aligned | Optional dedicated adapters later |
| `SDK.version` | **1.1.3** — matches `packages/importer`; drift-guarded | — |
| Plugin marketplace | Not shipped | Point innovators to importer PRs + Discussions |

---

## 6. Gaps ranked for innovation velocity

### P0 — Closed (2026-07-29)

1. ~~Enable true LLM column mapping~~ — **Done:** Gemini → OpenAI → heuristic in `/api/ai/map-csv` (still flag-gated).
2. ~~Fix importer README / package description / keywords~~ — **Done:** dedicated adapters vs Smart Import.
3. ~~Sync version claims~~ — **Done:** `SDK.version` = 1.1.3 + package.json drift guard.
4. ~~Land `packages/importer/SCHEMA.md`~~ — **Done:** interchange + runtime conversion table; root `SCHEMA.md` points to it.

**Ops (done 2026-07-29):** `ENABLE_LLM_IMPORT=true` and `NEXT_PUBLIC_ENABLE_LLM_IMPORT=true` set on Vercel (production, preview, development). Redeploy required for server env to take effect. Importer npm release target: **1.1.4**.

### P1 — Product leverage on existing plumbing

5. **Persisted Smart Mapping** keyed by header fingerprint / broker hint (book limitation: mapping UI per file).
6. **Unify Ask AI on Vercel AI SDK** end-to-end (Gemini + OpenAI) for one streaming/error/telemetry surface.
7. **Hard context budget** (token or char cap + tests) before expanding context (recent trades, tax lots, etc.).
8. **Open-facing SDK demos** that call the same `parseUniversal` path (procurement can run fixtures without Pocket UI).

### P2 — Roadmap (books already set expectation)

9. Safer agent loop (tool allowlists, human confirm) — SI Ch.10 / Pocket Analyst blueprint.
10. Richer market grounding (beyond `/api/quote`) without widening the portfolio egress surface.
11. Contributor adapter templates + fixture CI as the real “ecosystem” substitute for a marketplace.

---

## 7. Approved language for innovators & writers

**Use:**

- Client-side aggregation by construction; bounded, user-approved aggregate context.
- No PII / account identifiers on the Pocket Analyst inference path **as designed** in `contextBuilder`.
- Stateless inference **with respect to the portfolio payload**; quota/analytics metadata may persist.
- MIT sovereign ingestion SDK: 19 verified adapters + Smart Mapping; truncated mapping samples only.
- One deployment, two audiences (Pocket harness / Open procurement).

**Avoid (without legal + engineering sign-off):**

- “AI never sees your data,” “zero server footprint,” “fully local” for signed-in workflows, blanket “IndexedDB is our database,” “plugin marketplace,” unqualified “Bloomberg replacement.”

---

## 8. File map (receipts)

| Path | Why it matters |
|------|----------------|
| `packages/importer/src/index.ts` | Public SDK surface |
| `packages/importer/src/registry.ts` | 19 adapters |
| `packages/importer/src/universal/*` | Smart Mapping + optional map-csv client |
| `app/components/CSVImporter.tsx` | Production ingestion harness |
| `app/api/ai/map-csv/route.ts` | Truncated mapping API (Gemini → OpenAI → heuristic) |
| `app/lib/ai/contextBuilder.ts` | Sanitized snapshot |
| `app/api/ai/chat/route.ts` | Stateless stream + quota |
| `app/components/ai/AskAIModal.tsx` | Pocket Analyst client |
| `lib/canonical-claims.ts` | Claim floors, Open copy, hosts (`SDK.version` 1.1.3) |
| `packages/importer/SCHEMA.md` | Package OpenBrokerCSV + NormalizedTrade SSOT |
| `SCHEMA.md` | Root pointer to package SCHEMA |
| `docs/book/UNIVERSAL-LLM-IMPORT-BOOK.md` | Ingestion book SSOT |
| `docs/book/SOVEREIGN-INTELLIGENCE-BOOK.md` | Inference book SSOT |

---

## 9. Bottom line

**Shipped moat:** local-first MIT ingestion (19 adapters + universal mapping UX), truncated mapping egress with **real LLM assist when flagged**, deterministic top-N context builder, and an auth’d chat route that does not retain portfolio/message bodies. Schema honesty and adapter claims are aligned.

**Innovation frontier:** P1 — persisted Smart Mapping, Ask AI SDK unification, hard context budgets, Open SDK demos — then agents/grounding **without** widening the inference payload beyond the calibrated boundary.
