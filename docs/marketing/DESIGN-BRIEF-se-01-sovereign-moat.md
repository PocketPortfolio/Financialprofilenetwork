# Design brief: The Sovereign Moat (se-01)

**Asset ID:** `se-01_the_sovereign_moat`  
**Use:** LinkedIn pattern-interrupt visual for Part 1 — *The Sovereign Moat* (supports “moat = architectural choice” narrative).  
**Target deadline:** Tuesday 17:00 BST (24h before Wednesday launch).  
**Format:** Static PNG primary; optional 3s loop GIF as follow-on.

---

## Brand / aesthetic (Pocket Portfolio Amber Terminal)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#000000` | Full bleed, no gradient wash unless extremely subtle |
| Primary glow / lines / key labels | `#FFBF00` | Amber-gold (aligned with Amber Terminal email tokens) |
| Secondary text / fine labels | `#FFFFFF` | Sparingly; mostly dim white or amber-tinted |
| Vulnerable state accent | faint red-amber | Panel A status only — not “error red,” more corrosion |

**Mood:** Architectural blueprint × 1980s mainframe. No stock photography, no generic fintech blue, no human faces. Vector-like precision, thin rules, monospace or technical sans for small labels.

**Aspect:** Landscape for feed (e.g. 1200×630 or 1920×1080 master, export 1200×630 for LinkedIn).

---

## Composition: horizontal dual-panel diagram

### Panel A — left: “The Vulnerable Stack (Leased)”

- **Iconography:** Crumbling castle silhouette built from generic cloud shapes; label: `THE AI WRAPPER (LEASED)` (amber or white small caps).
- **Flow:** Large downward arrows labeled `RAW DATA (PII)` draining into a wide “pit” foundation: `DATA GRAVITY / VENDOR DB`.
- **Status line:** `STATUS: AUDIT-DRIVEN & COMPLIANCE-FRAGILE` — faint red-amber glow, smaller type.

### Panel B — right: “The Sovereign Moat (Engineered)”

- **Iconography:** Geometric fortress / bastion built from **code-block braces** `{ … }`; label: `THE SOVEREIGN MOAT (OWNED)`.
- **Barrier:** Vertical shimmering plane: `EDGE COMPILER / SANITIZATION BY CONSTRUCTION`.
- **Flow:** `RAW DATA` arrow approaches; at the compiler it stops — label `PII BLOCKED` on rejected path. Only narrow channel through: `STATELESS GATEWAY` carrying `SUMS / AGGREGATES / SEMANTIC SUMMARY` (small clean strings, amber).
- **Status line:** `STATUS: ZERO-TRUST & SOVEREIGN-PROOF` — pure amber glow.

### Center (between panels)

Large treatment, stacked lines (all caps or small caps):

```text
THE SOVEREIGN MOAT:
YOUR ARCHITECTURE HANDLES THE COMPLIANCE
SO YOU CAN HANDLE THE INNOVATION.
```

Thin amber frame or hairline box; optional subtle scan-line texture at low opacity.

---

## Optional GIF layer (phase 2)

- **Loop:** ~3s, seamless.
- **Static base:** Diagram as above.
- **Motion:** Edge Compiler barrier pulses / shimmers (high-energy field). Packet labeled `RAW LEDGER` travels left→right, **shatters** on compiler; fragments bounce off; single small **amber photon** (metadata) passes through gateway into fortress.
- **Export:** LinkedIn-friendly resolution and file size (keep under platform limits; test on mobile).

---

## Super-power prompt (for image / video tools)

Use as a single block for generators or external designers:

> Wide horizontal infographic, dual panel comparison on pure black `#000000` background, amber-gold `#FFBF00` linework and typography, white `#FFFFFF` secondary labels, technical blueprint + 1980s mainframe terminal aesthetic, no photographs. LEFT PANEL titled “The Vulnerable Stack (Leased)”: crumbling castle made of cloud icons, label “THE AI WRAPPER (LEASED)”, thick arrows labeled “RAW DATA (PII)” pointing down into a pit labeled “DATA GRAVITY / VENDOR DB”, small status “STATUS: AUDIT-DRIVEN & COMPLIANCE-FRAGILE” in faint red-amber. RIGHT PANEL titled “The Sovereign Moat (Engineered)”: geometric fortress built from code braces, label “THE SOVEREIGN MOAT (OWNED)”, vertical glowing barrier “EDGE COMPILER / SANITIZATION BY CONSTRUCTION”, raw data blocked with “PII BLOCKED”, only thin stream through “STATELESS GATEWAY” labeled “SUMS / AGGREGATES / SEMANTIC SUMMARY”, status “STATUS: ZERO-TRUST & SOVEREIGN-PROOF” in amber. CENTER between panels large text: “THE SOVEREIGN MOAT: YOUR ARCHITECTURE HANDLES THE COMPLIANCE SO YOU CAN HANDLE THE INNOVATION.” Minimal, high contrast, vector-like, no blue, no stock imagery.

---

## File handoff

- **AI draft (review / iterate):** `docs/marketing/se-01-the-sovereign-moat-diagram.png` — first-pass static; design team should align to exact typography, labels, and 1200×630 export.
- **Final static (target):** `docs/marketing/se-01-the-sovereign-moat-1200x630.png` (or `public/book-assets/...` if used on-site)
- **Animated (phase 2):** `docs/marketing/se-01-the-sovereign-moat-loop.gif`

Link from `LINKEDIN-PART-1-SOVEREIGN-MOAT.md` when the final asset is approved.
