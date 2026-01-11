# 🎯 OPERATION METRONOME - Setup Guide

**Automated Social Infrastructure for X.com**

---

## ✅ Implementation Complete

All code has been implemented:
- ✅ Twitter client library (`lib/social/twitter-client.ts`)
- ✅ Content fetcher (`lib/social/content-fetcher.ts`)
- ✅ Scheduler orchestrator (`lib/social/scheduler.ts`)
- ✅ Cron API routes (`app/api/cron/war-mode-update/route.ts`, `app/api/cron/research-drop/route.ts`)
- ✅ Vercel cron configuration (`vercel.json`)
- ✅ Dependencies installed (`twitter-api-v2`)

---

## 🔑 How to Get Twitter/X API Credentials

### Step 1: Apply for Twitter Developer Account

1. **Go to Twitter Developer Portal:**
   - Visit: https://developer.twitter.com/en/portal/dashboard
   - Sign in with your X.com account (@P0cketP0rtf0li0)

2. **Apply for Developer Access:**
   - Click "Sign up" or "Apply" for a developer account
   - Fill out the application form:
     - **Use case:** "Posting automated updates about my product"
     - **Description:** "Automated social media posts for product updates and research content"
     - **Will you make Twitter content available to a government entity?** → No
   - Accept terms and submit

3. **Wait for Approval:**
   - Usually approved within 24-48 hours
   - You'll receive an email when approved

### Step 2: Create a Project and App

1. **Create a Project:**
   - Go to: https://developer.twitter.com/en/portal/projects-and-apps
   - Click "Create Project"
   - Name: "Pocket Portfolio Social Automation"
   - Use case: "Making a bot"

2. **Create an App:**
   - Within the project, create an app
   - Name: "Metronome Scheduler"
   - App environment: Production

3. **Set App Permissions:**
   - Go to "User authentication settings"
   - Enable "OAuth 1.0a"
   - App permissions: **Read and Write** (required for posting)
   - Callback URL: `https://www.pocketportfolio.app` (or your domain)
   - Website URL: `https://www.pocketportfolio.app`
   - Click "Save"

### Step 3: Generate API Keys and Tokens

1. **Get API Keys:**
   - Go to "Keys and tokens" tab
   - Under "Consumer Keys":
     - **API Key** → Copy this (this is `TWITTER_API_KEY`)
     - **API Key Secret** → Copy this (this is `TWITTER_API_SECRET`)
     - Click "Regenerate" if needed, but save them immediately!

2. **Generate Access Token and Secret:**
   - Scroll to "Access Token and Secret"
   - Click "Generate"
   - **Access Token** → Copy this (this is `TWITTER_ACCESS_TOKEN`)
   - **Access Token Secret** → Copy this (this is `TWITTER_ACCESS_TOKEN_SECRET`)
   - **IMPORTANT:** These are shown only once! Save them immediately.

3. **Verify Permissions:**
   - Make sure Access Token permissions show "Read and Write"
   - If it shows "Read only", regenerate it after setting app permissions to "Read and Write"

---

## 📍 Where to Store Credentials

### Option 1: Vercel Environment Variables (Production)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `pocket-portfolio-app`

2. **Navigate to Settings → Environment Variables:**
   - Click "Settings" → "Environment Variables"

3. **Add These Variables:**

   ```
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_ACCESS_TOKEN=your_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
   CRON_SECRET=generate_a_random_32_char_string_here
   ```

4. **Set Environment:**
   - Select "Production", "Preview", and "Development" (or just Production if you prefer)
   - Click "Save"

5. **Generate CRON_SECRET:**
   - Use a secure random string generator
   - Or run: `openssl rand -hex 32` in terminal
   - Minimum 32 characters recommended

### Option 2: Local Development (.env.local)

For local testing, add to `.env.local` (already exists in your project):

```bash
# Twitter API v2 (OAuth 1.0a for posting)
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# Vercel Cron Security
CRON_SECRET=your_random_secret_string_min_32_chars

# Base URL (optional, defaults to production)
NEXT_PUBLIC_BASE_URL=https://www.pocketportfolio.app
```

