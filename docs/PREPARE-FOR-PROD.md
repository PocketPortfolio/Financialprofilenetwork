# Prepare for Production

Unified checklist before deploying to production. Covers build, env, Pocket Analyst (Ask AI), autonomous blog, and the book (Sovereign Intelligence + Universal LLM Import).

---

## Quick prepare (before push)

```bash
npm run typecheck && npm run lint && npm run build
```

Tests: `npm run test` (may need to run outside sandbox on Windows if you see `EPERM` on vitest/esbuild). Deploy workflow (push to `main`) runs `npm ci` and `vercel deploy`; it does **not** run lint/typecheck/test, so run them locally before pushing.

---

## 1. Build and checks

```bash
npm run build
```

Resolves to: `build:importer` → `build:sitemaps` → `build:inject-firebase` → `build:book-assets` → `next build`. Fix any TypeScript or lint errors.

**Optional pre-deploy:**

- `npm run typecheck`
- `npm run lint`
- `npm run test`

---

## 2. Environment variables (Vercel)

Use **Vercel → Project → Settings → Environment Variables** for **Production** (and Preview if you want full features there). See `.env.example` and **`docs/VERCEL-ENV-SUPPORT-ADMIN.md`** for the full list.

### Core (app, auth, admin)

- **Firebase:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Admin SDK).
- **Resend** (if using email): `RESEND_API_KEY`, `EMAIL_FROM`, etc.
- **Admin override:** `ADMIN_EMAIL_OVERRIDE` (optional) for support/admin flows.

### Pocket Analyst (Ask AI)

- **At least one LLM key:** `GOOGLE_GENERATIVE_AI_API_KEY` and/or `OPENAI_API_KEY`. Without both, `/api/ai/chat` returns 503.
- **CRON_SECRET** — required for `/api/cron/ai-usage-reset` (monthly quota reset).
- **NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL** — optional; full URL for landing demo video (e.g. Cloudinary). If unset, landing shows a placeholder.

### Debug and analytics

- **Do not set** `NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS` in production (or set to `false`). Debug ingest is gated behind this.

---

## 3. Autonomous blog (zero-touch)

- **Serverless bundle:** `next.config.js` excludes `public/images/blog/**` from API routes (fixes 250 MB limit) and includes `content/posts/**` and calendar JSON for `/api/blog/posts` and `/blog` so the blog listing and post pages work in production. See **`docs/DEPLOY-FIX-SERVERLESS-250MB.md`**.
- **Crons:** `vercel.json` defines crons (e.g. `/api/cron/research-drop` at 18:30 UTC). Set **CRON_SECRET** in Vercel so cron endpoints can authenticate.
- **Generation:** GitHub Action “Generate Blog Posts” (`.github/workflows/generate-blog.yml`) generates MDX + images and pushes; Vercel deploys on push. No manual step required for scheduled posts once calendars and workflow are set.

**Post-deploy:** Building in Public (`/blog`) should list generated posts; individual post URLs (e.g. `/blog/<slug>`) should load without “Something went wrong”.

---

## 4. Book (Sovereign Intelligence + Universal LLM Import)

- **Figures & covers:** Book images are served from **`/book-assets/`** (static). The build runs `npm run build:book-assets` (copies `docs/book/figures` and `docs/book/assets` to `public/book-assets`), so no manual copy is needed. Ensure `docs/book/figures/` and `docs/book/assets/` are committed.
- **Deploy script:** Use `node scripts/deploy-book-to-prod.js` (or push the same paths) to deploy book-related changes. See **`docs/DEPLOY-BOOK.md`**.

**Live URLs after deploy:**

- Universal LLM Import: **https://www.pocketportfolio.app/book/universal-llm-import**
- Sovereign Intelligence: **https://www.pocketportfolio.app/book/sovereign-intelligence**

---

## 5. Pre-deploy checklist

- [ ] `npm run build` completes successfully
- [ ] **Firebase Admin** set in Vercel (Production): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- [ ] **At least one LLM key** in Vercel (Production): `GOOGLE_GENERATIVE_AI_API_KEY` and/or `OPENAI_API_KEY`
- [ ] **CRON_SECRET** set in Vercel if using crons (recommended for Pocket Analyst monthly quota reset)
- [ ] `NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS` not set (or `false`) in production
- [ ] Blog: `next.config.js` has `outputFileTracingExcludes` (API) and `outputFileTracingIncludes` (blog routes) so deploy stays under 250 MB and blog works in prod
- [ ] Book: `docs/book/figures/` and `docs/book/assets/` committed (figures/covers load via `/book-assets/` after build copy)

---

## 6. Post-deploy verification

### Pocket Analyst (Ask AI)

- [ ] Open dashboard → Ask AI (FAB) → send a message → streamed reply (Gemini or OpenAI)
- [ ] Free user: badge shows “X/20 this month”; after limit, 429 and upgrade modal
- [ ] Paid user: no quota badge; can attach file; unlimited questions
- [ ] Ask “What is Apple’s stock price?” → answer includes numeric price
- [ ] Visit `/landing` → “Your Personal Quantitative Analyst” and “Try Ask AI” work; video plays if `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` is set
- [ ] Visit `/admin/analytics` → “Pocket Analyst (Ask AI)” section appears after at least one event

### Blog

- [ ] **Building in Public:** https://www.pocketportfolio.app/blog — shows generated posts (Pocket Portfolio, How to in Tech, Research)
- [ ] **Single post:** e.g. `/blog/<slug>` loads without “Something went wrong”
- [ ] **API:** `GET https://www.pocketportfolio.app/api/blog/posts` returns a non-empty array

### Book

- [ ] **Sovereign Intelligence:** https://www.pocketportfolio.app/book/sovereign-intelligence — loads; all 10 figures (si-figure-01 … si-figure-10) and cover load via `/book-assets/`
- [ ] **Universal LLM Import:** https://www.pocketportfolio.app/book/universal-llm-import — loads; chapter images and content render

---

## 7. Debug instrumentation

- App code that talks to the debug ingest endpoint is guarded by `NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS === 'true'`.
- **Book:** No debug instrumentation in production. The book-assets route and Sovereign Intelligence shell do not log to `.cursor/debug.log` or POST to any ingest URL; any such code has been removed. Do not re-add for prod.
- Scripts under `scripts/` (e.g. predator-probe, queue monitors) that reference the ingest URL are for local/debug only and are not part of the Next.js app bundle.

---

## 8. References

| Topic | Doc |
|--------|-----|
| Pocket Analyst (env, Firestore, cron, troubleshooting) | **`docs/POCKET-ANALYST-PROD.md`** |
| Vercel env (support + Pocket Analyst) | **`docs/VERCEL-ENV-SUPPORT-ADMIN.md`** |
| Blog serverless 250 MB + content tracing | **`docs/DEPLOY-FIX-SERVERLESS-250MB.md`** |
| Deploy book to prod (script, manual push) | **`docs/DEPLOY-BOOK.md`** |
| Sovereign Intelligence architecture | **`docs/book/SOVEREIGN-INTELLIGENCE-BOOK.md`** |
| Pocket Analyst implementation | **`docs/POCKET-ANALYST-IMPLEMENTATION-REPORT.md`** |
