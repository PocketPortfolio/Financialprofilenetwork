---
id: OP-SOTA-PARITY-PROD-READINESS-2026-05-25
title: Operation SOTA Parity — Production Readiness Report (Command Team)
status: READY_FOR_DEPLOY_PENDING_4.1
surface: Open Portfolio (www.openportfolio.co.uk) only
last_verified: 2026-05-25T19:23Z
ssot: docs/seed/open-portfolio-web-sota-brief.md
---

# Operation SOTA Parity — Command Team Report

**Subject:** Web ↔ Deck visual unification and related Open Portfolio landing work — production deploy readiness.

**Deploy scope (this release):** Open Portfolio **web surface only** (`www.openportfolio.co.uk` / `app/open/*`, landing plates, build gates).  
**Explicitly out of scope:** Seed deck **PDF/PPTX**, GoCardless/outreach PDFs, marketing cover generators, sovereign-ingestion serial content, and other business-operations artefacts — **do not ship** in this deploy train.

---

## 1. Executive summary

| Item | Status |
|------|--------|
| Engineering automated gates | **PASS** (2026-05-25) |
| Production build (`npm run build`) | **PASS** |
| Epic 4.1 manual visual sign-off | **PENDING** — Command Team |
| Epic 4.3 institutional outbound (Faulkner / Levine) | **BLOCKED** until 4.1 + prod URL verified |
| Deploy recommendation | **GO** — merge scoped PR after 4.1 checklist (§6) |

Phase 1 of Operation SOTA Parity is **engineering-complete**. The Open landing at `/open` replaces deprecated flat SVG heroes with eight **byte-distinct** baked 16:9 plates, HTML HUD overlays, motion layers, executive form gold border, and Interactive Architecture Demonstrations (IADs) on the briefing console. Narrative copy remains locked in `lib/canonical-claims.ts`.

---

## 2. What shipped (in scope for this deploy)

### Epic 1 — SSOT & governance

| Asset | Path |
|-------|------|
| Web SOTA brief | `docs/seed/open-portfolio-web-sota-brief.md` |
| Claims calibration (copy gate) | `docs/command/claims-vs-codebase-calibration.md` |
| QA gate checklist | `docs/seed/SOTA-PARITY-QA-GATE.md` |

### Epic 2 — Landing refactor (core)

| Capability | Implementation |
|------------|----------------|
| Plate SSOT (8 slots) | `lib/open-landing-visuals.ts` |
| Cache-bust plate URLs | `lib/open-landing-plate-cache.ts` (auto-generated on sync) |
| Plate-only visual component | `app/open/_components/OpenLandingVisual.tsx` |
| Story section wiring | `app/open/_components/OpenStorySection.tsx`, `OpenLandingClient.tsx` |
| Threat / moat HTML HUDs | `app/open/_components/OpenLandingPlateOverlay.tsx` |
| Sharp bake pipeline | `scripts/sync-open-web-plates.mjs`, `scripts/lib/plate-crop.mjs` |
| Automated verify gate | `scripts/verify-open-web-sota-parity.mjs` |
| Build integration | `package.json` → `build:open-web-landing` runs before `next build` |
| Plates + manifest | `public/open/landing/plates/*` (8 PNGs + `manifest.json` + `README.md`) |

**Legacy removed from landing path:** `BriefingRoomFace`, `HeroDataGravityBlock`, flat SVG plate reuse (`srcSvg`), duplicate CSS-only crops.

### Epic 2+ — Motion & procurement UX (session deliverables)

| Section | Plate | Motion / overlay |
|---------|-------|------------------|
| `hero` | slide-01 glass vault crop | Sovereign grid animation + left HUD label |
| `threat` | slide-01 legacy cloud crop | Exposure overlay (calibrated EUR/GBP metrics) |
| `subHero` | slide-02 client pipeline crop | Moat carousel (scroll-snap, no clip) |
| `bridge` | slide-03 (plate retained in SSOT) | **Pocket Analyst harness video** (`pocket-analyst-harness`) — see `docs/command/open-portfolio-bridge-harness-video-evaluation-2026-06-04.md` |
| `pillars` | slide-02 server crop | Plate only |
| `tracks` | slide-03 heatmap crop | Full-map firefly overlay |
| `packages` | slide-05 matrix crop (interim) | Package terminal HUD |
| `contact` | slide-05 full console | **IAD briefing console** (3 demos) |
| Executive form | — | Signature gold border (`OpenContactForm.tsx`) |

