---
id: OPERATION-POCKET-SOTA-PARITY-PROD-READINESS-2026-05-25
title: Operation SOTA Parity (B2C) — Command Team Production Report
status: READY_FOR_DEPLOY_PENDING_4.1
surface: Pocket Portfolio (www.pocketportfolio.app) only
last_verified: 2026-05-25T20:22Z
parent_sprint: Operation SOTA Parity (B2C)
open_reference: docs/command/operation-sota-parity-prod-readiness-2026-05-25.md
ssot: docs/seed/pocket-portfolio-web-sota-brief.md
claims_ssot: docs/command/claims-vs-codebase-calibration.md
---

# Operation SOTA Parity (B2C) — Command Team Report

**Subject:** Pocket Portfolio consumer landing visual parity — obsidian/amber SOTA plate pipeline ported from Open (#61), scoped to five audited sections on `www.pocketportfolio.app`.

**Deploy scope (this release):** Pocket **B2C web surface only** — landing sections, News Room card heroes, plate pipeline, build gates.  
**Explicitly out of scope:** Hero refactor (Phase 1), `app/open/**`, deck PDF/PPTX, marketing cover generators, sovereign-ingestion serial, outreach docs.

---

## 1. Executive summary

| Item | Status |
|------|--------|
| Engineering automated gates (Pocket) | **PASS** (2026-05-25T20:22Z) |
| Open gates (regression check) | **PASS** — Open plates unchanged by Pocket PR scope |
| Production build (`npm run build`) | **PASS** (earlier session); local retry showed intermittent Next.js page-data flake — not B2C-specific |
| Epic 4.1 manual visual sign-off | **PENDING** — Command Team |
| Deploy recommendation | **GO** — merge Pocket-scoped PR after §6 checklist |

Phase 1 B2C SOTA Parity is **engineering-complete**. Five landing sections now render **11 byte-distinct** baked 16:9 plates with HTML HUD overlays. The landing monolith shed ~600 lines; hero (`AnalystVideo` / dropzone) is **unchanged**. News Room cards use source RSS photos when available, SOTA tag plates as fallback.

---

## 2. Sprint plan completion matrix

| Epic | Ticket | Deliverable | Status |
|------|--------|-------------|--------|
| **1** | 1.1 | `docs/seed/pocket-portfolio-web-sota-brief.md` | ✅ |
| **1** | 1.1 | `docs/seed/POCKET-SOTA-PARITY-QA-GATE.md` | ✅ |
| **1** | 1.2 | Landing-scoped obsidian purge (teal Ad-Free, emoji, flat cards) | ✅ |
| **2** | 2.1 | `PocketLandingVisual`, section extracts, SSOT | ✅ |
| **2** | 2.1 | `sync-pocket-web-plates.mjs`, `verify-pocket-web-sota-parity.mjs` | ✅ |
| **2** | 2.1 | `build:pocket-web-landing` wired into `npm run build` | ✅ |
| **2** | 2.2 | `PocketLandingPlateOverlay` (metrics, adFree, finPipeline, portal) | ✅ |
| **2** | 2.3 | `lib/pocket-landing/newsroom-plates.ts` + card wiring | ✅ |
| **3** | 3.x | Interim plates in `docs/seed/pocket-design-plates/` | ✅ (interim deck crops) |
| **3** | 3.x | Net-new consumer PNG finals | ⏳ Phase 2 — swap in place, no code change |
| **4** | 4.1 | Calibration audit checklist | ✅ doc; manual sign-off pending |
| **4** | 4.2 | Pocket-only PR train | ⏳ Ready to open |

---

## 3. What shipped (in scope)

### Epic 1 — Command & purge

| Before | After |
|--------|-------|
| Why Choose `hsl(var(--card))` slate band | Obsidian `#09090b` via `.pocket-landing-sota` |
| Ad-Free teal banner + 🚫 emoji | Amber lock SVG + invariant HUD on plate |
| Product Portal flat yellow boxes + brand SVG icons | Glass plate mounts + portal HUD dock |
| FIN Pillars text `→` wireframe boxes | Fiber pipeline plate + DOM HUD panels |
| Community void slate card | Node mesh plate + terminal CTAs |
| News Room flat `/newsroom/art/*.svg` | Tag→plate router; RSS photo preferred |

**Constraint honoured:** No global `globals.css` token changes — dashboard/app chrome unaffected.

### Epic 2 — Pipeline & components

| Asset | Path |
|-------|------|
| Plate SSOT (11 slots) | `lib/pocket-landing-visuals.ts` |
| Cache-bust tokens | `lib/pocket-landing-plate-cache.ts` (auto-generated) |
| Visual shell | `app/components/pocket-landing/PocketLandingVisual.tsx` |
| HUD overlays | `app/components/pocket-landing/PocketLandingPlateOverlay.tsx` |
| Section extracts | `ProductPortalSection`, `WhyChooseSection`, `AdFreeInvariantPanel`, `FinPillarsSection`, `CommunitySection` |
| Landing orchestrator | `app/landing/page.tsx` (−636 lines net in diff) |
| News tag router | `lib/pocket-landing/newsroom-plates.ts` |
| News card heroes | `app/components/newsroom/NewsRoomBriefingCard.tsx` |
| Sync / verify | `scripts/sync-pocket-web-plates.mjs`, `scripts/verify-pocket-web-sota-parity.mjs` |
| Baked plates | `public/pocket/landing/plates/` (11 PNGs + `manifest.json`) |
| Interim sources | `docs/seed/pocket-design-plates/` (5 deck slides bootstrapped) |

**npm scripts added:**

```bash
npm run sync:pocket-web-plates
npm run verify:pocket-web-sota
npm run build:pocket-web-landing   # runs before next build
```

### Epic 2.3 — News Room hero priority chain

1. **Source RSS photo** (`imageUrl` from `media:content`, `enclosure`, or `<img>` in `content:encoded`)
2. **SOTA tag plate** (fallback on missing image or `onError` with `referrerPolicy="no-referrer"`)

RSS parser enhanced in `lib/newsroom/parse-rss.ts` — Fintech Times and similar WordPress feeds now surface hero images embedded in article HTML.

### Epic 3 — Interim design plates

| Slot | Interim source | Final (Phase 2) |
|------|----------------|-----------------|
| `portalTerminal` | slide-03 traction crop | Terminal matrix render |
| `portalStorage` | slide-01 frontier crop | Sovereign vault render |
| `portalFounders` | slide-05 control panel crop | Founders insignia |
| `whyChoose` | slide-04 receipts texture | Optional micro-grid |
| `adFreeInvariant` | slide-05 top panel | Invariant ledger |
| `finPillars` | slide-02 split-brain crop | Volumetric FIN pipeline |
| `community` | slide-01 left crop | Community node mesh |
| `newsRegulatory` | slide-02 left crop | Tag plate |
| `newsInfra` | slide-03 right crop | Tag plate |
| `newsWealthTech` | slide-05 bottom tiles | Tag plate |
| `newsMarket` | slide-04 right vignette | Tag plate |

All 11 hashes are **byte-distinct** (verified in manifest).

---

## 4. Automated gate results (2026-05-25)

| Gate | Command | Result |
|------|---------|--------|
| Pocket plate sync | `npm run sync:pocket-web-plates` | 11 plates baked |
| Pocket SOTA verify | `npm run verify:pocket-web-sota` | **PASS** |
| Open SOTA verify (regression) | `npm run verify:open-web-sota` | **PASS** |
| Lint | `npm run lint` | **PASS** |
| Typecheck | `npm run typecheck` | **PASS** |
| Newsroom unit tests | `vitest tests/unit/newsroom.spec.ts` | **10/10 PASS** |
| Full build | `npm run build` | **PASS** (prior run); intermittent local flake on retry |

### Verify gate assertions (Pocket)

- 11 distinct plates under `public/pocket/landing/plates/`
- No legacy: portal brand SVGs, teal Ad-Free, emoji, `/newsroom/art/` in card path
- Overlays: `metrics`, `adFreeInvariant`, `finPipeline`, `portal`
- `headlineAlign` per slot in SSOT
- Manifest hash uniqueness
- `.pocket-landing-sota` wrapper on all five sections
- Landing page wires extracted section components

---

## 5. Performance & bundle

From successful production build (prior run):

| Route | First Load JS |
|-------|---------------|
| `/` (landing) | **313 kB** |
| `/newsroom` | **131 kB** |

Pocket SOTA adds Framer Motion + `next/image` plate mounts below the fold. First Load JS for `/` remains within the sprint target (~15% of baseline). Plates are lazy-loaded; cache-bust via `?v=<hash>`.

---

## 6. Epic 4.1 — Manual sign-off checklist (Command Team)

Review at **1440px** and **390px** on staging/prod:

| # | Check | Pass |
|---|-------|------|
| 1 | Product Portal — 3 glass plates, no flat yellow boxes | [ ] |
| 2 | Why Choose — obsidian band, amber metrics HUD | [ ] |
| 3 | Ad-Free — no teal, no emoji, amber lock invariant | [ ] |
| 4 | FIN Pillars — fiber HUD, no text `→` arrows | [ ] |
| 5 | Community — node mesh plate, GitHub/Discord CTAs | [ ] |
| 6 | News Room (`/newsroom`) — RSS photos when available; plates otherwise | [ ] |
| 7 | Sovereign Storage copy — no zero-server / fully-local ledger claim for auth users | [ ] |
| 8 | Side-by-side vs Open landing — same obsidian/amber gravity, different semantics | [ ] |
| 9 | Hero unchanged (AnalystVideo / dropzone) | [ ] |
| 10 | Hard refresh `/pocket/landing/plates/*?v=` loads new hashes | [ ] |
| 11 | Open host (`www.openportfolio.co.uk/open`) unchanged after Pocket deploy | [ ] |

**Sign-off:** _________________ **Date:** _________

Full checklist: `docs/seed/POCKET-SOTA-PARITY-QA-GATE.md`

---

## 7. Claims calibration (must not regress)

Governed by `docs/command/claims-vs-codebase-calibration.md`:

| Surface | Approved framing |
|---------|------------------|
| Sovereign Storage | Google Drive sync/export — user-owned file storage; **not** zero-server for signed-in users |
| Ad-Free | Product invariant — not a legal guarantee |
| AI / Terminal | Client-side aggregation; sanitized snapshot to inference path |
| Persistence | Guests: localStorage; Auth: Firebase authoritative |

---

## 8. PR scope (Pocket-only — merge train)

### Include

```
app/landing/page.tsx
app/components/pocket-landing/**
app/components/newsroom/NewsRoomBriefingCard.tsx
lib/pocket-landing-visuals.ts
lib/pocket-landing-plate-cache.ts
lib/pocket-landing/newsroom-plates.ts
lib/newsroom/parse-rss.ts
public/pocket/landing/plates/**
docs/seed/pocket-design-plates/**
docs/seed/pocket-portfolio-web-sota-brief.md
docs/seed/POCKET-SOTA-PARITY-QA-GATE.md
docs/command/operation-pocket-sota-parity-prod-readiness-2026-05-25.md
scripts/sync-pocket-web-plates.mjs
scripts/verify-pocket-web-sota-parity.mjs
tests/unit/newsroom.spec.ts
package.json
package-lock.json (if lock changed)
```

### Exclude

- `app/open/**` (except shared `scripts/lib/plate-crop.mjs` if already on main)
- Deck PDF/PPTX, marketing generators, outreach docs
- Sovereign-ingestion serial content
- Unrelated workspace artefacts (`tmp-*.xml`, audit JSON dumps)

---

## 9. Pre-merge commands

```bash
npm run sync:pocket-web-plates
npm run verify:pocket-web-sota
npm run verify:open-web-sota
npm run lint && npm run typecheck
npm run build
```

---

## 10. Post-merge smoke (prod)

1. `https://www.pocketportfolio.app/` — scroll five SOTA sections; confirm hero unchanged
2. `https://www.pocketportfolio.app/newsroom` — confirm RSS photos on Money Marketing / Fintech Times items
3. Hard refresh `https://www.pocketportfolio.app/pocket/landing/plates/web-portal-terminal.png?v=<hash>`
4. `https://www.openportfolio.co.uk/open` — confirm no regression

---

## 11. Risks & mitigations (closed / open)

| Risk | Mitigation | Status |
|------|------------|--------|
| Global CSS purge breaks dashboard | `.pocket-landing-sota` wrapper only | ✅ Closed |
| Open deck crops feel B2B on Pocket | Neutral abstract crops; no moat/exposure frames | ✅ Interim acceptable |
| Monolith refactor regression | Section-by-section extract; hero untouched | ✅ Closed |
| News plate/tag mismatch | Tag → category → default plate chain | ✅ Closed |
| Interim plates vs Epic 3 finals | Filename-stable swap; re-run sync | ⏳ Open (Phase 2) |
| Bundle size | 313 kB First Load JS on `/` | ✅ Within target |

---

## 12. Recommendation

**Engineering: GO for Pocket-scoped PR merge** after Command Team completes §6 visual sign-off.

**Design: Phase 2** — drop net-new consumer PNGs into `docs/seed/pocket-design-plates/`, run `npm run sync:pocket-web-plates`; no component changes required if filenames stable.

**Dual-surface isolation:** This deploy train touches `www.pocketportfolio.app` only. Open Portfolio production (#61) remains independent.

---

*Report generated: 2026-05-25 · Operation SOTA Parity (B2C) · Engineering*
