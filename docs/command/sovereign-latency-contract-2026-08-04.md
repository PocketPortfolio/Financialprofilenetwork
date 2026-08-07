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
| `idleTimeout` | 600s (stay warm briefly after use; still scales to $0) |
| `flashboot` | true |
| RunPod modelReferences | `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` (host cache) |
| Served model id | `deepseek-r1:7b-qwen-distill-q4_K_M` |
| HF cache env | `/runpod-volume/huggingface-cache` (+ hub/transformers) |

First request after attaching the volume still populates the cache once. Later cold starts load from the volume (no HF re-download).

## What we will **not** claim

- “Cold start is always as fast as Gemini Flash” while `workersMin=0` and no FlashBoot host hit.
- “Localhost / laptop” for default Sovereign.

## Soft-launch ops

1. ~~Seed volume once~~ — Warm seed **PASS** (2026-08-04); cold boot #2 still **FAIL** (~305s).  
2. Cold customer path = **Cloud Auto fallback** (shipped). Do not claim volume-cached cold for Aug 10.  
3. Post–Aug 10 escalate: bake weights / model cache product / smaller quant / managed backend — or temporary `workersMin=1` for booked demos only.

## App contract (shipped)

| Path | Behavior |
|------|----------|
| Sovereign selected | Speculative **wake-on-ask** (`POST /api/ai/sovereign/wake`) |
| Sovereign Send + node warming | Poll `/models` up to **~25s** soft-launch; then Cloud Auto |
| Wake budget exhausted / on-node error | Cloud Auto **safety net**; `X-Pocket-Inference: cloud_auto_fallback` |
| Soft-launch capacity (2026-08-07 rev 2) | `workersMin=0`, `workersMax=5`, `idleTimeout=600` — scale to zero; concurrency when on |
| Idle GPU | `workersMin=0` — **$0** when no workers |

Vercel wake route `maxDuration` is **45s**. Chat remains longer for on-node complete + cloud fallback.
