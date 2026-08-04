---
id: OP-ARCH-SOVEREIGN-AI-HARNESS-2026-08-04
title: Sovereign AI Adversarial Harness — Architecture SSOT
status: SPEC_LOCKED · AUG10_PROD_HOSTED_PATH
code_freeze_until: 2026-08-10
implementation_unlock: 2026-08-04
audience: [Engineering, Head of AI, CPO, CCO, Marketing, Legal]
governance_ssot: docs/command/claims-vs-codebase-calibration.md
last_updated: 2026-08-04
---

# Sovereign AI Adversarial Harness — Architecture SSOT

**Mandate.** Wire Ask AI so bounded portfolio context can route to **Cloud Auto** (Gemini → OpenAI) or **OP-hosted sovereign inference** (Ollama/vLLM OpenAI-compat via `OLLAMA_BASE_URL`), enabling adversarial cloud-vs-sovereign benchmarks and Aug 10 launch for all prod users (no laptop Ollama required).

**CMD alignment.** Command Team CMD 1 + CMD 2 are merged here. Phase 1 = Ollama OpenAI-compatible. WASM = Phase 2+ research only. **Prod path = server-hosted node**, not browser → user localhost.

---

## 1. Locked decisions

| Decision | Lock |
|----------|------|
| Phase 1 runtime | Ollama (or vLLM) OpenAI-compat `/v1` |
| Primary sovereign model | `llama3.1:8b-instruct-q4_K_M` |
| Adversarial sovereign model | `deepseek-r1:7b-qwen-distill-q4_K_M` |
| Secondary bench | `qwen2.5-coder:7b-instruct-q4_K_M` |
| Cloud default | Unchanged Gemini → OpenAI chain in `/api/ai/chat` |
| **Prod path (Aug 10)** | **Browser → `/api/ai/chat` (`provider: ollama_*`) → `OLLAMA_BASE_URL`** (auth + quota + truncate) |
| Optional BYO | `NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT=true` → browser → user laptop (dev/power-user only) |
| WASM / in-browser LLM | Forbidden in product + marketing until calibrated ship |
| UI default | Cloud Auto; Sovereign options behind `NEXT_PUBLIC_ENABLE_LOCAL_AI=true` on prod |

```text
[ Ask AI badge ]
      │
      ├─ cloud_auto ──► POST /api/ai/chat ──► Gemini / OpenAI
      │                    (auth + quota)
      │
      └─ ollama_* ────► POST /api/ai/chat ──► OLLAMA_BASE_URL/chat/completions
                         (auth + quota; ≤6k context; no attachments Phase 1)
```

---

## 2. Provider contract

### 2.1 Client selection state

```ts
export type AskAiProviderMode =
  | 'cloud_auto'           // production default
  | 'ollama_llama31'       // Sovereign Llama 3.1
  | 'ollama_deepseek_r1';  // Sovereign Reasoning (adversarial)

export type ChatBody = {
  message: string;
  context?: string;
  attachedContent?: string;
  provider?: 'cloud_auto' | 'ollama_llama31' | 'ollama_deepseek_r1';
};
```

### 2.2 Hosted sovereign inference (prod)

```ts
// Server: POST {OLLAMA_BASE_URL}/chat/completions
{
  model: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b-instruct-q4_K_M',
  stream: true,
  messages: [
    { role: 'system', content: LOCAL_ASK_AI_SYSTEM_PREAMBLE + truncatedContext },
    { role: 'user', content: message }
  ]
}
```

### 2.3 Truncation guardrails (sovereign)

| Guard | Value | Rationale |
|-------|--------|-----------|
| Max portfolio context chars | **6000** | Protect ~8GB VRAM Q4 hosts |
| Attachments in Local mode | **Disabled (Phase 1)** | Avoid context blow-ups |
| Live quotes injection | **Skipped on Local** | Quotes come from cloud `/api/quote` path; Local stays process-bound |
| Offline UX | Amber badge + copy: *Local Ollama node offline — revert to Cloud* | |

Helpers: `app/lib/ai/providers/truncateContext.ts`.

### 2.4 Health check

`GET http://localhost:11434/v1/models` (or `/api/tags`) before Local send. On failure, block send and prompt revert to Cloud Auto.

---

## 3. Ask AI UI wireframe

