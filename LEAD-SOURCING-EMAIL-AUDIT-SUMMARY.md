# 🔍 Lead Sourcing & Email Audit Summary

**Date:** 2025-01-27  
**Status:** ⚠️ **AUDIT MODE**

---

## 📊 Lead Sourcing Status

### Current Status: ❌ **ZERO LEADS EXTRACTED**

**Evidence from Latest Test Run:**
- **London:** `extractedCount: 0, added: 0` (No cards found - React state issue)
- **Leeds:** `extractedCount: 0, added: 0` (Found 60 advisor links, 13 cards, but 0 emails extracted)
- **Manchester:** `extractedCount: 0, added: 0` (Found 63 advisor links, 13 cards, but 0 emails extracted)

**Root Cause Identified:**
1. ✅ Advisor cards are being found (13 cards per city)
2. ✅ Advisor links are being found (60-69 links per city)
3. ❌ Email extraction is finding invalid emails (share links like `mailto:?body=...`)
4. ❌ All found emails are being rejected (60-69 rejected per city)
5. ❌ Name-based email construction is NOT triggering (0 constructed)

**Fix Applied:**
- Updated extraction logic to filter share links
- Added fallback to construct emails from names when found emails are invalid
- Simplified validation logic

**Next Step:** Re-run test to verify fix works.

---

## ✅ Email Validation Process

### Email Validation Flow

**Function:** `validateEmail(email: string)`  
**Location:** `lib/sales/email-validation.ts:76`

**Validation Steps:**
1. ✅ Placeholder check (rejects `placeholder@example.com`)
2. ✅ Format validation (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
3. ✅ Domain extraction
4. ✅ Invalid domain block (test domains)
5. ✅ Disposable email block
6. ✅ MX record check (DNS lookup with 5s timeout)
7. ✅ Catch-all detection

**Validation Points:**
- ✅ `scripts/source-leads-autonomous.ts:94` - Before saving lead
- ✅ `scripts/test-predator-100-leads.ts:71` - Before saving lead
- ✅ All API endpoints validate before saving

**Result:** Only valid emails with MX records are saved to database.

---

## 📧 Email Generation Flow

### Complete Journey

```
1. LEAD SOURCING
   ├─ Source: Predator Bot (SJP Directory)
   ├─ Status: NEW
   ├─ Email: Validated via validateEmail()
   └─ Saved to: leads table
   
2. ENRICHMENT
   ├─ Function: enrichLead(leadId)
   ├─ Location: scripts/process-leads-autonomous.ts:133
   ├─ Status: NEW → RESEARCHING
   ├─ Data: researchSummary, researchData, culturalContext
   └─ Output: LeadResearchData
   
3. INITIAL EMAIL
   ├─ Function: generateEmail(leadId, leadData, 'initial', 1)
   ├─ Location: scripts/process-leads-autonomous.ts:395
   ├─ Status: RESEARCHING → CONTACTED (Step 1)
   ├─ Content: AI-generated with cultural context
   └─ Sending: sendEmail() via Resend API
   
4. FOLLOW-UPS
   ├─ Step 2: Value Add (3 days after Step 1)
   ├─ Step 3: Objection Killer (4 days after Step 2)
   ├─ Step 4: Breakup (7 days after Step 3)
   └─ Final: DO_NOT_CONTACT
```

---

## 🛑 How to Stop Email Sending

### Immediate Stop (Emergency Stop)

**Set Environment Variable:**
```bash
# In .env.local or Vercel environment variables
EMERGENCY_STOP=true
```

**Effect:**
- ✅ Blocks `app/api/agent/send-email/route.ts` (API sends)
- ✅ Blocks `scripts/process-leads-autonomous.ts` (autonomous processing)
- ✅ Blocks `lib/sales/compliance.ts:canContactLead()` (all compliance checks)
- ✅ Blocks `app/agent/conversation-handler.ts` (inbound replies)

**Verification:**
```bash
# Check if emergency stop is active
echo $EMERGENCY_STOP
# Should output: true
```

### Disable GitHub Actions Workflow

**Location:** `.github/workflows/autonomous-revenue-engine.yml`

**Disable Jobs:**
- Comment out `enrich-and-email` job
- Comment out `process-inbound` job

---

## 📋 Email Generation Details

### Function: `generateEmail()`

**Location:** `app/agent/outreach.ts:24`

**Input:**
- `leadId`: Lead ID
- `leadData`: Company info, tech stack, research summary, cultural context
- `emailType`: 'initial' | 'follow_up' | 'objection_handling'
- `sequenceStep`: 1-4 (for sequence-aware content)

**Process:**
1. Builds prompt with lead data
2. Uses B2B strategy for IFA leads (predator_sjp)
3. Includes cultural context (language, greeting)
4. Includes news signals (event-based triggers)
5. Includes product links (smart CTAs)
6. Generates via OpenAI (gpt-4o)
7. Validates compliance (AI disclosure, spam keywords)
8. Adds AI disclosure footer

**Output:**
```typescript
{
  email: {
    subject: string;
    body: string; // Markdown format
  },
  reasoning: string; // AI's reasoning
}
```

### Function: `sendEmail()`

**Location:** `app/agent/outreach.ts:475`

**Process:**
1. Converts Markdown to HTML
2. Makes URLs clickable
3. Sends via Resend API
4. Supports scheduled sending (timezone-aware)
5. Returns email ID and thread ID

**Resend Config:**
- From: `AI <ai@pocketportfolio.app>`
- Tags: `[{ name: 'lead_id', value: leadId }]`

---

## 🔍 Email Address Construction

### Predator Bot Email Pattern

**Pattern:** `firstname.lastname@sjpp.co.uk`

**Example:**
- Name: "John Smith"
- Email: `john.smith@sjpp.co.uk`

**Validation:**
- ✅ Must pass `validateEmail()` before saving
- ✅ MX record check required
- ✅ Not a disposable email
- ✅ Not a placeholder email

**Location:** `lib/sales/sourcing/predator-scraper.ts:963-972`

---

## 📊 Audit Queries

### Check Recent Emails Sent

```sql
-- Count emails by status
SELECT status, COUNT(*) as count
FROM leads
WHERE status IN ('CONTACTED', 'SCHEDULED')
GROUP BY status;

-- Recent email sends
SELECT 
  l.email,
  l.companyName,
  l.status,
  l.sequence_step,
  c.subject,
  c.created_at as sent_at
FROM leads l
JOIN conversations c ON l.id = c.lead_id
WHERE c.direction = 'outbound'
ORDER BY c.created_at DESC
LIMIT 50;
```

### Check Email Validity

```sql
-- Check constructed emails
SELECT email, companyName, firstName, lastName, dataSource
FROM leads
WHERE email LIKE '%@sjpp.co.uk'
ORDER BY created_at DESC
LIMIT 100;
```

---

## ✅ Recommendations

1. **Activate Emergency Stop:** Set `EMERGENCY_STOP=true` immediately
2. **Verify Lead Sourcing:** Re-run test to confirm fix works
3. **Audit Recent Emails:** Check last 100 emails for validity
4. **Review Email Content:** Sample AI-generated emails for quality
5. **Validate Constructed Emails:** Test `validateEmail()` on sample constructed emails

---

**Status:** ⚠️ **AUDIT MODE - EMAIL SENDING SHOULD BE PAUSED**  
**Next Action:** Activate emergency stop and verify lead sourcing fix

