---
id: CMD-RETAIL-TERMINAL-PLATE-2026-07-29
title: Retail Landing — Terminal Plate Creative Brief (CEO Quality Hold)
status: SHIPPED · AWAITING CEO / MARKETING VISUAL SIGN-OFF
surface: Pocket Portfolio retail landing (`landing_retail_ia_2026`)
owners: [Head of Creative Studios, CPO, Head of Marketing, Head of Product Engineering]
authority: CEO quality hold 2026-07-29 · Command org roles
---

# Retail Terminal Plate — Creative Brief

## Problem (CEO)

The Product Portal “Terminal” visual on the **retail** variant reads cut-out and low-fidelity. It is unsuitable as the primary marketing product shot for wealth managers.

## Repo facts

| Item | Path / contract |
|------|-----------------|
| Source plate | `docs/seed/pocket-design-plates/pocket-portal-terminal-v2.png` |
| Baked plate | `public/pocket/landing/plates/web-portal-terminal.png` |
| Slot | `portalTerminal` in `lib/pocket-landing-visuals.ts` |
| Retail mount | `ProductPortalSection variant="retail"` — terminal card only |
| Sync | `npm run sync:pocket-web-plates` |

## Reject (retail)

- Floating / tilted CGI panes on a void
- Macro DOF, soft blur, vignette “sticker” framing
- Empty Analyst / Shell pane
- Baked “PRODUCT PORTAL” (or any narrative) in PNG pixels
- Shared control aesthetic without retail marketing ambition
- Card max-width ~480px as the only retail hero for this section

## Approve (retail)

- Flat, orthographic, edge-to-edge product UI (screenshot fidelity)
- Obsidian `#09090b` + amber `#f59e0b` only (no fintech blue)
- Dense chart + portfolio + **populated** Analyst reply
- Quiet bottom band (~18%) for HTML HUD if needed
- Full-bleed / wide retail presentation (not a cut-out card stamp)
- Export → bake to 3840×2160 via plate sync

## Role RACI

| Role | R/A/C/I | Duty |
|------|---------|------|
| **Head of Creative Studios** | **A** | Own plate fidelity; ship `pocket-portal-terminal-retail-v3.png` (or successor) |
| **CPO** | **A** (UX) | Ratify retail presentation (full-bleed vs card); trust/clarity of product truth |
| **Head of Marketing** | **C** | Sign-off: does this make a wealth manager click Launch App? |
| **Head of Product Engineering** | **R** | Wire source → sync map; retail layout; cache bust; verify |
| **CEO** | **I** | Quality bar holder — retail must not ship control CGI as hero |

## Engineering acceptance

1. New source under `docs/seed/pocket-design-plates/` referenced by sync map. ✅ `pocket-portal-terminal-retail-v3.png`
2. `npm run sync:pocket-web-plates` updates `web-portal-terminal.png` + cache hash. ✅
3. Retail `ProductPortalSection` presents terminal as wide marketing surface (not 480px stamp). ✅ `retailHero` · max 1120px · 16:9 · no vignette/drift/HUD stamp
4. Control portal may keep prior plate language until Creative ships paired upgrades; retail must not regress. ✅ Shared terminal plate upgraded; control cards unchanged in structure

## Shipped 2026-07-29

| Deliverable | Owner executed |
|-------------|----------------|
| Creative brief | Command doc |
| Flat retail plate v3 | Creative (generated) → design-plates |
| Sync map + bake | Product Eng |
| Retail layout (`retailHero`) | CPO + Product Eng |

**Marketing / CEO:** visual sign-off on retail `?variant=retail` Product Portal section before treating as closed.

## Out of scope this ticket

- Intent/selection landing page
- New A/B attribution instrumentation
- Open Portfolio plates
