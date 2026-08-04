---
id: OP-CMD-SOVEREIGN-COLDSTART-CONTRACT-2026-08-04
title: Sovereign latency contract — idle $0 vs cloud-speed
status: NETWORK_VOLUME_ATTACHED · WORKERS_MIN_0 · FLASHBOOT_ON
date: 2026-08-04
---

# Sovereign latency contract

## Product rule (CEO)

Customers must **not** wait ~5 minutes. Sovereign **warm** answers must feel like Cloud Auto. Cost savings come from **idle scale-to-zero**, not from making users absorb cold-start downloads.

## Physics (honest)

| State | Target | How |
|-------|--------|-----|
| **Warm** (worker up) | ~1–3s TTFT | Proven on R1 endpoint |
| **Idle** | **$0 GPU** | `workersMin=0` |
| **Cold → warm** | Must not re-download 14GB from HF | **Network volume cache** + FlashBoot |

A 7B vLLM worker that re-pulls Hugging Face weights every scale-up **cannot** meet cloud UX inside Vercel’s 300s budget. That path is rejected.

## Infra lock (2026-08-04)

| Item | Value |
|------|--------|
| Endpoint | `sci7vw5ovb0xnd` (`op-sovereign-r1`) |
| Network volume | `jo6psx23dn` (`op-sov-r1-cache`, 50GB, `EU-RO-1`) |
| Cache env | `HF_HOME=/runpod-volume/huggingface` (+ hub/transformers) |
| `workersMin` | **0** (idle free) |
| `workersMax` | **1** |
| `idleTimeout` | 120s (stay warm briefly after use) |
| `flashboot` | true |
| Served model id | `deepseek-r1:7b-qwen-distill-q4_K_M` |

First request after attaching the volume still populates the cache once. Later cold starts load from the volume (no HF re-download).

## What we will **not** claim

- “Cold start is always as fast as Gemini Flash” while `workersMin=0` and no FlashBoot host hit.
- “Localhost / laptop” for default Sovereign.

## Soft-launch ops

1. Seed volume once (one successful completion).
2. Confirm second cold start ≪ first (no multi-minute HF download in logs).
3. If cold path still > ~30–45s after volume warm, escalate: smaller quant **or** temporary `workersMin=1` for Tier-1 demos only — never accept 5‑minute UX.

## App contract (shipped)

| Path | Behavior |
|------|----------|
| Sovereign selected + node **warm** (`GET /models` ≤3s) | Complete on-node (≤60s); `X-Pocket-Inference: ollama_*` |
| Sovereign selected + node **cold**/error | **Immediate Cloud Auto** (Gemini→OpenAI); `X-Pocket-Inference: cloud_auto_fallback` |
| Idle GPU | `workersMin=0` — **$0**; customers never wait for wake |

Vercel `maxDuration` for `/api/ai/chat` is **90s** (warm path), not 300s cold waits.
