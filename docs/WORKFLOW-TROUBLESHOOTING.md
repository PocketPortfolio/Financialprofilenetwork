# GitHub Actions Workflow Troubleshooting

## Issue: Workflow Not Triggering

If the workflow doesn't trigger even with manual dispatch, check the following:

### 1. Verify Workflow File Location
- ✅ File must be at: `.github/workflows/deploy.yml`
- ✅ File must be committed and pushed to the repository
- ✅ Check: `git ls-files .github/workflows/deploy.yml`

### 2. Check Workflow Syntax
The workflow file must be valid YAML:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:
```

### 3. Verify GitHub Actions is Enabled
1. Go to: Repository → Settings → Actions → General
2. Check "Allow all actions and reusable workflows"
3. Verify "Workflow permissions" are set correctly

### 4. Check Repository Permissions
- Ensure you have write access to the repository
- Check if Actions are enabled for the repository
- Verify branch protection rules aren't blocking

### 5. Verify Secrets are Set
Required secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Check: Repository → Settings → Secrets and variables → Actions

### 6. Check Workflow Logs
1. Go to: Actions tab
2. Click on the workflow
3. Check for any error messages
4. Look for "Skipped" status (might indicate conditions not met)

### 7. Manual Trigger Steps
1. Go to: https://github.com/PocketPortfolio/Financialprofilenetwork/actions/workflows/deploy.yml
2. Click "Run workflow" (top right)
3. Select branch: `main`
4. Click green "Run workflow" button
5. Check if a new run appears in the list

### 8. Common Issues

**Issue: "Workflow run skipped"**
- Check if branch matches `main`
- Verify workflow file is on the correct branch
- Check if there are any conditions preventing execution

**Issue: "No workflow runs appear"**
- Workflow file might not be committed
- Check if file exists in the repository
- Verify YAML syntax is valid

**Issue: "Workflow fails immediately"**
- Check secrets are set correctly
- Verify Vercel credentials are valid
- Check workflow file syntax

### 9. Force Trigger Test
Create a test commit to trigger automatic run:
```bash
git commit --allow-empty -m "Trigger workflow test"
git push origin main
```

### 10. Alternative: Use GitHub CLI
If GitHub CLI is installed:
```bash
gh workflow run deploy.yml
gh run watch
```

## Current Workflow Configuration

**File:** `.github/workflows/deploy.yml`
**Triggers:**
- Automatic: Push to `main` branch
- Manual: `workflow_dispatch`

**Latest Changes:**
- Made CI checks non-blocking (won't fail deployment)
- Tests, lint, and typecheck warnings won't stop deployment

## Next Steps

1. Verify workflow file is committed: `git ls-files .github/workflows/deploy.yml`
2. Check Actions tab for any error messages
3. Try manual trigger again
4. If still not working, check repository settings






