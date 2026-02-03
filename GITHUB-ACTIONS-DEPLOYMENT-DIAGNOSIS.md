# 🔍 GitHub Actions Auto-Deployment Diagnosis

## Issue
Automatic deployment from GitHub to Vercel did not trigger after pushing to `main` branch.

## Workflow Configuration

**File:** `.github/workflows/deploy.yml`

**Expected Behavior:**
- ✅ Should trigger automatically on push to `main` branch
- ✅ Should also be manually triggerable via `workflow_dispatch`

**Recent Commits:**
- `8d2a663` - "fix: Add framer-motion dependency for SponsorDeck component"
- `3a2c6ba` - "feat: Add global Founders Club banner and Sponsor Focus Deck"

## Possible Root Causes

### 1. GitHub Actions Disabled
**Check:** Repository Settings → Actions → General
- [ ] Actions are enabled for this repository
- [ ] "Allow all actions and reusable workflows" is selected (or at least "Allow local actions and reusable workflows")
- [ ] Workflow permissions are set correctly

**Fix:** Enable Actions if disabled

### 2. Missing GitHub Secrets
**Check:** Repository Settings → Secrets and variables → Actions

Required secrets:
- [ ] `VERCEL_TOKEN` - Vercel API token
- [ ] `VERCEL_ORG_ID` - Vercel organization/team ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID

**How to Check:**
1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/settings/secrets/actions`
2. Verify all three secrets exist
3. If missing, add them (see setup instructions below)

**Fix:** Add missing secrets

### 3. Workflow File Issues
**Check:** Workflow file syntax and location
- [ ] File exists at `.github/workflows/deploy.yml`
- [ ] YAML syntax is valid
- [ ] No indentation errors

**Fix:** Validate YAML syntax

### 4. Workflow Not Running (Silent Failure)
**Check:** GitHub Actions tab
1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/actions`
2. Check if workflow runs appear for recent commits
3. If runs exist but failed, check logs for errors

**Common Failure Reasons:**
- Missing secrets (workflow fails at "Verify Secrets" step)
- Build errors
- Vercel deployment errors

### 5. Branch Protection Rules
**Check:** Repository Settings → Branches → Branch protection rules
- [ ] No rules blocking GitHub Actions
- [ ] Workflows have required permissions

**Fix:** Adjust branch protection rules if needed

### 6. Workflow Permissions
**Check:** `.github/workflows/deploy.yml` permissions section
- [ ] Workflow has `contents: read` permission
- [ ] Workflow has `actions: read` permission (if needed)

**Current Status:** Workflow doesn't explicitly set permissions, uses default

## Diagnostic Steps

### Step 1: Check GitHub Actions Status
```bash
# Visit GitHub Actions page
https://github.com/PocketPortfolio/Financialprofilenetwork/actions
```

**Look for:**
- Recent workflow runs for commits `8d2a663` and `3a2c6ba`
- Any failed runs
- Any error messages

### Step 2: Verify Secrets Are Set
```bash
# Check if secrets exist (requires GitHub CLI or manual check)
# Manual: Go to repository settings → Secrets → Actions
```

**Required Secrets:**
1. `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
2. `VERCEL_ORG_ID` - Get from: Vercel Dashboard → Settings → General
3. `VERCEL_PROJECT_ID` - Get from: Project Settings → General

### Step 3: Test Manual Trigger
1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/actions/workflows/deploy.yml`
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"
5. Watch for errors

### Step 4: Check Workflow Logs
If workflow ran but failed:
1. Click on the failed run
2. Expand "Verify Secrets" step
3. Check for error messages:
   - `❌ ERROR: VERCEL_TOKEN secret is not set`
   - `❌ ERROR: VERCEL_ORG_ID secret is not set`
   - `❌ ERROR: VERCEL_PROJECT_ID secret is not set`

## Quick Fix: Get Vercel Credentials

### ✅ Found Vercel Project Configuration

**From `.vercel/project.json`:**
- **VERCEL_PROJECT_ID:** `prj_xmupQQfumETKPAmKooDEPMjeAfz2`
- **VERCEL_ORG_ID:** `team_xEo3S3FB1aFM2xV5gxZY36Gj`
- **Project Name:** `pocket-portfolio-app`

### Get VERCEL_TOKEN
```bash
# Via Vercel CLI
vercel login
vercel tokens create
# Or visit: https://vercel.com/account/tokens
# Name it: "github-actions-deploy"
```

**Note:** You'll only see the token once when creating it. Copy it immediately!

## Add Secrets to GitHub

1. Go to: `https://github.com/PocketPortfolio/Financialprofilenetwork/settings/secrets/actions`
2. Click "New repository secret" for each:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: [Get from https://vercel.com/account/tokens - create new token]

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: `team_xEo3S3FB1aFM2xV5gxZY36Gj` ✅ (Found in .vercel/project.json)

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `prj_xmupQQfumETKPAmKooDEPMjeAfz2` ✅ (Found in .vercel/project.json)

3. Make sure each secret is enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional but recommended)

## Test After Fixing

1. **Manual Trigger Test:**
   - Go to Actions → Deploy to Vercel → Run workflow
   - Select `main` branch
   - Click "Run workflow"
   - Watch for success

2. **Automatic Trigger Test:**
   - Make a small commit (e.g., update README)
   - Push to `main`
   - Check Actions tab for automatic run

## Alternative: Use Vercel Git Integration

If GitHub Actions continues to fail, consider using Vercel's native Git integration:

1. Go to Vercel Dashboard → Project Settings → Git
2. Connect GitHub repository
3. Enable automatic deployments
4. This will deploy automatically on every push to `main`

**Note:** This requires giving Vercel access to your GitHub repository.

## Current Workflow Status

**Workflow File:** ✅ Exists at `.github/workflows/deploy.yml`
**Triggers:** ✅ Configured for `push: branches: [main]`
**Manual Trigger:** ✅ Available via `workflow_dispatch`
**Secrets Required:** ⚠️ Need to verify in GitHub settings

## Next Steps

1. **Check GitHub Actions page** for any failed runs
2. **Verify secrets** are configured in GitHub
3. **Test manual trigger** to see specific error messages
4. **Fix any missing secrets** or configuration issues
5. **Re-test automatic deployment** with a new commit

---

**Last Updated:** 2026-02-02
**Workflow Version:** v25 (amondnet/vercel-action@v25)
