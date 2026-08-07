---
id: OP-CMD-SOVEREIGN-SOFT-LAUNCH-CAPACITY-2026-08-07
title: Soft-launch Sovereign capacity — multi-user fix
status: LIVE
date: 2026-08-07
endpoint: sci7vw5ovb0xnd (op-sovereign-r1)
---

# Soft-launch capacity fix (CEO)

## Why leadership’s 180s budget was wrong for brand UX

`SOVEREIGN_WAKE_BUDGET_MS = 180s` was a **safety ceiling** for a single cold PAYG boot under `workersMax: 1` — not an accepted wait for 100 concurrent users. With one worker, N Sovereign asks **serialize**; each client burns the wake budget in a queue. That is a capacity bug, not a product feature.

**Accepted product rule (unchanged):** customers must not wait ~minutes. Warm Sovereign ≈ cloud. Idle cost savings ≠ user-facing cold-start theatre.

## Live RunPod posture (2026-08-07)

| Setting | Was (mandate lock) | Soft launch now |
|---------|-------------------|-----------------|
| `workersMin` | 0 | **1** (one warm worker — first ask should not cold-boot) |
| `workersMax` | 1 | **5** (concurrent Sovereign without single-GPU stampede) |
| `idleTimeout` | 600 | **600** |
| App wake budget | 180s | **25s** then **Cloud Auto safety net** |

Script: `node scripts/ops-soft-launch-sovereign-capacity.mjs`

## Post soft-launch

Revert `workersMin → 0` when traffic is quiet **only if** volume-cached cold is proven &lt; ~15s. Keep `workersMax ≥ 3` for multi-user. Do not restore `workersMax: 1`.
