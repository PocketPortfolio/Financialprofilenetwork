---
id: OP-WEB-SOTA-BRIEF-2026-05-25
title: Open Portfolio Web — SOTA Visual Parity Brief
status: SHIPPED_PHASE1
parent: docs/seed/open-portfolio-seed-design-plates-brief.md
claims_ssot: docs/command/claims-vs-codebase-calibration.md
sprint: Operation SOTA Parity
output_dir: public/open/landing/plates/
legacy_pipeline: scripts/generate-open-landing-visuals.mjs
---

# Web SOTA brief — deck ↔ landing parity

**Sprint goal:** Unify the visual render pipeline across the seed teaser deck and `www.openportfolio.co.uk`. Replace flat programmatic SVG heroes with Tier-1 cinematic 3D plates. **Hold Tier-1 institutional outbound until Epic 4 gate passes.**

**Narrative copy remains locked** in `lib/canonical-claims.ts` (`OPEN_LANDING_COPY`). Visuals only.

---

## 1. Governance — reject criteria (inherited + web-specific)

Extends `docs/seed/design-plates/GATE-REVIEW.md`.

### Reject (send back to Design)

| Pattern | Example on current web |
|---------|-------------------------|
| Flat 2D UI rectangles + outer glow only | `public/open/landing/svg/privacy-architecture.svg` |
| Vector clip-art aesthetic | Shield (`hero-sovereign-layer`), hexagon hub (`open-packages`) |
| Fintech blue / off-palette accents | `/designchallenge` hero `si-figure-02-hybrid-architecture.svg` |
| Marketing copy baked into PNG pixels | `regulatory-stakes.svg` (€20M+), `open-packages.svg` headlines |
| Abstract “face” iconography | `BriefingRoomFace` in `OpenLandingVisual.tsx` |
| Generic SaaS drop-shadow cards | Figma-style `feDropShadow` stacks in landing SVG generator |

### Approve

| Requirement | Standard |
|-------------|----------|
| Surface | Obsidian `#09090b` anchor (not lifted grey `#111827`) |
| Accent | Warm amber `#f59e0b` only — paths, boundaries, metrics |
| Depth | Macro DOF, frosted glass, volumetric amber, fiber-optic edges |
| Typography | **HTML/CSS overlays only** — zero narrative text in plate pixels |
| Export | PNG sRGB, **2560×1440** min (**3840×2160** preferred), 16:9 |
| Safe zones | Top 12% / bottom 8% calmer for optional HUD overlays |

**Overlay typography (web):** Headings — system sans; data receipts — `ui-monospace` / JetBrains Mono / Fira Code stack (`app/globals.css`). Body on obsidian: `#e2e8f0` minimum for WCAG 4.5:1 on `#09090b`.

---

## 2. Slot mapping — landing ID → plate asset

| Landing ID | Section | Current (deprecated) | Target plate | Source ticket |
|------------|---------|----------------------|--------------|---------------|
| `hero` | Hero | `hero-sovereign-layer` (flat shield) | `web-hero-glass-vault.png` | 3.1 — net-new |
| `subHero` | Privacy architecture | `privacy-architecture` (flat vault/cloud) | `web-boundary-split-brain.png` | 2.2 — reuse `slide-02-split-brain.png` |
| `threat` | Regulatory stakes | `regulatory-stakes` (€20M+ neon box) | `web-boundary-frontier.png` | 2.2 — reuse `slide-01-frontier.png` |
| `bridge` | Pocket proof bridge | `live-proof-bridge` | `web-traction-dual-pane.png` | 2.2 — reuse `slide-03-traction.png` |
| `pillars` | Substrate pillars | `substrate-pillars` | `web-split-brain-pillars.png` | 2.2 — crop/variant of `slide-02-split-brain.png` or 3.2 derivative |
| `tracks` | Partner tracks | `partner-tracks` (hub-spoke) | `web-substrate-matrix.png` | 3.2 — net-new (shared with packages) |
| `packages` | NPM packages | `open-packages` (hexagon) | `web-substrate-matrix.png` | 3.2 — net-new |
| `contact` | Briefing room | `briefing-room` + face overlay | `web-clean-room-console.png` | 3.3 — net-new |

**Drop directory:** `public/open/landing/plates/`  
**Public URL pattern:** `/open/landing/plates/{filename}`

---

## 3. Design prompts — net-new plates

### 3.1 `web-hero-glass-vault.png` (Hero)

**Replaces:** flat 2D shield.

```text
Hyper-realistic macro shot, impenetrable frosted-glass vault core on pure obsidian #09090b void. Deep inside the glass, brilliant amber #f59e0b core pulses with volumetric light. Faint floating monospace code glyphs in depth-of-field blur at edges. Photon-mapped glass, UE5 cinematic render, macro lens, no text, no logos, 16:9 ultra detailed
```

**Negative:** `shield icon, flat vector, clip art, fintech blue, cartoon, watermark, text`

### 3.2 `web-substrate-matrix.png` (Packages + Tracks)

**Replaces:** hexagon hub + spider diagram.

```text
Cinematic isometric 3D obsidian silicon wafer on #09090b. Glowing amber #f59e0b fiber-optic pathways branch from central brightly lit node into four distinct translucent glass terminals. Industrial tech aesthetic, macro-lens blur foreground and background, high contrast, matches split-brain engineering schematic depth, no text, no labels, 16:9
```

**Negative:** `hexagon clipart, flat nodes, corporate training slide, powerpoint, blue`

### 3.3 `web-clean-room-console.png` (Contact)

**Replaces:** abstract briefing face.

```text
Photo-real executive perimeter console, edge-lit amber #f59e0b on obsidian #09090b. Frosted glass briefing table, institutional security aesthetic, volumetric rim lighting, shallow depth of field, procurement-grade gravitas, no faces, no text, no logos, 16:9 cinematic
```

