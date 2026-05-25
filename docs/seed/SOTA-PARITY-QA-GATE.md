---
id: OP-SOTA-PARITY-QA-GATE-2026-05-25
title: Operation SOTA Parity — QA Gate & Outbound Unlock
status: OPERATIONAL
parent: docs/seed/open-portfolio-web-sota-brief.md
---

# SOTA Parity — QA gate & outbound unlock

**Automated gate (CI/local):** `npm run verify:open-web-sota`  
**Plate sync:** `npm run sync:open-web-plates` (runs before production build)  
**Prod readiness report:** `docs/command/operation-sota-parity-prod-readiness-2026-05-25.md`

---

## Epic 4.1 — Cross-surface sign-off (30 min)

Open side-by-side:

1. [`Open_Portfolio_Seed_Teaser_2026.pdf`](Open_Portfolio_Seed_Teaser_2026.pdf)
2. Staging or production `https://www.openportfolio.co.uk/` at **1440px** and **390px**

| Check | Pass |
|-------|------|
| No flat shield / hexagon / briefing-room face on landing | [ ] |
| `threat` plate matches deck Slide 1 boundary tier | [ ] |
| `subHero` plate + moat HUD matches deck Slide 2 tier | [ ] |
| No marketing copy baked in PNG pixels (zoom 200%) | [ ] |
| Amber `#f59e0b` / obsidian `#09090b` only — no fintech blue on `/` | [ ] |
| HUD overlays readable (WCAG) on threat + subHero | [ ] |
| PDF → URL click-through feels one brand system | [ ] |
| Each landing section shows a **distinct frame** (no obvious duplicate paste) | [ ] |

**Sign-off:** _________________ **Date:** _________

---

## Epic 4.2 — Deploy

```bash
npm run sync:open-web-plates
npm run verify:open-web-sota
npm run lint
npm run typecheck
npm run build
```

Merge to `main` → Vercel deploy → hard refresh / purge edge cache for `/open/landing/plates/*`.

---

## Epic 4.3 — Outbound unlock (after 4.1 pass)

Remove strategic hold only when Epic 4.1 is signed off **and** production URL verified.

| Recipient | Payload |
|-----------|---------|
| Richard Faulkner (HSBC) | Institutional payload + SOTA PDF + `www.openportfolio.co.uk` |
| David Levine (syndicate) | Syndicate payload + SOTA PDF + URL |

---

## Phase 2 (non-blocking enhancement)

Replace interim deck-recycled plates with net-new Design finals (drop into `public/open/landing/plates/` in place):

- `web-hero-glass-vault.png` — Glass Vault render
- `web-substrate-matrix.png` — Substrate Matrix render
- `web-clean-room-console.png` — Clean Room console render

No code change required when finals land — re-run verify + 4.1 spot check.
