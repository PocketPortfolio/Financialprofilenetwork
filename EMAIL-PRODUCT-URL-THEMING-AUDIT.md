# 📧 Email Product URL & Theming Audit Report

**Date:** 2025-01-27  
**Purpose:** Audit when product URLs are included and how emails are themed for the sales pilot  
**Status:** ✅ **COMPLETE**

---

## 🎯 Executive Summary

### Product URL Inclusion

**Standard Strategy (Non-B2B Leads):**
- ✅ **Product URLs included in ALL steps** (Step 1, 2, 3, 4)
- ✅ URLs are tracked with UTM parameters
- ✅ Product selection based on company size (employee count)

**B2B Strategy (SJP/VouchedFor Leads):**
- ❌ **NO product URLs included** in any step
- ✅ Uses White Label Portal narrative instead
- ✅ Focus on "Corporate Sponsor (White Label Edition)" - $1,000/year

### Email Theming

**Two Distinct Strategies:**
1. **Standard Strategy:** Product-focused with sponsorship CTAs
2. **B2B Strategy:** White Label Portal narrative (no product URLs)

---

## 🔗 Product URL Inclusion Details

### Standard Strategy: Product URLs in ALL Steps

**Location:** `app/agent/outreach.ts:173-186`

**Product URL Generation:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app';
const ctaLinks: Record<string, string> = {
  'foundersClub': `${baseUrl}/sponsor?ref=pilot&tier=founder`,
  'corporateSponsor': `${baseUrl}/sponsor?ref=pilot&tier=corporate`,
  'featureVoter': `${baseUrl}/sponsor?ref=pilot&tier=developer-utility`,
  'codeSupporter': `${baseUrl}/sponsor?ref=pilot&tier=code-supporter`,
};

