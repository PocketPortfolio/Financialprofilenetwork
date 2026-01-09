# 🚀 Production Deployment Checklist - v2.1

**Date:** $(date)  
**Version:** 2.1 (£100k/Year Protocol)  
**Status:** ✅ READY FOR DEPLOYMENT

---

## ✅ Pre-Deployment Verification

### 1. Code Changes Verified
- [x] **Fix 1:** `calculatePipelineValue()` excludes `UNQUALIFIED` leads
- [x] **Fix 2:** `calculateProjectedRevenue()` excludes `UNQUALIFIED` leads
- [x] **Fix 3:** `source-leads-autonomous.ts` uses dynamic revenue-driven targeting
- [x] **Fix 4:** Email validation with MX record checking
- [x] **Fix 5:** 4-step email sequence state machine
- [x] **Fix 6:** Hard quota limits (100/day, 3000/month)
- [x] **Fix 7:** Revenue target updated to £8,333/month (£100k/year)

### 2. Database Schema
- [x] `UNQUALIFIED` status exists in `lead_status` enum
- [x] `sequence_step` column exists in `leads` table
- [x] `EMAIL_SCHEDULED` action exists in `audit_action` enum
- [x] Migration scripts tested and verified

### 3. GitHub Actions Workflow
- [x] Scheduled at 06:00 UTC daily for lead sourcing
- [x] Runs every 2 hours for enrichment & email generation
- [x] Runs every hour for inbound email processing
- [x] All steps have `continue-on-error: true` (non-blocking)
- [x] Required secrets configured:
  - `SUPABASE_SALES_DATABASE_URL`
  - `OPENAI_API_KEY`
  - `RESEND_API_KEY`
  - `GITHUB_TOKEN`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `SALES_RATE_LIMIT_PER_DAY`

### 4. Feedback Loop Verified
- [x] Sabotage test passed: System detects revenue gap
- [x] UNQUALIFIED leads excluded from pipeline calculations
- [x] Dynamic sourcing target adjusts based on revenue gap
- [x] Auto-replenishment mechanism confirmed

---

## 🔄 What Happens When Workflow Runs (With UNQUALIFIED Leads)

### Scenario: Manual Workflow Trigger with Existing UNQUALIFIED Leads

#### **Job 1: Source New Leads** (`source-leads`)

**Step 1: Fetch All Leads**
- Fetches ALL leads from database (including UNQUALIFIED)
- No filtering at this stage

**Step 2: Calculate Revenue Metrics**
- Passes all leads to `getRevenueDrivenDecisions()`
- `calculatePipelineValue()` **excludes** UNQUALIFIED leads
- `calculateProjectedRevenue()` **excludes** UNQUALIFIED leads
- Result: Pipeline value reflects only valid leads

**Step 3: Determine Dynamic Target**
- Calculates revenue gap: `£8,333 - projectedRevenue`
- If UNQUALIFIED leads exist → pipeline value is lower → gap is larger
- System calculates: `leadsNeededPerDay = revenueGap / (revenuePerLead * daysRemaining)`
- Target is clamped between 20 (MIN) and 200 (MAX)

**Step 4: Source New Leads**
- Sources leads from GitHub, YC, hiring posts
- Validates emails with MX record check
- Rejects placeholder emails
- Creates new leads with status `NEW`
- **Result:** System automatically replaces UNQUALIFIED leads with valid ones

**Example Output:**
```
📊 Revenue-Driven Sourcing:
   Current Revenue: £0
   Projected Revenue: £0 (UNQUALIFIED leads excluded)
   Revenue Gap: £8,333
   Action: INCREASE
   Target: 200 qualified leads/day (Revenue-driven)
   Reason: Revenue at £0, projected £0. Need 200 leads/day to hit £8,333 target.
```

---

#### **Job 2: Enrich Leads & Send Emails** (`enrich-and-email`)

**Step 1: Update Scheduled Emails**
- Finds `SCHEDULED` leads where `scheduledSendAt` has passed
- Updates status to `CONTACTED`
- **UNQUALIFIED leads:** Skipped (not in `SCHEDULED` status)

**Step 2: Re-enrich Stale Leads**
- Finds leads with `score = 0` or `researchSummary = "Research pending"`
- Re-enriches them with AI-generated summaries
- **UNQUALIFIED leads:** Skipped (not processed for enrichment)

**Step 3: Process Leads**
- Processes `NEW` leads → enriches → sends initial email
- Processes `RESEARCHING` leads → sends initial email (Step 1)
- Processes `CONTACTED` leads → sends follow-ups (Steps 2-4)
- **UNQUALIFIED leads:** Completely skipped (not in any active status)

