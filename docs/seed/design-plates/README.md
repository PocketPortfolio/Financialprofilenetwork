# Open Portfolio seed deck — external design plates

**Copy is locked** in `docs/seed/open-portfolio-seed-investor-package.md`. Do **not** bake investor copy into these images.

## Workflow (Command-mandated)

1. Render cinematic **background plates only** in Figma, Spline, Blender, or Midjourney (see `../open-portfolio-seed-design-plates-brief.md`).
2. Export **16:9 PNG** at **2560×1440** minimum (3840×2160 preferred for PDF).
3. Drop files here with exact names below.
4. Run `npm run build:open-seed-deck` — the builder **full-bleeds** plates and overlays **editable** headings, metrics (Slide 3), and annex text in PowerPoint.

## Required filenames

| File | Slide |
|------|--------|
| `slide-01-frontier.png` | Compliance lockout · amber boundary |
| `slide-02-split-brain.png` | Isometric moat · OSS wedge |
| `slide-03-traction.png` | Dual-pane · npm terminal + MAU heat (no numeric text in plate) |
| `slide-04-receipts.png` | Watermark backdrop · leave right third clear for photo composite |
| `slide-05-control-panel.png` | FIN glass cards · leave center clear for raise metrics overlay |

Until all five exist, the build **falls back** to programmatic SVG heroes (`scripts/lib/open-portfolio-seed-visuals.ts`).

**Current status (2026-05-25):** All five interim **AI-rendered** plates are committed here (~2MB each). `npm run build:open-seed-deck` reports `5/5 external design plates composited`. Product Design may still replace with Blender/Spline finals per `GATE-REVIEW.md`.

## Slide 3 metrics (overlay only)

Do not paint these into the plate — the generator inserts them from `NUMBERS_SNAPSHOT`:

- **TRAC-01:** npm all-time (currently 9,389)
- **TRAC-07:** MAU (currently 4.7K)
- **~22K** GA4 events* (confirm before send)

## Slide 4 photography

Commit `public/press/abba/abba-uk-black-business-show-deck.png` (or higher-res BBS assets). The builder composites the portrait on the right over `slide-04-receipts.png`.