const baseLink = ctaLinks[selectedProduct.id] || `${baseUrl}/sponsor?ref=pilot`;
const companySlug = leadData.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const trackedLink = `${baseLink}&utm_source=ai_pilot&utm_medium=email&utm_campaign=${companySlug}`;
```

**Product Selection Logic:**
- **Location:** `lib/stripe/product-catalog.ts:91`
- **Rule:** Companies with 10+ employees → Corporate Sponsor, else → Founder's Club
- **Products Available:**
  - Founder's Club: £100 (one-time, lifetime)
  - Corporate Ecosystem: $1,000/year
  - Developer Utility: $200/year
  - Code Supporter: $50/year

**URL Inclusion in Prompts:**
- **Step 1 (Initial):** ✅ Included (`app/agent/outreach.ts:236`)
- **Step 2 (Follow-up):** ✅ Included (same prompt structure)
- **Step 3 (Objection Handling):** ✅ Included (same prompt structure)
- **Step 4 (Breakup):** ❌ NOT included (breakup emails don't include CTAs)

**Prompt Instruction:**
```
CRITICAL REQUIREMENTS (Sprint 4: Humanity & Precision):
1. MUST include exactly ONE call-to-action link: ${trackedLink}
   - Format as Markdown: [Learn more about the Founder's Club](${trackedLink})
   - OR format as: "Learn more: ${trackedLink}" (will be auto-converted to clickable link)
   - Make the link text friendly and inviting (e.g., "Learn more", "Check it out", "Explore the Founder's Club")
   - NEVER just paste the raw URL - always use descriptive link text
   - Example: "If you're curious, [learn more about the Founder's Club](${trackedLink})"
```

---

## 🚫 B2B Strategy: NO Product URLs

**Location:** `lib/sales/campaign-logic.ts`

**B2B Strategy Detection:**
```typescript
export function shouldUseB2BStrategy(lead: {
  region?: string;
  dataSource?: string;
  jobTitle?: string;
}): boolean {
  // UK leads from SJP or VouchedFor should use B2B strategy
  if (lead.region === 'UK' && 
      (lead.dataSource?.includes('sjp') || lead.dataSource?.includes('vouchedfor') || lead.dataSource?.includes('predator'))) {
    return true;
  }
  
  // Job titles that indicate IFA
  if (lead.jobTitle?.toLowerCase().includes('financial advisor') || 
      lead.jobTitle?.toLowerCase().includes('ifa')) {
    return true;
  }
  
  return false;
}
```

**B2B Strategy Steps:**
- **Step 0 (Cold Open):** "The Nvidia Problem" narrative - NO product URLs
- **Step 1 (Value Add):** "Sovereign Portal" pitch - NO product URLs
- **Step 2 (Objection Killer):** Integration/ease focus - NO product URLs
- **Step 3 (Breakup):** Graceful exit - NO product URLs

**Why No Product URLs:**
- B2B strategy focuses on White Label Portal ($1,000/year Corporate Sponsor)
- Narrative is about "The Nvidia Problem" and data sovereignty
- No direct sponsorship links - focuses on demo requests instead

---

## 📝 Email Theming for Sales Pilot

### Standard Strategy Theming

**Step 1: Cold Open (Initial Contact)**
- **Theme:** Friendly engineer-to-engineer outreach
- **Tone:** Warm, conversational, peer-to-peer
- **Focus:** Data privacy, local-first architecture, data sovereignty
- **CTA:** Product link (sponsorship tier based on company size)
- **Location:** `app/agent/outreach.ts:216-286`

**Key Theming Elements:**
- ✅ Warm greeting (first name if reliable, else company name)
- ✅ Cultural context (language, greeting style)
- ✅ News signals (event-based triggers)
- ✅ Tech stack references
- ✅ Product selection (Founder's Club vs Corporate Sponsor)
- ✅ Friendly closing ("Looking forward to your thoughts!")

**Example Prompt Excerpt:**
```
TONE: Write as a warm, friendly fellow Engineer, NOT a cold Sales Rep
- Be genuinely friendly: "Hi! I'm reaching out because..." instead of "I am reaching out to..."
- Use conversational language: "I thought you might find this interesting" vs "You may be interested"
- Be warm but professional: "Hope you're doing well!" or "Hope this finds you well!"
- Show genuine curiosity: "I'm curious if..." vs "I want to know if..."
- Be humble and peer-to-peer: "I'm mostly reaching out to see if our local-first approach aligns with your privacy goals. If not, tell me to get lost—I won't be offended."
```

**Step 2: Value Add (Follow-Up)**
- **Theme:** Case study or feature highlight
- **Tone:** Soft, respectful, value-focused
- **Focus:** Local-first architecture, data privacy use cases
- **CTA:** Product link (same as Step 1)
- **Location:** `app/agent/outreach.ts:289-361`

**Step 3: Objection Killer**
- **Theme:** Privacy/security/GDPR compliance
- **Tone:** Professional, helpful, proactive
- **Focus:** Address common objections (GDPR, security, data ownership)
- **CTA:** Product link (same as Step 1)
- **Location:** `app/agent/outreach.ts:364-399`

**Step 4: Breakup (Soft Close)**
- **Theme:** Graceful exit
- **Tone:** Soft, respectful, professional
- **Focus:** Leave door open, acknowledge timing
- **CTA:** ❌ NO product link (breakup emails don't include CTAs)
- **Location:** `app/agent/outreach.ts:291-326`

---

### B2B Strategy Theming (SJP/VouchedFor Leads)

**Step 0: Cold Open**
- **Theme:** "The Nvidia Problem" narrative
- **Tone:** Founder-to-founder, direct, high status
- **Focus:** 60% of portfolios over-exposed to US Tech
- **Ask:** White Label version for clients
- **Location:** `lib/sales/campaign-logic.ts:17-27`

**Prompt Excerpt:**
```
1. HOOK: Mention you recently analyzed 500 retail portfolios and found 60% are dangerously over-exposed to US Tech (The "Nvidia Problem"), even when clients think they are diversified.
2. PROBLEM: Standard spreadsheets and free apps hide this risk.
3. SOLUTION: You built "Pocket Portfolio" to fix this visibility gap.
4. ASK: Ask if they are open to a "White Label" version for their clients.
Constraint: Keep it under 120 words. No fluff.
```

**Step 1: Value Add**
- **Theme:** "Sovereign Portal" (Privacy)
- **Tone:** Professional, privacy-focused
- **Focus:** Client-side risk calculation, no data selling
- **Ask:** 5-minute demo request
- **Location:** `lib/sales/campaign-logic.ts:29-38`

**Step 2: Objection Killer**
- **Theme:** Integration/Ease
- **Tone:** Helpful, addressing setup concerns
- **Focus:** Works with existing back-office software (Intelliflo/Xplan)
- **Ask:** 1-page PDF on White Labeling
- **Location:** `lib/sales/campaign-logic.ts:40-48`

**Step 3: Breakup**
- **Theme:** Graceful exit
- **Tone:** Professional, friendly, respectful
- **Focus:** Assume they're happy with current setup, leave door open
- **Location:** `lib/sales/campaign-logic.ts:50-58`

---

## 🎨 Theming Differences Summary

| Aspect | Standard Strategy | B2B Strategy |
|--------|------------------|-------------|
| **Product URLs** | ✅ Included (Steps 1-3) | ❌ NOT included |
| **Tone** | Warm, friendly engineer | Founder-to-founder, direct |
| **Focus** | Data privacy, local-first | White Label Portal, Nvidia Problem |
| **CTA** | Sponsorship tier link | Demo request / PDF offer |
| **Target** | CTOs, Solo Devs, Early Adopters | UK IFAs (SJP/VouchedFor) |
| **Product** | Founder's Club / Corporate Sponsor | Corporate Sponsor (White Label) |
| **Price Mention** | ✅ Yes (in product list) | ❌ No (focus on value) |

---

## 📊 Product URL Tracking

**UTM Parameters:**
- `utm_source=ai_pilot`
- `utm_medium=email`
- `utm_campaign={companySlug}` (company name slugified)

**Example URLs:**
- Founder's Club: `https://www.pocketportfolio.app/sponsor?ref=pilot&tier=founder&utm_source=ai_pilot&utm_medium=email&utm_campaign=st-james-place-partner`
- Corporate Sponsor: `https://www.pocketportfolio.app/sponsor?ref=pilot&tier=corporate&utm_source=ai_pilot&utm_medium=email&utm_campaign=st-james-place-partner`

**Link Conversion:**
- Markdown links `[text](url)` → HTML `<a>` tags
- Plain URLs → Auto-converted to clickable links
- **Location:** `app/agent/outreach.ts:418-469`

---

## 🔍 Code References

### Product URL Inclusion
- **Generation:** `app/agent/outreach.ts:173-186`
- **Prompt Inclusion:** `app/agent/outreach.ts:236-241`
- **Product Selection:** `lib/stripe/product-catalog.ts:91`
- **Link Conversion:** `app/agent/outreach.ts:418-469`

### B2B Strategy (No Product URLs)
- **Detection:** `lib/sales/campaign-logic.ts:117`
- **Prompt Generation:** `lib/sales/campaign-logic.ts:63`
- **Strategy Application:** `app/agent/outreach.ts:97-165`

### Email Theming
- **Standard Strategy:** `app/agent/outreach.ts:216-403`
- **B2B Strategy:** `lib/sales/campaign-logic.ts:10-61`
- **Cultural Context:** `app/agent/outreach.ts:202-207`
- **News Signals:** `app/agent/outreach.ts:192-195`

---

## ✅ Summary

### Product URLs
- **Standard Strategy:** ✅ Included in Steps 1-3 (NOT in Step 4 breakup)
- **B2B Strategy:** ❌ NOT included in any step
- **Tracking:** UTM parameters for analytics
- **Selection:** Based on company size (employee count)

### Email Theming
- **Standard Strategy:** Warm, friendly engineer-to-engineer with product CTAs
- **B2B Strategy:** Founder-to-founder, direct, White Label Portal narrative
- **Cultural Context:** Applied to both strategies
- **News Signals:** Applied to standard strategy only

### Key Differences
1. **Product URLs:** Standard strategy includes them, B2B strategy does not
2. **Tone:** Standard is warm/friendly, B2B is direct/high-status
3. **Focus:** Standard is product-focused, B2B is value-focused (White Label)
4. **CTA:** Standard is sponsorship link, B2B is demo/PDF request

---

**Next Steps:**
1. Monitor product URL click-through rates (UTM tracking)
2. Compare conversion rates between standard and B2B strategies
3. Review B2B strategy effectiveness (no product URLs = different conversion path)

