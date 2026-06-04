# Open Portfolio landing — SOTA design plates

**SSOT:** [`docs/seed/open-portfolio-web-sota-brief.md`](../../../docs/seed/open-portfolio-web-sota-brief.md)

Cinematic 16:9 background plates only — **no marketing copy baked into pixels**. Narrative and metrics render as HTML overlays in `OpenLandingPlateOverlay.tsx`.

## Sync from seed deck

```bash
npm run sync:open-web-plates
```

Bakes eight **byte-distinct** 16:9 PNGs from deck plates using sharp region crops (one unique frame per landing section). Headline alignment is documented in `lib/open-landing-visuals.ts` (`headlineAlign` per slot).

| Output file | Section | Deck source | Crop |
|-------------|---------|-------------|------|
| `web-hero-glass-vault.png` | hero | slide-01 | right — glass cubes |
| `web-boundary-frontier.png` | threat | slide-01 | left — legacy cloud |
| `web-boundary-split-brain.png` | subHero | slide-02 | left — client pipeline |
| `web-split-brain-pillars.png` | pillars | slide-02 | right — stateless server |
| `web-traction-dual-pane.png` | bridge | slide-03 | full — npm terminal + global map |
| `web-traction-heatmap.png` | tracks | slide-03 | map pane only (no npm terminal) |
| `web-substrate-matrix.png` | packages | slide-05 | control matrix grid (interim; Epic 3.2 wafer pending) |
| `web-clean-room-console.png` | contact | slide-05 | full — FIN console |

Gate: [`docs/seed/design-plates/GATE-REVIEW.md`](../../../docs/seed/design-plates/GATE-REVIEW.md)
