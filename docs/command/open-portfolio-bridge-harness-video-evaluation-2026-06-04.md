# Command evaluation — Open bridge harness visual (2026-06-04)

**Surface:** Open Portfolio (`www.openportfolio.co.uk`)  
**Section:** Bridge — *Pocket Portfolio: the live demonstration.*  
**Incident:** Black frame + broken poster shipped without Creative / Engineering gate — **rejected, remediated same day**

---

## Unified Command Team (org chart invoked)

| Role | Owner file | Gate on this change |
|------|------------|---------------------|
| **CEO** | `docs/command/roles/ceo.md` | Harness must prove live substrate — no abstract map as sole proof |
| **Head of Creative Studios** | `docs/command/roles/head-of-creative-studios.md` | **Media QA:** video plays muted on Open host before publish; no broken poster frame |
| **Head of Product Engineering** | `docs/command/roles/head-of-product-engineering.md` | CDN + CSP + layout verified; `npm run verify:open-bridge-harness` green |
| **Chief Product Officer** | `docs/command/roles/chief-product-officer.md` | Copy unchanged (`canonical-claims.ts` bridge body); visual only |

**Creative Studios failure (root cause):** UI shell (caption, HUD, 4K badge) merged without **mute-play verification** on the Open host. Poster path 404 + flex/aspect collapse produced the broken-image frame.

**Engineering remediation:**
- `getPocketAnalystHarnessVideoSrc()` — Open hosts always use Cloudinary `v1780578282`
- Harness uses **16/9** container (matches figure); no poster on Open bridge (avoids 404 flash)
- `scripts/verify-open-bridge-harness-video.mjs` — deploy gate

---

## Executive verdict

| Criterion | Static map (prior) | Pocket Analyst video (approved) |
|-----------|-------------------|----------------------------------|
| **Harness narrative** | Implied traction via GA4/npm dots | **Shows** Send → streaming inference |
| **Procurement story** | Metrics adjacent; visual abstract | Receipt cards + **product proof** in-frame |
| **Dual-surface clarity** | Map reads as geography | Unmistakably **Pocket** harness |
| **Mute-safe B2B** | N/A | Silent ~28s loop |

**Decision:** `bridge.motion: 'pocket-analyst-harness'`. **`tracks`** keeps footprint map.

---

## Sign-off checklist (required before prod)

- [ ] **Head of Creative Studios** — `www.openportfolio.co.uk` bridge: video autoplays, no broken icon, caption legible on mobile
- [ ] **Head of Product Engineering** — `node scripts/verify-open-bridge-harness-video.mjs` exit 0
- [ ] **CEO** — Harness narrative matches “Proof, not promises” eyebrow

---

## Implementation map

| Asset | Path |
|-------|------|
| Harness | `app/open/_components/OpenLandingPocketAnalystHarness.tsx` |
| Wiring | `app/open/_components/OpenLandingVisual.tsx` |
| SSOT | `lib/open-landing-visuals.ts` |
| Video SSOT | `lib/landing-product-video.ts` → `getPocketAnalystHarnessVideoSrc()` |
