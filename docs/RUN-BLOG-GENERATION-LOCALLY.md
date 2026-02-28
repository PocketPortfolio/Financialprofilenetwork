# Run Blog Generation Locally (when GitHub Actions are blocked)

When the **Generate Blog Posts** workflow cannot run (e.g. billing/budget blocking Actions), you can generate due posts locally and push them so they go live today.

## Posts due today (2026-02-28)

1. **How-to 14:00:** "February Retro: 3 Tools We Deprecated This Month" — ✅ generated (local run).
2. **Research 18:00:** "Research: Kubernetes Cluster Autoscaling - Response Time Analysis" — ✅ generated (local run).

## Prerequisites

- **OPENAI_API_KEY** in `.env.local` (same as GitHub secret). The script loads `.env.local` automatically.
- Optional: **YOUTUBE_API_KEY** in `.env.local` for research posts that fetch videos.

## Steps

1. **Install dependencies** (if not already):
   ```bash
   npm ci
   ```

2. **Run the blog generator** (generates all posts where `date <= today` and `status === 'pending'`):
   ```bash
   npm run generate-blog
   ```

3. **Commit and push** the generated files (same as the workflow would do):
   ```bash
   git add content/posts/*.mdx content/blog-calendar.json content/how-to-tech-calendar.json content/research-calendar.json public/images/blog/*.png
   git status   # verify only intended files
   git commit -m "🤖 Auto-generate blog posts"
   git push origin main
   ```

4. **Deploy:** If Vercel is connected to the repo via Git, the push will trigger a production deploy. If you rely only on the **Deploy to Vercel** GitHub Action, that run may still be blocked until Actions are unblocked; in that case deploy once from the Vercel dashboard or after fixing Actions.

## What the workflow normally does

- **Generate Blog Posts** (`.github/workflows/generate-blog.yml`) runs on a schedule (hourly, every 2h, 09:00 UTC, 18:00 UTC). It:
  - Runs `npm run generate-blog`
  - Commits new/changed MDX, calendar JSON, and images
  - Pushes to `main`
  - Deploys to Vercel Production in the same run

When Actions are blocked, none of that runs—hence no posts. Running the script locally and pushing reproduces the commit and push; Vercel then deploys if Git integration is enabled.
