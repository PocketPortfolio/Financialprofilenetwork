# CoderLegion — Sovereign Engineering Serial

## Technical & Editorial Audit (April 2026)

**Status:** Green (structural + narrative), pending Part 4 GA4 refresh at launch window.  
**Audience:** Command team, MIDAS / Invest Manchester / Route to Rise stakeholders, editorial.  
**Scope:** Twelve-part CoderLegion serial (`content/coderlegion-sovereign-engineering-serial/`), manifest, first-party MDX mirrors, cover assets.

---

### Executive summary

| Item | Detail |
|------|--------|
| **Series slug** | `sovereign-engineering-serial` |
| **Cadence** | Fridays, **10:00 UTC** (isolated from other CoderLegion serials) |
| **Canonical (current)** | `https://www.pocketportfolio.app/book/sovereign-intelligence` |
| **Covers** | `se-01.png` … `se-12.png` (2400×1260); `node scripts/generate-sovereign-engineering-cover-pngs.mjs` |
| **Engineering backstop** | `docs/IP-TECHNICAL-MECHANISMS.md` |

The serial bridges **startup velocity** and **institutional rigor**: Parts **1–9** are implementation-grounded; **10** is **roadmap**, **11** is **vision** with **bank-grade data-handling posture** (not certification cosplay); **12** closes with **UK engineering base, global reach** for **Route to Rise** and **MIDAS** narratives.

---

### Schedule and source files

| # | Publish (Fri) | File |
|---|---------------|------|
| 1 | 2026-04-10 | `01-end-of-data-export-compliance-trap.md` |
| 2 | 2026-04-17 | `02-split-brain-client-context-server-reasoning.md` |
| 3 | 2026-04-24 | `03-sanitization-by-construction-edge-compiler.md` |
| 4 | 2026-05-01 | `04-viral-scale-post-mortem-ga4.md` |
| 5 | 2026-05-08 | `05-local-first-browser-vault.md` |
| 6 | 2026-05-15 | `06-prompt-grounding-system-prompt.md` |
| 7 | 2026-05-22 | `07-viral-loop-referral-events.md` |
| 8 | 2026-05-29 | `08-amber-terminal-email-css.md` |
| 9 | 2026-06-05 | `09-privacy-first-admin-analytics.md` |
| 10 | 2026-06-12 | `10-roadmap-universal-statement-parser.md` (`status: roadmap`) |
| 11 | 2026-06-19 | `11-vision-stateless-b2b-gateway.md` (`status: vision`) |
| 12 | 2026-06-26 | `12-global-frontier-route-to-rise.md` |

---

### Per-part themes (review matrix)

- **Part 1** — Sovereignty as architecture philosophy; stateless chat; telemetry vs payload; residency vs sovereignty.
- **Part 2** — Split-brain: edge memory, cloud reasoning, `buildPortfolioContext`.
- **Part 3** — Structural exclusion (“edge compiler”); import vs AI boundary.
- **Part 4** — GA4 window + referral/stateless infra (verify metrics at publish).
- **Part 5** — Guest localStorage, authenticated trades, prefs, quota behavior.
- **Part 6** — `SYSTEM_PROMPT`, context block, quotes, attachments (“CFA-grade” as layered engineering).
- **Part 7** — Referral events; no portfolio fields in growth schema.
- **Part 8** — Amber Terminal email as code (`viral-moment-announce-email.ts`).
- **Part 9** — `/api/admin/analytics` aggregates; operator console, not holdings SQL.
- **Part 10** — PDF/statement pipeline as roadmap; no shipped-PDF claim.
- **Part 11** — B2B/VPC vision; **bank-grade = data-handling posture** (local-first, bounded egress, stateless inference, telemetry split); attestations parallel, not prerequisite to stating posture.
- **Part 12** — **The Global Frontier — UK Engineering, Global Reach (Route to Rise)**; Greater Manchester / Salford; MIDAS & Invest Manchester ecosystem; serial recap + GA4 geography discipline.

---

### Cleanup sprint executed (April 2026)

1. **Voice polish (Parts 2–9)** — Removed **`Hook:`** scaffolding; hook copy folded into opening **lead-in** paragraphs for immersive CoderLegion narrative.
2. **Part 12 title alignment** — Standardized YAML + manifest + H1 narrative to **Part 12: The Global Frontier — UK Engineering, Global Reach (Route to Rise)**; added **From Greater Manchester to the world** (Salford/Manchester, MIDAS, Invest Manchester).
3. **Part 11 guardrail** — **Bank-grade** explicitly framed as **data-handling posture** (zero-trust-aligned minimization), **not** a replacement for named certifications (e.g. SOC 2) counterparties may still require.
4. **GROWTH-TEAM.md** — Pre-publish CTA checklist aligned to **book + try app** only (no optional internal doc link in footer).

---

### Final pre-launch checklist

| Item | Status | Owner |
|------|--------|--------|
| **GA4 refresh (Part 4)** | Pending (~24h before launch) | Data / growth |
| **Amber cover PNGs** | Generated `se-01.png`–`se-12.png` | Design / eng |
| **Canonical URL** | Book URL `/book/sovereign-intelligence` | Editorial |
| **MIDAS / Manchester alignment** | Part 12 body + MDX | CEO / editorial |

---

### Positioning statement (internal)

The **Sovereign Engineering** manifesto positions Pocket Portfolio as **technical authority** in financial AI: not only consuming models, but **re-engineering the safety layer**—stateless inference, client-side compilation, minimal central custody—appropriate for a **$100T-class** industry’s data expectations, articulated without waiting on every formal attestation to describe **how the system behaves**.

---

### Tables (syndication + blog)

Pipe-style GFM tables with bold/code inside cells failed to render reliably (e.g. CoderLegion preview). **Parts 1, 3, 4, 12** (CoderLegion `.md`) and **Part 4** MDX mirror now use **semantic HTML `<table>`** blocks. See manifest note in `content/coderlegion-sovereign-engineering-serial.md`.

### Document control

- **Saved:** `docs/CODERLEGION-SERIES-AUDIT-APRIL-2026.md`
- **Related:** `content/coderlegion-sovereign-engineering-serial.md`, `content/coderlegion-sovereign-engineering-serial/GROWTH-TEAM.md`
