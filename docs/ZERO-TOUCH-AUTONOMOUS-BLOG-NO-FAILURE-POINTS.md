# Zero-Touch Autonomous Blog Engine – No Failure Points Report

**Date:** 2026-03-12  
**Status:** All failure points removed or fail-fast; no silent failures.

---

## 1. Zero-touch flow (no human intervention)

From **“due post on calendar”** to **“post live on production”**, the system requires **no human action**:

| Step | Actor | Human? |
|------|--------|-------|
| Trigger | Vercel Cron (9:00, 14:00, 18:00 UTC + hourly) | No |
| Read calendars | GitHub raw URLs (blog, how-to, research JSON) | No |
| Pick due post | `getDuePosts(calendar, now)` — date + scheduledTime + status=pending | No |
| Generate MDX + image | OpenAI GPT-4 + DALL-E in cron handler | No |
| Push MDX | GitHub API `createOrUpdateFile(content/posts/{slug}.mdx)` | No |
| Push image | GitHub API `createOrUpdateFileBinary(public/images/blog/{slug}.png)` | No |
| Update calendar | GitHub API `createOrUpdateFile(calendarPath)` — status=published, publishedAt | No |
| Trigger deploy | POST `VERCEL_DEPLOY_HOOK_URL` | No |

**Single exception:** Adding *new* pending entries to the calendars (future dates) is done by separate scripts run manually or by another process; it is outside this engine.

---

## 2. No silent failure points

Every point where the pipeline could previously “succeed” while leaving the system inconsistent has been removed or made **fail-fast**.

### 2.1 Auth and config

| Check | Behaviour if missing | Location |
|-------|----------------------|----------|
| `CRON_SECRET` | 401 Unauthorized | `route.ts` |
| `OPENAI_API_KEY` | 500, message | `route.ts` |
| `GITHUB_TOKEN` | 500, message | `route.ts` |

No silent skip: missing secrets cause an immediate error response.

### 2.2 Calendar update (mandatory)

| Check | Behaviour if failed | Location |
|-------|---------------------|----------|
| Calendar entry not found (id/slug) | **Throw** → 500, deploy hook **not** called | `app/api/cron/generate-blog/route.ts` |
| Research: id match fails | Fallback find by **slug**; if still not found → throw | Same |
| `createOrUpdateFile(calendarPath)` throws | 500, deploy hook not reached | Same |

**Before:** If `findIndex` returned -1, the route skipped the calendar update and still returned 200 and triggered the deploy hook → post live but calendar still "pending" (admin showed "Overdue").  
**Now:** If the calendar entry cannot be found (by id or slug), the route **throws** with a clear error (id, slug, category, path, entry count). Run returns 500; deploy hook is not called. No success without a calendar update.

### 2.3 Content quality (research)

| Check | Behaviour if failed | Location |
|-------|---------------------|----------|
| Fewer than 3 reference hyperlinks in body | **Throw** → 500, nothing pushed | `lib/blog-generator-cron.ts` |
| Unescaped `<` or `>` before digits in prose | **Throw** → 500, nothing pushed | `lib/blog-generator-cron.ts` (after sanitize, `hasUnescapedAngleBracketsBeforeDigits`) |

No push of research content that would break SEO/AEO/GEO or MDX compile.

### 2.4 MDX safety

| Check | Behaviour | Location |
|-------|-----------|----------|
| Model outputs raw `< 1 ms` etc. | Sanitizer escapes to `{'<'} 1` in prose (outside code blocks) | `lib/mdx-escape.ts`, used in generator + `app/blog/[slug]/page.tsx` |
| Escape missed (prose still has `<digit` / `>digit`) | Validation throws before push | `lib/blog-generator-cron.ts` |

No silent publish of content that would cause "Unexpected character `1` before name" at render time.

### 2.5 GitHub API

| Check | Behaviour if failed | Location |
|-------|---------------------|----------|
| `getFileSha` 404 (new file) | Treated as create (no sha in PUT) | `route.ts` |
| `createOrUpdateFile` / `createOrUpdateFileBinary` throw | 500, error message | `route.ts` |

No catch that swallows errors; failures propagate and the run fails.

### 2.6 Deploy hook

| Check | Behaviour | Location |
|-------|-----------|----------|
| `VERCEL_DEPLOY_HOOK_URL` not set | Response notes it; no deploy triggered | `route.ts` |
| POST to hook fails or !ok | Logged; `deployTriggered: false` in response | `route.ts` |

Deploy hook is best-effort after a successful push; it does not change the success/failure of the run (calendar + content push define success).

---

## 3. Summary table: no failure points left silent

| Risk | Mitigation | Result if wrong |
|------|------------|-----------------|
| Calendar not updated | Mandatory update; throw if entry not found; fallback by slug for research | 500, no deploy hook |
| Research without ref links | Validate ≥3 markdown links; throw if &lt; 3 | 500, no push |
| MDX broken by `<`/`>` | Escape in prose; validate; throw if still present | 500, no push |
| Wrong/missing secrets | Explicit checks at start | 401/500 |
| GitHub write fails | No swallow; throw propagates | 500 |

---

## 4. Files reference

| Role | Path |
|------|------|
| Cron API | `app/api/cron/generate-blog/route.ts` |
| Generator + validation | `lib/blog-generator-cron.ts` |
| MDX escape + validation | `lib/mdx-escape.ts` |
| Blog render (escape at read time) | `app/blog/[slug]/page.tsx` |
| Gold standard | `docs/BLOG-POST-GOLD-STANDARD.md` |
| Cron + calendar rule | `docs/VERCEL-CRON-BLOG-GENERATION.md` |

---

## 5. Deploy and run

- **GitHub:** Push to `main` (no auto-deploy when GitHub billing is broken).
- **Vercel:** Run `npx vercel --prod` to deploy after push so production has the latest code and calendar logic.
- **Cron:** Vercel Cron invokes the route on schedule; deploy hook triggers production deploy after each successful post generation.

This report reflects the implementation as of the date above. The autonomous blog engine is zero-touch from due post to live post, with no silent failure points.
