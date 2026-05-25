---
id: OP-SEED-PLATE-GATE-2026-05-25
title: Phase 1 Design Plate Gate Review
status: OPERATIONAL
---

# Phase 1 gate review — approve plates before typography composite

**Recommendation:** **Yes — schedule a 30-minute gate** after raw 3D exports land, **before** `npm run build:open-seed-deck` final composite. This prevents typography work on rejected backgrounds.

## When to run the gate

| Trigger | Owner |
|---------|--------|
| `slide-01-frontier.png` and `slide-02-split-brain.png` exported from Blender/Spline/MJ | Product Design |
| Files placed in `docs/seed/design-plates/` | Product Design |
| Build run: `npm run build:open-seed-deck` | Engineering |
| Review meeting | CPO + Chief Branding + FounderOps |

Slides 3–5 can follow in **Phase 2** using the same checklist; Phase 1 gate is **blocking only for Slides 1–2** per Command mandate.

## Approval checklist (per plate)

### Global (all plates)

- [ ] **16:9** at ≥2560×1440, sRGB PNG, no compression artefacts
- [ ] Background anchored to **#09090b** (not `#111827` or lifted grey)
- [ ] **No fintech blue**, no macOS traffic lights, no brand-green accents
- [ ] **No marketing copy** baked into pixels (metrics are overlaid at build time)
- [ ] Safe zone: top **12%** and bottom **8%** kept calmer for headline/footer overlays

### Slide 01 — Boundary (`slide-01-frontier.png`)

- [ ] Vertical **amber fiber** boundary reads at projection distance
- [ ] Left mass feels **restrictive** (legacy cloud) without cartoon red buttons
- [ ] Right side reads as **frosted glass cubes**, not flat rounded rects
- [ ] Macro depth of field — foreground sharper than far background

### Slide 02 — Split-brain (`slide-02-split-brain.png`)

- [ ] Isometric **engineering schematic**, not clip-art hexagons
- [ ] Amber **volumetric sphere** inside client node
- [ ] Server side shows **light dissipation** (zero persistence metaphor)
- [ ] No unreadable micro-labels in the raster (labels are PPT overlays)

## Reject criteria (send back to Design)

- Flat 2D UI rectangles with outer glow only
- Vector clip-art aesthetic
- Wrong palette (green/red accents outside legacy hazard zone on slide 1 left only)
- Text smaller than 24px baked into plate
- Letterboxing or non–16:9 crops

## Phase 2 sweep (after plates 1–2 approved)

Execute on composite deck — see `open-portfolio-seed-design-plates-brief.md` § Phase 2:

- [ ] Amber-only accent on FIN pillars and terminal chrome
- [ ] WCAG body text **#e2e8f0** on obsidian for overlays
- [ ] UK BBS photo **alpha edge-fade** into background (Figma mask or build vignette)
- [ ] Slide 3 metrics still sourced from `NUMBERS_SNAPSHOT` overlays

## Sign-off record

| Plate | Approved by | Date | Notes |
|-------|-------------|------|-------|
| slide-01-frontier.png | | | |
| slide-02-split-brain.png | | | |

---

*Gate passed → run full 5-plate drop + final investor export.*
