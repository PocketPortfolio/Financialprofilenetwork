# Deployment: Tracked vs Untracked

Use this to verify no critical files are left untracked before deploy.

## Core deployment (must be tracked)

All of the following **are tracked** and deployed:

| Area | Path | Purpose |
|------|------|---------|
| Book routes | `app/book/layout.tsx`, `app/book/sovereign-intelligence/page.tsx`, `app/book/sovereign-intelligence/SovereignIntelligenceBookShell.tsx`, `app/book/universal-llm-import/*` | `/book/sovereign-intelligence`, `/book/universal-llm-import` |
| Book API | `app/api/book-assets/[[...path]]/route.ts` | Serves `docs/book/` (figures, covers) at `/api/book-assets/` |
| Book content | `docs/book/SOVEREIGN-INTELLIGENCE-BOOK.md`, `docs/book/UNIVERSAL-LLM-IMPORT-BOOK.md` | Markdown source for both books |
| Book assets | `docs/book/assets/covers/*.svg`, `docs/book/figures/si-figure-*.svg`, `docs/book/figures/figure-*.svg`, `docs/book/assets/chapter-headers/*` | Covers and figures served by book-assets API |
| Other app | All other `app/**` under version control | Pages, API routes, components |

## Intentionally untracked (do not commit)

| Path | Reason |
|------|--------|
| `coverage/` | Test coverage output (now in `.gitignore`) |
| `.next/` | Build output |
| `node_modules/` | Dependencies |
| `.env`, `.env.local`, `.env.*` | Secrets (use Vercel env) |

## Optional untracked (safe to leave or add)

| Path | Notes |
|------|--------|
| `docs/book/POCKET-ANALYST-BLUEPRINT.md`, `docs/book/SOVEREIGN-INTELLIGENCE-PEER-REVIEW.md`, `docs/book/assets/covers/README.md` | Supplementary docs; not required for live book pages |
| `docs/SECURITY-GCP-IMMEDIATE-ACTIONS.md`, `docs/SUPPORT-FORM.md` | Internal docs; add if you want them in repo |
| `public/book-assets/figures/si-figure-*.svg` | Optional static copy; app uses `/api/book-assets` from `docs/book/figures/` |
| `pocketanalyst.mp4`, `public/pocketanalyst.mp4` | **Do not commit** – large binary. Use Cloudinary + `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` |
| `.cursor/plans/` | Editor/IDE; not deployment |
| `scripts/enable-rls-system-settings.ts`, `scripts/test-support-api.js` | Utility/test scripts; add if part of team workflow |

## Quick verify before deploy

```bash
# Core book route and assets
git ls-files app/book/ docs/book/SOVEREIGN-INTELLIGENCE-BOOK.md docs/book/assets/covers/ docs/book/figures/si-figure | head -30

# Should see: sovereign-intelligence/page.tsx, both covers, all si-figure-*.svg
```

If any of those are missing, run `git add` for the missing paths, then commit and push.
