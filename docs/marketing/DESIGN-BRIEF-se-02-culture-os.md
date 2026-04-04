# Design brief: Culture OS (se-02)

**Asset ID:** `se-02_culture_os`  
**Use:** LinkedIn visual for Part 2 — *Culture — The Invisible OS* (system monitor / calibration narrative).  
**Format:** Static PNG primary (1200×630 for feed); optional short loop GIF (subtle pulse on bus lines or “sync” ticks).

---

## Brand / aesthetic (Pocket Portfolio Amber Terminal)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#000000` | Full bleed |
| Primary glow / traces / key UI | `#FFBF00` | Amber-gold lines, brain outline, buses |
| Fine labels / secondary | `#FFFFFF` or dim `#a1a1aa` tone as white at 70% | Peripheral caps, small log text |
| Accent | none blue | No corporate blue |

**Mood:** System Monitor / `top` for humans—kernel typography, monospace for log footer, thin vector circuitry. No stock photos, no 3D glossy “AI brain” cliché; keep flat or isometric technical illustration.

**Aspect:** Landscape 1200×630 (master may be 1920×1080, export 1200×630).

---

## Core composition

### Center

- Human **brain silhouette** in outline glow (amber `#FFBF00`).
- **Interior** of the silhouette is not organic neurons—it is **motherboard / PCB** pattern: traces, vias, small SMD blocks, readable as “silicon inside the biological shape.”

### Interface (peripherals)

Four **nodes** around the brain (cardinal or balanced layout), each a small terminal-style box or chip package, connected to the brain by **glowing data-bus** lines (parallel traces, subtle animation in GIF phase).

| Label (caps) |
|----------------|
| ENGINEERING |
| GROWTH |
| COMMUNITY |
| STRATEGY |

### Floating data (near connections)

Small monospace snippets (amber or white on black), like HUD readouts:

- `status: CALIBRATED`
- `sync: 100%`
- `error_handling: EMPOWERED`

Place near different buses so the frame feels “live.”

### Footer (system log)

Monospace, left-aligned or centered block, amber prompt style:

```text
SYSTEM LOG: CULTURE.OS
> PROCESS: HARMONY OVER HOMOGENEITY
> STATE: CALIBRATED
```

**Copy QA:** The word is **homogeneity** (one `e` after `g`: …g-e-n-e-i-t-y). Do **not** render **homogeeneity** (double `e`).

Optional: faint `█` cursor blink in GIF only.

---

## Optional GIF (phase 2)

- 2–3s loop: bus lines gentle pulse; `sync: 100%` ticks or subtle opacity wave; brain outline soft breathing glow.
- Keep file size LinkedIn-safe.

---

## Super-power prompt (for image / video tools)

> Landscape infographic on pure black #000000, Pocket Portfolio Amber Terminal aesthetic, glowing amber gold #FFBF00 lines and typography, white secondary text, no blue, no stock photos. Center: human brain silhouette outlined in amber glow, interior filled with detailed motherboard PCB circuitry instead of neurons. Four peripheral modules around it labeled in caps ENGINEERING, GROWTH, COMMUNITY, STRATEGY, each connected to the brain by glowing parallel data-bus lines. Floating monospace code snippets near wires: "status: CALIBRATED", "sync: 100%", "error_handling: EMPOWERED". Footer in monospace must spell exactly: "SYSTEM LOG: CULTURE.OS" then "> PROCESS: HARMONY OVER HOMOGENEITY" then "> STATE: CALIBRATED" — spell HOMOGENEITY as H-O-M-O-G-E-N-E-I-T-Y with exactly ONE E between G and N (correct English word homogeneity), never HOMOGEENEITY with double E. Technical system-monitor dashboard style, minimalist, high contrast, vector-like precision.

---

## File handoff

- **AI draft:** `docs/marketing/se-02-culture-os-diagram.png`
- **Final:** `docs/marketing/se-02-culture-os-1200x630.png`
- **GIF (optional):** `docs/marketing/se-02-culture-os-loop.gif`

Cross-link: `LINKEDIN-PART-2-CULTURE-INVISIBLE-OS.md` when final asset ships.