Surface: [`app/components/ai/AskAIModal.tsx`](../../app/components/ai/AskAIModal.tsx) header (right of title, left of usage/close).

```text
Pocket Analyst          [ Cloud Auto ▼ ]  [0/20]  [x]
                        ● amber when Local
Dropdown:
  • Cloud Auto (OpenAI / Gemini)     [Default]
  • Sovereign Local (Llama 3.1 8B)   [Experimental]
  • Sovereign Reasoning (DeepSeek-R1)[Adversarial]
```

- **Cloud Auto** indicator: muted / green-neutral (use existing muted styles — no fintech blue).
- **Local modes:** amber (`var(--accent-warm)` / `#f59e0b`) status dot + “Localhost”.
- Feature gate: `NEXT_PUBLIC_ENABLE_LOCAL_AI === 'true'`. If unset, badge hidden; behaviour = Cloud Auto only.

---

## 4. Module layout (post-freeze / implementation)

| Path | Role |
|------|------|
| `app/lib/ai/providers/types.ts` | Mode enums, model IDs, env defaults |
| `app/lib/ai/providers/truncateContext.ts` | Sovereign context hard-cap |
| `app/lib/ai/providers/ollama.ts` | Health + streaming + plain-text stream for `/api/ai/chat` |
| `app/components/ai/AskAIModal.tsx` | Badge; Sovereign modes POST `/api/ai/chat` |
| `app/api/ai/chat/route.ts` | `cloud_auto` + hosted `ollama_*` when `OLLAMA_BASE_URL` set |
| `tests/unit/ai/providers-*.spec.ts` | Truncation + mode→model mapping |
| `tests/unit/ai/chat-inference-boundary.spec.ts` | Hosted ollama stream + no payload persistence |

Env (see `env.example`) — **Aug 10 prod**:

```bash
NEXT_PUBLIC_ENABLE_LOCAL_AI=true
OLLAMA_BASE_URL=https://your-sovereign-node.example/v1
OLLAMA_DEFAULT_MODEL=llama3.1:8b-instruct-q4_K_M
OLLAMA_REASONING_MODEL=deepseek-r1:7b-qwen-distill-q4_K_M
# Optional BYO only:
# NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT=true
# NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434/v1
```

---

## 5. Governance & claim calibration

**SSOT ledger:** [`docs/command/claims-vs-codebase-calibration.md`](../command/claims-vs-codebase-calibration.md)

### Allowed

- Model-agnostic routing of **bounded** context to cloud APIs or an **OP-hosted sovereign inference node**.
- Sovereign path uses truncated portfolio summary (≤6k); attachments off Phase 1; raw ledger not written to Firestore.
- Internal adversarial harness benchmarks sovereign vs cloud on the same `buildPortfolioContext` payload.

### Forbidden

- In-browser WASM LLM inference (unshipped).
- “Zero bytes leave the device” in **Cloud Auto** mode (or while using hosted Sovereign — context still reaches OP’s node via `/api/ai/chat`).
- “Local models match GPT-4.”
- Claiming **user-laptop process-local** for all prod users unless BYO client-direct is enabled and documented.

---

## 6. Timeline

| Window | Work |
|--------|------|
| Through 2026-08-10 | **Launch gate:** Vercel `NEXT_PUBLIC_ENABLE_LOCAL_AI=true` + `OLLAMA_BASE_URL` pointing at live sovereign node; smoke Cloud + Llama + DeepSeek |
| 2026-08-10 | Prod launch — Sovereign modes available to authenticated users |
| Post-launch | Benchmarks + Tier-1 demo polish |

**Related:** [`sovereign-ai-harness-eng-tickets-2026-08-11.md`](sovereign-ai-harness-eng-tickets-2026-08-11.md) · [`sovereign-ai-harness-benchmark-and-demo-2026-08-14.md`](sovereign-ai-harness-benchmark-and-demo-2026-08-14.md)

---

## 7. Verified host inventory (2026-08-04)

| Asset | State |
|-------|--------|
| Ollama | 0.32.5 · port 11434 OK |
| `llama3.1:8b-instruct-q4_K_M` | Installed |
| `deepseek-r1:7b-qwen-distill-q4_K_M` | Installed |
| `qwen2.5-coder:7b-instruct-q4_K_M` | Installed |
| LM Studio | Not present |
