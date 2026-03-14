# Autonomous Blog Engine (Vercel Cron) – Detailed Report

**Report date:** 2026-02-27  
**Scope:** End-to-end architecture, schedule, data flow, quality controls, and operations for blog generation via Vercel Cron.

---

## 1. Executive Summary

The **autonomous blog engine** generates scheduled blog posts when GitHub Actions is unavailable (e.g. billing suspension). It runs as **Vercel Cron** jobs that call `/api/cron/generate-blog`. Each run:

1. Fetches merged content calendars from GitHub (raw JSON).
2. Selects at most **one** due post (by date and optional `scheduledTime`).
3. Generates MDX content (OpenAI GPT-4) and a hero image (DALL-E 3).
4. Pushes the new post (MDX + image) and calendar update to GitHub via the GitHub API.
5. Optionally triggers a Vercel production deploy via a **Deploy Hook** when GitHub → Vercel auto-deploy is not in use.

Output is constrained to match the **gold standard** of 100+ existing deployed posts (section order, reference hyperlinks, no code-block wrapping). Research posts are validated for ≥3 reference links before push.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Vercel Cron (scheduler)                              │
│  Schedule: 9:00, 14:00, 18:00 UTC + every hour                               │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │ GET /api/cron/generate-blog
                                    │ Auth: Bearer CRON_SECRET | x-vercel-cron
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  app/api/cron/generate-blog/route.ts                                          │
│  • Validate CRON_SECRET / x-vercel-cron                                       │
│  • fetchCalendarsFromGitHub() → merged calendar                                │
│  • getDuePosts(calendar, now) → [post] or []                                  │
│  • If none due → 200 { generated: 0 }                                         │
│  • Else: generatePostForCron(post) → { mdxContent, imageBuffer }              │
│  • createOrUpdateFile(MDX), createOrUpdateFileBinary(image)                   │
│  • Update calendar JSON (status: published, publishedAt)                       │
│  • POST VERCEL_DEPLOY_HOOK_URL (if set)                                       │
│  • Return 200 { generated: 1, slug, title, deployTriggered }                   │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  lib/blog-generator-cron.ts                                                   │
│  • fetchCalendarsFromGitHub: blog + how-to + research calendars (GitHub raw)   │
│  • getDuePosts: status===pending, date<=today, time>=scheduledTime           │
│  • generatePostForCron:                                                        │
│    - Optional YouTube video (research), prompts by category                    │
│    - OpenAI Chat (gpt-4o) → MDX                                               │
│    - sanitizeMDXContent (unwrap ```mdx, strip Video import/component)          │
│    - Research: validate ≥3 reference hyperlinks                                 │
│    - DALL-E 3 → image buffer                                                   │
│  • getCalendarFilePath(post) → calendar JSON path                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ GitHub raw URLs   │    │ OpenAI API       │    │ GitHub API       │
│ (read calendars)  │    │ (GPT-4 + DALL-E) │    │ (write MDX,       │
│                   │    │                  │    │  image, calendar) │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │ Vercel Deploy Hook   │
                        │ (POST → production) │
                        └──────────────────────┘
```

---

## 3. Cron Schedule (vercel.json)

| Cron expression   | Time (UTC) | Purpose / alignment |
|-------------------|------------|----------------------|
| `0 9 * * *`       | 09:00      | Finance / deep-dive (blog calendar) |
| `0 14 * * *`      | 14:00      | How-to posts (how-to-tech calendar) |
| `0 18 * * *`      | 18:00      | Research posts (research calendar, often with `scheduledTime: "18:00"`) |
| `0 * * * *`       | Every hour | Catch-up for missed or delayed runs |

All times are **UTC**. The same handler `/api/cron/generate-blog` is invoked; it picks the **first** due post across merged calendars (blog + how-to + research). Only **one post per run** is generated.

---

## 4. Data Sources and Due-Post Logic

### 4.1 Calendars (read-only from GitHub)

- **blog:** `https://raw.githubusercontent.com/PocketPortfolio/Financialprofilenetwork/main/content/blog-calendar.json`
- **how-to:** `content/how-to-tech-calendar.json`
- **research:** `content/research-calendar.json`

Entries are merged and de-duplicated by a composite key: for research, `id`; for others, `slug` (or `id`).

### 4.2 When is a post “due”?

A post is due if and only if:

1. **status** is `"pending"`.
2. **date** (YYYY-MM-DD) is **≤** today (UTC).
3. If **scheduledTime** is set (e.g. `"18:00"`), current UTC time (hours:minutes) must be **≥** that time.

So a research post with `date: "2026-03-09"` and `scheduledTime: "18:00"` becomes due at 18:00 UTC on 2026-03-09 and remains due on subsequent runs (hourly, next day, etc.) until it is generated and marked `published`.

### 4.3 Selection

`getDuePosts()` returns a **sorted** list of all due posts. The route uses **`duePosts[0]`** only. Order depends on how calendars are merged; typically the first due post in the merged list is chosen.

---

## 5. Generation Pipeline (generatePostForCron)

### 5.1 Inputs per post

- **title, date, slug, pillar, keywords, category** from the calendar.
- **Research only:** optional YouTube video via `YOUTUBE_API_KEY` (search by title + keywords → one video; `videoId`, `title`, `channelTitle`).

### 5.2 Content generation (OpenAI)

- **Model:** `gpt-4o` (migrated from `gpt-4-turbo-preview` Mar 2026; same quality bar: gold-standard section order, References format, validation unchanged).
- **System/user prompts** depend on category:
  - **Research:** Gold-standard section order (Abstract → Methodology → Key Findings → [Video Reference] → References → Future Trends → Verdict), Verdict link to product, **References as bullet list with `[Title](URL)`** (≥3 real URLs). Raw MDX only; no ```mdx wrapper, no `import` or `<Video />`.
  - **How-to:** Short guide (300–500 words), code-first, frontmatter.
  - **Blog (deep-dive):** 1200–2000 words, Key Takeaways including “Sovereign Sync”, product link.

### 5.3 Post-processing

- **unwrapCodeBlock:** If the model returns content inside ` ```mdx ` or ` ``` `, the inner content is extracted.
- **sanitizeMDXContent:** Normalize code fences, strip `import Video ...` and `<Video id={...} />` (video comes from frontmatter `videoId`).
- **Frontmatter:** Normalized/overwritten for `title`, `date`, `description`, `tags`, `author`, `image`, `pillar`, `category`; research gets `videoId` when a video was found.

### 5.4 Validation (research only)

- Count markdown links `[text](http...)` in the final body.
- If **&lt; 3**, throw and **do not push**. Error message states that research posts must have at least 3 reference hyperlinks for SEO and source verification.

### 5.5 Image generation (DALL-E 3)

- **Research:** “Academic data viz, blue/grey, charts, no text. Theme: {title}.”
- **How-to:** “Minimalist terminal, dark mode, green on black, no text. Theme: {title}.”
- **Blog:** “Abstract FinTech viz, orange/slate, charts, no text. Theme: {title}.”
- Image saved to `public/images/blog/{slug}.png`.

---

## 6. GitHub API Usage (route)

- **Repo:** `PocketPortfolio/Financialprofilenetwork`.
- **Auth:** `GITHUB_TOKEN` (Bearer), scope `repo`.
- **Read:** Calendars via **raw GitHub URLs** (no API for calendars). For calendar **update**, file content is read via Contents API to get current JSON.
- **Write:**
  - **getFileSha(path):** GET contents; 404 → `null` (new file).
  - **createOrUpdateFile(path, content, message):** PUT with base64 content; `sha` included when updating.
  - **createOrUpdateFileBinary(path, buffer, message):** Same for binary (image).

Written paths:

- `content/posts/{slug}.mdx`
- `public/images/blog/{slug}.png`
- One of: `content/blog-calendar.json`, `content/how-to-tech-calendar.json`, `content/research-calendar.json` (calendar that contained the post).

Commit message: `🤖 Auto-generate blog post (Vercel Cron) - {title}`.

---

## 7. Deploy Hook (post-push deploy)

When **VERCEL_DEPLOY_HOOK_URL** is set (recommended when GitHub → Vercel deploy is broken):

- After a successful push (MDX + image + calendar), the route sends **POST** to that URL.
- Vercel then starts a **production** deploy for the project.
- Response JSON includes `deployTriggered: true/false` and a message indicating whether the hook was used.

If the hook is not set, the message explains that setting it will trigger deploy when GitHub→Vercel is unavailable.

---

## 8. Authentication and Security

- **Cron invocation:** Request must be authorized by one of:
  - `Authorization: Bearer <CRON_SECRET>`
  - `x-vercel-cron: <CRON_SECRET>`
  - `x-vercel-cron: 1` (Vercel’s own cron runner)
- Missing or wrong auth → **401 Unauthorized**.
- **CRON_SECRET** should be set in Vercel (and optionally used for manual curl tests); rotate if ever exposed.
- **Required env (500 if missing):** `OPENAI_API_KEY`, `GITHUB_TOKEN`; **CRON_SECRET** for auth. **Optional:** `YOUTUBE_API_KEY`, `VERCEL_DEPLOY_HOOK_URL`.

---

## 9. Quality Bar and Gold Standard

- **Gold standard doc:** `docs/BLOG-POST-GOLD-STANDARD.md` defines the format of the 100+ deployed posts. Generated output must not deviate.
- **Research:** Section order fixed; References must be a **bullet list** with `- [Source Title](https://url) - description.`; ≥3 links; validation before push.
- **No code-block wrapping** of the full body; no `import Video` or `<Video />` in body (handled by template from `videoId`).
- Relaxing these rules is explicitly out of scope without a product decision (see `VERCEL-CRON-BLOG-GENERATION.md` and gold standard doc).

---

## 10. Limits and Behavior

- **Max duration:** Route configured with `maxDuration: 300` (5 minutes) for OpenAI + DALL-E.
- **One post per run:** Only `duePosts[0]` is processed; multiple due posts are handled over subsequent runs (hourly or next scheduled time).
- **Missed runs:** Due posts remain due until generated; no “expiry.” Hourly cron catches up.
- **Idempotence:** Creating a new file uses `getFileSha(path)` → 404 → no `sha` in PUT; updates use existing `sha`. Prevents duplicate-file errors on create.

---

## 11. Files Reference

| Role | Path |
|------|------|
| Cron API route | `app/api/cron/generate-blog/route.ts` |
| Generator + calendars + due logic | `lib/blog-generator-cron.ts` |
| Cron schedule | `vercel.json` → `crons` |
| Gold standard (format) | `docs/BLOG-POST-GOLD-STANDARD.md` |
| Operator doc | `docs/VERCEL-CRON-BLOG-GENERATION.md` |
| Env / security | `docs/security/README.md` |

---

## 12. Manual Test

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://www.pocketportfolio.app/api/cron/generate-blog
```

- **No posts due:** `{ "success": true, "generated": 0, "message": "No posts due for generation", ... }`.
- **Success:** `{ "success": true, "generated": 1, "slug": "...", "title": "...", "deployTriggered": true, ... }`.
- **Failure:** 500 with `{ "success": false, "error": "..." }` (e.g. validation failure, OpenAI/GitHub error).

---

## 13. Summary Table

| Aspect | Detail |
|--------|--------|
| **Trigger** | Vercel Cron: 9:00, 14:00, 18:00 UTC + hourly |
| **Endpoint** | `GET /api/cron/generate-blog` |
| **Auth** | `CRON_SECRET` (Bearer or x-vercel-cron) |
| **Calendars** | GitHub raw: blog, how-to-tech, research JSON |
| **Due rule** | status=pending, date≤today, time≥scheduledTime |
| **Content** | OpenAI GPT-4 (MDX) + DALL-E 3 (image) |
| **Writes** | GitHub: 1 MDX, 1 PNG, 1 calendar JSON update |
| **Deploy** | Optional POST to VERCEL_DEPLOY_HOOK_URL |
| **Quality** | Gold-standard section order; research ≥3 ref links; no ```mdx wrap, no Video in body |
| **Max duration** | 5 minutes (serverless) |

This report reflects the implementation as of the stated report date.
