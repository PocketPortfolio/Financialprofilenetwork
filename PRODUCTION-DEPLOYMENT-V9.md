# 🚀 Production Deployment - Predator V9 + 10K/Day Capacity

**Date:** 2025-01-27  
**Version:** V9  
**Status:** ✅ **READY FOR PRODUCTION**

---

## ✅ Pre-Deployment Verification

### Code Changes
- [x] **Processing Capacity Increased**: `MAX_LEADS_TO_PROCESS` = 833 (matches 10K/day mandate)
- [x] **Proxy Configuration Added**: `SALES_PROXY_URL` added to GitHub Actions workflow
- [x] **Debug Logging**: Conditional (only active if `ENABLE_PREDATOR_DEBUG=true`)
- [x] **TypeScript Compilation**: ✅ No errors
- [x] **Linting**: ✅ No errors
- [x] **Version Consistency**: All references updated to V9

### Capacity Alignment
- **Sourcing**: 10,000 leads/day (12 runs × ~833 leads/run)
- **Processing**: 9,996 leads/day (12 runs × 833 leads/run)
- **Status**: ✅ **FULLY ALIGNED** (no bottleneck)

---

## 🔐 Required GitHub Secrets

### Critical (Must Have)
```bash
SUPABASE_SALES_DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

### Optional (Recommended)
```bash
SALES_PROXY_URL=http://user:pass@proxy-host:port  # For Predator bot (prevents Cloudflare bans)
GITHUB_TOKEN=ghp_...  # For GitHub sourcing (if enabled)
PRODUCTHUNT_API_TOKEN=...  # For Product Hunt sourcing (if enabled)
CRUNCHBASE_API_KEY=...  # For Crunchbase sourcing (if enabled)
TWITTER_BEARER_TOKEN=...  # For Twitter sourcing (if enabled)
```

### Optional (Rate Limiting & KV)
```bash
SALES_RATE_LIMIT_PER_DAY=50  # Default: 50 emails/day
KV_REST_API_URL=https://...  # For rate limiting (optional)
KV_REST_API_TOKEN=...  # For rate limiting (optional)
```

---

## 📋 Deployment Checklist

### 1. GitHub Secrets Configuration
- [ ] Verify `SUPABASE_SALES_DATABASE_URL` is set
- [ ] Verify `OPENAI_API_KEY` is set
- [ ] Verify `RESEND_API_KEY` is set
- [ ] Add `SALES_PROXY_URL` (if you have a proxy)
- [ ] Verify optional API keys are set (if using those channels)

### 2. Workflow Verification
- [x] Workflow file: `.github/workflows/autonomous-revenue-engine.yml`
- [x] Schedule: Every 2 hours (12 runs/day)
- [x] Manual trigger: Enabled (`workflow_dispatch`)
- [x] All jobs have `continue-on-error: true` (non-blocking)

### 3. Code Verification
- [x] `MAX_LEADS_TO_PROCESS = 833` in `scripts/process-leads-autonomous.ts`
- [x] `SALES_PROXY_URL` added to workflow
- [x] Debug logging is conditional
- [x] No hardcoded credentials
- [x] No blocking errors

### 4. Database
- [x] Schema verified
- [x] Migrations ready (if any)
- [x] Connection string configured

---

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "feat: Increase processing capacity to 833/run (10K/day mandate) + add proxy config"
git push origin main
```

### Step 2: Verify GitHub Secrets
1. Go to: Repository → Settings → Secrets and variables → Actions
2. Verify all required secrets are present
3. Add `SALES_PROXY_URL` if you have a proxy

### Step 3: Test Manual Trigger
1. Go to: Actions → Autonomous Revenue Engine
2. Click "Run workflow"
3. Select "enrich-and-email" job (to process your 180 leads)
4. Monitor execution

### Step 4: Verify Scheduled Runs
- Workflow runs automatically every 2 hours
- Check Actions tab after first scheduled run
- Verify logs show correct processing capacity

---

## 📊 Expected Behavior

### Lead Sourcing (source-leads job)
- **Frequency**: Every 2 hours
- **Target**: ~833 leads/run
- **Daily Capacity**: 10,000 leads/day
- **Status**: Creates leads with status `NEW`

### Lead Processing (enrich-and-email job)
- **Frequency**: Every 2 hours
- **Capacity**: 833 leads/run
- **Daily Capacity**: 9,996 leads/day
- **Processes**:
  - `NEW` leads → Enrichment → Status: `RESEARCHING`
  - `RESEARCHING` leads → Email generation → Status: `CONTACTED`
  - `CONTACTED` leads → Follow-ups (Steps 2-4)

### Your 180 Leads
- **Status**: Will be processed in **single run** (within 833 limit)
- **Action**: Manually trigger `enrich-and-email` job
- **Expected Time**: ~10-15 minutes for enrichment + email generation

---

## 🔍 Monitoring

### Key Metrics to Watch
1. **Sourcing Success Rate**: Check `source-leads` job logs
2. **Processing Capacity**: Verify 833 leads/run in logs
3. **Email Send Rate**: Monitor `enrich-and-email` job logs
4. **Error Rate**: Check for any workflow failures

### Log Locations
- GitHub Actions: Repository → Actions → Autonomous Revenue Engine
- Database: Check `leads` table for status updates
- Email Service: Check Resend dashboard for delivery status

---

## ⚠️ Troubleshooting

### Issue: Workflow fails with "SALES_PROXY_URL not found"
**Solution**: Add `SALES_PROXY_URL` to GitHub Secrets (or leave empty if no proxy)

### Issue: Processing only 50 leads instead of 833
**Solution**: Verify `MAX_LEADS_TO_PROCESS = 833` in `scripts/process-leads-autonomous.ts`

### Issue: Predator bot gets blocked by Cloudflare
**Solution**: Add valid `SALES_PROXY_URL` to GitHub Secrets

### Issue: Database connection errors
**Solution**: Verify `SUPABASE_SALES_DATABASE_URL` is correct in GitHub Secrets

---

## ✅ Post-Deployment Verification

After deployment, verify:

1. **Workflow Runs Successfully**
   - [ ] `source-leads` job completes without errors
   - [ ] `enrich-and-email` job completes without errors
   - [ ] `process-inbound` job completes without errors

2. **Processing Capacity**
   - [ ] Logs show processing up to 833 leads/run
   - [ ] No "limit reached" messages

3. **Lead Pipeline**
   - [ ] New leads are being sourced
   - [ ] Leads are being enriched
   - [ ] Emails are being sent

4. **Your 180 Leads**
   - [ ] All 180 leads processed in single run
   - [ ] Leads moved from `NEW` → `RESEARCHING` → `CONTACTED`
   - [ ] Emails sent successfully

---

## 🎯 Success Criteria

✅ **System is production-ready when:**
- All GitHub Secrets are configured
- Workflow runs successfully on manual trigger
- Processing capacity matches 10K/day mandate
- Your 180 leads are processed successfully
- Scheduled runs execute every 2 hours without errors

---

**Ready to deploy!** 🚀

