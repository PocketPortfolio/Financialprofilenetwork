---
title: "Part 7: Building Tactile AI - Sovereign Intelligence"
date: "2026-03-23"
tags: ["engineering", "ai", "ux", "vercel-ai-sdk", "streaming", "react"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-07-header.png"
series: "Building Sovereign Intelligence"
---

# Building Tactile AI: Optimistic UI and the Vercel AI SDK

The feeling of "someone is typing"—streaming tokens, optimistic UI updates, clear loading states—makes the assistant feel responsive. We use **Vercel AI SDK** (`streamText`, `useChat`) for consistent streaming: tokens arrive as they're generated; the message appears incrementally. No "wait for full response" spinner. That is **tactile intelligence**: the UI reflects the live nature of the model's output.

![Figure 7 — React Component Tree. PocketAnalystProvider → AskAIFab + AskAIModal; modal contains header, message list, input, attachment.](./images/si-figure-07-component-tree.svg)

## UI stack

**Entry:** Floating Action Button (FAB) for "Ask AI." **Modal:** Glassmorphism-style; header with usage badge (e.g. "3/20 questions this month"); message list (scrollable); input area (text + attachment button); send. **Rendering:** Markdown for assistant messages (tables, bold, lists, links). **Accessibility:** keyboard, focus management, aria-labels.

## Vercel AI SDK: useChat and streamText

On the client we use `useChat` from the Vercel AI SDK. It manages the message list, the current input, the loading state, and the submission logic. We pass an API route (`/api/ai/chat`) and the body (message, portfolioContext, attachedContent). The hook handles the stream: it appends tokens to the assistant message as they arrive. On the server we use `streamText` to call Gemini and pipe the response to the client. We do not implement raw fetch + ReadableStream ourselves; we rely on the SDK for consistency and for features like stop generation and retry.

## Optimistic UI and message ordering

When the user sends a message, we optimistically append it to the message list so the UI updates immediately. We then append a placeholder for the assistant reply and stream into it. That avoids a "waiting" gap. The order of messages (user, assistant, user, assistant) is preserved. If the request fails, we keep the user message and show the error below it with a retry option.

## Component responsibilities

`PocketAnalystProvider` holds the modal open state and may fetch usage. `AskAIFab` toggles the modal. `AskAIModal` reads trades/positions from app state, calls `buildPortfolioContext` when the user sends a message, and passes the result in the request. It renders the message list, input, attachment control, and send button. It handles loading (typing indicator), error (message and retry), and quota exceeded (upgrade CTA). The modal does not persist messages to a backend; it keeps them in React state.

---

*Part 7 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**
