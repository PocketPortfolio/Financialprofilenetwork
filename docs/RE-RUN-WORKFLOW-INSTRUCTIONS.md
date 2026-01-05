# ✅ Re-Run Workflow Instructions

## Current Status
- ✅ **OPENAI_API_KEY secret is set** (just updated)
- ✅ All required secrets are configured:
  - OPENAI_API_KEY ✅
  - VERCEL_TOKEN ✅
  - VERCEL_ORG_ID ✅
  - VERCEL_PROJECT_ID ✅

## Why Previous Run Failed
The workflow failed because `OPENAI_API_KEY` was missing when it ran. Now that it's set, the workflow should succeed.

## Re-Run the Workflow

### Step 1: Trigger the Workflow
1. Go to: https://github.com/PocketPortfolio/Financialprofilenetwork/actions/workflows/generate-blog.yml
2. Click **"Run workflow"** button (top right)
3. Select branch: **`main`**
4. Click green **"Run workflow"** button

### Step 2: Monitor Execution
Watch the workflow progress through these steps:
1. ✅ **Checkout repository** - Gets the code
2. ✅ **Setup Node.js 20** - Sets up environment
3. ✅ **Install dependencies** - Runs `npm ci`
4. ✅ **Verify OpenAI API Key** - Should now pass (secret is set)
5. ✅ **Generate blog posts** - Creates post using OpenAI
6. ✅ **Check for changes** - Detects new files
7. ✅ **Commit and push changes** - Commits to main
8. ✅ **Workflow Summary** - Shows results

### Step 3: Watch for Deployment
After the blog generation completes:
1. Go to: https://github.com/PocketPortfolio/Financialprofilenetwork/actions/workflows/deploy.yml
2. A new deployment should appear automatically (triggered by the commit)
3. Watch it deploy to Vercel
4. Post will be live when deployment completes

## Expected Timeline
- **Now**: Trigger workflow
- **+2-3 min**: Blog post generated
- **+1 min**: Changes committed and pushed
- **+5-10 min**: Deployment to Vercel completes
- **Total**: ~10-15 minutes to live

## What Will Be Generated
- **MDX File**: `content/posts/2025-year-in-review-sovereign-finance.mdx`
- **Image**: `public/images/blog/2025-year-in-review-sovereign-finance.png`
- **Calendar Update**: `content/blog-calendar.json` (status changed to "published")

## Verification
After workflow completes:
1. ✅ Check blog post exists: `content/posts/2025-year-in-review-sovereign-finance.mdx`
2. ✅ Check image exists: `public/images/blog/2025-year-in-review-sovereign-finance.png`
3. ✅ Check Vercel deployment succeeded
4. ✅ Check live site: Blog post should be visible

---

**Last Updated**: 2025-12-31 18:32 GMT
**Status**: Ready to re-run with secrets configured


