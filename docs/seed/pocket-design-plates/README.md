# Pocket B2C design plates

Interim sources for `npm run sync:pocket-web-plates`.

Epic 3 net-new consumer PNGs drop here with the same filenames referenced in `scripts/sync-pocket-web-plates.mjs`.

Until Design delivers finals, sync bootstraps from `docs/seed/design-plates/slide-*.png` on first run.

## Purpose-built portal plates (CMD-UI-ASSET-2026-06-09)

Per the CEO mandate replacing the generic deck crops on the Product Portal
section of the landing page, the three portal cards now consume net-new,
purpose-built renders (deep black + amber, no baked typography — HTML overlay
handles the kicker/title text):

- `pocket-portal-terminal-v2.png` → `web-portal-terminal.png` — Pocket Analyst
  dashboard (chart bounding box + portfolio matrix + analyst console).
- `pocket-portal-storage-v2.png` → `web-portal-storage.png` — encrypted vault
  with local-first device and Drive folder-tree pipeline.
- `pocket-portal-founders-v2.png` → `web-portal-founders.png` — hex insignia
  with roadmap blueprint and metallic access key.

These sources are full-frame 16:9 — the bake script consumes them with
`full: true` (no crop region). When re-rendering, keep the bottom ~18% of the
frame visually quiet so the HTML overlay (`PRODUCT PORTAL` / `SOVEREIGN SYNC`
/ `FOUNDERS CLUB` kickers + card titles) overlays cleanly.
