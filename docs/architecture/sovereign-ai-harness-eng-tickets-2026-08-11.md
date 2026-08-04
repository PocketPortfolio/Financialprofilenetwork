---
id: OP-ENG-TICKETS-SOVEREIGN-AI-HARNESS-2026-08-11
title: Sovereign AI Harness — Engineering Ticket Queue
unlock: 2026-08-11
status: QUEUED · IMPLEMENTATION_LANDED_IN_TREE
last_updated: 2026-08-04
---

# Engineering tickets — Sovereign AI Harness

Implement against [`sovereign-ai-harness-plan-2026-08-04.md`](sovereign-ai-harness-plan-2026-08-04.md). Do not break Cloud Auto auth/quota.

**Note (2026-08-04):** Core T1–T6 landed in-tree under CEO “execute end-to-end” direction. Tickets below remain the AC checklist for QA / PR review.

## T1 — Provider types + truncation

**Files:** `app/lib/ai/providers/types.ts`, `truncateContext.ts`  
**AC:**

- [ ] `AskAiProviderMode` + model ID constants exported
- [ ] `truncatePortfolioContextForLocal(ctx, maxChars=6000)` hard-caps with ellipsis marker
- [ ] Unit tests for truncation and mode→model map

## T2 — Ollama client adapter

**Files:** `app/lib/ai/providers/ollama.ts`  
**AC:**

- [ ] `checkOllamaHealth(baseUrl)` → boolean
- [ ] `streamOllamaChat({ baseUrl, model, system, user })` → `AsyncIterable<string>` or ReadableStream of text deltas
- [ ] Uses OpenAI-compat `/chat/completions` with `stream: true`
- [ ] Clear error when node unreachable / CORS

## T3 — Ask AI model badge + Local branch

**Files:** `app/components/ai/AskAIModal.tsx`  
**AC:**

- [ ] Badge dropdown when `NEXT_PUBLIC_ENABLE_LOCAL_AI=true`
- [ ] Modes: Cloud Auto / Sovereign Local / Sovereign Reasoning
- [ ] Amber indicator for Local modes
- [ ] Local path: health check → truncate context → stream from Ollama (no `/api/ai/chat` body with portfolio for Local)
- [ ] Attachments disabled or ignored in Local mode (Phase 1)
- [ ] Offline copy: *Local Ollama node offline — revert to Cloud*

## T4 — Cloud route hygiene

**Files:** `app/api/ai/chat/route.ts`  
**AC:**

- [ ] Accept optional `provider: 'cloud_auto'` (no behaviour change)
- [ ] If `provider` is an ollama_* value, return **400** with guidance to use client Local path (prevent accidental server→localhost on Vercel)
- [ ] Existing Gemini→OpenAI + quota/auth unchanged for cloud

## T5 — Env + docs

**Files:** `env.example`, README note if needed  
**AC:**

- [ ] Document `NEXT_PUBLIC_ENABLE_LOCAL_AI`, `NEXT_PUBLIC_OLLAMA_*`
- [ ] Note `OLLAMA_ORIGINS` for browser CORS

## T6 — Inference boundary tests

**Files:** `tests/unit/ai/providers-*.spec.ts`, extend `chat-inference-boundary` as needed  
**AC:**

- [ ] Local truncation never expands payload
- [ ] Mode mapping locked to verified model IDs
- [ ] Document that Local client path must not POST portfolio context to cloud

## Dependency order

`T1 → T2 → T3` parallelisable with `T4` + `T5`; `T6` after T1–T3.
