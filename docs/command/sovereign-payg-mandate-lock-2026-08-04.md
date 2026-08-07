---
id: OP-CMD-SOVEREIGN-PAYG-MANDATE-LOCK-2026-08-04
title: Sovereign inference — PAYG scale-to-zero mandate lock (prod)
status: LOCKED
date: 2026-08-04
---

# PAYG mandate lock (prod final lap)

## Mandate (CEO)

**Pay only for what is used. Nothing more.**

| Allowed | Forbidden |
|---------|-----------|
| RunPod **Serverless** soft-launch: `workersMin: 1`, `workersMax: 5`, `idleTimeout: 600` | Always-on **Pods**; `workersMax: 1` (serializes all users) |
| Per-second GPU while serving | Idle GPU burn / Pinggy-as-prod |
| Prepaid wallet | “Customers download local models” |

## Live topology (final)

**One** Serverless endpoint (proven healthy):

| | |
|--|--|
| Name | `op-sovereign-r1` |
| ID | `sci7vw5ovb0xnd` |
| URL | `https://api.runpod.ai/v2/sci7vw5ovb0xnd/openai/v1` |
| Model | `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` |
| Served id | `deepseek-r1:7b-qwen-distill-q4_K_M` |

Both Ask AI Sovereign UI modes (Instruct + Reasoning) route here for Phase-1 launch.  
Vercel: `OLLAMA_LLAMA_BASE_URL` = `OLLAMA_REASONING_BASE_URL` = above; `OLLAMA_API_KEY` = RunPod key.

**Pods:** none.  
**Customers:** never install Ollama.

## Cost

Idle ≈ **\$0**. Active = GPU time only.  
Do **not** recreate `op-sovereign-ollama` pods.

## Remaining for full product launch

1. **Commit + push** Ask AI Sovereign harness (code still local).  
2. Redeploy so `NEXT_PUBLIC_ENABLE_LOCAL_AI` + chat route path are live.  
3. Optional later: second Serverless endpoint with Meta-Llama (`HF_TOKEN`) for true dual-model adversarial UI.
