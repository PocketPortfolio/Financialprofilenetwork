# Deploy: Serverless 250MB Fix + Autonomous Blog Verification

## What was fixed

- **Cause:** `/api/admin/analytics` was bundling `public/images/blog` (233 MB) into the serverless function, exceeding Vercel’s 250 MB limit.
- **Change:** `next.config.js` now has `outputFileTracingExcludes` so `public/images/blog/**` is not traced into API routes. Blog images stay as static assets.

## 1. Deploy (run locally)

Git had a lock in the automation environment. Run in your repo:

```bash
git add next.config.js
git commit -m "fix: exclude public/images/blog from API serverless bundles (fix 250MB limit)"
git push origin main
```

Vercel will build from `main`. The build should complete without the “Serverless Function has exceeded 250 MB” error.

## 2. Verify build

- In Vercel: Project → Deployments → latest deployment → Build should succeed.
- In the build log you should **not** see “Max serverless function size of 250 MB almost reached” for `api/admin/analytics` with `public/images/blog` in “Large Dependencies”.

## 3. Zero-touch autonomous blog

- **Generate blog (GitHub Actions):** `.github/workflows/generate-blog.yml`  
  - Runs: every hour, every 2 hours, 09:00 UTC, **18:00 UTC** (research posts).  
  - Generates today’s research post when `date <= today` and `status === 'pending'`, then commits and pushes (triggers Vercel).
- **Research drop (Vercel Cron):** `vercel.json` → `/api/cron/research-drop` at **18:30 UTC** (30 18 * * *).  
  - Posts the latest research post to Twitter/X.  
  - Requires `CRON_SECRET` in Vercel.

## 4. Today’s scheduled post (2026-02-20)

- **Calendar:** `content/research-calendar.json` → date `2026-02-20`, slug `research-risk-calculation-performance-monte-carlo-vs-analytical-2026-02-20`, status `pending`.
- **Publish flow:**  
  1. GitHub Action runs at 18:00 UTC (or next hourly run): generates MDX + image, sets status to `published`, pushes.  
  2. Vercel deploys from that push.  
  3. At 18:30 UTC, Vercel Cron calls `/api/cron/research-drop` → Twitter post.

**If today’s post isn’t generated yet:**

- Trigger the workflow manually: GitHub → Actions → “Generate Blog Posts” → “Run workflow”.
- Or wait for the next scheduled run (top of the hour or 18:00 UTC).

## 5. Quick checks after deploy

1. **Build:** Vercel deployment green, no 250 MB error.
2. **Blog page:** `https://www.pocketportfolio.app/blog/research-risk-calculation-performance-monte-carlo-vs-analytical-2026-02-20` returns 200 (after the post is generated and deployed).
3. **Cron:** In Vercel → Project → Crons, confirm `/api/cron/research-drop` is scheduled for 18:30 UTC and that it runs (check Logs or trigger once with `Authorization: Bearer <CRON_SECRET>`).
