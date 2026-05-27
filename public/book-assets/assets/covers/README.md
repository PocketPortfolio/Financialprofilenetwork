# Book covers — Pocket Portfolio Technical Press

Branded cover art for the Technical Press series. **Terminal / Pro Reference Manual** aesthetic: dark surfaces, amber accent (`#f59e0b`), no generic fintech blue.

## Assets

| File | Book | Use |
|------|------|-----|
| `sovereign-intelligence-cover.svg` | Sovereign Intelligence: Building Local-First RAG for Finance | Hero on `/book/sovereign-intelligence`, PDF, print |
| `universal-llm-import-cover.svg` | Universal LLM Import: Building Local-First, Sovereign CSV Ingestion | Hero on `/book/universal-llm-import`, PDF, print |

**Aspect ratio:** 1200×630 (same as OG/social cards).

## Design system

- **Background:** `#0b0d10` → `#111418` (brand `--bg` / `--surface`)
- **Accents:** Amber gradient `#fbbf24` → `#f59e0b` (`var(--accent-warm)`)
- **Structure:** `#1c232b` borders, amber micro-grid at 6% opacity
- **Type:** Inter for titles; monospace for imprint and pipeline labels
- **Imprint:** “POCKET PORTFOLIO TECHNICAL PRESS” — small caps, letter-spacing, muted grey

## Serving

- **Source of truth:** `docs/book/assets/covers/`
- **Web app:** Copied to `public/book-assets/assets/covers/` by `npm run build:book-assets`
- **OG/social:** Book pages use `/api/og?title=...` (amber terminal card); hero covers are the SVGs above

## Export for print/PDF

Export SVGs to PNG at 1200×630 or 2400×1260 (2×) for sharp output.
