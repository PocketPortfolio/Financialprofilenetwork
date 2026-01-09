/**
 * Autonomous Lead Processing Script
 * 
 * Processes leads in the pipeline:
 * 1. Enriches NEW leads
 * 2. Generates and sends emails to RESEARCHING leads
 * 
 * Runs every 2 hours via GitHub Actions
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads, auditLogs, conversations } from '@/db/sales/schema';
import { eq, and, inArray, or, sql } from 'drizzle-orm';
import { enrichLead } from '@/app/agent/researcher';
import { generateEmail, sendEmail } from '@/app/agent/outreach';
import { canContactLead } from '@/lib/sales/compliance';
import { kv } from '@vercel/kv';
import { calculateOptimalSendTime, isOptimalSendWindow } from '@/lib/sales/timezone-utils';
import { getBestProductForLead } from '@/lib/stripe/product-catalog';
import { isRealFirstName } from '@/lib/sales/name-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

const MAX_LEADS_TO_PROCESS = 50; // Maximum leads to process per run (will be limited by rate limit)

/**
 * Process NEW leads (enrichment)
 */
async function processNewLeads() {
  console.log('🔍 Processing NEW leads (enrichment)...');
  
  // First, clean up any placeholder emails that slipped through
  const placeholderLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.status, 'NEW'),
        or(
          sql`${leads.email} LIKE '%.placeholder'`,
          sql`${leads.email} LIKE '%@similar.%'`,
          sql`${leads.email} LIKE '%@github-hiring.%'`
        )
      )
    );
  
  if (placeholderLeads.length > 0) {
    console.log(`   🧹 Cleaning up ${placeholderLeads.length} placeholder emails...`);
    for (const lead of placeholderLeads) {
      await db.update(leads)
        .set({
          status: 'DO_NOT_CONTACT',
          researchSummary: 'Placeholder email detected - cannot contact',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
    }
    console.log(`   ✅ Marked ${placeholderLeads.length} placeholder leads as DO_NOT_CONTACT`);
  }
  
  const newLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.status, 'NEW'))
    .limit(MAX_LEADS_TO_PROCESS)
    .orderBy(leads.createdAt);
  
  console.log(`   Found ${newLeads.length} NEW leads to enrich`);
  
  for (const lead of newLeads) {
    // CRITICAL: Skip placeholder emails - they should never be processed
    if (isPlaceholderEmail(lead.email)) {
      console.log(`   ⚠️  Skipping placeholder email: ${lead.email} at ${lead.companyName}`);
      // Mark as DO_NOT_CONTACT immediately
      await db.update(leads)
        .set({
          status: 'DO_NOT_CONTACT',
          researchSummary: 'Placeholder email detected - cannot contact',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Placeholder email detected - marked as DO_NOT_CONTACT',
        metadata: { originalAction: 'PLACEHOLDER_REJECTED' },
      });
      continue;
    }
    
    try {
      console.log(`   Enriching: ${lead.email} at ${lead.companyName}`);
      await enrichLead(lead.id);
      console.log(`   ✅ Enriched: ${lead.email}`);
    } catch (error: any) {
      console.error(`   ❌ Failed to enrich ${lead.email}:`, error.message);
      
      // Log error
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: `Enrichment failed: ${error.message}`,
        metadata: { error: error.message, originalAction: 'ENRICHMENT_FAILED' },
      });
    }
  }
  
  return newLeads.length;
}

/**
 * Process RESEARCHING leads (email generation and sending)
 */
