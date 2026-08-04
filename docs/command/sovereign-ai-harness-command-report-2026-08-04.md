---
id: OP-CMD-REPORT-SOVEREIGN-AI-HARNESS-2026-08-04
title: Command Team Report — Sovereign AI Adversarial Harness (Ask AI)
status: PROD_PATH_LOCKED · AUG10_LAUNCH
date: 2026-08-04
owners: [CEO, Head of AI, CPO, Head of Product Engineering, CCO, Head of Marketing, Legal]
architecture_ssot: docs/architecture/sovereign-ai-harness-plan-2026-08-04.md
governance_ssot: docs/command/claims-vs-codebase-calibration.md
---

# Command Team Report — Sovereign AI Adversarial Harness

**Verdict.** Ask AI routes the **same edge-built bounded portfolio context** to Cloud Auto (Gemini → OpenAI) or **OP-hosted sovereign inference** (Llama 3.1 8B / DeepSeek-R1 7B via `OLLAMA_BASE_URL`). This is the **Aug 10 prod launch path** — not a laptop-only demo.

**Alignment.** CMD 1 + CMD 2 executed; prod pivot: Sovereign modes go through `/api/ai/chat` so every authenticated user can use them without installing Ollama.

---

## 1. What shipped (in-tree)

| Layer | Delivery |
|-------|----------|
| Architecture SSOT | `docs/architecture/sovereign-ai-harness-plan-2026-08-04.md` |
| Eng ticket queue | `docs/architecture/sovereign-ai-harness-eng-tickets-2026-08-11.md` |
| Benchmark + demo script | `docs/architecture/sovereign-ai-harness-benchmark-and-demo-2026-08-14.md` |
| Claims cross-link | `docs/command/claims-vs-codebase-calibration.md` §6b |
| Provider module | `app/lib/ai/providers/*` |
| Ask AI UI | `AskAIModal` — **Sovereign** dropdown |
| Chat route | `/api/ai/chat` streams `ollama_*` when `OLLAMA_BASE_URL` is set |
| Tests | Hosted ollama stream + 503 without node; providers helpers |
| Optional BYO | `NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT=true` → browser → laptop Ollama |

**UI labels:**

- Cloud Auto (Gemini / OpenAI) · Default  
- Llama 3.1 8B (Sovereign) · Hosted  
- DeepSeek-R1 7B (Sovereign) · Hosted  

---

## 2. Architecture (Aug 10 prod)

```text
Ask AI badge
  ├─ Cloud Auto  → POST /api/ai/chat → Gemini / OpenAI (auth + quota)
  └─ Sovereign   → POST /api/ai/chat → OLLAMA_BASE_URL (auth + quota; ≤6k context)
```

**Why hosted for prod:** End users will not run Ollama. Vercel reaches OP’s private OpenAI-compat node via server env `OLLAMA_BASE_URL`.

---

## 3. Command Q&A (prod / context)

### Q1 — Do prod users need local models on their machines?

**No.** Default Cloud Auto. Sovereign modes use **OP-hosted** inference. Set on Vercel before Aug 10:

- `NEXT_PUBLIC_ENABLE_LOCAL_AI=true`
- `OLLAMA_BASE_URL=https://…/v1`
- `OLLAMA_DEFAULT_MODEL` / `OLLAMA_REASONING_MODEL` (optional overrides)

### Q2 — Does Sovereign get the same context?

**Same bounded summary — stricter.** `buildPortfolioContext()` truncated to ≤6k; no attachments Phase 1; no live quote injection. Payload is ephemeral to the LLM prompt (same inference-boundary posture as cloud).

### Q3 — BYO laptop Ollama?

**Optional only** (`NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT=true`). Not required for launch. Do not market as the default prod path.

---

## 4. Claim calibration (Legal / Marketing)

| Allowed | Forbidden |
|---------|-----------|
| Model-agnostic routing of **bounded** context | In-browser WASM LLM (unshipped) |
| OP-hosted sovereign node (not third-party Gemini/OpenAI for that mode) | “Zero bytes leave the device” on hosted Sovereign or Cloud Auto |
| Adversarial harness sovereign vs cloud | “8B matches GPT-4” / air-gapped browser for all users |

---

## 5. GTM / Tier-1 use

Demo: Cloud query → flip Llama 3.1 Sovereign → *“Same edge assembly; inference on our sovereign node — not a consumer cloud LLM API.”*

Full script: `docs/architecture/sovereign-ai-harness-benchmark-and-demo-2026-08-14.md`.

---

## 6. Org-role actions (pre–Aug 10)

| Role | Action |
|------|--------|
| **CEO / Eng** | Provision sovereign node; set Vercel envs; smoke Cloud + both Sovereign modes on prod/staging |
| **Head of AI** | Run B1–B5 against hosted node; log under `docs/architecture/_harness-runs/` |
| **CPO / Eng** | Confirm Cloud Auto regression-free; quota still applies on Sovereign |
| **CCO** | Use hosted-sovereign language (not “runs on your laptop”) for Aug 10 pitches |
| **Marketing** | No WASM / air-gap / “device-local for everyone” claims |
| **Legal** | Sign off §6b claims before public Sovereign messaging |

---

## 7. References

- Architecture: `docs/architecture/sovereign-ai-harness-plan-2026-08-04.md`
- Claims: `docs/command/claims-vs-codebase-calibration.md` §6b
- Env template: `env.example` (Sovereign AI section)
