# Pre-Deploy Status

**Date:** February 2025

## ✅ Completed

| Step | Result |
|------|--------|
| **Lint** | Passed — no ESLint warnings or errors |
| **Production build** | Passed — sitemaps, Firebase inject, Next.js build |

## ⚠ Note

- **Typecheck** (`npm run typecheck`): Fails only in **test files** (ThemeSwitcher.test.tsx, import specs). App and API code typecheck; Next.js build does not run these test files.
- **Tests**: Pre-existing failures (waitlist, ThemeSwitcher, etc.). Not required for Vercel deploy; CI runs them as non-blocking.

## 🚀 Deploy to Production

Deployment is handled by **GitHub Actions** (`.github/workflows/deploy.yml`):

1. **Push to `main`** — commits to `main` trigger "Deploy to Vercel" and deploy to production.
2. **Or** run the workflow manually: Actions → "Deploy to Vercel" → "Run workflow".

**Required GitHub secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (and any env vars your app needs in Vercel project settings).

### After deploy

- Confirm production env has **Firebase Admin** vars so `/api/scarcity` works (Founder’s Club counter).
- Smoke test: landing, `/import`, dashboard import modal, sponsor page (desktop + mobile), banners.
