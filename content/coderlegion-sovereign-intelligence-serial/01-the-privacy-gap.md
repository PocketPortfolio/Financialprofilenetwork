---
title: "Part 1: The Privacy Gap - Sovereign Intelligence"
date: "2026-03-02"
tags: ["engineering", "ai", "local-first", "privacy", "rag", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-01-header.png"
series: "Building Sovereign Intelligence"
---

# The Privacy Gap: Why sending financial ledgers to OpenAI is broken

Financial data is the most sensitive data users own. Transaction histories, account balances, and position-level detail are the crown jewels of personal finance. Sending raw ledgers to generic chatbot APIs—OpenAI, Anthropic, or any third party that trains or logs prompts—is a non-starter for privacy-conscious users and for compliance. Yet users rightly expect AI that "knows" their portfolio: allocation, top holdings, performance, tax implications. The **data chasm** is the gap between what the AI needs to be useful and what the user is willing to send.

Generic chatbots fail in finance for three reasons. First, **trust**: users do not want their full trade history in a vendor's logs. Second, **accuracy**: the model must reason over *their* data—aggregates, tickers, dates—not generic advice. Third, **regulation**: data minimization and purpose limitation (e.g. GDPR) require that we do not send more than necessary. So we cannot simply paste the user's CSV into ChatGPT and ask "summarize my portfolio." We need an architecture that keeps the full dataset local and sends only what is strictly required for the model to answer.

## Why "raw ledgers" are dangerous

A single export can contain hundreds or thousands of rows: date, ticker, action, quantity, price, fees, account identifiers, broker names. That is PII and financial history. Storing or training on it creates retention, breach, and consent issues. Even "anonymized" aggregates can be re-identified when combined with other data. The only safe approach is to never send the raw ledger at all—and to send a **sanitized snapshot** that preserves signal (allocation, performance) but drops identifiers and row-level detail.

## Bring the compute to the data

**"Bring the Compute to the Data."** Keep the full dataset local—in the browser, in IndexedDB or Redux—and send only a **sanitized snapshot**: totals, top N holdings by value, trade count, unrealized P/L. No account numbers, no broker names, no row-level trades unless the user explicitly attaches a file for that session. The client runs a **context builder** that reduces 10,000+ trades into a short, signal-preserving summary (token-bounded, e.g. under 4,000 tokens). That string is the only portfolio data that ever hits the server. The server never stores it; each request is stateless.

This pattern inverts the usual "send everything to the cloud" model. The cloud does the heavy reasoning (LLM, optional search grounding); the client does the heavy data reduction. The API is a pure function: `(sanitizedContext, userMessage, optionalFileContent) → stream`.

## The Sanitized Snapshot pattern

The client (browser) holds the full state: trades, positions, totals. A function—`buildPortfolioContext(trades, positions)` in our implementation—produces a single block of text:

```text
Portfolio summary (for personalization only):
Total positions: 12
Total trades: 347
Total invested (USD equiv): 45230.50
Total current value (USD equiv): 48102.20
Total unrealized P/L: 2871.70 (6.3%)

Top holdings by current value:
  AAPL: 45.00 shares, USD 8325.00 (17.3%), P/L 12.1%
  MSFT: 22.00 shares, USD 7986.00 (16.6%), P/L 8.4%
  ...
```

The model sees only this. It does not see account numbers, broker names, or the 347 individual trades. **What never crosses the wire:** full trade list; account or broker identifiers; any column that could re-identify the user. **What does:** aggregates (totals, counts), top holdings (ticker, shares, value, percentage), and optionally—only when the user explicitly attaches a file—the parsed text of that file for that turn.

## The Data Chasm

![Figure 1 — The Data Chasm. Raw Ledger on device, Sanitized Context as bridge, LLM in cloud.](./images/si-figure-01-data-chasm.svg)

Three zones. **Left:** Raw Ledger (User's Device)—the full CSV or normalized trades in IndexedDB. **Right:** LLM (Cloud)—Gemini or another model. **Middle:** Sanitized Context (4K tokens max)—the only bridge. Full history never crosses; only the summary flows left to right; the streaming response flows right to left.

## What crosses the wire (summary table)

| Sent to server | Not sent |
| --- | --- |
| Portfolio summary (totals, top N holdings) | Full trade list |
| User message (this turn) | Account numbers, broker names |
| Optional: parsed attachment text (this turn only) | Conversation history (unless client resends) |

This table can be shared with compliance and users. It makes the data boundary explicit and auditable.

---

*Part 1 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
