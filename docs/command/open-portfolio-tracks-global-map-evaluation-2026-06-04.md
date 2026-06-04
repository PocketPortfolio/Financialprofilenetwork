# Command evaluation — Open tracks global map (2026-06-04)

**Surface:** Open Portfolio · `tracks` section — *Pick the door that matches your mandate.*  
**Status:** Remediated after Creative rejection of dual-pane plate

---

## Unified Command Team

| Role | File | Verdict |
|------|------|---------|
| **Head of Creative Studios** | `docs/command/roles/head-of-creative-studios.md` | **Reject** `web-traction-dual-pane` on tracks — left npm/terminal column is off-narrative clutter |
| **Head of Product Engineering** | `docs/command/roles/head-of-product-engineering.md` | Re-bake `web-traction-heatmap.png` via `npm run sync:open-web-plates` (map-only crop) |
| **CPO** | `docs/command/roles/chief-product-officer.md` | Mandate-path copy unchanged; visual crop only |

---

## Approved asset

| Item | Value |
|------|--------|
| Plate | `public/open/landing/plates/web-traction-heatmap.png` |
| Deck crop | `slide-03-traction.png` region `{ left: 0.36, width: 0.62 }` — **map pane only** |
| Overlay | `OpenLandingDigitalFootprintMap` `placement="global"` |
| Fit | `objectFit: cover` — map fills 16:9 |

**Not approved for tracks:** `web-traction-dual-pane.png` (terminal + map split).

---

## Sign-off before push

- [ ] **Creative Studios** — No terminal/code column visible; full map legible on mobile
- [ ] **HoPE** — `npm run verify:open-web-sota` pass after sync
