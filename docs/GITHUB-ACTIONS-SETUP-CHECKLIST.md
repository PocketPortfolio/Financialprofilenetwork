# ✅ GitHub Actions Deployment Setup Checklist

## Current Status

✅ **Workflow File:** `.github/workflows/deploy.yml` exists and is configured  
✅ **Triggers:** Automatic on push to `main`, manual via `workflow_dispatch`  
✅ **Repository:** `PocketPortfolio/Financialprofilenetwork`  
✅ **Branch:** `main`  

## Required Actions

### Step 1: Get Vercel Credentials

You need three values from your Vercel dashboard:

#### A. VERCEL_TOKEN
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `github-actions-deploy`
4. Copy the token (you'll only see it once!)

#### B. VERCEL_ORG_ID
1. Go to: https://vercel.com/[your-team-or-username]/settings
2. Look for "Team ID" or "User ID" in the General settings
3. Copy the ID (looks like: `team_xxxxx` or `user_xxxxx`)

**Alternative method:**
```bash
vercel whoami
# Then check your account/team ID
```

#### C. VERCEL_PROJECT_ID
1. Go to: https://vercel.com/[your-team]/pocket-portfolio-app/settings/general
2. Scroll to "Project ID"
3. Copy the ID (looks like: `prj_xxxxx`)

**Alternative method:**
```bash
vercel link
# This will show your project ID
```

### Step 2: Add Secrets to GitHub

1. Go to: https://github.com/PocketPortfolio/Financialprofilenetwork/settings/secrets/actions
2. Click "New repository secret" for each:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: [paste your Vercel token]

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: [paste your org/team ID]

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: [paste your project ID]

### Step 3: Test the Workflow

1. Go to: https://github.com/PocketPortfolio/Financialprofilenetwork/actions
2. Click on "Deploy to Vercel" workflow
3. Click "Run workflow" → "Run workflow" (manual trigger)
4. Watch the logs to verify:
   - ✅ CI checks pass
   - ✅ Build succeeds
   - ✅ Deployment to Vercel completes

### Step 4: Verify Deployment

1. Check Vercel Dashboard → Deployments
2. You should see a new deployment from GitHub Actions
3. Verify the site is updated

## How It Works

```
Push to main branch
    ↓
GitHub Actions triggers automatically
    ↓
Run CI checks (lint, typecheck, test)
    ↓
Build Next.js application
    ↓
Deploy to Vercel Production
    ↓
Site automatically updates
```

## Benefits

✅ **No Vercel Git Connection Needed**
- Works with any GitHub account
- No need to manage multiple Git connections

✅ **Full CI/CD Pipeline**
- Tests run before deployment
- Prevents broken code from going live

✅ **Automatic Deployments**
- Every push to `main` = automatic deployment
- No manual steps required

✅ **Preview Deployments**
- Pull requests get preview URLs automatically
- Test changes before merging

## Troubleshooting

### Workflow Fails with "Secret not found"
- Verify all three secrets are added
- Check secret names are exact (case-sensitive)

### Deployment Fails
- Check Vercel token has correct permissions
- Verify project ID matches your Vercel project
- Check Vercel dashboard for error messages

### CI Checks Fail
- Fix linting: `npm run lint:fix`
- Fix types: `npm run typecheck`
- Fix tests: `npm run test`

## Next Steps After Setup

1. ✅ Add the three GitHub secrets
2. ✅ Test with manual workflow trigger
3. ✅ Push a test commit to verify auto-deploy
4. ✅ Monitor first few deployments

## Related Documentation

- `docs/GITHUB-ACTIONS-DEPLOYMENT.md` - Full deployment guide
- `.github/workflows/deploy.yml` - Workflow configuration

