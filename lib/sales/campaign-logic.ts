// lib/sales/campaign-logic.ts

/**
 * B2B White Label Strategy - "The Nvidia Problem" Narrative
 * 
 * This enforces the strict B2B strategy for UK Independent Financial Advisors (IFAs).
 * NO sponsorship pitches - only White Label Portal pitches.
 */

import { isRealFirstName } from '@/lib/sales/name-validation';

export const CAMPAIGN_STRATEGY = {
  product: "Corporate Sponsor (White Label Edition)",
  price: "$1,000/year",
  target_audience: "UK Independent Financial Advisors (IFAs)",
  
  // THE NARRATIVE ARC
  steps: {
    0: {
      stage: "COLD_OPEN",
      goal: "Hook with Data (The Nvidia Problem)",
      prompt_instruction: `
        Write a short, peer-to-peer email to a Financial Advisor.
        1. HOOK: Mention you recently analyzed 500 retail portfolios and found 60% are dangerously over-exposed to US Tech (The "Nvidia Problem"), even when clients think they are diversified.
        2. PROBLEM: Standard spreadsheets and free apps hide this risk.
        3. SOLUTION: You built "Pocket Portfolio" to fix this visibility gap.
        4. ASK: Ask if they are open to a "White Label" version for their clients.
        Constraint: Keep it under 120 words. No fluff.
      `
    },
    1: {
      stage: "VALUE_ADD",
      goal: "Sell the 'Sovereign Portal' (Privacy)",
      prompt_instruction: `
        Follow up on the previous email.
        1. PAIN: Clients are using apps like Mint/Yahoo that sell their data to hedge funds.
        2. GAIN: Our "Sovereign Portal" calculates risk client-side (in the browser). We technically cannot see or sell their data.
        3. OFFER: It gives their firm a branded, privacy-first dashboard.
        4. ASK: "Worth a 5-min demo to see the Privacy Engine?"
      `
    },
    2: {
      stage: "OBJECTION_KILLER",
      goal: "Address Integration/Ease",
      prompt_instruction: `
        Address the silent objection: "Is this hard to set up?"
        1. FACT: It works alongside their existing back-office software (Intelliflo/Xplan).
        2. EASE: Clients just connect their accounts via Open Banking.
        3. ASK: "Can I send you a 1-page PDF on how the White Labeling works?"
      `
    },
    3: {
      stage: "BREAKUP",
      goal: "Graceful Exit",
      prompt_instruction: `
        Final check-in.
        1. GESTURE: Assume they are happy with their current client reporting.
        2. LEAVE DOOR OPEN: "I'll stop bugging you, but the offer stands if you ever want to upgrade from spreadsheets."
        3. SIGN OFF: Professional and friendly.
      `
    }
  }
};

export function getPromptForStep(
  step: number, 
  lead: {
    firstName?: string;
    firstNameReliable?: boolean;
    lastName?: string;
    companyName: string;
    email: string;
    dataSource?: string;
    region?: string;
  }
): string | null {
  const strategy = CAMPAIGN_STRATEGY.steps[step as keyof typeof CAMPAIGN_STRATEGY.steps];
  
  if (!strategy) return null; // End of sequence

  // Validate firstName before using it (same logic as standard strategy)
  const firstNameReliable = lead.firstNameReliable !== false && 
                            lead.firstName && 
                            isRealFirstName(lead.firstName);
  const greetingName = firstNameReliable ? lead.firstName : lead.companyName;
  
  // Add warning if firstName is unreliable
  const firstNameWarning = lead.firstName && !firstNameReliable 
    ? `\n\n⚠️ CRITICAL: The provided "firstName" (${lead.firstName}) is NOT a real name - it appears to be an email prefix (e.g., "info", "contact", "hello"). DO NOT use this in the greeting. Use the company name instead (${lead.companyName}).`
    : '';
  const sourceContext = lead.dataSource?.includes('sjp') 
    ? 'St. James\'s Place Partner' 
    : lead.dataSource?.includes('vouchedfor') 
    ? 'Independent Financial Advisor' 
    : lead.dataSource?.includes('napfa')
    ? 'Fee-Only Financial Advisor (NAPFA)'
    : 'Financial Advisor';

  // Regional context for compliance references
  const regionalContext = lead.region === 'US'
    ? 'US Market: Reference "SEC compliance" and "401Ks" if relevant. Use US spelling (e.g., "color" not "colour").'
    : 'UK Market: Reference "FCA compliance" and "ISAs" if relevant. Use UK spelling (e.g., "colour" not "color").';

  return `
    RECIPIENT: ${greetingName}${lead.lastName ? ` ${lead.lastName}` : ''}
    COMPANY: ${lead.companyName}${firstNameWarning}
    SOURCE: ${sourceContext} (Adjust tone: Professional but direct)
    REGION: ${lead.region || 'UK'} - ${regionalContext}
    
    YOUR GOAL: ${strategy.goal}
    
    INSTRUCTIONS:
    ${strategy.prompt_instruction}
    
    GREETING: ${firstNameReliable 
      ? `Use their first name: "Hi ${lead.firstName}," or "Hello ${lead.firstName}," - be professional and direct`
      : `Use a company greeting: "Hi team at ${lead.companyName}," or "Hello ${lead.companyName}," - be professional and direct`}
    
    CLOSING: MUST include a friendly closing before the signature: "Looking forward to your thoughts!" or "Hope to hear from you!" (REQUIRED - do not omit)
    
    TONE: Founder-to-Founder. Direct. High status. You represent the CEO's voice but are transparently an AI assistant.
    SIGNATURE: End with this exact signature (DO NOT use "[Your Name]" or any placeholder):
    Best,
    
    Abba
    AI Assistant at Pocket Portfolio
    
    NOTE: The AI disclosure footer will be added automatically after this signature.
  `;
}

/**
 * Check if lead should use B2B strategy (UK IFAs)
 */
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

