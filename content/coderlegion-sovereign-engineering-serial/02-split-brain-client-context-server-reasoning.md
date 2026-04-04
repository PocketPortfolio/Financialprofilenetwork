---
title: "Part 2: Split-Brain — Client-Side Context vs Server-Side Reasoning"
date: "2026-04-17"
tags: ["engineering", "ai", "local-first", "finance", "rag", "architecture"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-02.png"
series: "Sovereign Engineering"
---

# Split-Brain: Analyst-Grade Reasoning Without Raw Transactions on the Server

To deliver **analyst-grade** answers without centralizing the **transaction tape**, we engineered a deliberate **split-brain**: the server never needs your raw history to answer “What is my largest position?”—it needs a **semantic summary**—allocation, scale, and performance—that fits in a few hundred tokens. This post is the **technical truth** for that claim: **memory on the edge**, **reasoning in the cloud**, **one bounded string** across the boundary.

---

## The three zones

1. **Local edge (browser):** normalized `Trade[]`, computed `Position` map, UI state. This is where **thousands of CSV rows** (after import) live as structured objects — not as a paste buffer in ChatGPT.
2. **Compiler (client):** `buildPortfolioContext` in `app/lib/ai/contextBuilder.ts` — deterministic reduction to a **fixed-schema** text block.
3. **Stateless API:** `POST /api/ai/chat` — receives `context` + `message` (+ optional attachment for paid tier), streams the model output, **does not** persist the payload as portfolio rows.

**Flow:** the app builds that summary on the client, then sends it with each question — the API does not pull your full trade history from a server-side portfolio database for this path.

---

## The literal compiler: `buildPortfolioContext`

Below is the **actual** function as implemented today. Read it as a **token funnel**: many trades in → one small string out.

```typescript
const TOP_HOLDINGS_COUNT = 10;

export function buildPortfolioContext(
  trades: Trade[],
  positions?: Record<string, Position> | Position[]
): string {
  const positionMap: Record<string, Position> = (() => {
    if (positions !== undefined) {
      if (Array.isArray(positions)) {
        const map: Record<string, Position> = {};
        positions.forEach((p) => {
          map[p.ticker] = p;
        });
        return map;
      }
      return positions;
    }
    const { positions: derived } = calculatePositions(trades);
    return derived;
  })();

  const positionList = Object.values(positionMap).filter((p) => p.shares > 0);
  const totals = calculatePortfolioTotals(positionMap);

  const lines: string[] = [];
  lines.push('Portfolio summary (for personalization only):');
  lines.push(`Total positions: ${totals.totalPositions}`);
  lines.push(`Total trades: ${trades.length}`);
  if (totals.totalInvested > 0 || totals.totalCurrentValue > 0) {
    lines.push(`Total invested (USD equiv): ${totals.totalInvested.toFixed(2)}`);
    lines.push(`Total current value (USD equiv): ${totals.totalCurrentValue.toFixed(2)}`);
    lines.push(
      `Total unrealized P/L: ${totals.totalUnrealizedPL.toFixed(2)} (${totals.totalUnrealizedPLPercent.toFixed(1)}%)`
    );
  }

  if (positionList.length > 0) {
    const byValue = [...positionList].sort((a, b) => b.currentValue - a.currentValue);
    const top = byValue.slice(0, TOP_HOLDINGS_COUNT);
    lines.push('');
    lines.push('Top holdings by current value:');
    top.forEach((p) => {
      const pct =
        totals.totalCurrentValue > 0 ? (p.currentValue / totals.totalCurrentValue) * 100 : 0;
      lines.push(
        `  ${p.ticker}: ${p.shares.toFixed(2)} shares, ${p.currency} ${p.currentValue.toFixed(2)} (${pct.toFixed(1)}%), P/L ${p.unrealizedPLPercent.toFixed(1)}%`
      );
    });
  }

  return lines.join('\n');
}
```

**What this proves**

- **Thousands of rows** in `trades` collapse to: **one count**, **portfolio totals**, and **at most ten** ticker lines. Typical output is **~1–2 KB** of UTF-8 — not a dump of every fill, date, or broker note.
- **No CSV**, no “Description”, no “Account Number” column appears here — those fields either never made it into `Trade`, or they are **not selected** for emission because the function **only** prints the allowed template.

---

## Wire format: what the client actually sends

`AskAIModal` posts JSON:

```typescript
body: JSON.stringify({
  message: text,
  context: portfolioContext,
  ...(isPaid && attachedContent ? { attachedContent } : {}),
}),
```

So the **only** default portfolio signal is `portfolioContext` — the string from `buildPortfolioContext`. The server does **not** pull trades from a database for this path; it **trusts the client-built summary** (and optional attachment) for that session.

---

## Attachment boundary (precision matters)

**Paid** users may send `attachedContent`. That is **full text for one turn** — a different privacy contract than the default top-N summary. Be explicit in product copy and UX.

---

## Takeaway

**Analyst-grade** does not require **server-side** row replay. It requires **correct aggregation** locally plus **grounded** prompts on the server (system instructions and live quote injection — the topic of Part 6).

---

*Part 2 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**
