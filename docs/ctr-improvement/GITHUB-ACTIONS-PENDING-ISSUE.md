# GitHub Actions: Jobs Stuck in "Pending" Then Cancelled

**Date:** 2026-02-02  
**Status:** 🔧 **INVESTIGATING**  
**Issue:** Jobs get stuck in "pending" state and then get cancelled before they can run

---

## 🔍 Root Cause Analysis

### The Problem
1. **Multiple Cron Schedules Conflict:**
   - `generate-blog.yml` has 4+ cron schedules that can trigger simultaneously
   - At certain times (9 AM, 18:00, every even hour), multiple runs trigger at once
   - With `cancel-in-progress: true`, they keep cancelling each other before getting a runner

2. **GitHub Actions Free Tier Limits:**
   - Limited concurrent runners (20 max across all repos)
   - High demand periods = jobs wait in "pending" for runners
   - If a new scheduled run starts while previous is still "pending", it gets cancelled

3. **Concurrency Control Too Aggressive:**
   - `cancel-in-progress: true` cancels runs that are still waiting for runners
   - Jobs never get a chance to actually start executing

---

## 📊 Evidence

**Recent Pattern:**
- Run #977: queued (in progress) - 5m ago
- Run #976: completed (cancelled) - 10m ago
- Run #975: completed (cancelled) - 63m ago

**Pattern:** Jobs get queued → wait for runner → new scheduled run starts → cancels previous → cycle repeats

---

## ✅ Solutions

### Solution 1: Consolidate Cron Schedules (Recommended)
**Problem:** Multiple cron schedules trigger simultaneously, causing conflicts

**Fix:** Use a single cron schedule with internal logic to handle different scenarios

```yaml
on:
  schedule:
    # Single schedule - every 2 hours
    - cron: '0 */2 * * *'
  workflow_dispatch:
```

**Benefits:**
- ✅ Only one run at a time
- ✅ No conflicts between schedules
- ✅ Internal logic can handle different scenarios (hourly check, daily posts, etc.)

---

### Solution 2: Add Runner Wait Time
**Problem:** Jobs cancelled before they can get a runner

**Fix:** Add a delay before cancelling, or use `workflow_run` to chain workflows

**Alternative:** Use `workflow_run` to ensure previous run completes before starting new one

---

### Solution 3: Reduce Schedule Frequency
**Problem:** Too many scheduled runs competing for runners

**Fix:** Reduce from every hour + every 2 hours to just every 2 hours

**Current:**
- Every hour: `'0 * * * *'`
- Every 2 hours: `'0 */2 * * *'`
- At 9 AM: `'0 9 * * *'`
- At 18:00: `'0 18 * * *'`

**Proposed:**
- Every 2 hours: `'0 */2 * * *'` (covers hourly needs with internal logic)
- Remove redundant schedules

---

### Solution 4: Use Workflow Run Chaining
**Problem:** Multiple schedules cause conflicts

**Fix:** Use `workflow_run` to chain workflows sequentially

```yaml
on:
  workflow_run:
    workflows: ["blog-health-check"]
    types: [completed]
```

---

## 🎯 Recommended Fix

**Immediate Action:**
1. **Consolidate cron schedules** - Remove redundant hourly schedule
2. **Keep only essential schedules** - Every 2 hours + specific times if needed
3. **Add internal logic** - Handle hourly checks within the workflow script

**Long-term:**
1. Consider using `workflow_run` for sequential execution
2. Add retry logic for runner availability
3. Monitor GitHub Actions usage and consider upgrading if needed

---

## 📝 Implementation Plan

1. ✅ **Analyze current schedules** - Identify conflicts
2. ⏳ **Consolidate schedules** - Remove redundant ones
3. ⏳ **Test with single schedule** - Verify it works
4. ⏳ **Monitor for 24 hours** - Ensure no more pending/cancelled cycles

---

**Last Updated:** 2026-02-02  
**Status:** 🔧 **FIX IN PROGRESS**
