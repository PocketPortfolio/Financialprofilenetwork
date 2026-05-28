# LinkedIn cover — Abba · SOTA design brief (v3)

**Role:** Head of AI & Community Operations  
**CEO mandate:** Elevate from flat wireframe v2 to Tier-1 infrastructure aesthetic (Linear / Vercel / Stripe gravity).

---

## Strategic answer: hardware vs community?

**Recommendation: 65% AI / silicon edge · 35% community network — in one frame, not two modes.**

| Lens | Why |
|------|-----|
| **Primary focal (sharp)** | **AI / silicon edge** — bounded inference, edge-lit glass “packets,” wafer metaphor. Matches *Chief AI Architect* authority and procurement story (inspectable boundary). |
| **Secondary field (bokeh)** | **Decentralized nodes** — amber node constellation out of focus on the right. Matches *Community Operations* without turning the cover into “social network” clipart. |
| **Left third** | **Clean obsidian void** — profile photo safe zone; no competing focal mass. |

Abba’s title is **dual**; the cover should read **“infrastructure first, builders in the field”** — not 50/50 clipart balance. Community is **atmosphere**, not the hero object.

If the role were *only* Community Ops → lean network. *Only* AI Architect → lean silicon. **Head of both** → hybrid above.

---

## Brand invariants (non-negotiable)

- Background: `#09090b` obsidian
- Accent: `#f59e0b` warm amber (edge light, fiber paths) — **no** `#0070f3` / fintech blue / cyan-purple gradients
- No stock “AI brain,” bridges, or flat vector constellations
- **Art over copy** — profile supplies title; max subtle etched monospace in texture

---

## SOTA generation prompt (Midjourney / SDXL / Flux)

Copy as a single block:

```text
A state-of-the-art, premium LinkedIn landscape cover photo for an elite AI infrastructure company. The aesthetic is hyper-realistic, cinematic, and industrial-tech, heavily inspired by modern design leaders like Linear and Vercel.

The background is a deep, textured obsidian black (#09090b) featuring subtle, dark-on-dark micro-grid lines and faint monospace code fragments etched into the surface (e.g. @pocket-portfolio/importer, buildPortfolioContext) at very low opacity.

The central focal point features edge-lit, frosted glass data nodes and silicon chip architecture, illuminated by sharp, volumetric warm amber lasers and fiber-optic pathways (#f59e0b). The right periphery shows soft bokeh of interconnected amber node lights — decentralized builder network, out of focus.

Macro-lens depth of field: center-right tack sharp, left third clean and dark for circular profile photo overlay, edges smoothly blurred. 4:1 ultra-wide banner composition.

Zero abstract vector clip-art. Zero generic fintech blue. High-gravity, mathematically precise, engineered authority. No people, no logos, no headline text.
```

**Suggested params (tool-dependent):** `--ar 4:1` · stylize medium-low · avoid “illustration,” “vector,” “flat”

---

## Production files

| Asset | Path |
|-------|------|
| **SOTA raster (AI-generated baseline)** | `public/marketing/linkedin-abba-head-ai-community-cover-sota.png` |
| **SVG wireframe v2 (deprecated for profile)** | `linkedin-abba-head-ai-community-cover.png` — keep for internal only |
| **Regenerate script (vector)** | `scripts/generate-linkedin-abba-ai-community-cover.mjs` |

**LinkedIn requires exactly 1584×396 (4:1).** AI renders are often 3:2 — always run:

```bash
npm run export:linkedin-abba-cover-spec
```

Outputs: `linkedin-abba-head-ai-community-cover-1584x396.jpg` (upload this) + `.png`

---

## Design team checklist

1. Left 28%: luminance ≤ profile-safe (no bright blobs).
2. Focal stack sits **center-right** (x 55–85%).
3. Etched code ≤ 8% opacity — texture only, not readable marketing.
4. Amber speculars only on edges — no full-frame orange wash.
5. Mobile crop: re-check in LinkedIn preview (title safe on profile, not on banner).

---

## CEO one-liner (for sign-off)

> **Sharp silicon-glass inference at the edge; builder constellation in the bokeh; left field clear for Abba. Amber on obsidian — Tier-1 infra, not 2015 wireframes.**
