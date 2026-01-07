# 🤖 Autonomous Blog Engine - How It Works in Practice

## Overview

The autonomous blog engine is a **fully automated system** that generates, verifies, commits, and deploys blog posts without any human intervention. This document explains how it works in practice, not just theory.

## The Complete Autonomous Flow

### 1. **Scheduling & Triggering** (GitHub Actions Cron)

**Every Hour**: `0 * * * *` - Self-healing check runs every hour at :00 minutes
**Every 2 Hours**: `0 */2 * * *` - Additional reliability checks
**Daily at 9 AM**: `0 9 * * *` - Primary scheduled time

**Why Multiple Schedules?**
- GitHub Actions cron is unreliable (can be delayed 0-15 minutes or not trigger at all)
- Multiple schedules ensure posts are caught even if one fails
- Hourly check ensures posts are generated within 1 hour of their scheduled time

### 2. **Post Detection** (Script Logic)

The script checks the calendar for posts that should be generated:

```typescript
const today = new Date().toISOString().split('T')[0]; // "2026-01-07"
const duePosts = calendar.filter(
  post => post.date <= today && post.status === 'pending'
);
```

**Criteria for Generation:**
- ✅ `post.date <= today` - Post is due or overdue
- ✅ `post.status === 'pending'` - Post hasn't been generated yet

### 3. **Content Generation** (OpenAI GPT-4)

For each post due for generation:

1. **Article Generation**:
   - Uses GPT-4 Turbo with custom system prompt
   - Generates 1200-2000 word MDX-formatted article
   - Includes frontmatter, structured sections, internal links
   - Retries up to 3 times if generation fails

2. **Image Generation**:
   - Uses DALL-E 3 to create blog post image
   - Abstract FinTech visualization with brand colors
   - Retries up to 3 times if generation fails

3. **File Writing**:
   - Saves MDX to: `content/posts/{slug}.mdx`
   - Saves PNG to: `public/images/blog/{slug}.png`
   - Creates directories if they don't exist

### 4. **File Verification** (Critical Safety Check)

**BEFORE updating status to 'published'**, the script verifies:

```typescript
// ✅ CRITICAL: Verify files exist BEFORE updating status
const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);

if (!fs.existsSync(mdxPath)) {
  throw new Error(`MDX file not created: ${mdxPath}`);
}
if (!fs.existsSync(imagePath)) {
  throw new Error(`Image file not created: ${imagePath}`);
}

// ✅ Only mark for status update if files are verified to exist
postsToUpdate.push(post);
```

**Why This Matters:**
- Prevents status from being 'published' if files don't exist
- Ensures calendar status matches reality
- Catches silent failures immediately

### 5. **Status Update** (Only After Verification)

Status is updated **ONLY** for posts with verified files:

```typescript
// ✅ UPDATE STATUS ONLY FOR POSTS WITH VERIFIED FILES
for (const post of postsToUpdate) {
  post.status = 'published';
  console.log(`📝 Status updated to 'published': ${post.slug}`);
}
```

**This ensures:**
- Status is never 'published' without files
- Failed generations remain 'pending' or become 'failed'
- Calendar accurately reflects what was generated

### 6. **Calendar Update** (Persistent State)

The calendar file is updated with new statuses:

```typescript
fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
```

**This file tracks:**
- Which posts have been generated (`status: 'published'`)
- Which posts failed (`status: 'failed'`)
- Which posts are pending (`status: 'pending'`)

### 7. **Post-Generation Verification** (Double-Check)

After all posts are processed, the script verifies:

1. **Today's Posts Were Generated**:
   ```typescript
   const todayExpectedPosts = calendar.filter(
     post => post.date === today && post.status === 'pending'
   );
   if (todayExpectedPosts.length > 0) {
     // CRITICAL ERROR - Exit with code 1
   }
   ```

2. **Generated Posts Have Files**:
   ```typescript
   for (const post of generatedPosts) {
     if (!fs.existsSync(mdxPath) || !fs.existsSync(imagePath)) {
       // CRITICAL ERROR - Exit with code 1
     }
   }
   ```

3. **Today's Posts Didn't Fail**:
   ```typescript
   const todayFailedPosts = calendar.filter(
     post => post.date === today && post.status === 'failed'
   );
   if (todayFailedPosts.length > 0) {
     // CRITICAL ERROR - Exit with code 1
   }
   ```

