import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { EmailOutputSchema, SYSTEM_IDENTITY } from './config';
import { checkCompliance } from '@/lib/sales/compliance';
import { Resend } from 'resend';
import { getBestProductForLead, getActiveProducts } from '@/lib/stripe/product-catalog';
import { CulturalContext } from '@/lib/sales/cultural-intelligence';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate an email using AI
 */
export async function generateEmail(
  leadId: string,
  leadData: {
    firstName?: string;
    companyName: string;
    techStack: string[];
    researchSummary?: string;
    culturalContext?: CulturalContext;
    newsSignals?: Array<{ type: string; description: string }>;
    selectedProduct?: { id: string; name: string };
    employeeCount?: number;
  },
  emailType: 'initial' | 'follow_up' | 'objection_handling' = 'initial'
): Promise<{ email: any; reasoning: string }> {
  
  const prompt = buildPrompt(leadData, emailType);

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: EmailOutputSchema,
    prompt: `${SYSTEM_IDENTITY.identity}\n\n${prompt}`,
  });
  
  const reasoning = object.reasoning;

  // Compliance check
  const compliance = checkCompliance(object.body);
  if (!compliance.passed) {
    throw new Error(`Compliance violation: ${compliance.violations.join(', ')}`);
  }

  // Add AI disclosure footer
  const bodyWithFooter = addAiDisclosure(object.body);

  return {
    email: {
      ...object,
      body: bodyWithFooter,
    },
    reasoning: reasoning,
  };
}

