---
id: OP-CMD-SOVEREIGN-NODE-LAUNCH-2026-08-04
title: Sovereign inference node — hosting pick + same-day launch runbook
status: PAYG_LOCKED · PROD_FINAL_LAP
date: 2026-08-04
mandate_ssot: docs/command/sovereign-payg-mandate-lock-2026-08-04.md
---

# Sovereign node — hosting + launch runbook

## Customer truth (post-launch)

**Customers do not download or run local models.**  
Ask AI Sovereign modes call Pocket’s `/api/ai/chat` → RunPod Serverless OpenAI-compat. Default remains Cloud Auto (Gemini/OpenAI). BYO laptop Ollama is off (`NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT` unset).

## Mandate (CEO) — PAYG only

**Pay only for what is used. Nothing more.**  
SSOT: [`sovereign-payg-mandate-lock-2026-08-04.md`](sovereign-payg-mandate-lock-2026-08-04.md)

| Allowed | Forbidden |
|---------|-----------|
| Serverless `workersMin: 0`, `workersMax: 1`, `idleTimeout: 5` | Always-on Pods for Ask AI Sovereign |
| Per-second GPU while serving | Idle GPU burn / Pinggy-as-prod |

## Live endpoints

| UI mode | Endpoint | ID |
|---------|----------|-----|
| Sovereign 7B Instruct | `op-sovereign-llama31` | `nx84z0pq9q5tz6` |
| DeepSeek-R1 7B | `op-sovereign-r1` | `sci7vw5ovb0xnd` |

```bash
node scripts/ops-deploy-runpod-serverless-sovereign.mjs --redeploy-vercel
node scripts/ops-smoke-sovereign-payg.mjs
```

Vercel: `OLLAMA_LLAMA_BASE_URL`, `OLLAMA_REASONING_BASE_URL`, `OLLAMA_API_KEY` (= RunPod key), `NEXT_PUBLIC_ENABLE_LOCAL_AI=true`.

## Cost

Idle GPU ≈ **\$0**. Active = GPU-hr × time workers are up (+ ≤5 min idle).  
~\$10 wallet lasts **weeks** at light launch traffic if no always-on pod; **~22 hours** if an A40 pod is left running (do not).

## Claims

Allowed: OP-hosted sovereign inference; bounded context; not Gemini/OpenAI for that mode.  
Forbidden: customers run on-device models; zero bytes leave device on hosted Sovereign.
