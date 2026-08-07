---
id: OP-CMD-SOVEREIGN-SOFT-LAUNCH-CAPACITY-2026-08-07
title: Soft-launch Sovereign capacity — multi-user + scale-to-zero
status: LIVE · SCALE_TO_ZERO
date: 2026-08-07
rev: 2
endpoint: sci7vw5ovb0xnd (op-sovereign-r1)
---

# Soft-launch capacity (CEO lock)

## Mandate

**Idle GPU ≈ $0 always** (`workersMin: 0`). Launch copy says scale-to-zero — keep that promise.  
**Do not waste user time:** short wake budget → **Cloud Auto safety net**. Capacity for concurrency when *on*, not always-on warm standby.

## Live RunPod posture (rev 2)

| Setting | Value | Why |
|---------|-------|-----|
| `workersMin` | **0** | Scale to zero — matches GTM / PAYG |
| `workersMax` | **5** | Multi-user when scaled; no single-GPU queue stampede |
| `idleTimeout` | **600** | Stay warm briefly after last ask, then scale toward 0 |
| App wake budget | **25s** | Then Cloud Auto — never strand users for ~3 min |

Script: `node scripts/ops-soft-launch-sovereign-capacity.mjs` (min=0, max=5).

## Rejected

- Soft-launch `workersMin: 1` (~$27/day always-on) — conflicts with marketing + CEO cost gate.
