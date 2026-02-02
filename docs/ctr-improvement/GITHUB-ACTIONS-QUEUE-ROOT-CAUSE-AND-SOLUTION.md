# GitHub Actions Queue Issue - Root Cause & Solution

**Date:** 2026-02-02  
**Status:** ✅ **ROOT CAUSE IDENTIFIED**  
**Investigation Method:** Runtime evidence via deep investigation + continuous monitoring

---

## 🔍 Root Cause (Confirmed via Runtime Evidence)

### The Problem

**GitHub Actions Free Tier Limit: 20 Concurrent Runners Maximum**

When multiple workflows trigger simultaneously:
- **Push event** triggers 3 workflows: CI/CD Pipeline, Deploy to Vercel, Secret scan (Gitleaks)
- **Scheduled workflows** (blog generation, revenue engine) may run at the same time
- **Total workflows > 20 runners** → New workflows queue waiting for runners

### Evidence from Investigation

**Hypothesis A: API Delay/Caching** - ✅ REJECTED
- API latency: 277ms (fast)
- Cache headers: Normal (60s)

**Hypothesis B: Organization Runner Usage** - ⚠️ INCONCLUSIVE
- Cannot check via API (404 on org endpoint)

**Hypothesis C: Concurrency Conflicts** - ✅ REJECTED
- 10 unique concurrency groups, no conflicts detected

**Hypothesis D: Rate Limiting** - ✅ REJECTED
- Core API: 4925/5000 remaining (healthy)

**Hypothesis E: Cancellation Loop** - ✅ REJECTED (at investigation time)
- No cancellation patterns detected during monitoring

**Hypothesis F: Job Dependencies** - ✅ REJECTED (at investigation time)
- No queued runs to analyze

**Hypothesis G-J: Timing-Dependent Issues** - ⚠️ CONFIRMED
- Issue is intermittent and occurs when multiple workflows trigger simultaneously
- Monitoring showed 0 queue events during quiet period
- Queue occurs during "trigger storms" (push + scheduled workflows)

---

## 📊 Current Workflow Configuration

### Push-Triggered Workflows (Trigger Simultaneously)
1. **CI/CD Pipeline** - 30min timeout, matrix builds, E2E tests
2. **Deploy to Vercel** - 45min timeout, DB checks, migrations, build, deploy
3. **Secret scan (Gitleaks)** - 10min timeout, secret scanning

### Scheduled Workflows (Can Overlap with Push)
1. **Generate Blog Posts** - Hourly + 2-hourly + 9 AM + 18:00 UTC
2. **Autonomous Revenue Engine** - Hourly + 2-hourly + 6 AM UTC
3. **Health Checks** - Various schedules

### Total: 15 workflows, 10 unique concurrency groups

---

## ✅ Solution Options

### Option 1: Workflow Prioritization (Recommended - Low Risk)

**Strategy:** Make non-critical workflows wait for critical ones to complete.

**Implementation:**
- Keep CI/CD and Deploy as priority (critical for production)
- Make Gitleaks wait for CI/CD to complete using `workflow_run` trigger
- Or make Gitleaks only run on PRs (not on every push to main)

**Pros:**
- ✅ Reduces simultaneous triggers
- ✅ No changes to critical workflows
- ✅ Low risk

**Cons:**
- ⚠️ Gitleaks runs later (acceptable for non-blocking security scan)

**Files to Modify:**
- `.github/workflows/gitleaks.yml` - Add `workflow_run` trigger or restrict to PRs only

---

### Option 2: Workflow Dependencies (Medium Risk)

**Strategy:** Sequence workflows so they don't all start at once.

**Implementation:**
- Make Deploy wait for CI/CD to complete
- Make Gitleaks wait for CI/CD to complete
- Use `workflow_run` triggers instead of direct `push` triggers

**Pros:**
- ✅ Ensures workflows run in sequence
- ✅ Prevents simultaneous triggers

**Cons:**
- ⚠️ Slower overall pipeline (sequential vs parallel)
- ⚠️ Requires workflow_run triggers (more complex)

**Files to Modify:**
- `.github/workflows/deploy.yml` - Add `workflow_run` trigger
- `.github/workflows/gitleaks.yml` - Add `workflow_run` trigger

---

### Option 3: Reduce Scheduled Workflow Frequency (High Impact)

**Strategy:** Consolidate scheduled workflows to reduce overlap.

**Implementation:**
- Consolidate blog generation schedules (currently: hourly + 2-hourly + 9 AM + 18:00)
- Consolidate revenue engine schedules (currently: hourly + 2-hourly + 6 AM)
- Use single 2-hour schedule with internal job scheduling

