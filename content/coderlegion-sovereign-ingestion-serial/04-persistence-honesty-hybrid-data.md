---
title: "Part 4: Persistence Honesty — Navigating the Hybrid Data Layer"
date: "2026-06-15"
tags: ["engineering", "local-first", "firebase", "storage", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-04.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Persistence Honesty: Guests, Firebase, Cache, and User-Owned Sync

“Local-first” in our prose means **interaction and ingestion default to the device** — not “no server for signed-in users.” This part is the **mode matrix** every writer and growth campaign must internalise. Deeper guest/auth detail also lives in `content/coderlegion-sovereign-engineering-serial/05-local-first-browser-vault.md`; here we align with the **2026 calibration ledger**.

---

## Ground truth table

<table>
<thead>
<tr>
<th scope="col">User mode</th>
<th scope="col">Authoritative trades</th>
<th scope="col">Code touchpoints</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Guest</strong></td>
<td>Browser <code>localStorage</code> (namespaced keys, quota handling)</td>
<td><code>localPortfolioStore</code> patterns</td>
</tr>
<tr>
<td><strong>Authenticated</strong></td>
<td><strong>Firebase</strong> cloud — authoritative history</td>
<td><code>useTrades</code> → <code>TradeService.getTrades</code></td>
</tr>
<tr>
<td><strong>UI preferences</strong></td>
<td>Zustand <code>persist</code> with <code>partialize</code> — chart/filters only</td>
<td><code>portfolioStore</code></td>
</tr>
<tr>
<td><strong>IndexedDB</strong></td>
<td>Primarily <strong>Firestore client SDK cache</strong>; cleared on logout where implemented</td>
<td><code>useAuth</code> teardown</td>
</tr>
<tr>
<td><strong>Google Drive</strong></td>
<td>User-owned file (<code>pocket_portfolio_db.json</code>) — dumb sync lane</td>
<td>Sovereign Sync docs / architecture page</td>
</tr>
</tbody>
</table>

---

## Why “IndexedDB is our database” is wrong

Guests do not use IndexedDB as the primary trade vault — they use **`localStorage`**. Authenticated users’ authority is **Firebase**, with IndexedDB as **offline/cache** for the SDK. Claiming IndexedDB is “the portfolio vault for everyone” fails procurement diligence in one grep.

---

## Local-first ≠ no cloud

Approved phrases (from `docs/command/claims-vs-codebase-calibration.md`):

- **Client-side aggregation by construction** for LLM context.
- **Stateless inference handler** for portfolio text on `/api/ai/chat`.

Prohibited without sign-off:

- “Zero server footprint” / “fully local portfolio” for auth workflows.
- “No cloud” — Firebase, Vercel, LLM APIs, optional Redis/KV are all cloud-adjacent.

---

## Google Drive: sovereign sync, not app logic

Drive holds a **user-owned JSON file**. The app does not execute portfolio business rules on Google’s servers — it treats Drive as **dumb storage** for export/sync. That is a credible “user-owned lane” story **without** claiming we eliminated Firebase for signed-in users.

---

## Engineering takeaway for Part 12

Honest persistence makes the **inference boundary** (Parts 2–3) believable: we are not pretending the full ledger never existed; we are proving the **LLM hop** does not require re-uploading it row-by-row.

---

*Part 4 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**
