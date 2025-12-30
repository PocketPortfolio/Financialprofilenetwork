# Blog Content Directory

This directory contains the autonomous blog generation system for Pocket Portfolio.

## Structure

- `blog-calendar.json` - Master calendar with 104 scheduled blog posts (2 per week for 52 weeks)
- `posts/` - Generated MDX blog post files

## Usage

### Generate Calendar
```bash
npm run generate-blog-calendar
```

### Generate Blog Posts
```bash
npm run generate-blog
```

This will:
1. Check `blog-calendar.json` for posts due today
2. Generate content using OpenAI GPT-4
3. Generate images using DALL-E 3
4. Save MDX files to `posts/`
5. Save images to `public/images/blog/`
6. Update calendar status to `published`

## Automated Generation

Blog posts are automatically generated via GitHub Actions:
- **Schedule:** Every Monday and Thursday at 9 AM UTC
- **Workflow:** `.github/workflows/generate-blog.yml`

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key for GPT-4 and DALL-E 3

## Content Guidelines

All generated posts follow strict guidelines:
- ❌ **NEVER** mention "Excel editing" or "Spreadsheets" as features
- ✅ Use "Raw Data" or "JSON" only
- ✅ Always include a "Verdict" section
- ✅ Always include CTA for Corporate/Founder Tiers
- ✅ Minimum 1200 words, maximum 2000 words
- ✅ SEO-optimized with keywords

## Pillars

Posts are organized into 4 content pillars:
1. **Philosophy** - Data sovereignty, local-first, vendor lock-in
2. **Technical** - JSON parsing, performance, architecture
3. **Market** - Investment strategies, data-driven analysis
4. **Product** - Sovereign Sync, features, updates

