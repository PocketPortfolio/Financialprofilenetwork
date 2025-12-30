# Autonomous Blog Generation System

## Overview

The Pocket Portfolio autonomous blog system generates 104 SEO-optimized blog posts over 52 weeks (2 posts per week) using OpenAI GPT-4 for content and DALL-E 3 for images.

## Architecture

### Components

1. **Blog Calendar** (`content/blog-calendar.json`)
   - 104 scheduled posts
   - 4 content pillars: Philosophy, Technical, Market, Product
   - SEO-optimized titles and keywords

2. **Generation Script** (`scripts/generate-autonomous-blog.ts`)
   - Reads calendar for due posts
   - Generates content via OpenAI GPT-4
   - Generates images via DALL-E 3
   - Saves MDX files and images
   - Updates calendar status

3. **Dynamic Routes**
   - `app/blog/[slug]/page.tsx` - Individual post pages
   - `app/api/blog/posts/route.ts` - API endpoint for post metadata

4. **GitHub Actions** (`.github/workflows/generate-blog.yml`)
   - Runs every Monday and Thursday at 9 AM UTC
   - Automatically generates and commits posts

## Usage

### Manual Generation

```bash
# Generate calendar (one-time)
npm run generate-blog-calendar

# Generate due posts
npm run generate-blog
```

### Environment Setup

Add to `.env.local`:
```
OPENAI_API_KEY=sk-proj-...
```

### GitHub Actions Setup

1. Add `OPENAI_API_KEY` to GitHub Secrets
2. Workflow runs automatically on schedule
3. Can be manually triggered via "workflow_dispatch"

## Content Guidelines

### Forbidden Phrases
- ❌ "Edit in Excel"
- ❌ "Spreadsheet editing"
- ❌ "Google Sheets editing"

### Required Elements
- ✅ "Raw Data" or "JSON" terminology
- ✅ "Verdict" section
- ✅ CTA for Corporate/Founder Tiers
- ✅ 1200-2000 words
- ✅ SEO keywords in frontmatter

## SEO Integration

- **Sitemap:** Blog posts automatically added to `sitemap.xml`
- **Structured Data:** Article schema with JSON-LD
- **Open Graph:** Full metadata for social sharing
- **Keywords:** Targeted for "data sovereignty", "JSON finance", "local-first"

## Content Pillars

1. **Philosophy** (26 posts)
   - Data sovereignty, vendor lock-in, local-first
   - Examples: "The Death of the Cloud Portfolio", "Why Cloud Portfolios are Traps"

2. **Technical** (26 posts)
   - JSON parsing, performance, architecture
   - Examples: "Parsing 1M Trades in JSON", "Schema Design for Financial Data"

3. **Market** (26 posts)
   - Investment strategies, data-driven analysis
   - Examples: "Dollar Cost Averaging vs. Lump Sum", "The Psychology of Panic Selling"

4. **Product** (26 posts)
   - Sovereign Sync, features, updates
   - Examples: "Sovereign Sync: The End of Vendor Lock-in", "Why We Built Sovereign Sync"

## File Structure

```
content/
  blog-calendar.json      # Master schedule
  posts/                  # Generated MDX files
    {slug}.mdx

public/
  images/
    blog/                # Generated DALL-E images
      {slug}.png

scripts/
  generate-blog-calendar.ts
  generate-autonomous-blog.ts

app/
  blog/
    [slug]/
      page.tsx           # Dynamic post page
    page.tsx             # Blog index
  api/
    blog/
      posts/
        route.ts         # Post metadata API
```

## Monitoring

- Check calendar status: `content/blog-calendar.json`
- View generated posts: `content/posts/`
- Check GitHub Actions logs for generation status
- Monitor sitemap for new posts: `/sitemap.xml`

## Troubleshooting

### Posts Not Generating
1. Check `OPENAI_API_KEY` is set
2. Verify calendar has posts with `status: "pending"` and `date <= TODAY`
3. Check GitHub Actions logs for errors

### Image Generation Fails
- DALL-E 3 has rate limits
- Script includes 2-second delay between posts
- Failed posts marked as `status: "failed"` in calendar

### MDX Rendering Issues
- Ensure `next-mdx-remote` is installed
- Check MDX syntax in generated files
- Verify frontmatter format

## Next Steps

1. **Set GitHub Secret:** Add `OPENAI_API_KEY` to repository secrets
2. **Test Generation:** Run `npm run generate-blog` manually
3. **Verify First Post:** Check `/blog/{first-slug}` renders correctly
4. **Monitor Schedule:** GitHub Actions will auto-generate going forward

