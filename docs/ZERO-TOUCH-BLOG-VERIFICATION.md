# Zero-Touch Blog Engine – Verification

This doc describes how the autonomous blog works, how to verify it in production, and guardrails so the "posts disappeared" regression cannot recur (§7–§8).

---

## 1. What “zero touch” means

- **Calendars** (`content/blog-calendar.json`, `content/how-to-tech-calendar.json`, `content/research-calendar.json`) define scheduled posts with `date`, `slug`, `title`, and `status: "pending"`.
- **GitHub Action** “Generate Blog Posts” (`.github/workflows/generate-blog.yml`) runs on a schedule (hourly, every 2 hours, 09:00 UTC, 18:00 UTC). It finds entries where `date <= today` and `status === 'pending'`, generates MDX + image via OpenAI, writes to `content/posts/<slug>.mdx` and `public/images/blog/<slug>.png`, sets `status` to `published` and sets `publishedAt`, then commits and pushes.
- **Vercel** deploys on every push to `main`, so new posts go live without manual deploy.
- **Crons** (e.g. `/api/cron/research-drop` at 18:30 UTC) can post to Twitter/X; they require `CRON_SECRET` in Vercel.

No manual steps are required for scheduled posts once the workflow and secrets are configured.

---

## 2. Production fixes (already applied)

| Issue | Fix |
|--------|-----|
| Serverless 250 MB limit | `next.config.js` → `outputFileTracingExcludes`: `public/images/blog/**` excluded from `/api/**` so API routes stay under 250 MB. |
| Blog listing empty in prod | `outputFileTracingIncludes`: `/api/blog/posts` includes `./content/posts/**` so the API can read MDX in the serverless bundle. |
| Single post page “Something went wrong” | `outputFileTracingIncludes`: `/blog` includes `./content/posts/**` and the three calendar JSON files so `/blog/[slug]` can read content. |
| Build warning (multiple lockfiles) | `outputFileTracingRoot: __dirname` in `next.config.js` so tracing uses the project root. |

---

## 3. Pre-deploy checklist (zero-touch blog)

- [ ] `next.config.js` has `outputFileTracingIncludes` for `/api/blog/posts` and `/blog`, and `outputFileTracingExcludes` for `public/images/blog/**` on API routes.
- [ ] `outputFileTracingRoot: __dirname` is set (optional but removes lockfile warning).
- [ ] GitHub secrets: `OPENAI_API_KEY` (required for generator), `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (for deploy after generate). Optional: `YOUTUBE_API_KEY` for research posts.
- [ ] Vercel: `CRON_SECRET` set if using cron endpoints (e.g. research-drop).

---

## 4. Post-deploy verification (production)

1. **Blog listing**
   - Open: https://www.pocketportfolio.app/blog  
   - “Building in Public” should show three sections with posts (Pocket Portfolio Posts, How to in Tech, Research). No empty lists.

2. **Posts API**
   - `GET https://www.pocketportfolio.app/api/blog/posts`  
   - Response must be a non-empty array of post objects (slug, title, date, etc.).

3. **Single post**
   - Open any post URL, e.g.  
     https://www.pocketportfolio.app/blog/stop-building-fintech-with-databases-why-i-went-local-first-  
   - Page must load (200) with content. No “Something went wrong”.

4. **Admin analytics**
   - Build must complete on Vercel without “Serverless Function has exceeded 250 MB”.  
   - `/admin/analytics` should show blog analytics; “Files missing” in prod is inferred from calendar (no `fs` check of `content/posts` in prod).

5. **Generate Blog Posts workflow**
   - GitHub → Actions → “Generate Blog Posts” → Run workflow (manual run).  
   - Check that it finds due posts, generates MDX + image, commits and pushes. Next Vercel deploy will include the new post.

---

## 5. Current state (as of last update)

- **Published and with MDX:** All blog/how-to/research posts with `date` from 2026-01-* through 2026-02-22 that are `published` have corresponding `.mdx` files in `content/posts` (and images where applicable).
- **Pending (date ≤ today, not yet generated):**
  - **Blog (Pocket Portfolio):** 2026-02-23 – “Sovereign Sync: Frequently Asked Questions” (`sovereign-sync-frequently-asked-questions`) – `status: "pending"`, no MDX yet.
  - **How-to:** 2026-02-23 – “How to Export Data to CSV from JSON” (`how-to-export-data-to-csv-from-json`) – pending.
  - **Research:** 2026-02-23 – “Research: Blockchain Transaction Throughput - Layer 2 Solutions” (`research-blockchain-transaction-throughput-layer-2-solutions-2026-02-23`) – pending.

These will be generated on the next successful run of “Generate Blog Posts” (scheduled or manual). After that run commits and pushes, Vercel will deploy and the new posts will be live.

---

## 6. References

- **Deploy and serverless fixes:** `docs/DEPLOY-FIX-SERVERLESS-250MB.md`
- **Prepare for prod (full app):** `docs/PREPARE-FOR-PROD.md`
- **Workflow:** `.github/workflows/generate-blog.yml`
- **Generator script:** `scripts/generate-autonomous-blog.ts`

---

## 7. Guardrails (so this never happens again)

| Guardrail | What it does |
|-----------|----------------|
| **Config assertion** | Before every deploy, `scripts/verify-blog-tracing-config.js` runs (in deploy workflow). It checks that `next.config.js` contains the required `outputFileTracingIncludes` keys and paths. If someone removes them, the deploy workflow **fails** before `vercel deploy`. Run locally: `npm run verify-blog-tracing`. |
| **Health endpoint** | `GET /api/blog/health` reads `content/posts` the same way the posts API does. If the directory is missing or has **zero** `.mdx` files, it returns **503** with a message pointing to `outputFileTracingIncludes`. You can monitor this URL (e.g. uptime check); 503 means the bundle regressed. |
| **Post-deploy check** | After a successful Vercel deploy, the deploy workflow waits 45s then calls `GET https://www.pocketportfolio.app/api/blog/posts`. If the response has fewer than 5 posts, the workflow **fails** (step turns red). So a deploy that would cause "posts disappeared" is caught immediately. |

Together: **wrong config** → deploy never completes (config assertion). **Right config but broken bundle** → deploy completes but verification step fails (post-deploy check). **Runtime regression** → health returns 503 (monitoring).

---

## 8. Never remove

- **In `next.config.js`:** Do **not** remove or rename:
  - `outputFileTracingIncludes['/api/blog/posts']` → `['./content/posts/**']`
  - `outputFileTracingIncludes['/api/blog/health']` → `['./content/posts/**']`
  - `outputFileTracingIncludes['/blog']` → `['./content/posts/**', ...calendars]`
- If you change the structure (e.g. move posts to another dir), update the includes **and** the posts API, health route, and blog page to use the new path; then run `npm run verify-blog-tracing` and the deploy workflow will keep enforcing the new paths once you update the script.
