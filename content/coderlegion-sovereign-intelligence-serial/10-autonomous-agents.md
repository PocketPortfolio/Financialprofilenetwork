---
title: "Part 10: The Roadmap - Sovereign Intelligence"
date: "2026-04-01"
tags: ["engineering", "ai", "agents", "safety", "finance", "roadmap"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-10-header.png"
series: "Building Sovereign Intelligence"
---

# The Roadmap: Moving from AI Chatbots to Autonomous Financial Agents

Today: user asks, model answers. Tomorrow: user asks, model **proposes an action** (e.g. "Add AAPL to watchlist") and the user confirms. The roadmap: **confirmation UI**, **audit log**, **no autonomous execution** without explicit user approval. The agent loop: User → Model (with tools) → Tool call → **Confirmation step** → Execute or Cancel. Human in the loop always for financial actions.

![Figure 10 — Agent Loop. User → Model → Tool call → Confirmation (human in the loop) → Execute or Cancel; no auto-execution.](./images/si-figure-10-agent-loop.svg)

## Safety

Guardrails for "action" mode: only certain verbs (e.g. add to watchlist, export); no direct broker orders without extra auth and confirmation. The model can suggest; the user must confirm. No automatic execution of financial actions.

## Safe actions first: watchlist and export

The first "actions" we might support are low-risk: "Add AAPL to my watchlist" or "Export this summary." The model would emit a structured intent (e.g. `{ action: "add_to_watchlist", ticker: "AAPL" }`); the client would show a confirmation ("Add AAPL to watchlist?") and on confirm would call the existing watchlist API. No broker connection, no money movement. That validates the agent loop (model → proposed action → user confirms → client executes) before we consider any trade-related actions.

## Tool schema and confirmation UI

If the model emits tool calls, we need a schema: action name, parameters, and a human-readable description for the confirmation dialog. The client parses the tool call, shows a confirmation, and on confirm calls the corresponding logic. The model should not be able to call arbitrary tools; we allow only a whitelist. That prevents prompt injection from triggering unintended actions. When the model returns a tool call, the client must not execute it immediately. It should render a confirmation UI. Only on Confirm does the client execute. The server is stateless and never performs user actions.

## Broker orders: not in v1

Executing real trades would require broker integration, regulatory compliance, and likely a separate "trading" product. We do not plan to support broker orders in the first version. The roadmap is: (1) watchlist and export, (2) perhaps client-side alerts, (3) only much later, if at all, any broker-linked action with full compliance and confirmation flows.

---

*Part 10 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
