# GitHub Actions Deployment Guide

## Overview

Pocket Portfolio uses GitHub Actions to deploy to Vercel, bypassing the need for Vercel's Git integration. This allows us to deploy from the `PocketPortfolio/Financialprofilenetwork` repository without connecting it directly in Vercel.

## Workflow Configuration

**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Automatic: Pushes to `main` branch
- Manual: `workflow_dispatch` (can be triggered manually from GitHub Actions)

**Jobs:**
1. **deploy-production** - Deploys to Vercel production on pushes to `main`
2. **deploy-preview** - Creates preview deployments for pull requests

## Required GitHub Secrets

The workflow requires these secrets to be configured in GitHub:

1. **VERCEL_TOKEN**
   - Get from: Vercel Dashboard → Settings → Tokens
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID**
   - Get from: Vercel Dashboard → Settings → General
   - Or via CLI: `vercel whoami` and check your account/team ID

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel Dashboard → Project Settings → General
   - Or from the project URL: `vercel.com/[team]/[project]`

## Setup Instructions

### Step 1: Get Vercel Credentials

1. **Get Vercel Token:**
   ```bash
   # Via Vercel CLI
   vercel login
   vercel tokens create
   ```
   Or go to: https://vercel.com/account/tokens

2. **Get Organization ID:**
   - Go to Vercel Dashboard → Settings → General
   - Copy the "Team ID" or "User ID"

3. **Get Project ID:**
   - Go to Project Settings → General
   - Copy the "Project ID"

### Step 2: Add Secrets to GitHub

1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/settings/secrets/actions`
2. Click "New repository secret" for each:
   - `VERCEL_TOKEN` = [your Vercel token]
   - `VERCEL_ORG_ID` = [your Vercel org/team ID]
   - `VERCEL_PROJECT_ID` = [your Vercel project ID]

### Step 3: Verify Workflow

1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/actions`
2. Find "Deploy to Vercel" workflow
3. Click "Run workflow" → "Run workflow" (manual test)
4. Check the logs to verify deployment

## How It Works

1. **On Push to Main:**
   - Workflow triggers automatically
   - Runs CI checks (lint, typecheck, test)
   - Builds the project
   - Deploys to Vercel Production

2. **On Pull Request:**
   - Creates a preview deployment
   - Comments on PR with preview URL

3. **Manual Trigger:**
   - Can be triggered from Actions tab
   - Useful for re-deploying without pushing code

## Deployment Process

```
Push to main
    ↓
GitHub Actions triggers
    ↓
Run CI checks (lint, typecheck, test)
    ↓
Build Next.js app
    ↓
Deploy to Vercel Production
    ↓
Vercel automatically updates production site
```

## Troubleshooting

### Workflow Fails

1. **Check Secrets:**
   - Verify all three secrets are set correctly
   - Secrets are case-sensitive

2. **Check Vercel Token:**
   - Token must have deployment permissions
   - Token might have expired (create new one)

3. **Check Project ID:**
   - Ensure project ID matches your Vercel project
   - Project must exist in the specified org/team

### Deployment Not Appearing

1. Check Vercel Dashboard → Deployments
2. Check GitHub Actions logs for errors
3. Verify Vercel project is active

### CI Checks Failing

- Fix linting errors: `npm run lint:fix`
- Fix type errors: `npm run typecheck`
- Fix test failures: `npm run test`

## Benefits of This Approach

✅ **No Vercel Git Connection Needed**
- Works with any GitHub account
- No need to disconnect/reconnect accounts

✅ **Full Control**
- Deploy when you want
- Manual triggers available

✅ **CI/CD Integration**
- Runs tests before deployment
- Prevents broken code from deploying

✅ **Preview Deployments**
- Automatic previews for PRs
- Test changes before merging

## Next Steps

1. ✅ Workflow file exists (`.github/workflows/deploy.yml`)
2. ⏳ Add GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
3. ⏳ Test deployment (manual trigger)
4. ✅ Auto-deploy on push to `main`

## Related Files

- `.github/workflows/deploy.yml` - Deployment workflow
- `.github/workflows/ci.yml` - CI pipeline
- `vercel.json` - Vercel configuration

