---
id: POCKET-WEB-SOTA-BRIEF-2026-05-25
title: Pocket Portfolio Web — B2C SOTA Visual Parity Brief
status: IN_PROGRESS
parent: docs/seed/open-portfolio-web-sota-brief.md
claims_ssot: docs/command/claims-vs-codebase-calibration.md
sprint: Operation SOTA Parity (B2C)
output_dir: public/pocket/landing/plates/
source_dir: docs/seed/pocket-design-plates/
---

# Pocket B2C SOTA brief — landing visual parity

**Sprint goal:** Elevate `www.pocketportfolio.app` to Tier-1 infrastructure aesthetics (obsidian + amber) using the same plate pipeline as Open Portfolio — **without** B2B procurement semantics.

**Scope:** Five audited landing sections only. Hero (`AnalystVideo` / dropzone) stays unchanged in Phase 1.

**Copy:** Existing landing prose; visuals only. Claims governed by `docs/command/claims-vs-codebase-calibration.md`.

---

## 1. Governance

### Reject

| Pattern | Example on current B2C landing |
|---------|----------------------------------|
| Slate-blue / shadcn card backgrounds | Why Choose `hsl(var(--card))` |
| Teal/emerald marketing banners | Ad-Free Promise `rgba(16,185,129,…)` |
| Emoji clip-art | Ad-Free 🚫, Early Access 🚀 |
| Flat yellow stroke product cards | Product Portal 2px borders |
| Flat newsroom SVG wireframes | `/newsroom/art/*.svg` |
| Fintech blue accents | Google Drive badge shadows (non-brand) |
| B2B deck semantics on Pocket | Legacy cloud, moat HUD, npm terminal crops |

### Approve

| Requirement | Standard |
|-------------|----------|
| Surface | Obsidian `#09090b` (landing-scoped `.pocket-landing-sota`) |
| Accent | Warm amber `#f59e0b` only |
| Depth | Macro DOF plates + HTML HUD overlays |
| Typography | HTML/CSS only — zero narrative in PNG pixels |
| Export | PNG sRGB, 3840×2160 baked 16:9 |

**Sovereign Storage:** Art and HUD must not imply zero-server or fully local ledger for signed-in users (Firebase auth path).

---

## 2. Slot mapping (11 slots)

| Slot ID | Section | Output PNG |
|---------|---------|------------|
| `portalTerminal` | Product Portal — The Terminal | `web-portal-terminal.png` |
| `portalStorage` | Product Portal — Sovereign Storage | `web-portal-storage.png` |
| `portalFounders` | Product Portal — Founders | `web-portal-founders.png` |
| `whyChoose` | Why Choose metrics band | `web-why-choose.png` |
| `adFreeInvariant` | Ad-Free Promise | `web-ad-free-invariant.png` |
| `finPillars` | FIN Pillars | `web-fin-pillars.png` |
| `community` | Built with community | `web-community-nodes.png` |
| `newsRegulatory` | News Room `#regulatory` lane | `web-news-regulatory.png` |
| `newsInfra` | News Room `#infra` lane | `web-news-infra.png` |
| `newsWealthTech` | News Room `#wealth-tech` lane | `web-news-wealth-tech.png` |
| `newsMarket` | News Room `#market` lane | `web-news-market.png` |

---

## 3. Design prompts (Epic 3 — net-new)

See Open brief section 3 format. Consumer infrastructure gravity — terminal matrix, sovereign vault, FIN fiber pipeline, community node mesh, news tag library.

Interim Phase 1: neutral abstract crops from `docs/seed/pocket-design-plates/` (synced from shared deck art, no B2B-labelled frames).

---

## 4. Engineering

- SSOT: `lib/pocket-landing-visuals.ts`
- Components: `app/components/pocket-landing/`
- Sync: `npm run sync:pocket-web-plates`
- Verify: `npm run verify:pocket-web-sota`
- QA: `docs/seed/POCKET-SOTA-PARITY-QA-GATE.md`

---

## 5. Out of scope

- Hero refactor (Phase 1)
- Open Portfolio `/open` routes
- Deck PDF/PPTX outbound artefacts
