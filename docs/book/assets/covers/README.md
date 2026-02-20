# Book covers — Pocket Portfolio Technical Press

Branded, futuristic cover art for the Technical Press series. Designed to fit the platform theme (dark base, gradient orbs, green–blue accent, Inter typography) and to read as authoritative technical books.

## Assets

| File | Book | Use |
|------|------|-----|
| `sovereign-intelligence-cover.svg` | Sovereign Intelligence: Building Local-First RAG for Finance | Hero/OG, PDF, print |
| `universal-llm-import-cover.svg` | Universal LLM Import: Building Local-First, Sovereign CSV Ingestion | Hero/OG, PDF, print |

**Aspect ratio:** 1200×630 (same as OG/social cards). Safe for web, export, and social previews.

## Design system

- **Background:** `#0b1220` (brand dark)
- **Accents:** Gradient green `#34d399` → blue `#2563eb`; sky `#0ea5e9` in orbs
- **Type:** Inter (or system-ui fallback); heavy weight for titles, medium for subtitles
- **Imprint:** “POCKET PORTFOLIO TECHNICAL PRESS” — small caps, letter-spacing, muted grey
- **Futuristic elements:** Soft gradient orbs (blur), subtle grid or flow patterns, minimal abstract shapes (bridge/pipeline) to suggest theme without clutter

## Serving

- **In app:** Covers are under `docs/book/assets/covers/` and are served by `/api/book-assets/assets/covers/<filename>.svg`.
- **OG/social:** Book pages use dynamic `/api/og?title=...&description=...` for social cards; these SVGs can be used as custom OG images if you add a raster export (e.g. PNG) for platforms that don’t support SVG.

## Export for print/PDF

For PDF or print, export SVGs to PNG at 1200×630 or 2400×1260 (2×) for sharp output. Use the same files from this folder in the book build pipeline (e.g. title page or cover page).
