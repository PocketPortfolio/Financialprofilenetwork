# 📧 Email Generation Audit Report

**Date:** 2025-01-27  
**Status:** 🔴 **AUDIT MODE - EMAIL SENDING PAUSED**  
**Purpose:** Document email generation flow and validate email addresses

---

## 🚨 Emergency Stop Status

**Current Status:** ⚠️ **REQUIRES MANUAL ACTIVATION**

To stop all email sending immediately:
```bash
# Set in environment variables (.env.local or Vercel)
EMERGENCY_STOP=true
```

**Emergency Stop Checks:**
- ✅ `app/api/agent/send-email/route.ts:32` - Blocks API email sends
- ✅ `scripts/process-leads-autonomous.ts:733` - Blocks autonomous processing
- ✅ `lib/sales/compliance.ts:111` - Blocks via `canContactLead()`
- ✅ `app/agent/conversation-handler.ts:46` - Blocks inbound replies

---

## 📊 Lead Sourcing Status

### Current Status: ⚠️ **ZERO LEADS EXTRACTED**

**Evidence from Debug Logs:**
- London: `extractedCount: 0, added: 0`
- Leeds: `extractedCount: 0, added: 0` (despite finding 60 advisor links)
- Manchester: `extractedCount: 0, added: 0` (despite finding 63 advisor links)

**Root Cause:** Email extraction is finding invalid emails (share links) and rejecting them, but name-based email construction is not triggering.

**Fix Applied:** Updated extraction logic to:
1. Filter out share links (`mailto:?body=...`)
2. Construct emails from names when found emails are invalid
3. Validate emails before saving

**Next Steps:** Run test again to verify fix works.

---

## ✅ Email Validation Process

### Email Validation Flow

**Location:** `lib/sales/email-validation.ts:76`

**Validation Steps:**
1. ✅ **Placeholder Check:** Rejects placeholder emails (e.g., `placeholder@example.com`)
2. ✅ **Format Check:** Validates email format with regex
3. ✅ **Domain Check:** Extracts and validates domain
4. ✅ **Invalid Domain Block:** Blocks test/invalid domains
5. ✅ **Disposable Email Block:** Blocks disposable email providers
6. ✅ **MX Record Check:** Verifies domain has mail servers (DNS lookup)
7. ✅ **Catch-All Detection:** Detects catch-all email patterns

**Validation Points:**
- `scripts/source-leads-autonomous.ts:94` - Before saving lead
- `scripts/test-predator-100-leads.ts:71` - Before saving lead
- `app/api/public/lead-submission/route.ts:97` - Public API
- `app/api/waitlist/submit/route.ts:34` - Waitlist submission

**Email Validation Result:**
```typescript
interface EmailValidationResult {
  isValid: boolean;
  reason?: string; // If invalid, explains why
}
```

---

## 📧 Email Generation Flow

### Complete Sales Journey Email Flow

```
1. LEAD SOURCING
   ↓
   Status: NEW
   Email: Validated via validateEmail()
   ↓
   
2. ENRICHMENT (processNewLeads)
   Location: scripts/process-leads-autonomous.ts:133
   Function: enrichLead(leadId)
   ↓
   Status: RESEARCHING
   Data: researchSummary, researchData, culturalContext, techStack
   ↓
   
3. INITIAL EMAIL GENERATION (processResearchingLeads)
   Location: scripts/process-leads-autonomous.ts:239
   Function: generateEmail(leadId, leadData, 'initial', 1)
   ↓
   Status: CONTACTED (Step 1) or SCHEDULED
   Email: AI-generated with cultural context, news signals, product links
   ↓
   
4. FOLLOW-UP EMAILS (processContactedLeads)
   Location: scripts/process-leads-autonomous.ts:490
   Function: generateEmail(leadId, leadData, emailType, sequenceStep)
   ↓
   Step 2: Value Add (3 days after Step 1)
   Step 3: Objection Killer (4 days after Step 2)
   Step 4: Breakup (7 days after Step 3) → DO_NOT_CONTACT
```

---

## 🔍 Email Generation Details

### Function: `generateEmail()`

**Location:** `app/agent/outreach.ts:24`

**Input Parameters:**
```typescript
generateEmail(
  leadId: string,
  leadData: {
    firstName?: string;
    firstNameReliable?: boolean;
    companyName: string;
    techStack: string[];
    researchSummary?: string;
    culturalContext?: CulturalContext;
    newsSignals?: Array<{ type: string; description: string }>;
    selectedProduct?: { id: string; name: string };
    employeeCount?: number;
    requiredLanguage?: string | null;
    dataSource?: string;
    region?: string;
    jobTitle?: string;
  },
  emailType: 'initial' | 'follow_up' | 'objection_handling',
  sequenceStep?: number
)
```

**Process:**
1. Builds prompt based on email type and sequence step
2. Uses B2B strategy when `dataSource` is `predator_sjp` or `predator_vouchedfor`
3. Includes cultural context (greeting, language)
4. Includes news signals (event-based triggers)
5. Includes selected product (smart links)
6. Generates email via OpenAI (gpt-4o)
7. Checks compliance (AI disclosure, spam keywords)
8. Adds AI disclosure footer
9. Returns email object and reasoning

**Output:**
```typescript
{
  email: {
    subject: string;
    body: string;
  },
  reasoning: string; // AI's reasoning for the email
}
```

---

## 📤 Email Sending Details

### Function: `sendEmail()`

**Location:** `app/agent/outreach.ts:475`