**If any check fails, the workflow exits with error code 1**, triggering:
- Workflow failure notification
- GitHub issue creation (automatic)
- Alert to you immediately

### 8. **Git Commit & Push** (Workflow Step)

The workflow automatically commits and pushes:

1. **Check for Changes**:
   ```bash
   git status --porcelain
   ```

2. **Stage Files** (if changes detected):
   ```bash
   git add -f content/posts/*.mdx
   git add -f public/images/blog/*.png
   git add -f content/blog-calendar.json
   ```

3. **Commit & Push**:
   ```yaml
   uses: stefanzweifel/git-auto-commit-action@v5
   commit_message: '🤖 Auto-generate blog posts'
   ```

**This triggers:**
- Vercel deployment (automatic on push to main)
- Post goes live on production
- No human intervention needed

### 9. **Workflow Verification** (Independent Check)

Even if the script passes, the workflow has an independent verification step:

```yaml
- name: Verify expected posts were generated
  if: always() && steps.expected-posts.outputs.expected_posts > 0
  run: |
    # Verify each expected post has both MDX and PNG files
    # Fail workflow if any files are missing
```

**This provides:**
- Double-check that files exist
- Catches issues even if script passes
- Creates GitHub issue if verification fails

## The Complete Timeline (Example: Jan 7, 9am Post)

1. **9:00 UTC**: Hourly check runs
   - Script detects post: `date: "2026-01-07"`, `status: "pending"`
   - Post is included in `duePosts`

2. **9:00:30 UTC**: Generation starts
   - GPT-4 generates article content
   - DALL-E 3 generates image
   - Files written to disk

3. **9:01:00 UTC**: Verification
   - Script verifies MDX file exists ✅
   - Script verifies PNG file exists ✅
   - Post added to `postsToUpdate` array

4. **9:01:05 UTC**: Status update
   - Post status changed to `'published'`
   - Calendar file updated

5. **9:01:10 UTC**: Post-generation checks
   - Verifies today's posts were generated ✅
   - Verifies files exist ✅
   - Script exits with code 0

6. **9:01:15 UTC**: Git operations
   - Workflow detects changes
   - Files staged
   - Commit created: "🤖 Auto-generate blog posts"
   - Pushed to `main` branch

7. **9:01:30 UTC**: Deployment
   - Vercel detects push to main
   - Builds and deploys automatically
   - Post goes live: `https://www.pocketportfolio.app/blog/{slug}`

**Total Time**: ~2 minutes from trigger to live post

## Safety Mechanisms

### 1. **File Verification Before Status Update**
- Status is never 'published' without files
- Prevents false positives

### 2. **Post-Generation Verification**
- Double-checks files exist after generation
- Fails workflow if files missing

### 3. **Workflow-Level Verification**
- Independent check even if script passes
- Creates GitHub issue if verification fails

### 4. **Critical Error Detection**
- Script exits with error code 1 if today's posts fail
- Workflow fails, triggering alerts

### 5. **Hourly Self-Healing**
- Runs every hour to catch missed posts
- Ensures posts are generated within 1 hour

## Why This Is Truly Autonomous

1. **No Manual Triggers Needed**: Runs automatically on schedule
2. **Self-Healing**: Catches missed posts within 1 hour
3. **Automatic Verification**: Multiple layers of checks
4. **Automatic Deployment**: Git push triggers Vercel automatically
5. **Automatic Alerts**: GitHub issues created if something fails
6. **Status Accuracy**: Calendar status always matches reality

## Current Status

- ✅ **111 posts** in calendar
- ✅ **103 posts** pending (will be generated automatically)
- ✅ **8 posts** published (working correctly)
- ✅ **Hourly self-healing** active
- ✅ **File verification** before status update
- ✅ **Automatic commit & deployment**

## Next Post Generation

The next pending post will be automatically generated when:
- Its `date <= today`
- Its `status === 'pending'`
- The hourly check runs (every hour at :00 minutes)

**No human intervention required.**

---

**Last Updated**: 2026-01-07  
**Status**: Fully Autonomous - All 103 pending posts will be generated automatically

