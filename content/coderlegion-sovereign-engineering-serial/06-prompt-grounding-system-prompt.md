---
title: "Part 6: Prompt Grounding — CFA-Grade Reasoning in a Stateless API"
date: "2026-05-15"
tags: ["engineering", "ai", "finance", "prompting", "gemini", "vercel-ai"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-06.png"
series: "Sovereign Engineering"
---

# Prompt Grounding in a Stateless World

When we say **“CFA-grade”** in product language, we mean **three engineering layers**: **domain-scoped system text**, **client portfolio summary**, and **server-injected live quotes**—plus an optional **attachment** lane for paid users.

---

## Layer 1 — `SYSTEM_PROMPT` (persona + guardrails)

In `app/api/ai/chat/route.ts`, `SYSTEM_PROMPT` constrains the assistant to **finance**, tells it to use **portfolio context** when present, to use **“Current quote data”** when injected, and to treat **“File the user included”** as authoritative for that turn. It also nudges **1–3** markdown citations to reputable sources when helpful.

This is how we **steer** the model without storing conversation state server-side.

---

## Layer 2 — Portfolio context block

The handler builds:

```typescript
const contextBlock = context
  ? `\n\nPortfolio context:\n${context}`
  : '\n\n(No portfolio context provided.)';
```

`context` is the **entire** output of `buildPortfolioContext` (Part 2–3). So grounding for holdings is **exactly** what the client compiled — not a server-side join against a `portfolios` table.

---

## Layer 3 — Live quote injection (`extractSymbolHints`)

The route parses the **user message** for tickers and known names (`NAME_TO_TICKER`), caps symbols, calls internal `/api/quote`, and appends a **quote block** into the system string. That gives **price truth** without the user pasting screenshots.

---

## Layer 4 — Attachments (paid)

```typescript
const attachedBlock = attachedContent
  ? `\n\nFile the user included (use this):\n${attachedContent}`
  : '';
const systemPrompt = SYSTEM_PROMPT + contextBlock + quoteBlock + attachedBlock;
```

`MAX_ATTACHED_CONTENT_LENGTH = 60_000` on the server caps abuse. **Different privacy contract** than default top-N context.

---

## Provider routing

Comments in `route.ts`: **Gemini** preferred when `GOOGLE_GENERATIVE_AI_API_KEY` is set (`gemini-1.5-flash` free tier, `gemini-1.5-pro` paid); **OpenAI** fallback when configured or when Gemini errors.

---

## Why 10k CSV rows never hit the model (default path)

**Compaction happens client-side** before the request. The model sees **tens of lines**, not **tens of thousands**.

---

*Part 6 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**
