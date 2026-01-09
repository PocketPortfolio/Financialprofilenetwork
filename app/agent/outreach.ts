import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { EmailOutputSchema, SYSTEM_IDENTITY } from './config';
import { checkCompliance } from '@/lib/sales/compliance';
import { Resend } from 'resend';
import { getBestProductForLead, getActiveProducts } from '@/lib/stripe/product-catalog';
import { CulturalContext } from '@/lib/sales/cultural-intelligence';
import { isRealFirstName } from '@/lib/sales/name-validation';
import { db } from '@/db/sales/client';
import { conversations } from '@/db/sales/schema';
import { sql, gte } from 'drizzle-orm';

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
    firstNameReliable?: boolean;
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
    firstNameReliable?: boolean;
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
  // Use absolute URLs for email links (relative paths don't work in emails)
  // All products are on the /sponsor page, so link there
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app';
  const ctaLinks: Record<string, string> = {
    'foundersClub': `${baseUrl}/sponsor?ref=pilot&tier=founder`,
    'corporateSponsor': `${baseUrl}/sponsor?ref=pilot&tier=corporate`,
    'featureVoter': `${baseUrl}/sponsor?ref=pilot&tier=feature-voter`,
    'codeSupporter': `${baseUrl}/sponsor?ref=pilot&tier=code-supporter`,
  };

  const baseLink = ctaLinks[selectedProduct.id] || `${baseUrl}/sponsor?ref=pilot`;
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

  // Determine if we should use firstName in greeting
  const firstNameReliable = leadData.firstNameReliable !== false && leadData.firstName && isRealFirstName(leadData.firstName);
  const greetingName = firstNameReliable ? leadData.firstName : leadData.companyName;
  const firstNameWarning = leadData.firstName && !firstNameReliable 
    ? `\n\n⚠️ CRITICAL: The provided "firstName" (${leadData.firstName}) is NOT a real name - it appears to be an email prefix (e.g., "info", "contact", "hello"). DO NOT use this in the greeting. Use the company name instead (${leadData.companyName}).`
    : '';

  if (emailType === 'initial') {
    return `Generate a cold outreach email to ${greetingName} at ${leadData.companyName}.${firstNameWarning}
    
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
   - Format as Markdown: [Learn more about the Founder's Club](${trackedLink})
   - OR format as: "Learn more: ${trackedLink}" (will be auto-converted to clickable link)
   - Make the link text friendly and inviting (e.g., "Learn more", "Check it out", "Explore the Founder's Club")
   - NEVER just paste the raw URL - always use descriptive link text
   - Example: "If you're curious, [learn more about the Founder's Club](${trackedLink})"

2. GREETING: ${firstNameReliable 
    ? `Use their first name warmly: "Hi ${leadData.firstName}!" or "Hello ${leadData.firstName}," - be friendly and personal`
    : `Use a friendly company greeting: "Hi team at ${leadData.companyName}!" or "Hello ${leadData.companyName}," - be warm and approachable`}

3. TONE: Write as a warm, friendly fellow Engineer, NOT a cold Sales Rep
   - Be genuinely friendly: "Hi! I'm reaching out because..." instead of "I am reaching out to..."
   - Use conversational language: "I thought you might find this interesting" vs "You may be interested"
   - Be warm but professional: "Hope you're doing well!" or "Hope this finds you well!"
   - Show genuine curiosity: "I'm curious if..." vs "I want to know if..."
   - Be humble and peer-to-peer: "I'm mostly reaching out to see if our local-first approach aligns with your privacy goals. If not, tell me to get lost—I won't be offended."
   - Avoid "Sales Breath": No false urgency, no aggressive language, no "I have a great solution for you!"
   - Examples:
     * ❌ "I am reaching out to introduce..."
     * ✅ "Hi! I'm reaching out because I thought you might appreciate..."
     * ❌ "I have a great solution that will transform your business!"
     * ✅ "I'm mostly reaching out to see if our local-first approach aligns with your privacy goals."
     * ❌ "This is a limited-time offer!"
     * ✅ "If this isn't a fit, no worries—just let me know."
     * ❌ "As a CTO, you need this!"
     * ✅ "As a fellow engineer, I thought you might appreciate our local-state architecture..."

4. FRIENDLINESS CHECKLIST:
   - Start with a warm greeting (use exclamation marks sparingly but naturally)
   - Use "I" and "you" (conversational, not formal)
   - Include a friendly closing ("Looking forward to your thoughts!" or "Hope to hear from you!")
   - Be genuine, not robotic - show personality while staying professional
   - Use contractions naturally ("I'm", "you're", "we're") for a conversational feel

4. Subject line: 10-100 characters
5. Body: 100-2000 characters
6. Focus on "Data Privacy" and "Local-First Architecture" as primary value props
7. Reference their tech stack (e.g., "Since you use ${leadData.techStack[0] || 'React'}, you'll appreciate our local-state architecture...")
8. DO NOT pitch "Enterprise SLA" or "Managed Cloud Hosting" (we don't have these)
9. DO pitch "Privacy," "No Monthly Fees (for Founders)," "Own Your Data"
10. Select ONE product from the active products list that best fits this lead (Selected: ${selectedProduct.name})
11. Include reasoning for why this email was generated and which product you're pitching`;
  }
  
  if (emailType === 'follow_up') {
    return `Generate a follow-up email to ${greetingName} at ${leadData.companyName}.${firstNameWarning}
    
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
    return `Generate an objection handling email to ${greetingName}.${firstNameWarning}
    
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
 * Convert Markdown links [text](url) to HTML anchor tags
 */
function convertMarkdownLinksToHtml(text: string): string {
  // Convert Markdown links [text](url) to HTML <a> tags
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(markdownLinkRegex, '<a href="$2" style="color: #0066cc; text-decoration: underline;">$1</a>');
}

/**
 * Convert plain URLs to clickable HTML links (fallback for URLs not in Markdown format)
 */
function convertUrlsToClickableLinks(text: string): string {
  // Match URLs that aren't already inside <a> tags
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  return text.replace(urlRegex, (url) => {
    // Check if URL is already inside an <a> tag
    const beforeMatch = text.substring(0, text.indexOf(url));
    const afterMatch = text.substring(text.indexOf(url) + url.length);
    const beforeTag = beforeMatch.lastIndexOf('<a');
    const afterTag = afterMatch.indexOf('</a>');
    
    // If URL is between <a> and </a>, don't convert it
    if (beforeTag !== -1 && afterTag !== -1 && beforeTag < text.indexOf(url)) {
      return url;
    }
    
    return `<a href="${url}" style="color: #0066cc; text-decoration: underline;">${url}</a>`;
  });
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
  // v2.1: Hard Quota Limits - Check before sending
  if (!scheduledSendAt || scheduledSendAt <= new Date()) {
    // Only check quota for immediate sends (not scheduled)
    
    // Daily limit: 100 emails per 24 hours
    const dailyCount = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(conversations)
      .where(
        sql`${conversations.createdAt} > NOW() - INTERVAL '24 hours'`
      );
    
    if (dailyCount[0]?.count >= 100) {
      throw new Error('Daily email quota reached (100 emails/24h). Upgrade plan or wait.');
    }
    
    // Monthly limit: 3000 emails per 30 days
    const monthlyCount = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(conversations)
      .where(
        sql`${conversations.createdAt} > NOW() - INTERVAL '30 days'`
      );
    
    if (monthlyCount[0]?.count >= 3000) {
      throw new Error('Monthly email quota reached (3000 emails/30d). Upgrade plan or wait.');
    }
  }
  
  // Convert Markdown links to HTML, then plain URLs, then newlines
  let htmlBody = convertMarkdownLinksToHtml(body);
  htmlBody = convertUrlsToClickableLinks(htmlBody);
  htmlBody = htmlBody.replace(/\n/g, '<br>');
  
  const sendOptions: any = {
    from: 'Pilot <pilot@pocketportfolio.app>',
    to,
    subject,
    html: htmlBody, // Use converted HTML with clickable links
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

