---
id: POCKET-SOTA-PARITY-QA-GATE-2026-05-25
title: Pocket B2C SOTA Parity — QA Gate
status: OPERATIONAL
parent: docs/seed/pocket-portfolio-web-sota-brief.md
---

# Pocket B2C SOTA — QA gate

**Automated:** `npm run verify:pocket-web-sota`  
**Plate sync:** `npm run sync:pocket-web-plates` (runs before production build)

## Epic 4.1 — Manual sign-off

Review `https://www.pocketportfolio.app/` at **1440px** and **390px**.

| Check | Pass |
|-------|------|
| Product Portal — 3 glass plates, no flat yellow boxes | [ ] |
| Why Choose — obsidian band, amber metrics HUD | [ ] |
| Ad-Free — no teal banner, no emoji, amber lock invariant | [ ] |
| FIN Pillars — fiber pipeline plate + HUD, no text `→` arrows | [ ] |
| Community — node mesh plate, execution-terminal CTAs | [ ] |
| News Room — SOTA plates replace flat SVG wireframes | [ ] |
| Sovereign Storage copy does not claim zero-server for auth users | [ ] |
| Open landing unchanged on `www.openportfolio.co.uk` | [ ] |
| Plate cache tokens (`?v=`) load on hard refresh | [ ] |

**Sign-off:** _________________ **Date:** _________

## Pre-merge commands

```bash
npm run sync:pocket-web-plates
npm run verify:pocket-web-sota
npm run lint && npm run typecheck && npm run build
```