**⚠️ IMPORTANT:** 
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Never share these credentials publicly
- If credentials are leaked, regenerate them immediately in Twitter Developer Portal

---

## 🧪 Testing Before Deployment

### 1. Test Twitter Credentials Locally

Create a test script (`scripts/test-twitter-credentials.ts`):

```typescript
import { TwitterClient } from '../lib/social/twitter-client';

async function test() {
  try {
    const client = new TwitterClient();
    const isValid = await client.verifyCredentials();
    console.log('✅ Twitter credentials valid:', isValid);
    
    if (isValid) {
      // Optional: Post a test tweet (uncomment to test)
      // const result = await client.postTweet('🧪 Test tweet from Operation Metronome');
      // console.log('✅ Test tweet posted:', result.id);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run: `npx ts-node --project scripts/tsconfig.json scripts/test-twitter-credentials.ts`

### 2. Test Cron Routes Manually

Once deployed to Vercel, test the cron endpoints:

```bash
# Test War Mode Update
curl -X GET "https://www.pocketportfolio.app/api/cron/war-mode-update" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Research Drop
curl -X GET "https://www.pocketportfolio.app/api/cron/research-drop" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🚀 Deployment Checklist

- [ ] Twitter Developer account approved
- [ ] Twitter app created with "Read and Write" permissions
- [ ] All 4 Twitter credentials obtained (API Key, Secret, Access Token, Secret)
- [ ] `CRON_SECRET` generated (32+ character random string)
- [ ] All credentials added to Vercel Environment Variables
- [ ] Credentials tested locally (optional but recommended)
- [ ] Code committed and pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Cron jobs appear in Vercel Dashboard → Settings → Cron Jobs
- [ ] First automated post verified (wait for scheduled time or test manually)

---

## 📅 Cron Schedule Details

**Current Schedule (UTC):**
- **09:00 UK Update:** `0 8 * * *` (8:00 UTC = 9:00 UK in winter, 9:00 BST in summer)
- **18:00 UK Research:** `0 17 * * *` (17:00 UTC = 18:00 UK in winter, 18:00 BST in summer)

**Note:** UK timezone changes between GMT (UTC+0) and BST (UTC+1). The cron runs at fixed UTC times, so:
- **Winter (GMT):** Cron at 08:00 UTC = 09:00 UK ✅
- **Summer (BST):** Cron at 08:00 UTC = 09:00 BST ✅ (works correctly!)

If you need exact 09:00/18:00 UK year-round regardless of daylight saving, you'll need to adjust the cron schedule twice yearly or use a timezone-aware service.

---

## 🔒 Security Notes

1. **CRON_SECRET:** This prevents unauthorized access to your cron endpoints. Keep it secret.
2. **Twitter Credentials:** Never commit to Git. Always use environment variables.
3. **Read-Only Safety:** The system is designed to only post scheduled content, never reply to mentions automatically.

---

## 🐛 Troubleshooting

### "Missing Twitter API credentials"
- Check all 4 environment variables are set in Vercel
- Verify variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

### "Unauthorized" when testing cron
- Verify `CRON_SECRET` matches in both Vercel and your test request
- Check Authorization header format: `Bearer YOUR_SECRET`

### "Failed to post tweet"
- Verify Twitter app has "Read and Write" permissions
- Check Access Token permissions in Twitter Developer Portal
- Ensure you're not hitting rate limits (300 tweets per 3 hours on free tier)

### Cron jobs not running
- Check Vercel Dashboard → Settings → Cron Jobs
- Verify `vercel.json` has correct cron configuration
- Check Vercel logs for errors
- Ensure environment variables are set for Production environment

---

## 📊 Monitoring

After deployment, monitor:
- Vercel Function Logs for cron execution
- Twitter account for posted tweets
- Error rates in Vercel Dashboard

---

**Status:** ✅ Ready for deployment after credentials are configured

