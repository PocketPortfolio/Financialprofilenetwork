# 🚀 Autonomous Blog System - Setup Instructions

## Quick Start

### 1. Set Environment Variable

Add to your `.env.local` or GitHub Secrets:

```bash
OPENAI_API_KEY=your-api-key-here
```

### 2. Generate Calendar (Already Done ✅)

The calendar with 104 posts is already generated at `content/blog-calendar.json`.

### 3. Test Generation (Dry Run)

```bash
# Test generating the first post
npm run generate-blog
```

This will:
- Check for posts due today (date <= today)
- Generate content via GPT-4
- Generate image via DALL-E 3
- Save to `content/posts/{slug}.mdx`
- Save image to `public/images/blog/{slug}.png`

### 4. Set Up GitHub Actions

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add secret: `OPENAI_API_KEY` with your API key
3. The workflow (`.github/workflows/generate-blog.yml`) will run automatically:
   - Every Monday and Thursday at 9 AM UTC
   - Can be manually triggered via "Actions" tab

### 5. Verify First Post

After generation, visit:
- `/blog/{slug}` - Individual post page
- `/blog` - Blog index (should show generated posts)

## Manual Testing

### Test Calendar Generation
```bash
npm run generate-blog-calendar
```

### Test Blog Generation (First Post)
```bash
# Temporarily set first post date to today for testing
# Edit content/blog-calendar.json, set first post date to today
npm run generate-blog
```

### Verify Files Created
- ✅ `content/posts/{slug}.mdx` exists
- ✅ `public/images/blog/{slug}.png` exists
- ✅ Calendar status updated to `"published"`

## Content Guidelines (Enforced by AI)

The generation script enforces:
- ❌ **NEVER** mentions "Excel editing"
- ✅ Uses "Raw Data" or "JSON" only
- ✅ Always includes "Verdict" section
- ✅ Always includes CTA for Corporate/Founder Tiers
- ✅ 1200-2000 words
- ✅ SEO-optimized

## Monitoring

### Check Calendar Status
```bash
# View pending posts
cat content/blog-calendar.json | grep -A 5 "pending"

# View published posts
cat content/blog-calendar.json | grep -A 5 "published"
```

### Check Generated Posts
```bash
ls content/posts/
ls public/images/blog/
```

### GitHub Actions Logs
- Go to: Repository → Actions → "Generate Blog Posts"
- Check logs for generation status
- Failed posts marked as `"failed"` in calendar

## Troubleshooting

### "OPENAI_API_KEY not found"
- Add to `.env.local` for local testing
- Add to GitHub Secrets for automated generation

### "No posts due for generation"
- Check calendar: posts with `date <= TODAY` and `status: "pending"`
- For testing, temporarily set a post date to today

### "Image generation failed"
- DALL-E 3 has rate limits
- Script includes 2-second delay between posts
- Retry failed posts manually

### "MDX rendering error"
- Check MDX syntax in generated file
- Verify frontmatter format
- Check `next-mdx-remote` is installed

## Next Steps

1. ✅ Calendar generated (104 posts)
2. ✅ Scripts created
3. ✅ Routes configured
4. ✅ GitHub Actions workflow ready
5. ⏳ **Set GitHub Secret:** `OPENAI_API_KEY`
6. ⏳ **Test Generation:** Run `npm run generate-blog`
7. ⏳ **Deploy:** System will auto-generate going forward

## Schedule

- **Week 1, Post 1:** 2026-01-01 (Monday)
- **Week 1, Post 2:** 2026-01-04 (Thursday)
- **Continues:** 2 posts/week for 52 weeks = 104 total posts

## SEO Impact

Each post includes:
- ✅ JSON-LD Article schema
- ✅ Open Graph metadata
- ✅ Canonical URLs
- ✅ Auto-added to sitemap.xml
- ✅ Targeted keywords for "data sovereignty", "JSON finance", "local-first"

## Cost Estimation

- **GPT-4 Turbo:** ~$0.01-0.03 per post (1200-2000 words)
- **DALL-E 3:** ~$0.04 per image
- **Total per post:** ~$0.05-0.07
- **104 posts:** ~$5-7 total