**Result:** UNQUALIFIED leads are ignored during processing. System only works with valid leads.

---

#### **Job 3: Process Inbound Emails** (`process-inbound`)

- Processes replies from leads
- Generates AI responses
- Updates lead status (`REPLIED`, `INTERESTED`, etc.)
- **UNQUALIFIED leads:** No inbound emails expected (invalid emails)

---

## 📊 Dashboard Behavior with UNQUALIFIED Leads

### Tab Configuration
- **Fresh Tab:** Shows `NEW`, `RESEARCHING` (UNQUALIFIED excluded)
- **Active Tab:** Shows `SCHEDULED`, `CONTACTED`, `REPLIED`, `INTERESTED`, `NEGOTIATING` (UNQUALIFIED excluded)
- **Archive Tab:** Shows `CONVERTED`, `NOT_INTERESTED`, `DO_NOT_CONTACT`, **`UNQUALIFIED`** ✅

### Metrics Calculation
- **Pipeline Value:** Excludes UNQUALIFIED leads ✅
- **Projected Revenue:** Excludes UNQUALIFIED leads ✅
- **Current Revenue:** Only counts `CONVERTED` leads
- **Lead Counts:** UNQUALIFIED shown only in Archive tab

---

## 🛡️ Safety Mechanisms

### 1. Email Validation
- MX record checking before lead creation
- Invalid emails marked as `UNQUALIFIED` immediately
- Prevents "Delivery Delayed" errors

### 2. Quota Limits
- **Daily:** 100 emails/24h (hard limit)
- **Monthly:** 3000 emails/30d (hard limit)
- System throws error if exceeded

### 3. Sequence Tracking
- 4-step email sequence with wait periods
- Prevents spamming (3, 4, 7 day waits)
- Leads marked `DO_NOT_CONTACT` after Step 4 if no response

### 4. Revenue-Driven Volume
- Dynamic target based on revenue gap
- Auto-adjusts when leads are disqualified
- Clamped to safety limits (20-200 leads/day)

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
```bash
# Verify all tests pass
npm run typecheck
npm run lint

# Verify database schema
npm run db:verify

# Test locally (optional)
npm run source-leads-autonomous
npm run process-leads-autonomous
```

### 2. GitHub Actions
- [x] Workflow file committed
- [x] All secrets configured in GitHub
- [x] Workflow enabled in repository settings

### 3. Database Migrations
- [x] `UNQUALIFIED` status added to enum
- [x] `sequence_step` column added
- [x] `EMAIL_SCHEDULED` action added
- [x] Migrations run in production (via workflow)

### 4. Post-Deployment Verification
- [ ] Monitor first workflow run (06:00 UTC)
- [ ] Verify leads are sourced correctly
- [ ] Verify UNQUALIFIED leads appear in Archive tab
- [ ] Verify pipeline value excludes UNQUALIFIED
- [ ] Verify dynamic target adjusts correctly

---

## 📝 Expected Behavior Summary

### With UNQUALIFIED Leads Present:

1. **Sourcing Run:**
   - Fetches all leads (including UNQUALIFIED)
   - Calculates revenue metrics (excludes UNQUALIFIED)
   - Detects larger revenue gap
   - Sets higher target (up to 200/day)
   - Sources new valid leads to replace UNQUALIFIED ones

2. **Processing Run:**
   - Skips UNQUALIFIED leads completely
   - Only processes valid leads (`NEW`, `RESEARCHING`, `CONTACTED`, etc.)
   - Enriches and sends emails to valid leads only

3. **Dashboard:**
   - UNQUALIFIED leads visible in Archive tab only
   - Pipeline value excludes UNQUALIFIED
   - Metrics reflect only valid leads

### Result:
✅ **System automatically replaces UNQUALIFIED leads with valid ones**  
✅ **No manual intervention required**  
✅ **Self-healing mechanism active**

---

## 🎯 Success Criteria

- [ ] Workflow runs successfully at 06:00 UTC
- [ ] New leads are sourced and validated
- [ ] UNQUALIFIED leads excluded from pipeline calculations
- [ ] Dynamic target adjusts based on revenue gap
- [ ] No errors in workflow logs
- [ ] Dashboard displays UNQUALIFIED leads in Archive tab only

---

## 📞 Support & Monitoring

- **Workflow Logs:** GitHub Actions → Autonomous Revenue Engine
- **Database:** Supabase Dashboard → Sales Database
- **Metrics:** Admin Dashboard → `/admin/sales`

---

**Status:** ✅ **READY FOR PRODUCTION DEPLOYMENT**

**Next Action:** Merge to `main` branch and monitor first scheduled run.

