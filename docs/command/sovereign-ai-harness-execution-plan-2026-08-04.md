---
id: OP-CMD-REPORT-SOVEREIGN-AI-HARNESS-EXECUTION-2026-08-04
title: Command Team Report — Sovereign AI Adversarial Harness (Execution Plan)
status: PAYG_LOCKED · QUOTA_10 · PHASE_F_SHIPPED_MAIN · SOFT_LAUNCH
date: 2026-08-04
owners: [CEO, Head of AI, CPO, Head of Product Engineering, CCO, Head of Marketing, Legal]
architecture_ssot: docs/architecture/sovereign-ai-harness-plan-2026-08-04.md
payg_ssot: docs/command/sovereign-payg-mandate-lock-2026-08-04.md
governance_ssot: docs/command/claims-vs-codebase-calibration.md
---

# Command Team Report — Sovereign AI Adversarial Harness (Execution Plan)

**Verdict.** Ask AI can route the same edge-built bounded portfolio context to **Cloud Auto** (Gemini → OpenAI) or **OP-hosted Sovereign** inference on RunPod Serverless (**PAYG scale-to-zero**). Customers **never** download models. Free-tier Pocket Analyst quota is now **10 questions / rolling 30 days** (was 20).

**CEO mandate locked:** pay only for GPU time used — no always-on pods.

---

## 1. Execution plan (status)

| Phase | Work | Status |
|-------|------|--------|
| **A — Contract** | Provider modes, truncation ≤6k, claims calibration | **Done** (in-tree) |
| **B — Hosted path** | `/api/ai/chat` accepts `ollama_*` → `OLLAMA_*_BASE_URL` | **Done** (in-tree; needs release) |
| **C — PAYG infra** | RunPod Serverless `workersMin=0`, terminate pods | **Done** (live) |
| **D — Vercel envs** | `NEXT_PUBLIC_ENABLE_LOCAL_AI`, base URLs, `OLLAMA_API_KEY` | **Done** (Production) |
| **E — Quota** | Free tier **20 → 10** | **Done** (in-tree; needs release) |
| **F — App release** | Commit + push + prod deploy of harness + quota | **Done** (`cdcaf5d0` on `main` · prod Ready · soft launch) |
| **G — Dual distinct weights** | Separate Instruct vs R1 HF models | **Phase-1 deferred** — both UI modes hit proven R1 endpoint |
| **H — GTM** | Tier-1 live-toggle demo once F green | **Queued** |

### Immediate next actions

1. **Eng / CEO:** Authorise **commit + push** of Sovereign harness + free-tier=10, then prod redeploy.  
2. **Head of AI:** Smoke Cloud Auto + Sovereign on prod after deploy (expect cold start ≤ few minutes after idle).  
3. **CCO / Marketing:** Use “OP-hosted sovereign / PAYG” language — **not** “runs on the customer’s laptop.”  
4. **Legal:** §6b claims — hosted Sovereign is not “zero bytes leave the device.”

---

## 2. Architecture (prod)

```text
Ask AI
  ├─ Cloud Auto     → POST /api/ai/chat → Gemini 1.5 Flash|Pro → OpenAI gpt-4o-mini|gpt-4o
  └─ Sovereign *    → POST /api/ai/chat → RunPod Serverless OpenAI-compat
                      workersMin=0 · idleTimeout=5 · per-second billing
```

**Customer path:** browser → Pocket API (auth + quota) → inference.  
**Not customer path:** installing Ollama / downloading GGUFs (optional BYO only if `NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT=true` — **off for launch**).

---

## 3. Inference model inventory (Pocket Portfolio)

### 3.1 Ask AI / Pocket Analyst (user-facing)

| UI mode | Backend model(s) | Who can use | Needs local install? |
|---------|------------------|-------------|----------------------|
| **Cloud Auto** (default) | Free: `gemini-1.5-flash` then `gpt-4o-mini`; Paid: `gemini-1.5-pro` then `gpt-4o` | All signed-in users (quota on free) | **No** |
| **Sovereign Instruct** | Hosted `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` (served id `deepseek-r1:7b-qwen-distill-q4_K_M`) via RunPod | All signed-in once UI flag live on prod | **No** |
| **Sovereign Reasoning (DeepSeek-R1)** | Same RunPod endpoint / same weights (Phase-1) | Same | **No** |

**Quota:** Free tier **10** questions / 30-day window applies to **all** Ask AI modes (cloud + sovereign). Paid = unlimited.

### 3.2 Other product AI (not Ask AI badge)

| Surface | Model | Customer-facing? |
|---------|--------|------------------|
| CSV map (`/api/ai/map-csv`) | Gemini 1.5 Flash → OpenAI `gpt-4o-mini` | Yes (import assist) |
| Optional BYO laptop Ollama | Whatever tags match env (`llama3.1:8b…`, `deepseek-r1:7b…`) | **No for launch** — flag off |

### 3.3 Can customers use “any” cloud and local model?

| Claim | Truth |
|-------|--------|
| Any **cloud** model in the Ask AI dropdown | **Yes for Cloud Auto** (auto chain). **Not** arbitrary third-party clouds from the UI. |
| Any **Sovereign** mode without installing software | **Yes** — OP-hosted PAYG node. |
| Any **local** model on their machine | **No for launch.** BYO Ollama is opt-in eng flag only. Customers do **not** need (and are not asked) to download models. |
| Distinct Instruct vs R1 weights | **Not yet** — Phase-1 both modes share the proven DeepSeek-R1 distill endpoint. True adversarial dual-weight is Phase-2 (`HF_TOKEN` / second endpoint). |

---

## 4. Org-role actions

| Role | Action |
|------|--------|
| **CEO** | Approve app release (commit/push); keep RunPod wallet funded for PAYG |
| **Head of AI** | Post-deploy smoke; log harness run; plan Phase-2 second weight |
| **CPO / Eng** | Ship free-tier=10 + Sovereign UI; confirm Cloud Auto regression-free |
| **CCO** | Demo: Cloud ↔ Sovereign toggle; noun = hosted PAYG, not laptop |
| **Marketing** | No WASM / air-gap / “download our models” |
| **Legal** | Sign §6b before public Sovereign messaging |

---

## 5. References

- Architecture: `docs/architecture/sovereign-ai-harness-plan-2026-08-04.md`  
- PAYG lock: `docs/command/sovereign-payg-mandate-lock-2026-08-04.md`  
- Claims: `docs/command/claims-vs-codebase-calibration.md` §6b  
- Ops: `scripts/ops-deploy-runpod-serverless-sovereign.mjs`, `scripts/ops-smoke-sovereign-payg.mjs`