async function processResearchingLeads() {
  console.log('📧 Processing RESEARCHING leads (email generation)...');
  
  // First, clean up any placeholder emails in RESEARCHING status
  const placeholderResearching = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.status, 'RESEARCHING'),
        or(
          sql`${leads.email} LIKE '%.placeholder'`,
          sql`${leads.email} LIKE '%@similar.%'`,
          sql`${leads.email} LIKE '%@github-hiring.%'`
        )
      )
    );
  
  if (placeholderResearching.length > 0) {
    console.log(`   🧹 Cleaning up ${placeholderResearching.length} placeholder emails in RESEARCHING status...`);
    for (const lead of placeholderResearching) {
      await db.update(leads)
        .set({
          status: 'DO_NOT_CONTACT',
          researchSummary: 'Placeholder email detected - cannot contact',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
    }
    console.log(`   ✅ Marked ${placeholderResearching.length} placeholder leads as DO_NOT_CONTACT`);
  }
  
  // Check rate limit FIRST to calculate dynamic limit
  const rateLimitKey = `sales:rate-limit:${new Date().toISOString().split('T')[0]}`;
  const currentCount = (await kv.get<number>(rateLimitKey)) || 0;
  const maxPerDay = parseInt(process.env.SALES_RATE_LIMIT_PER_DAY || '50', 10);
  
  if (currentCount >= maxPerDay) {
    console.log(`   ⚠️  Rate limit reached: ${currentCount}/${maxPerDay} emails today`);
    return 0;
  }
  
  // Calculate dynamic limit based on remaining quota
  const remainingQuota = maxPerDay - currentCount;
  const leadsToProcess = Math.min(MAX_LEADS_TO_PROCESS, remainingQuota);
  
  console.log(`   📊 Rate limit status: ${currentCount}/${maxPerDay} sent today, ${remainingQuota} remaining`);
  console.log(`   🔢 Processing up to ${leadsToProcess} leads (limited by remaining quota)`);
  
  const researchingLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.status, 'RESEARCHING'))
    .limit(leadsToProcess)
    .orderBy(leads.updatedAt);
  
  console.log(`   Found ${researchingLeads.length} RESEARCHING leads to contact`);
  
  let sent = 0;
  
  for (const lead of researchingLeads) {
    // Double-check rate limit (safety check)
    if (currentCount + sent >= maxPerDay) {
      console.log(`   ⚠️  Rate limit reached, stopping`);
      break;
    }
    
    // CRITICAL: Skip placeholder emails - they should never be contacted
    if (isPlaceholderEmail(lead.email)) {
      console.log(`   ⚠️  Skipping placeholder email: ${lead.email} at ${lead.companyName}`);
      // Mark as DO_NOT_CONTACT immediately
      await db.update(leads)
        .set({
          status: 'DO_NOT_CONTACT',
          researchSummary: 'Placeholder email detected - cannot contact',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Placeholder email detected - marked as DO_NOT_CONTACT',
        metadata: { originalAction: 'PLACEHOLDER_REJECTED' },
      });
      continue;
    }
    
    // Check if lead can be contacted
    const contactCheck = await canContactLead(lead.id, db);
    if (!contactCheck.canContact) {
      console.log(`   ⏭️  Skipping ${lead.email}: ${contactCheck.reason}`);
      continue;
    }
    
    try {
      console.log(`   Generating email for: ${lead.email}`);
      
      // Sprint 4: Get enriched research data (includes cultural context, news signals, timezone)
      const researchData = await enrichLead(lead.id);
      
      // Sprint 4: Calculate optimal send time (timezone awareness)
      const timezone = lead.timezone || researchData.timezone;
      let optimalSendTime: Date | undefined;
      let shouldSendNow = false;
      
      if (timezone) {
        optimalSendTime = calculateOptimalSendTime(timezone);
        shouldSendNow = isOptimalSendWindow(timezone);
      } else {
        // Safety: If no timezone, schedule for 09:00 UTC tomorrow (never send at night)
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(9, 0, 0, 0);
        optimalSendTime = tomorrow;
      }
      
      // Determine if email will be scheduled or sent immediately
      const isScheduled = optimalSendTime && optimalSendTime > new Date();
      
      // Sprint 4: Get cultural context from lead data
      // Note: Full cultural context (greeting, prompt) is stored in researchData during enrichment
      const researchDataObj = lead.researchData as any;
      const culturalContext = lead.detectedLanguage && lead.detectedRegion ? {
        detectedLanguage: lead.detectedLanguage,
        detectedRegion: lead.detectedRegion,
        confidence: researchDataObj?.culturalConfidence || 85,
        culturalPrompt: researchDataObj?.culturalPrompt || '',
        greeting: researchDataObj?.culturalGreeting || 'Hi',
      } : undefined;
      
      // Sprint 4: Get selected product
      const selectedProduct = getBestProductForLead({
        employeeCount: researchData.employeeCount,
      });
      
      // Generate email with cultural context, news signals, and selected product
      const { email, reasoning } = await generateEmail(
        lead.id,
        {
          firstName: lead.firstName || undefined,
          firstNameReliable: lead.firstName ? isRealFirstName(lead.firstName) : false,
          companyName: lead.companyName,
          techStack: lead.techStackTags || [],
          researchSummary: lead.researchSummary || undefined,
          culturalContext, // Sprint 4: Cultural intelligence
          newsSignals: researchData.newsSignals, // Sprint 4: Event-based triggers
          selectedProduct, // Sprint 4: Smart links
          employeeCount: researchData.employeeCount,
        },
        'initial'
      );
      
      // Sprint 4: Send email (Resend handles scheduling automatically via scheduledAt)
      const { emailId, threadId } = await sendEmail(
        lead.email,
        email.subject,
        email.body,
        lead.id,
        isScheduled ? optimalSendTime : undefined // Only pass if scheduling
      );
      
      // Update rate limit (only if sending immediately, not if scheduled)
      if (!isScheduled) {
        await kv.set(rateLimitKey, currentCount + sent + 1);
      }
      
      // Save conversation
      await db.insert(conversations).values({
        leadId: lead.id,
        type: 'INITIAL_OUTREACH',
        subject: email.subject,
        body: email.body,
        direction: 'outbound',
        emailId,
        threadId,
        aiReasoning: reasoning,
      });
      
      // Update lead status: SCHEDULED if scheduled, CONTACTED if sent immediately
      await db.update(leads)
        .set({
          status: isScheduled ? 'SCHEDULED' : 'CONTACTED',
          lastContactedAt: isScheduled ? optimalSendTime : new Date(),
          scheduledSendAt: isScheduled ? optimalSendTime : null,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      
      // Log action
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: isScheduled ? 'EMAIL_SCHEDULED' : 'EMAIL_SENT',
        aiReasoning: reasoning,
        metadata: {
          emailId,
          threadId,
          subject: email.subject,
          scheduledFor: isScheduled ? optimalSendTime?.toISOString() : undefined,
        },
      });
      
      sent++;
      if (isScheduled) {
        console.log(`   ✅ Scheduled email to: ${lead.email} for ${optimalSendTime?.toISOString()}`);
      } else {
        console.log(`   ✅ Sent email to: ${lead.email}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to send email to ${lead.email}:`, error.message);
      
      // Log error
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: `Email generation/sending failed: ${error.message}`,
        metadata: { error: error.message, originalAction: 'EMAIL_FAILED' },
      });
    }
  }
  
  return sent;
}

/**
 * Main processing function
 */
async function processLeadsAutonomous() {
  console.log('🚀 Autonomous Lead Processing Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  // Check emergency stop
  if (process.env.EMERGENCY_STOP === 'true') {
    console.log('⛔ Emergency stop activated - processing halted');
    return;
  }
  
  const enriched = await processNewLeads();
  const emailsSent = await processResearchingLeads();
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Enriched: ${enriched} leads`);
  console.log(`   Emails Sent: ${emailsSent} emails`);
  console.log('');
}

// Run if called directly
if (require.main === module) {
  processLeadsAutonomous()
    .then(() => {
      console.log('✅ Lead processing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Lead processing failed:', error);
      process.exit(1);
    });
}

export { processLeadsAutonomous };


