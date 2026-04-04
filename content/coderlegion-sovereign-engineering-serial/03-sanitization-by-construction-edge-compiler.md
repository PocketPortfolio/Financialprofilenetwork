---
title: "Part 3: Sanitization by Construction — The Edge Compiler"
date: "2026-04-24"
tags: ["engineering", "ai", "local-first", "finance", "privacy", "typescript"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-03.png"
series: "Sovereign Engineering"
---

# Sanitization by Construction: The "Edge Compiler"

Regex-based **PII stripping** on arbitrary exports is fragile: one new column, one merged cell, one localization change—and you leak. We chose **structural exclusion**: the network never sees a **free-form ledger string** because we **never build one** for the model.

---

## Naming truth: there is no `EdgeCompiler` package

**Edge Compiler** is our **term of art** for the deterministic reduction in `buildPortfolioContext` (`app/lib/ai/contextBuilder.ts`). There is no separate package or binary with that name—just this function’s contract.

---

## Two different pipelines (do not conflate them)

<table>
<thead>
<tr>
<th scope="col">Stage</th>
<th scope="col">What happens</th>
<th scope="col">PII risk</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>CSV → trades</strong></td>
<td>Importer / broker adapters (<code>packages/importer</code>, etc.) parse files into normalized <code>Trade</code> objects in the browser</td>
<td>Parsing must respect broker columns; that is <strong>import</strong> logic, not Ask AI</td>
</tr>
<tr>
<td><strong>Trades → LLM context</strong></td>
<td><code>buildPortfolioContext</code> turns <code>Trade[]</code> + positions into a <strong>fixed template</strong> string</td>
<td><strong>No row dump</strong> — only totals + top <strong>10</strong> tickers by value</td>
</tr>
</tbody>
</table>

Part 3 is about the **second** stage: the **AI boundary**. The function does **not** parse CSV text or “drop Description / Account Number columns” line-by-line — by the time it runs, data is already **`Trade`**. Anything that is not part of the **allowed output lines** simply **cannot appear**, because the function **only** pushes the template fields (ticker, shares, currency, value, allocation %, P/L %).

That is **structural exclusion**, not redaction.

---

## Why PII “never hits the network tab” (default path)

For the default Ask AI flow:

1. The client builds **`context`** from `buildPortfolioContext` only.
2. The HTTP body contains **`context`**, not the raw CSV file and not a concatenation of every trade row.
3. **Open DevTools → Network** on a typical “ask about my allocation” question: you should see a **short** `context` string — not your export.

**Paid attachment** is explicit: if the user sends file content, that is a **deliberate** second boundary — not the default “sanitized snapshot” path.

---

## The core logic (same as Part 2, different emphasis)

`TOP_HOLDINGS_COUNT = 10` caps ticker-level disclosure. **Totals** (`calculatePortfolioTotals`) give portfolio-level signal without listing every fill. Comment in source:

```typescript
// No raw ledger rows, no PII, no account identifiers—sanitization by construction.
```

For **CSV import**, optional column mapping may send **headers and a few sample rows** only; the **full file stays in the browser**. Same privacy instinct, different pipeline than Ask AI context.

---

## Performance

Reduction is **O(n)** over trades for position derivation + **O(m log m)** for sorting positions where **m** is position count — typically **milliseconds** on-device. Sub-200ms is plausible on modern laptops; **measure** if you publish a number.

---

## Summary

- **Edge Compiler** = **`buildPortfolioContext`** — fixed schema, aggregates + top-N.
- **Not** a regex scrubber on arbitrary strings.
- **CSV column** semantics belong to **import**; **semantic summary** belongs to **context builder**.

---

*Part 3 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**
