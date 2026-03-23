# LinkedIn **company page** cover banner

## Spec (LinkedIn)

- **Aspect ratio:** ~6:1 (5.9:1)
- **Dimensions:** **1128 × 191** px  
- **Formats:** JPG or PNG · **max 8 MB**

## Production file (repo)

| File | Notes |
|------|--------|
| `public/marketing/linkedin-company-banner-1128x191.png` | Exact **1128×191** PNG (~143 KB). |

**After deploy:**  
`https://www.pocketportfolio.app/marketing/linkedin-company-banner-1128x191.png`

## Brand alignment (codebase)

- **Primary accent:** Amber **`#f59e0b`** (matches `var(--accent-warm)` / CLAUDE.md).
- **Surfaces:** Deep slate **`#020617`**; muted text **`#94a3b8`**, **`#64748b`**.
- **Aesthetic:** Terminal / pro reference manual — hairline grid, monospace kicker, no generic fintech blue hero treatment.
- **Copy:** Sovereign AI · edge aggregation · truncated payloads · zero retention at inference; URL **pocketportfolio.app**.

## Source generation

A wider source render was produced, then resized with **sharp** to hit LinkedIn’s exact pixel spec. Editable source PNG (pre-resize) may live under Cursor assets as `linkedin-company-banner-brand.png` if you need to re-export.

## Upload path (LinkedIn)

Company Page → **Edit** → **Upload cover image** → select `linkedin-company-banner-1128x191.png`.

LinkedIn may crop differently on mobile; keep critical text away from extreme edges if you iterate.
