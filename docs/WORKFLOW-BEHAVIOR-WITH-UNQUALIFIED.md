# 🔄 Workflow Behavior with UNQUALIFIED Leads

## What Happens When You Trigger Manual Workflow Run (With UNQUALIFIED Leads)

### Current State
- You have existing `UNQUALIFIED` leads in the database
- These leads have invalid emails (no MX records, placeholder emails, etc.)
- They are marked as `UNQUALIFIED` status

---

## 📋 Step-by-Step Workflow Execution

### **Job 1: Source New Leads** (`source-leads`)

#### What Happens:

1. **Fetches All Leads**
   ```typescript
   const allLeads = await db.select().from(leads);
   // Includes UNQUALIFIED leads
   ```

2. **Calculates Revenue Metrics**
   ```typescript
   const revenueDecisions = getRevenueDrivenDecisions(allLeads.map(...));
   // UNQUALIFIED leads are EXCLUDED from:
   // - calculatePipelineValue()
   // - calculateProjectedRevenue()
   ```

3. **Determines Dynamic Target**
   - Pipeline value: **LOWER** (because UNQUALIFIED excluded)
   - Projected revenue: **LOWER** (because UNQUALIFIED excluded)
   - Revenue gap: **LARGER** (because projected revenue is lower)
   - **Result:** System calculates **HIGHER** target to compensate

4. **Sources New Valid Leads**
   - Validates emails with MX record check
   - Rejects invalid emails immediately
   - Creates new leads with status `NEW`
   - **Result:** System automatically replaces UNQUALIFIED leads

#### Example Output:
```
📊 Revenue-Driven Sourcing:
   Current Revenue: £0
   Projected Revenue: £0 (UNQUALIFIED leads excluded from calculation)
   Revenue Gap: £8,333 (larger because UNQUALIFIED excluded)
   Action: INCREASE
   Target: 200 qualified leads/day (Revenue-driven)
   Reason: Revenue at £0, projected £0. Need 200 leads/day to hit £8,333 target.
```

**Key Point:** The system **detects** the revenue gap caused by UNQUALIFIED leads and **automatically increases** the sourcing target to fill it.

---

### **Job 2: Enrich Leads & Send Emails** (`enrich-and-email`)

#### What Happens:

1. **Update Scheduled Emails**
   - Finds `SCHEDULED` leads where email was sent
   - Updates to `CONTACTED`
   - **UNQUALIFIED leads:** Not affected (not in `SCHEDULED` status)

2. **Re-enrich Stale Leads**
   - Finds leads with `score = 0` or stale research
   - Re-enriches with AI summaries
   - **UNQUALIFIED leads:** Skipped (not processed)

3. **Process Leads**
   - Processes `NEW` → enriches → sends initial email
   - Processes `RESEARCHING` → sends initial email
   - Processes `CONTACTED` → sends follow-ups (Steps 2-4)
   - **UNQUALIFIED leads:** Completely skipped (not in active statuses)

#### Example Output:
```
🔍 Processing NEW leads (enrichment)...
   Found 5 NEW leads to enrich
   ✅ Enriched: 5 leads

📧 Processing RESEARCHING leads (email generation)...
   Found 3 RESEARCHING leads to contact
   ✅ Sent: 3 initial emails

📧 Processing CONTACTED leads for follow-ups...
   Found 10 CONTACTED leads to check for follow-ups
   ⏭️  Skipping (waiting for wait period)
   ✅ Sent: 2 follow-up emails
```

**Key Point:** UNQUALIFIED leads are **completely ignored** during processing. System only works with valid leads.

---

### **Job 3: Process Inbound Emails** (`process-inbound`)

#### What Happens:

- Processes replies from valid leads
- Generates AI responses
- Updates lead status
- **UNQUALIFIED leads:** No inbound emails expected (invalid emails don't receive emails)

---

## 📊 Dashboard Impact

### Tab Visibility:
- **Fresh Tab:** `NEW`, `RESEARCHING` (UNQUALIFIED excluded) ✅
- **Active Tab:** `SCHEDULED`, `CONTACTED`, `REPLIED`, `INTERESTED`, `NEGOTIATING` (UNQUALIFIED excluded) ✅
- **Archive Tab:** `CONVERTED`, `NOT_INTERESTED`, `DO_NOT_CONTACT`, **`UNQUALIFIED`** ✅

### Metrics:
- **Pipeline Value:** Excludes UNQUALIFIED ✅
- **Projected Revenue:** Excludes UNQUALIFIED ✅
- **Current Revenue:** Only `CONVERTED` leads
- **Lead Counts:** UNQUALIFIED shown only in Archive tab

---

## 🎯 Summary: What Will Happen

### ✅ **Good News:**

1. **UNQUALIFIED leads are handled correctly:**
   - Excluded from pipeline calculations
   - Excluded from revenue projections
   - Shown only in Archive tab
   - Completely skipped during processing

2. **System automatically compensates:**
   - Detects revenue gap (caused by UNQUALIFIED exclusion)
   - Calculates higher sourcing target
   - Sources new valid leads to replace UNQUALIFIED ones

3. **No manual intervention needed:**
   - System self-heals
   - Automatically replaces invalid leads
   - Maintains pipeline value

### ⚠️ **What to Expect:**

1. **First Run:**
   - May source many leads (up to 200/day) if revenue gap is large
   - This is expected behavior (system compensating for UNQUALIFIED leads)

2. **Subsequent Runs:**
   - As valid leads are added, revenue gap decreases
   - Sourcing target will naturally decrease to ~50-70 leads/day

3. **Dashboard:**
   - UNQUALIFIED leads visible in Archive tab
   - Pipeline value reflects only valid leads
   - Metrics are accurate

---

## 🚀 Ready to Deploy

**The system is designed to handle UNQUALIFIED leads gracefully:**

✅ Excludes them from calculations  
✅ Automatically replaces them  
✅ Shows them in Archive tab only  
✅ No errors or issues expected  

**You can safely trigger the workflow now. The system will:**
1. Detect the revenue gap (caused by UNQUALIFIED exclusion)
2. Calculate appropriate sourcing target
3. Source new valid leads
4. Process only valid leads
5. Self-heal the pipeline

---

## 📝 Monitoring Checklist

After triggering the workflow, verify:

- [ ] Workflow completes successfully
- [ ] New valid leads are sourced
- [ ] UNQUALIFIED leads remain in Archive tab
- [ ] Pipeline value excludes UNQUALIFIED
- [ ] Dynamic target adjusts correctly
- [ ] No errors in workflow logs

---

**Status:** ✅ **SAFE TO TRIGGER WORKFLOW**

The system is production-ready and will handle UNQUALIFIED leads correctly.