**Negative:** `emoji face, minimalist portrait, abstract eyes, cartoon, blue UI`

---

## 4. Phase 1 reuse — deck plates (Engineering, Day 1–2)

Copy from `docs/seed/design-plates/` → `public/open/landing/plates/`:

| Source | Destination | Landing slot |
|--------|-------------|--------------|
| `slide-01-frontier.png` | `web-boundary-frontier.png` | `threat` |
| `slide-02-split-brain.png` | `web-boundary-split-brain.png` | `subHero` |
| `slide-03-traction.png` | `web-traction-dual-pane.png` | `bridge` |

Script (to add): `npm run sync:open-web-plates` — copies + logs SHA for cache busting.

---

## 5. HTML overlay spec (Ticket 2.3)

All narrative and metric copy lives in **DOM**, not PNG.

### Threat frame — optional HUD on `threat` plate

Mirror seed deck Slide 1 overlay (left panel on legacy-cloud zone):

- **THE INFLECTION POINT: 2025 EXPOSURE**
- GBP 4.45M · Average Breach Cost (Financial Services)
- EUR 35M or 7% · EU AI Act (Art. 99 Tier-1 ceiling)
- EUR 20M or 4% · GDPR (Art. 83(5) higher-tier ceiling)
- Footer line: legacy aggregators + persistent PII + max regulatory exposure

Source values: `ThreatSection` props + `NUMBERS_SNAPSHOT` — **do not duplicate** the three cards below; HUD is atmospheric, cards remain authoritative with citations.

### SubHero frame — optional HUD on `subHero` plate

Mirror seed deck Slide 2 overlay:

1. Ingest @ Edge — `@pocket-portfolio/importer` (MIT, N+ adapters)
2. Context Engine — `buildPortfolioContext()` bounded aggregates
3. Stateless API — POST `/api/ai/chat` · zero payload persistence

Adapter count from live SDK metadata (`OpenLandingClient` props).

### Component contract

```typescript
// lib/open-landing-visuals.ts (target shape)
export interface OpenLandingVisualMeta {
  id: OpenLandingVisualId;
  src: string;                    // plate PNG only — no srcSvg
  alt: string;
  caption: string;
  aspectRatio: '16/9';            // normalize all slots to 16:9
  overlay?: 'exposure' | 'moat' | null;
  plateSource?: 'deck-reuse' | 'net-new';
}
```

New component: `OpenLandingPlateOverlay.tsx` — absolute positioned scrim + monospace HUD; responsive `clamp()` font sizes; `prefers-reduced-motion` hides pulse animations only.

---

## 6. Engineering refactor checklist (Ticket 2.1)

| File | Action |
|------|--------|
| `lib/open-landing-visuals.ts` | Point `src` at `plates/*`; remove `srcSvg`; add `overlay` flags |
| `app/open/_components/OpenLandingVisual.tsx` | Remove `BriefingRoomFace`, shield-centric `HeroDataGravityBlock`; add optional `OpenLandingPlateOverlay`; drop `textHeavy` branch |
| `scripts/generate-open-landing-visuals.mjs` | Mark **deprecated** in header; do not run in CI |
| `package.json` | Add `sync:open-web-plates`; remove `generate:open-landing-visuals` from default build |
| `public/open/landing/svg/*` | Retain until Epic 4 sign-off; then archive to `docs/archive/open-landing-svg/` |

**Image loading:** Keep `next/image` with `object-fit: cover`, `quality={90}`, `sizes` tuned for grid. Plate filenames versioned or content-hashed on deploy.

---

## 7. QA gate — Epic 4.1 (blocking outbound)

Side-by-side review:

1. `docs/seed/Open_Portfolio_Seed_Teaser_2026.pdf`
2. Staging `www.openportfolio.co.uk/` at 1440px and 390px widths

**Pass criteria:**

- [ ] Zero flat shield / hexagon / face iconography on landing
- [ ] Threat + subHero plates match deck Slides 1–2 aesthetic tier
- [ ] No marketing copy visible inside PNG pixels (zoom 200%)
- [ ] Amber/obsidian invariant holds; no fintech blue on Open surface
- [ ] WCAG contrast on all HUD overlays
- [ ] Investor click-through: PDF → URL feels like one brand system

**Fail →** extend hold on Richard Faulkner / David Levine dispatch (Ticket 4.3).

**Checklist doc:** [`SOTA-PARITY-QA-GATE.md`](SOTA-PARITY-QA-GATE.md)  
**Automated gate:** `npm run verify:open-web-sota`

---

## 8. Sprint ticket index

| Ticket | Epic | Owner | Depends on |
|--------|------|-------|------------|
| 1.1 | Command | CTO | — |
| 2.1 | Engineering | Frontend | 1.1 |
| 2.2 | Engineering | Frontend | 1.1, deck plates committed |
| 2.3 | Engineering | Frontend | 2.1, 2.2 |
| 3.1 | Design | 3D | 1.1 |
| 3.2 | Design | 3D | 1.1 |
| 3.3 | Design | 3D | 1.1 |
| 4.1 | QA | Product Design | 2.x + 3.x |
| 4.2 | DevOps | Engineering | 4.1 pass |
| 4.3 | Growth | Founder | 4.2 prod |

---

## 9. Out of scope (this sprint)

- `/designchallenge` figure swap (track as follow-up — fintech blue violation)
- Missing OG PNGs (`tier1designpartner`, `board-of-investors`)
- Replacing interim AI deck plates with Blender finals (parallel, non-blocking for web Phase 1 reuse)

---

**Build for purpose. Verify on artifact. Reciprocate the signal.**
