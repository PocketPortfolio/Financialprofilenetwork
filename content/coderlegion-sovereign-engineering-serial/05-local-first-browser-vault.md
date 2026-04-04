---
title: "Part 5: Local-First Mastery — Browser Storage as the Financial Vault"
date: "2026-05-08"
tags: ["engineering", "local-first", "finance", "browser", "storage", "firebase"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-05.png"
series: "Sovereign Engineering"
---

# Local-First: The Browser as the Vault

“IndexedDB for everything” is a **marketing shorthand**. Engineers need the **three real persistence lanes** in this codebase: **guest localStorage**, **authenticated cloud trades**, and **Zustand prefs-only**—plus **Firestore IndexedDB cache** teardown on logout.

---

## Lane 1 — Guest users: `localPortfolioStore.ts` (localStorage)

Unauthenticated users never hit Firebase for trades. Data lives under namespaced keys:

```typescript
const STORAGE_KEY_TRADES = 'pocket-portfolio-local-trades';
const STORAGE_KEY_PORTFOLIO = 'pocket-portfolio-local-portfolio';
const STORAGE_KEY_METADATA = 'pocket-portfolio-local-metadata';
```

`saveLocalTrades` writes JSON with **metadata** (`tradeCount`, `dataSize`, timestamps). Quota is estimated against a **5MB** conservative browser budget (`QUOTA_WARNING_THRESHOLD` / `QUOTA_ERROR_THRESHOLD`). When quota goes red, the user gets a **hard error** — we fail closed rather than silently truncating wealth data.

**Engineering takeaway:** the “vault” for guests is **literally** `localStorage` keys prefixed `pocket-portfolio-` — not a hosted SQL row.

---

## Lane 2 — Authenticated users: `useTrades` + `TradeService`

When `isAuthenticated && user`, `useTrades` loads via:

```typescript
const userTrades = await TradeService.getTrades(user.uid, true); // forceServerFetch
```

So **authoritative** trade history for signed-in users is **Firebase-backed** (cloud), while the **UI working set** still behaves local-first: filtering, healed-trade tombstones in `localStorage` (`healedTradeIds`), and client-side aggregation before Ask AI.

**Do not claim** “no server” for auth users — claim **no central portfolio DB for LLM inference** (Part 1) and **minimal** product surface area.

---

## Lane 3 — Preferences only: `portfolioStore.ts` + `persist`

`zustand/middleware` `persist` uses **`partialize`** so we **do not** dump positions into long-term storage:

```typescript
partialize: (state) => ({
  chartView: state.chartView,
  timeRange: state.timeRange,
  selectedSectors: state.selectedSectors,
  sectorFilter: state.sectorFilter,
  selectedBenchmark: state.selectedBenchmark,
}),
```

Chart UX survives reload; **sensitive blobs** are not persisted here by design.

---

## IndexedDB: where it actually shows up

Firebase Auth + Firestore client SDKs use **IndexedDB** for offline/cache. On **logout**, `useAuth` attempts `clearIndexedDbPersistence(db)` before `terminate(db)` — see `app/hooks/useAuth.ts`. That is **cache hygiene**, not “portfolio primary store.”

---

## Why not “just use Supabase”?

This is a **blast-radius** choice: a multi-tenant Postgres of **everyone’s ledgers** is a different breach story than **device-held** guest data + **user-scoped** cloud docs for auth users. We compare architectures, not logos.

---

*Part 5 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**