**Input Parameters:**
```typescript
sendEmail(
  to: string,              // Lead's email address
  subject: string,         // Email subject
  body: string,           // Email body (Markdown)
  leadId: string,         // Lead ID for tracking
  scheduledSendAt?: Date  // Optional: Schedule for future
)
```

**Process:**
1. Converts Markdown links to HTML
2. Converts plain URLs to clickable links
3. Converts newlines to `<br>` tags
4. Sends via Resend API
5. Supports scheduled sending (timezone-aware)
6. Returns email ID and thread ID

**Resend Configuration:**
- From: `AI <ai@pocketportfolio.app>`
- Tags: `[{ name: 'lead_id', value: leadId }]`
- Scheduled: If `scheduledSendAt` provided and in future

---

## 🔄 Email Sequence Strategy

### Sequence Steps

| Step | Email Type | Wait Period | Purpose |
|------|------------|-------------|---------|
| **Step 1** | `initial` | 0 days | Cold Open - Immediate contact |
| **Step 2** | `follow_up` | 3 days | Value Add - Case study/feature |
| **Step 3** | `objection_handling` | 4 days | Objection Killer - GDPR/security |
| **Step 4** | `follow_up` | 7 days | Breakup - Graceful exit |

**Status Flow:**
```
NEW → RESEARCHING → CONTACTED (Step 1) → CONTACTED (Step 2) → CONTACTED (Step 3) → CONTACTED (Step 4) → DO_NOT_CONTACT
```

**Location:** `scripts/process-leads-autonomous.ts:43`

---

## 🛡️ Compliance & Safety Checks

### Compliance Checks

**Location:** `lib/sales/compliance.ts:canContactLead()`

**Checks:**
1. ✅ Emergency stop (`EMERGENCY_STOP === 'true'`)
2. ✅ Opt-out status (`status === 'DO_NOT_CONTACT'`)
3. ✅ Email sequence (only sends if sequence allows)
4. ✅ Wait periods (respects days between steps)

**Compliance Check Points:**
- `app/api/agent/send-email/route.ts:40` - Before API send
- `scripts/process-leads-autonomous.ts:336` - Before autonomous send
- `scripts/process-leads-autonomous.ts:520` - Before follow-up send

---

## 📋 Email Content Generation

### Prompt Building

**Location:** `app/agent/outreach.ts:77`

**Prompt Components:**
1. **System Identity:** AI agent identity and role
2. **Email Type:** Initial, follow-up, or objection handling
3. **Lead Data:** Company name, tech stack, research summary
4. **Cultural Context:** Language, greeting, cultural norms
5. **News Signals:** Recent company events/news
6. **Product Links:** Selected product for lead
7. **B2B Strategy:** Special handling for IFAs (predator_sjp)

**B2B Strategy Detection:**
- If `dataSource === 'predator_sjp'` or `'predator_vouchedfor'`
- If `jobTitle` contains "advisor" or "adviser"
- Uses B2B-specific prompts and tone

---

## 🔍 Email Address Validation

### Constructed Email Pattern

**For Predator Bot Leads:**
- Pattern: `firstname.lastname@sjpp.co.uk`
- Example: `john.smith@sjpp.co.uk`
- Validation: Must pass `validateEmail()` before saving

**Validation Requirements:**
- ✅ Valid email format
- ✅ Domain has MX records
- ✅ Not a disposable email
- ✅ Not a placeholder email
- ✅ Not a test domain

**Location:** `lib/sales/sourcing/predator-scraper.ts:963-972`

---

## 🚫 How to Stop Email Sending

### Method 1: Emergency Stop (Immediate)

```bash
# Set in .env.local or Vercel environment variables
EMERGENCY_STOP=true
```

**Effect:**
- ✅ Blocks all API email sends
- ✅ Blocks autonomous email processing
- ✅ Blocks inbound email replies
- ✅ Logs `KILL_SWITCH_ACTIVATED` in audit log

### Method 2: Disable Workflow (GitHub Actions)

**Location:** `.github/workflows/autonomous-revenue-engine.yml`

**Disable Jobs:**
- `enrich-and-email` - Stops enrichment and email sending
- `process-inbound` - Stops inbound email processing

### Method 3: Manual Script Modification

**Temporary Stop:**
```typescript
// In scripts/process-leads-autonomous.ts:733
if (true) { // Force stop
  console.log('⛔ Email processing manually disabled');
  return { enriched: 0, emailsSent: 0 };
}
```

---

## 📊 Email Audit Queries

### Check Emails Sent

```sql
-- Count emails sent by status
SELECT status, COUNT(*) as count
FROM leads
WHERE status IN ('CONTACTED', 'SCHEDULED')
GROUP BY status;

-- Check recent email sends
SELECT 
  l.email,
  l.companyName,
  l.status,
  l.sequence_step,
  c.subject,
  c.created_at as email_sent_at
FROM leads l
JOIN conversations c ON l.id = c.lead_id
WHERE c.direction = 'outbound'
ORDER BY c.created_at DESC
LIMIT 50;
```

### Check Email Validation

```sql
-- Check for invalid emails
SELECT email, companyName, dataSource
FROM leads
WHERE email LIKE '%@sjpp.co.uk'
ORDER BY created_at DESC
LIMIT 100;
```

---

## ✅ Recommendations

1. **Activate Emergency Stop:** Set `EMERGENCY_STOP=true` immediately
2. **Audit Recent Emails:** Check last 100 emails sent for validity
3. **Verify Email Construction:** Confirm constructed emails are valid
4. **Test Email Validation:** Run validation on sample constructed emails
5. **Review Email Content:** Check AI-generated email content for quality

---

**Report Generated:** 2025-01-27  
**Next Review:** After lead sourcing fix verification

