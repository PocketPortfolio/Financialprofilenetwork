---
title: "Part 4: AI Grounding - Sovereign Intelligence"
date: "2026-03-11"
tags: ["engineering", "ai", "gemini", "grounding", "finance", "market-data"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-04-header.png"
series: "Building Sovereign Intelligence"
---

# AI Grounding: Connecting local data to live stock prices using Gemini 1.5

Users ask "What's the current price of AAPL?" or "Any news on TSLA?" The model must not guess; it must use **live, authoritative data**. **Gemini's native grounding** (e.g. Google Search) lets the model pull public, live data when the user asks about the market. We enable grounding so that "My Portfolio" (local context) and "The Market" (search) are both available in one place.

![Figure 4 — Grounding Flow. User question → Needs live data? → Yes: Gemini + Search; No: context only → Response streamed back.](./images/si-figure-04-grounding-flow.svg)

## Dual source of truth

**"My Portfolio"** = local context from the context builder. Totals, top holdings, performance—all from the sanitized snapshot. **"The Market"** = grounded search. Current prices, headlines, earnings dates—from Gemini's search retrieval. The system prompt instructs the model to use both and to cite which source it's using (e.g. "Based on your portfolio context, your largest holding is AAPL. According to current market data, AAPL is trading at …").

## When to ground vs. context-only

**Context-only:** "What's my biggest holding?" "How is my portfolio allocated?" Answerable from the sanitized snapshot; no search; lower latency. **Grounding:** "What's the current price of AAPL?" "Latest news on TSLA?" The model needs live data; we enable search grounding for the request. Search grounding adds latency (retrieval + model processing). For portfolio-only questions we do not need it; for "What's AAPL trading at?" we do.

## Example: combining portfolio and market

User asks "How is my AAPL position doing compared to the current price?" The context says "AAPL: 45 shares, USD 8325 (17.3%), P/L 12.1%." The model may use grounding to fetch the current AAPL price, then explain the comparison. One question uses both sources: portfolio (local) and market (grounded). The system prompt instructs the model to cite "your portfolio context" vs "current market data" when it matters.

## Limitations

Grounding is not a substitute for a full market data pipeline. It is best for public, searchable facts: prices, headlines, earnings dates. For institutional-grade real-time data, the product would need a dedicated data provider. For most retail users, grounding is sufficient for "what's AAPL at?" and "any news on TSLA?"

---

*Part 4 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
