---
title: "Part 5: Prompt Guardrails - Sovereign Intelligence"
date: "2026-03-16"
tags: ["engineering", "ai", "prompts", "safety", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-05-header.png"
series: "Building Sovereign Intelligence"
---

# Prompt Guardrails: Forcing an LLM to only talk about finance

The **system prompt** defines who the assistant is and what it can do. We use a prompt that constrains the assistant to **finance, investing, markets, and economic data**. It states: "You are the Pocket Portfolio Financial Analyst." Scope: portfolio analysis, market data, economic context, and technology only in a financial context. It refuses off-topic requests (e.g. cooking, medical advice) with a polite redirect: "I'm here to help with your portfolio and the markets."

![Figure 5 — Prompt Engineering. System prompt sections: Role, Scope, Data usage, Output format, Refusal policy.](./images/si-figure-05-prompt-engineering.svg)

**Data usage:** The model is told that portfolio context (if provided) is a summary of the user's holdings and totals; it must not invent positions or numbers. Attached content (if any) is only for the current question. **Output format:** Markdown (tables, bold, lists), links to official sources (e.g. company IR, SEC). **Refusal policy:** No investment recommendations that could be construed as advice; no executing trades or accessing user accounts; suggest links and data, do not act.

## Red lines: what the model must never do

1. Never output the user's account number, broker name, or any identifier we did not send (the model does not have them).
2. Never recommend a specific buy or sell (we are not giving investment advice).
3. Never claim to have executed a trade or to have access to the user's broker.
4. Never pretend to have data we did not provide (e.g. if we did not send sector breakdown, the model should not invent one).
5. Never execute any action without explicit user confirmation when we add tool use.

## Example system prompt outline (for implementers)

(1) **Role:** "You are the Pocket Portfolio Financial Analyst." (2) **Scope:** "You help with portfolio analysis, market data, and investing concepts. You do not give personalized investment advice or execute trades." (3) **Data:** "You may receive a portfolio summary (totals and top holdings). Use it only to answer the user's question. You do not have account numbers or full trade history." (4) **Output:** "Use Markdown: tables, bold, lists. Link to official sources when relevant." (5) **Refusals:** "For off-topic questions, politely redirect: 'I'm here for portfolio and market questions.' For 'what's my account number?' say you don't have that data." (6) **Grounding:** "When the user asks for current prices or news, use search when available and cite 'current market data.' When answering from the portfolio summary, cite 'your portfolio summary.'"

---

*Part 5 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
