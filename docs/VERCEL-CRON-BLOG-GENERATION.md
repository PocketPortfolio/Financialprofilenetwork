# Vercel Cron Blog Generation

When GitHub Actions is suspended (e.g. billing issues), blog posts can be generated via **Vercel Cron** instead.

## How It Works

1. **Vercel Cron** triggers `/api/cron/generate-blog` on schedule (9:00, 14:00, 18:00 UTC + hourly)
2. The API route fetches calendars from GitHub (raw URLs), finds due posts, generates one post via OpenAI + DALL-E
3. Pushes MDX, image, and **updated calendar** (status → published, publishedAt) to GitHub via the GitHub API. **The calendar update is mandatory:** if the calendar entry cannot be found (by id or slug), the route **throws** and returns 500 so the run never succeeds with content pushed but calendar still "pending". This prevents the admin from showing "Overdue" for posts that are already live.
4. If **`VERCEL_DEPLOY_HOOK_URL`** is set, the route POSTs to it to trigger a production deploy (use this when GitHub → Vercel auto-deploy is broken)

## Required Environment Variables

Add these to **Vercel Project Settings → Environment Variables** (Production):

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (for GPT-4 + DALL-E 3) |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope (to push files) |
| `CRON_SECRET` | Secret to verify cron requests (Vercel sets this automatically for crons) |
| `VERCEL_DEPLOY_HOOK_URL` | **Recommended when GitHub → Vercel deploy is broken.** Deploy Hook URL so the cron can trigger a production deploy after pushing. Create in Vercel → Project → Settings → Git → Deploy Hooks. |
| `YOUTUBE_API_KEY` | Optional – for Research posts to fetch relevant videos |

## Deploy Hook (when GitHub → Vercel is broken)

If Vercel doesn’t deploy from GitHub (e.g. billing), the cron can still deploy after pushing:

1. Vercel → your project → **Settings** → **Git** → **Deploy Hooks**
2. Create a hook (e.g. “Blog cron”), branch **main**
3. Copy the URL and add it in Vercel env vars as **`VERCEL_DEPLOY_HOOK_URL`**

After each successful post generation, the cron will POST to that URL and trigger a production deploy.

## Creating the GitHub Token

1. Go to [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) with scope: **`repo`** (full control of private repositories)
3. Copy the token and add it to Vercel as `GITHUB_TOKEN`

## Cron Schedule

Matches the original GitHub Actions schedule:

- `0 9 * * *` – 9:00 UTC (finance/deep-dive posts)
- `0 14 * * *` – 14:00 UTC (how-to posts)
- `0 18 * * *` – 18:00 UTC (research posts)
- `0 * * * *` – Every hour (catch missed posts)

## Past 18:00 / missed run

Posts stay **due** until they’re generated: `date <= today`, `status === 'pending'`, and (if set) `current time >= scheduledTime`. So a post scheduled for 18:00 is still due at 18:04, 19:00, or on the next hourly run. The next time the cron runs it will pick that post up and generate it. Nothing is lost.

## Manual Trigger

You can trigger the cron manually for testing:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://www.pocketportfolio.app/api/cron/generate-blog
```

Get `CRON_SECRET` from Vercel Project Settings → Environment Variables.

## Switching Back to GitHub Actions

When GitHub Actions is working again:

1. The Vercel cron will continue to run – it’s harmless (no-op when no posts are due)
2. You can remove the generate-blog cron entries from `vercel.json` if you prefer
3. Or leave them as a fallback – they only run when posts are due

## Gold standard

Generated posts must match the **100+ deployed posts** on GitHub. Format is defined in [BLOG-POST-GOLD-STANDARD.md](./BLOG-POST-GOLD-STANDARD.md). Do not deviate from that formatting.

## Quality bar (SEO / AEO / GEO)

Generated posts are treated as SEO, AEO, and GEO assets. The cron generator enforces:

- **References = hyperlinks:** Research posts must have at least 3 references in the form `[Source Title](https://url)` so users can verify sources. Plain-text citations are rejected.
- **Validation:** Before push, research content is checked for ≥3 markdown links; if not met, generation fails and nothing is pushed.
- **No code-block wrapping:** Output is unwrapped if the model returns content inside \`\`\`mdx.
- **No inline Video:** Video is rendered from frontmatter by the template; import/component in the body are stripped.
- **MDX-safe prose:** No raw `<` or `>` before numbers in body text (e.g. use "less than 1 ms" not "< 1 ms"). Prompts instruct the model; `lib/mdx-escape.ts` escapes any that slip through; validation rejects and does not push if any remain.

These rules are in `lib/blog-generator-cron.ts` and `docs/BLOG-POST-GOLD-STANDARD.md`. Do not relax them without a product decision.

## Files

- **API route:** `app/api/cron/generate-blog/route.ts`
- **Lib:** `lib/blog-generator-cron.ts`
- **Cron config:** `vercel.json` (crons array)