### Epic 3 — Interactive Architecture Demonstrations (IADs)

Mounted on contact visual (`motion: 'briefing-console'`):

| IAD | Proves | Notes |
|-----|--------|-------|
| Stateless Chess | Stateless inference / FEN payload | Client `chess.js`; **demo-honest** — no live `/api/ai/chat` on public landing |
| Perimeter Sort | Edge sanitization | GDPR lockout uses SSOT EUR 20M ceiling from threat HUD |
| Node Router | Deflationary edge routing | Perimeter vs cloud budget drain |

Dependency added: `chess.js` (^1.4.0) — client-only, contact section.

---

## 3. Plate mapping (deploy artefact)

| Output PNG | Landing slot | Deck source | Crop |
|------------|--------------|-------------|------|
| `web-hero-glass-vault.png` | hero | slide-01-frontier | right 48% |
| `web-boundary-frontier.png` | threat | slide-01-frontier | left 48% |
| `web-boundary-split-brain.png` | subHero | slide-02-split-brain | left 58% |
| `web-split-brain-pillars.png` | pillars | slide-02-split-brain | right 52% |
| `web-traction-dual-pane.png` | bridge | slide-03-traction | full 16:9 |
| `web-traction-heatmap.png` | tracks | slide-03-traction | right 50% |
| `web-substrate-matrix.png` | packages | slide-05-control-panel | center 92×84% (interim) |
| `web-clean-room-console.png` | contact | slide-05-control-panel | full 16:9 |

All eight hashes verified **byte-distinct** (`manifest.json` synced 2026-05-25T18:22:59Z).

---

## 4. Automated gate results (2026-05-25)

```
npm run sync:open-web-plates     ✓ PASS — 8 plates baked, cache file written
npm run verify:open-web-sota     ✓ PASS — engineering gate
npm run lint                     ✓ PASS
npm run typecheck                ✓ PASS
vitest surface-host + canonical  ✓ PASS — 44 tests
npm run clean:next && npm run build   ✓ PASS — full production parity build
```

**Open landing route size (build):** `/open` → 27.4 kB page JS, 181 kB First Load JS (includes IAD + chess.js client chunk).

---

## 5. Out of scope — do NOT deploy

Exclude from the production PR / release train:

| Category | Examples |
|----------|----------|
| Seed deck outputs | `docs/seed/Open_Portfolio_Seed_Teaser_2026.pdf`, `.pptx`, `_open-seed-deck-cache/` |
| Deck generators | `scripts/generate-open-portfolio-seed-deck.ts`, `scripts/lib/open-portfolio-seed-deck.ts` |
| Business outreach PDFs | `docs/outreach/*.pdf`, `scripts/generate-gocardless-plan-pdf.mjs` |
| Marketing / social covers | `docs/marketing/*`, `public/marketing/*`, cover generator scripts |
| Sovereign ingestion serial | `content/coderlegion-sovereign-ingestion-serial/**` |
| Temp / audit dumps | `tmp-*.xml`, `tmp-newsroom.json`, `npm-audit*.json`, `dependabot-alerts.json` |
| Unrelated doc edits | Unless required for Open deploy (see §7 commit manifest) |

These may remain in the working tree or a separate docs branch; they must not block or contaminate the Open web deploy.

---

## 6. Epic 4.1 — Manual sign-off (required before outbound)

Command Team: complete at **1440px** and **390px** on staging/production `https://www.openportfolio.co.uk/open` (or `/` on Open host).

| # | Check | Pass |
|---|-------|------|
| 1 | No flat shield / hexagon / briefing-room face | [ ] |
| 2 | Each section shows a **distinct** plate (no obvious duplicate paste) | [ ] |
| 3 | Threat exposure HUD readable; metrics match calibration doc | [ ] |
| 4 | SubHero moat carousel — all 3 steps visible / scrollable, no clip | [ ] |
| 5 | Bridge map fireflies land on continents (not open ocean) | [ ] |
| 6 | Packages section has visible art (matrix + terminal HUD) | [ ] |
| 7 | Contact IADs engage on tap; form remains primary CTA | [ ] |
| 8 | Executive form has **signature gold border** (non-negotiable) | [ ] |
| 9 | Amber `#f59e0b` / obsidian `#09090b` only — no fintech blue on landing | [ ] |
| 10 | Hard refresh confirms new plates (`?v=` cache tokens on PNG URLs) | [ ] |

**Sign-off:** _________________ **Date:** _________

