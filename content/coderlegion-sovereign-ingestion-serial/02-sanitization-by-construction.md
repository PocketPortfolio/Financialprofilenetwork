---
title: "Part 2: Sanitization by Construction"
date: "2026-06-01"
tags: ["engineering", "ai", "privacy", "typescript", "context-builder", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-02.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Sanitization by Construction: Bounded Context Before the Network

Regex redaction on arbitrary broker exports fails the moment a column renames, a locale shifts decimal separators, or a merged cell appears. We chose **structural exclusion**: the Ask AI path never serializes a **free-form ledger string** because we **never build one** for the model.

The mechanism is `buildPortfolioContext` in `app/lib/ai/contextBuilder.ts`.

---

## Edge Compiler = function contract, not a package

**Edge Compiler** is a **term of art** for this deterministic reduction. There is no `EdgeCompiler` npm module — only a pure function with a fixed output template:

```typescript
const TOP_HOLDINGS_COUNT = 10;
// ...
lines.push('Portfolio summary (for personalization only):');
lines.push(`Total positions: ${totals.totalPositions}`);
lines.push(`Total trades: ${trades.length}`);
// Top holdings: ticker, shares, currency, value %, P/L %
```

Source comment (accurate):

```typescript
// No raw ledger rows, no PII, no account identifiers—sanitization by construction.
```

---

## Two pipelines — do not conflate

<table>
<thead>
<tr>
<th scope="col">Stage</th>
<th scope="col">Input → output</th>
<th scope="col">What crosses the network for Ask AI</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Import</strong></td>
<td>Broker CSV → <code>Trade[]</code> via <code>packages/importer</code></td>
<td><strong>Not</strong> the default Ask AI body (Part 5)</td>
</tr>
<tr>
<td><strong>Context build</strong></td>
<td><code>Trade[]</code> + positions → template string</td>
<td><strong>Yes</strong> — bounded aggregate only</td>
</tr>
</tbody>
</table>

Import may touch account-ish columns while parsing; the **inference boundary** is the second stage. By the time `buildPortfolioContext` runs, only template fields can appear in the output lines.

---

## What the LLM receives (calibrated language)

Approved: **“The LLM receives a bounded, user-approved aggregate context payload.”**

**Prohibited:** “AI never sees your data.” The model also receives the user message, optional attachment content (explicit user action), and route-defined server injections (e.g. live quotes) per `app/api/ai/chat/route.ts` and `docs/IP-TECHNICAL-MECHANISMS.md`.

**Approved:** **No PII and no account identifiers on the Pocket Analyst inference path** as designed in `contextBuilder.ts`.

---

## DevTools receipt

On a typical allocation question:

1. Client calls `buildPortfolioContext(trades, positions)`.
2. Network tab shows a **short** `context` field in the POST body — not 10,000 trade rows.
3. Compare to guest `localStorage` or Firebase-backed trade count in application state — orders of magnitude larger than the payload.

---

## Performance

Reduction is **O(n)** over trades for position derivation plus sort of position list for top-N — typically milliseconds on-device. Publish latency numbers only after measurement on target hardware.

---

*Part 2 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**
