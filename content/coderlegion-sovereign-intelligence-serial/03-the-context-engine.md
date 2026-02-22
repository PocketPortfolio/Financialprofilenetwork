---
title: "Part 3: The Context Engine - Sovereign Intelligence"
date: "2026-03-09"
tags: ["engineering", "ai", "local-first", "context", "tokens", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-03-header.png"
series: "Building Sovereign Intelligence"
---

# The Context Engine: Squashing 10,000 trades into 4,000 tokens

The **context engine** is the code that maps the user's portfolio state to a string the LLM can use. In our implementation it is a single function: `buildPortfolioContext(trades, positions)` in `app/lib/ai/contextBuilder.ts`. Given trades and (optionally) computed positions, it produces one block of text: totals (positions, trades, invested, current value, unrealized P/L), then the top N holdings by current value. No PII; no ticker-level history beyond the top N.

**Why a string?** The model is a language model. It reasons over text. So we give it text: a compact, factual summary that answers "what does this user hold and how is it doing?" in a few hundred words.

## The Token Funnel

![Figure 3 — The Token Funnel. Trades and positions (wide) → Aggregation → Top N + totals (narrow) → context string ≤4K tokens.](./images/si-figure-03-token-funnel.svg)

**Wide top:** "Trades + Positions" (full state). **Middle:** "Aggregation" (compute totals, sort by value, take top N). **Narrow bottom:** "Top N + Totals" → "Context String (≤4K tokens)." Signal (allocation, performance) preserved; noise (dates, IDs) dropped.

We include: **Totals** — total positions, total trades, total invested (USD equiv), total current value, total unrealized P/L. **Top holdings** — by current value, up to N (e.g. 10): ticker, shares, currency, current value, allocation percent, P/L percent. We exclude: user ID, account numbers, broker names, full trade list.

## Code deep dive: buildPortfolioContext

The function accepts `trades` (from e.g. `useTrades()`) and optional `positions`. If positions are not provided, it derives them from trades via `calculatePositions(trades)`. It then computes totals with `calculatePortfolioTotals(positionMap)`, builds an array of lines (portfolio summary, totals, then "Top holdings by current value" with one line per holding), and returns `lines.join('\n')`. The implementation is deterministic and side-effect free; it can be unit-tested with fixture trades and positions.

We use a fixed N (e.g. 10) for "top holdings by current value." That keeps the context length bounded regardless of portfolio size. We cap the portfolio context at roughly 4,000 tokens so that the user message, system prompt, and optional attachment fit comfortably.

## From 10,000 trades to one paragraph

Suppose the user has 10,000 trades across 200 tickers. The context builder first aggregates: it computes positions (net shares per ticker, cost basis, current value). That reduces 10,000 rows to 200 positions. It then sorts by current value and takes the top 10. It also sums totals. The output is a string of roughly 20 lines. So 10,000 trades become a few hundred words. The model receives only that. It cannot answer "what did you buy on March 15, 2022?" because that row-level detail was never sent. That is the token funnel in practice.

---

*Part 3 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