Deck PDF side-by-side comparison (Slide 1–3 tier vs web threat/subHero/bridge) is **recommended** but deck artefacts are **not deployed** — use local `docs/seed/design-plates/` or offline PDF only.

---

## 7. Recommended deploy runbook

### Pre-merge

1. Open PR containing **§8 commit manifest only**.
2. Re-run on CI: `npm run verify:open-web-sota && npm run lint && npm run typecheck && npm run build`.
3. Complete §6 checklist on **Vercel Preview** URL for Open host.

### Merge & release

4. Merge to production branch → Vercel production deploy (single monorepo train per `docs/command/deploy-production-gates.md`).
5. Post-deploy smoke (Open host only):
   - `curl -sI https://www.openportfolio.co.uk/` → 200
   - `curl -sI https://www.openportfolio.co.uk/open/landing/plates/web-hero-glass-vault.png` → 200
   - Visual pass §6 on production with hard refresh / incognito.

### Post-deploy

6. Purge edge cache for `/open/landing/plates/*` if CDN serves stale PNGs (plate URLs include `?v={hash}` — new deploy should bust automatically).
7. **Do not** lift Epic 4.3 outbound hold until §6 signed on **production** URL.

---

## 8. Suggested commit manifest (Open SOTA deploy PR)

```
app/open/_components/OpenContactForm.tsx
app/open/_components/OpenLandingClient.tsx
app/open/_components/OpenLandingVisual.tsx
app/open/_components/OpenStorySection.tsx
app/open/_components/OpenLandingDigitalFootprintMap.tsx
app/open/_components/OpenLandingPackageTerminal.tsx
app/open/_components/OpenLandingPlateOverlay.tsx
app/open/_components/OpenLandingSovereignGrid.tsx
app/open/_components/briefing-iad/**

lib/open-landing-visuals.ts
lib/open-landing-plate-cache.ts

public/open/landing/plates/**

scripts/sync-open-web-plates.mjs
scripts/verify-open-web-sota-parity.mjs
scripts/lib/plate-crop.mjs
scripts/generate-open-landing-visuals.mjs  (deprecated header)

package.json
package-lock.json

tests/unit/surface-host.spec.ts

docs/seed/open-portfolio-web-sota-brief.md
docs/seed/SOTA-PARITY-QA-GATE.md
docs/command/claims-vs-codebase-calibration.md
docs/command/operation-sota-parity-prod-readiness-2026-05-25.md  (this report)
```

Optional (if already reviewed): `CLAUDE.md` calibration line, `docs/command/deploy-production-gates.md`.

---

## 9. Known gaps & Phase 2 (non-blocking)

| Gap | Mitigation today | Phase 2 |
|-----|------------------|---------|
| Epic 3.2 net-new plates (wafer / vault finals) | Interim deck crops + HUD/IAD overlays | Design drops PNGs into `public/open/landing/plates/` — re-run sync not required if filenames unchanged |
| `packages` shares slide-05 source with `contact` (distinct crops) | Byte-distinct hashes; different motion layers | Dedicated substrate matrix render |
| Stateless Chess uses demo engine, not live API | Explicit “demo mode” label in UI | Rate-limited `/api/ai/chat` demo endpoint (optional) |
| Epic 4.1 not yet signed | Engineering GO only | Command Team visual pass |

---

## 10. Risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Stale plate CDN cache | Medium | `plateSrc(?v=hash)` + post-deploy smoke |
| IAD perceived as “games” | Medium | IAD framing, executive copy, form-first layout |
| chess.js bundle on landing | Low | ~181 kB First Load JS total for `/open`; acceptable for B2B landing |
| Accidental deck PDF deploy | Low | §5 exclusion list + PR review |
| Claims drift (zero-server etc.) | High | `claims-vs-codebase-calibration.md`; chess labeled demo-only |

---

## 11. Command Team verdict

**Engineering:** Ready for production deploy of Open Portfolio web updates.  
**Product / Design:** Epic 4.1 manual sign-off required before institutional outbound.  
**Scope discipline:** Deploy Open web only; keep PDF/PPTX and business-ops artefacts out of this release.

**Recommended commit message (when approved):**

```
Ship Operation SOTA Parity Phase 1 on Open Portfolio landing — plates, HUDs, IADs, and build gates.

Replaces flat SVG heroes with baked deck plates, motion overlays, briefing console IADs, and automated verify gate. Open host only; deck PDF/PPTX out of scope.
```

---

*Prepared by Engineering — Operation SOTA Parity. Automated verification timestamp: 2026-05-25T19:23Z.*