function buildPrompt(
  leadData: {
    firstName?: string;
    companyName: string;
    techStack: string[];
    researchSummary?: string;
    culturalContext?: CulturalContext;
    newsSignals?: Array<{ type: string; description: string }>;
    selectedProduct?: { id: string; name: string };
    employeeCount?: number;
  },
  emailType: string
): string {
  const products = getActiveProducts();
  const selectedProduct = leadData.selectedProduct || getBestProductForLead({
    employeeCount: leadData.employeeCount,
  });

  // Build CTA link based on product (Sprint 4: Smart Links)
  const ctaLinks: Record<string, string> = {
    'foundersClub': '/pricing?tier=founder&ref=pilot',
    'corporateSponsor': '/corporate?ref=pilot',
    'featureVoter': '/pricing?tier=feature-voter&ref=pilot',
    'codeSupporter': '/github-repo?ref=pilot',
  };

  const baseLink = ctaLinks[selectedProduct.id] || '/pricing?ref=pilot';
  const companySlug = leadData.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const trackedLink = `${baseLink}&utm_source=ai_pilot&utm_medium=email&utm_campaign=${companySlug}`;

  const productList = products.map(p => 
    `- ${p.displayName}: ${p.currency === 'GBP' ? '£' : '$'}${p.price} (${p.billing === 'one-time' ? 'lifetime' : p.billing}) - ${p.aiPitchStrategy}`
  ).join('\n');

  // Add news signal context (Sprint 4: Event-Based Triggers)
  const newsContext = leadData.newsSignals && leadData.newsSignals.length > 0
    ? `\n\nRECENT NEWS SIGNAL: ${leadData.newsSignals[0].description}\nUse this as opening hook - be timely and relevant. Example: "Hi, congratulations on the ${leadData.newsSignals[0].type} last week..."`
    : '';

  // Add cultural context (Sprint 4: Cultural Intelligence)
  const culturalContext = leadData.culturalContext && leadData.culturalContext.confidence > 90
    ? `\n\nCULTURAL CONTEXT (High Confidence: ${leadData.culturalContext.confidence}%):\n${leadData.culturalContext.culturalPrompt}\nGreeting: ${leadData.culturalContext.greeting}\nIMPORTANT: If confidence > 90%, consider using the detected language. Otherwise, use "International English" (simple grammar, no idioms, clear value prop).`
    : leadData.culturalContext
    ? `\n\nCULTURAL CONTEXT (Low Confidence: ${leadData.culturalContext.confidence}%):\nUse "International English" - simple grammar, no idioms, clear value proposition.`
    : '';

  if (emailType === 'initial') {
    return `Generate a cold outreach email to ${leadData.firstName || leadData.companyName} at ${leadData.companyName}.
    
Context:
- Company: ${leadData.companyName}
- Tech Stack: ${leadData.techStack.join(', ')}
- Research: ${leadData.researchSummary || 'No additional research'}${newsContext}${culturalContext}

CRITICAL PRODUCT INFORMATION:
Pocket Portfolio is a LOCAL-FIRST portfolio tracking platform. Key value props:
- Data Sovereignty: Your portfolio data lives in YOUR Google Drive, not our servers
- Privacy-Absolute: Data never leaves your device unless you explicitly sync
- Zero Vendor Lock-In: Export everything, own your data completely
- Free JSON API: No API key required for public data
- No Monthly Fees: Core functionality is free (sponsorships support development)

ACTIVE PRODUCTS (ONLY PITCH THESE):
${productList}

CRITICAL REQUIREMENTS (Sprint 4: Humanity & Precision):
1. MUST include exactly ONE call-to-action link: ${trackedLink}
   - Link should be naturally integrated (e.g., "Learn more: [link]" or "Check it out: [link]")
   - Do NOT just paste the link - integrate it into the flow

2. TONE: Write as a fellow Engineer asking for a code review, NOT a Sales Rep asking for a meeting
   - Be humble: "I'm mostly reaching out to see if our local-first approach aligns with your privacy goals. If not, tell me to get lost—I won't be offended."
   - Avoid "Sales Breath": No false urgency, no aggressive language, no "I have a great solution for you!"
   - Focus on peer-to-peer curiosity and technical alignment
   - Examples:
     * ❌ "I have a great solution that will transform your business!"
     * ✅ "I'm mostly reaching out to see if our local-first approach aligns with your privacy goals."
     * ❌ "This is a limited-time offer!"
     * ✅ "If this isn't a fit, no worries—just let me know."
     * ❌ "As a CTO, you need this!"
     * ✅ "As a fellow engineer, I thought you might appreciate our local-state architecture..."

3. Subject line: 10-100 characters
4. Body: 100-2000 characters
5. Focus on "Data Privacy" and "Local-First Architecture" as primary value props
6. Reference their tech stack (e.g., "Since you use ${leadData.techStack[0] || 'React'}, you'll appreciate our local-state architecture...")
7. DO NOT pitch "Enterprise SLA" or "Managed Cloud Hosting" (we don't have these)
8. DO pitch "Privacy," "No Monthly Fees (for Founders)," "Own Your Data"
9. Select ONE product from the active products list that best fits this lead (Selected: ${selectedProduct.name})
10. Include reasoning for why this email was generated and which product you're pitching`;
  }
  
  if (emailType === 'follow_up') {
    return `Generate a follow-up email to ${leadData.firstName || leadData.companyName} at ${leadData.companyName}.
    
Context:
- Company: ${leadData.companyName}
- Previous contact: 3 days ago
- Tech Stack: ${leadData.techStack.join(', ')}

CRITICAL: Focus on "Local-First" and "Data Sovereignty" value props. Do NOT pitch features we don't have.

Requirements:
- Soft, respectful tone
- One relevant technical detail about local-first architecture or data privacy
- Offer to archive if not interested
- Include reasoning`;
  }
  
  if (emailType === 'objection_handling') {
    return `Generate an objection handling email to ${leadData.firstName || leadData.companyName}.
    
Context:
- Company: ${leadData.companyName}
- Objection: Price concern

Requirements:
- Acknowledge objection
- Escalate to human supervisor
- Professional, helpful tone
- Include reasoning`;
  }
  
  return '';
}

function addAiDisclosure(body: string): string {
  const footer = `

---
I am an AI Sales Pilot for Pocket Portfolio. Reply 'STOP' to pause.
Automated outreach • Human supervisor monitoring this thread.`;

  return body + footer;
}

/**
 * Send email via Resend
 * Sprint 4: Supports timezone-aware scheduling
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  leadId: string,
  scheduledSendAt?: Date // NEW: Optional scheduled send time for timezone awareness
): Promise<{ emailId: string; threadId?: string }> {
  const sendOptions: any = {
    from: 'Pilot <pilot@pocketportfolio.app>',
    to,
    subject,
    html: body.replace(/\n/g, '<br>'),
    tags: [{ name: 'lead_id', value: leadId }],
  };

  // If scheduledSendAt is provided and in the future, use Resend's scheduled send
  if (scheduledSendAt && scheduledSendAt > new Date()) {
    sendOptions.scheduledAt = scheduledSendAt.toISOString();
    console.log(`📅 Email scheduled for ${scheduledSendAt.toISOString()} (timezone-aware)`);
  }

  const { data, error } = await resend.emails.send(sendOptions);

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return {
    emailId: data?.id || '',
    threadId: data?.id, // Use email ID as thread ID for now
  };
}