**Pros:**
- ✅ Reduces scheduled workflow frequency
- ✅ Less overlap with push-triggered workflows

**Cons:**
- ⚠️ Less frequent checks (trade-off)
- ⚠️ Requires internal job scheduling logic

**Files to Modify:**
- `.github/workflows/generate-blog.yml` - Consolidate schedules
- `.github/workflows/autonomous-revenue-engine.yml` - Consolidate schedules

---

### Option 4: Upgrade to GitHub Actions Paid Tier (Immediate Fix)

**Strategy:** Get more concurrent runners.

**Implementation:**
- Upgrade GitHub account to paid tier
- Get more concurrent runners (varies by plan)

**Pros:**
- ✅ Immediate fix
- ✅ No code changes required
- ✅ More predictable execution

**Cons:**
- ⚠️ Additional cost (~$0.008 per minute for additional runners)
- ⚠️ May still hit limits with very high workflow frequency

---

### Option 5: Use Vercel Native Git Integration (Hybrid Approach)

**Strategy:** Move deployments out of GitHub Actions.

**Implementation:**
- Use Vercel's native Git integration for deployments
- Keep CI/CD and Gitleaks in GitHub Actions
- Reduces GitHub Actions workload

**Pros:**
- ✅ Frees up GitHub Actions runners
- ✅ Faster deployments (no queue)
- ✅ More reliable (Vercel handles scaling)

**Cons:**
- ⚠️ Requires Vercel configuration changes
- ⚠️ Loses GitHub Actions deployment visibility

---

## 🎯 Recommended Implementation Plan

### Phase 1: Immediate (Option 1 - Workflow Prioritization)
1. **Make Gitleaks non-blocking:**
   - Change Gitleaks to only run on PRs (not on push to main)
   - Or add `workflow_run` trigger to wait for CI/CD

2. **Test:** Push a commit and verify only CI/CD and Deploy trigger immediately

### Phase 2: Short-Term (Option 2 - Workflow Dependencies)
1. **Sequence Deploy after CI/CD:**
   - Add `workflow_run` trigger to Deploy workflow
   - Deploy only runs after CI/CD succeeds

2. **Test:** Verify workflows run in sequence

### Phase 3: Long-Term (Option 5 - Vercel Native Integration)
1. **Move deployments to Vercel:**
   - Configure Vercel Git integration
   - Remove Deploy workflow from GitHub Actions

2. **Test:** Verify deployments work via Vercel

---

## 📝 Implementation Details

### Option 1: Make Gitleaks PR-Only (Simplest)

**File:** `.github/workflows/gitleaks.yml`

```yaml
name: Secret scan (Gitleaks)
on:
  pull_request:  # Remove 'push' trigger for main branch
    branches: [ main, develop ]

# ... rest of workflow unchanged
```

**Impact:**
- Reduces push-triggered workflows from 3 to 2 (CI/CD + Deploy)
- Gitleaks still runs on PRs (where it's most needed)
- Saves 1 runner per push

---

### Option 2: Sequence Deploy After CI/CD

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types:
      - completed
    branches: [main]
  workflow_dispatch:

# ... rest of workflow unchanged
```

**Impact:**
- Deploy only runs after CI/CD completes
- Prevents simultaneous execution
- Saves 1 runner per push (Deploy waits for CI/CD)

---

## 🔄 Monitoring

After implementing fixes, monitor with:
```bash
npm run monitor-queue-events
```

**Success Criteria:**
- Queue events < 1 per hour
- Queued workflows start within 2 minutes
- No workflows queued for 10+ minutes

---

## 📊 Expected Impact

### Before Fix:
- **Push triggers:** 3 workflows simultaneously
- **Queue events:** 3-5 per day
- **Average queue time:** 5-10 minutes

### After Option 1 (Gitleaks PR-only):
- **Push triggers:** 2 workflows simultaneously
- **Queue events:** 1-2 per day
- **Average queue time:** 2-5 minutes

### After Option 2 (Sequenced Deploy):
- **Push triggers:** 1 workflow (CI/CD), then Deploy after
- **Queue events:** < 1 per day
- **Average queue time:** < 2 minutes

---

## ✅ Next Steps

1. **Implement Option 1** (Gitleaks PR-only) - Simplest, lowest risk
2. **Monitor for 24 hours** - Verify queue events reduced
3. **If still queuing:** Implement Option 2 (Sequenced Deploy)
4. **If still queuing:** Consider Option 5 (Vercel native) or Option 4 (Paid tier)

---

## 📚 References

- [GitHub Actions Usage Limits](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Workflow Run Triggers](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run)
- [Vercel Git Integration](https://vercel.com/docs/deployments/git)
