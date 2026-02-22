---
title: "Part 2: Architecting a Local-First Hybrid RAG - Sovereign Intelligence"
date: "2026-03-04"
tags: ["engineering", "ai", "local-first", "nextjs", "gemini", "rag"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-02-header.png"
series: "Building Sovereign Intelligence"
---

# Architecting a Local-First Hybrid RAG for Finance

![Figure 2 — Hybrid Architecture. Browser → API → Gemini + Search; sanitized context and streaming response only.](./images/si-figure-02-hybrid-architecture.svg)

**Server:** Next.js App Router, Vercel AI SDK (`streamText`, `useChat`), Gemini 1.5 Flash (default) and optional Pro for paid tiers. The API route `/api/ai/chat` is the gatekeeper: it receives sanitized context, user message, and optional attached content; enforces quotas; calls the model; streams the response. **Client:** React, Redux (or equivalent) for app state, IndexedDB for persistence. The context builder runs in the browser and passes its output in the request body. No server-side session store for portfolio data; each request is self-contained.

**Why this split.** The browser is the only place that has access to the user's full data without copying it to the cloud. The server is the only place that can call the LLM and (optionally) Google Search grounding at scale. So we split: **memory** (what the user owns, what they've said this session) in the browser; **reasoning** (token generation, search) on the server. The API is stateless and does not persist portfolio or conversation history.

## The flow

1. **Client:** User has trades/positions in state. Context builder runs `buildPortfolioContext(trades, positions)` → string. User types a message (and optionally attaches a file). Client sends `POST /api/ai/chat` with `{ message, portfolioContext?, attachedContent? }`.
2. **Server:** Validates body; checks tier and quota (e.g. Firestore); selects model (Flash vs Pro); builds system prompt (role, scope, guardrails); appends portfolio context and optional attachment to the prompt; calls Gemini (with or without search grounding); streams tokens back.
3. **Client:** Vercel AI SDK consumes the stream; updates message list; renders Markdown. No server storage of the conversation; the client holds the message list in component state.

So: **Client-side summarization → Stateless API route → LLM (with optional grounding) → Streaming response back to client.**

## Split Brain: memory vs. reasoning

**Split Brain** is the key concept. The "memory" lives in the browser: the full trade list, positions, and the conversation history for this session. The "reasoning" lives on the server: the LLM call, token generation, and optional search grounding. The API is a pure function: `(sanitizedContext, userMessage, optionalFileContent) → stream`. It does not read from a database of user data; it does not store the context after the request.

This avoids the worst of both worlds: we do not send raw data to the cloud (privacy), and we do not run the LLM in the browser (performance, cost, capability). We get the best of both: local data sovereignty and cloud-scale reasoning.

## Why we do not use server-side RAG or vector store for portfolio

Traditional RAG indexes documents on a server and retrieves relevant chunks at query time. We deliberately do not do that for portfolio data: it would require uploading and storing the user's data on our infrastructure, which violates the sovereign-data principle. Our "RAG" is client-side: the client holds the corpus (trades, positions), reduces it to a summary (context builder), and sends only that summary. There is no server-side index of the user's portfolio. The only thing that looks like "retrieval" is Gemini's optional search grounding for market data—and that retrieves public web data, not the user's private data. **Move AI to the data, not data to the AI.**

## Request shape

The client sends a JSON body: `{ message: string, portfolioContext?: string, attachedContent?: string }`. The `message` is required; the other two are optional. The server responds with a streaming body so the client can render tokens as they arrive. If quota is exceeded, the server returns 429; the client shows the quota-exceeded modal.

## Implementation notes

- **Context builder:** `app/lib/ai/contextBuilder.ts` — `buildPortfolioContext(trades, positions?)` returns a string. Called in the client before each send.
- **Chat API:** `app/api/ai/chat/route.ts` — POST handler; reads `message`, `portfolioContext`, `attachedContent`; enforces quota; calls Gemini; streams.
- **Usage and quotas:** `app/api/ai/usage/route.ts` and Firestore for tier and remaining questions.

---

*Part 2 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
