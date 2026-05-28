---
title: "Part 11: Designing the Local-First UX Narrative"
date: "2026-08-03"
tags: ["engineering", "design", "ux", "branding", "tailwind"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-11.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Designing the Local-First UX Narrative: Terminal Gravity Without Fintech-Blue Defaults

Users infer trust from **density and restraint** — not from gradient-blue “fintech SaaS” skins. Pocket Portfolio’s design system encodes **terminal / pro reference manual** gravity: high information density, subtle borders, warm amber accent — while persistence remains **hybrid** (Part 4). The UI metaphor does not erase Firebase for signed-in users.

---

## Brand guards (non-negotiable)

From `CLAUDE.md` and calibration:

- **Primary accent:** `var(--accent-warm)` / `#f59e0b` (amber) — CTAs, FABs, active states.
- **Surfaces:** `var(--surface)`, `var(--background)` for dark/light consistency.
- **Borders:** `var(--border-subtle)` for grid lines and panels.
- **Forbidden:** generic fintech blue — `bg-blue-500`, `#0070f3` gradients in product and **serial cover art**.

Open surfaces lock theme via `OpenSurfaceThemeLock.tsx` so B2B pages do not drift into consumer pastel skins.

---

## Terminal density vs “indie tracker”

| Indie tracker pattern | Our direction |
| --- | --- |
| Pastel cards, oversized whitespace | Compact tables, monospace-adjacent labels |
| Single-number hero only | Totals **plus** top-N breakdown preview |
| Blue primary buttons | Amber primary; zinc neutrals |
| Hidden import complexity | Visible import / harness receipts (Part 6) |

Landing and dashboard shells expose **import status**, **allocation rows**, and **Ask AI** in the same visual language — one coherent “operator terminal.”

---

## Local-first **narrative** without overclaim

Copy on `/learn/local-first` and Open learn routes should say:

- Interaction and ingestion default **on device**.
- Signed-in users still have **cloud-authoritative** trades.
- Ask AI sends **bounded context**, not “nothing.”

Design supports the story; **architecture** proves it (Parts 2–3).

---

## Email and off-platform brand

`content/coderlegion-sovereign-engineering-serial/08-amber-terminal-email-css.md` documents **brand-as-code** for email — same `#0a0a0a` / `#f59e0b` tokens. CoderLegion covers for **this** serial use `#09090b` backgrounds (see `scripts/generate-sovereign-ingestion-cover-pngs.mjs`).

---

## Checklist for new UI PRs

1. No new blue primary classes without explicit exception.
2. Tables readable at 1280px without hiding critical compliance hints.
3. Copy reviewed against `claims-vs-codebase-calibration.md` if mentioning “local” or “sovereign.”

---

*Part 11 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**
