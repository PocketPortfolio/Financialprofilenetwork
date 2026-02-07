# Deploy to Prod + Autonomous Blog Engine Verification (Feb 2026)

**Date:** 2026-02-07  
**Push:** `fa14484` → `main` (06d6552..fa14484)

---

## 1. What Was Pushed

- **Build fix:** Importer now exports `genericParse`, `parseUniversal`, and universal types from the main entry; root build runs `build:importer` before Next.js so Vercel gets a valid dist.
- **Universal source in repo:** `packages/importer/src/universal/` is committed so the importer builds correctly on CI/Vercel.

---

## 2. What Happens Next

### Vercel (automatic)

1. **Trigger:** Push to `main` (your push).
2. **Build:** Vercel runs `npm ci` then `npm run build`:
   - `build:importer` → compiles `packages/importer` (dist with universal API).
   - `build:sitemaps` → sitemaps (including blog).
   - `build:inject-firebase` → Firebase config.
   - `next build` → Next.js production build (no more “genericParse/parseUniversal not exported”).
3. **Deploy:** If the build succeeds, the current `main` branch (including all content in `content/posts/`) goes live.

### Autonomous blog engine

- **Flow:** `generate-blog.yml` runs on schedule (hourly, every 2h, 09:00 UTC, 18:00 UTC). It generates due posts, commits and pushes to `main`, then runs “Deploy to Vercel Production” (vercel-action) in the same run.
- **Previously:** When the workflow pushed, Vercel’s build failed (missing universal exports / missing files). So the site never updated even though the blog workflow had committed new posts.
- **Now:** With the build fixed, the next time either:
  - **This push’s build** completes successfully → everything currently on `main` (including all existing blog posts in the repo) is deployed to the frontend.
  - **A future blog workflow run** pushes → that commit will also build and deploy, so new generated posts will go live.

---

## 3. How to Verify

### A. Vercel build (this push)

1. Open the Vercel dashboard for this project.
2. Find the deployment for commit `fa14484` (or latest on `main`).
3. Confirm **Build** completed successfully (no “genericParse/parseUniversal” or “ColumnMappingModal/brokers” errors).
4. Confirm **Deployment** is “Production” and the URL is live.

### B. Blog content on the frontend

1. **Blog index:**  
   `https://www.pocketportfolio.app/blog`  
   - Should list all posts that exist in `content/posts/` and are exposed by the app (e.g. 118+ entries if sitemap-blog-v3 matches).

2. **Sitemap:**  
   `https://www.pocketportfolio.app/sitemap-blog-v3.xml`  
   - Should include one `<loc>` per blog URL. Count should match the number of generated blog pages (e.g. 118 in recent build logs).

3. **Sample posts:**  
   Open a few slugs from `content/posts/*.mdx` (e.g. from blog index or sitemap) and confirm they load and render.

### C. Autonomous blog engine health

1. **GitHub Actions:**  
   https://github.com/PocketPortfolio/Financialprofilenetwork/actions  
   - **generate-blog:** Next run will generate due posts (date ≤ today, status `pending`), commit, push, and deploy. After our fix, that deploy should succeed.
   - **deploy (deploy.yml):** Runs on every push to `main`; this push will trigger it. Check that the run for `fa14484` succeeds.

2. **Calendars (for context):**  
   - `content/blog-calendar.json` – main blog schedule.  
   - `content/research-calendar.json` – research pillar.  
   - `content/how-to-tech-calendar.json` – how-to.  
   Posts with `status: 'pending'` and `date <= today` are what the engine will generate next.

---

## 4. “1800 generated posts” note

- The **sitemap build** in recent logs reported **118 blog pages** (sitemap-blog-v3). If “1800” refers to something else (e.g. total scheduled entries across calendars, or a different metric), the same principle applies: **any post that is already in the repo** (under `content/posts/` and wired into the blog/sitemap) **will be included in this deploy** once the Vercel build succeeds.
- Posts that were **never committed** (e.g. generated in a failed workflow run where the job died before commit) are not in the repo and will not appear until a future successful run generates and commits them.

---

## 5. Quick checklist

| Step | Action |
|------|--------|
| 1 | Confirm Vercel deployment for `fa14484` (or latest `main`) – **Build: Success** |
| 2 | Open production URL and check `/blog` – all expected posts listed |
| 3 | Open `sitemap-blog-v3.xml` – count and sample URLs correct |
| 4 | In GitHub Actions, confirm deploy workflow for this push succeeded |
| 5 | On next generate-blog run, confirm it commits and that the resulting Vercel deploy succeeds |

Once the build is green and the checklist passes, the autonomous blog engine and the current set of generated posts are deployed and verified.
