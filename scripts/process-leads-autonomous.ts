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
import { eq, and, inArray, or, sql, isNotNull } from 'drizzle-orm';
import { enrichLead } from '@/app/agent/researcher';
import { generateEmail, sendEmail } from '@/app/agent/outreach';
import { canContactLead } from '@/lib/sales/compliance';
// WAR MODE: kv import removed - no rate limiting (Directive 011)
import { calculateOptimalSendTime, isOptimalSendWindow } from '@/lib/sales/timezone-utils';
import { getBestProductForLead } from '@/lib/stripe/product-catalog';
import { isRealFirstName } from '@/lib/sales/name-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import { determineOutreachLanguage } from '@/lib/sales/cultural-guardrails';

const MAX_LEADS_TO_PROCESS = 50; // Maximum leads to process per run (WAR MODE: No rate limit)

/**
 * Email Sequence Strategy:
 * Step 1: Cold Open (Initial Contact) - Wait 0 days (send immediately)
 * Step 2: Value Add (Follow-Up) - Wait 3 days
 * Step 3: Objection Killer (Privacy/Security) - Wait 4 days
 * Step 4: Breakup (Soft Close) - Wait 7 days, then mark as DO_NOT_CONTACT
 */

/**
 * Get email sequence step for a lead (v2.1: Uses stored sequence_step from DB)
 * Iron Rail State Machine: Step 1 -> 2 -> 3 -> 4
 */
async function getEmailSequenceStep(leadId: string): Promise<{
  step: 1 | 2 | 3 | 4;
  emailType: 'initial' | 'follow_up' | 'objection_handling';
  waitDays: number;
  canSend: boolean;
  daysSinceLastContact: number;
  emailCount: number;
}> {
  // Get lead with stored sequence_step
  const [lead] = await db
    .select({ 
      lastContactedAt: leads.lastContactedAt,
      sequenceStep: leads.sequenceStep,
    })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Count outbound emails for verification
  const outboundEmails = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.leadId, leadId),
        eq(conversations.direction, 'outbound')
      )
    );

  const emailCount = outboundEmails.length;
  
  // Use stored sequence_step (default to 0 if null)
  const storedStep = lead.sequenceStep ?? 0;
  
  // Get last contacted date
  const lastContacted = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null;
  const now = new Date();
  const daysSinceLastContact = lastContacted 
    ? Math.floor((now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24))
    : 999; // Never contacted

  // Determine sequence step based on stored value (v2.1: State Machine)
  let step: 1 | 2 | 3 | 4;
  let emailType: 'initial' | 'follow_up' | 'objection_handling';
  let waitDays: number;
  let canSend: boolean;

  if (storedStep === 0 || emailCount === 0) {
    // Step 1: Cold Open (Initial Contact)
    step = 1;
    emailType = 'initial';
    waitDays = 0; // Can send immediately
    canSend = true;
  } else if (storedStep === 1 || emailCount === 1) {
    // Step 2: Value Add (Follow-Up) - Wait 3 days
    step = 2;
    emailType = 'follow_up';
    waitDays = 3;
    canSend = daysSinceLastContact >= 3;
  } else if (storedStep === 2 || emailCount === 2) {
    // Step 3: Objection Killer - Wait 4 days
    step = 3;
    emailType = 'objection_handling';
    waitDays = 4;
    canSend = daysSinceLastContact >= 4;
  } else if (storedStep === 3 || emailCount === 3) {
    // Step 4: Breakup (Soft Close) - Wait 7 days
    step = 4;
    emailType = 'follow_up'; // Will be handled as breakup in prompt
    waitDays = 7;
    canSend = daysSinceLastContact >= 7;
  } else {
    // Already sent all 4 emails - don't send more
    step = 4;
    emailType = 'follow_up';
    waitDays = 999;
    canSend = false;
  }

  return { step, emailType, waitDays, canSend, daysSinceLastContact, emailCount };
}

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
    
    // ✅ COST OPTIMIZATION: Skip if already enriched (prevents unnecessary API calls)
    const hasResearchSummary = lead.researchSummary && lead.researchSummary !== 'Research pending';
    const hasResearchData = lead.researchData && typeof lead.researchData === 'object';
    const hasCulturalData = lead.detectedLanguage && lead.detectedRegion;
    const existingResearch = (lead.researchData as any) || {};
    const hasEmployeeCount = existingResearch.employeeCount !== undefined || lead.employeeCount !== undefined;
    
    if (hasResearchSummary && hasResearchData && hasCulturalData && hasEmployeeCount) {
      console.log(`   ⏭️  Skipping ${lead.email}: Already enriched (has researchSummary, researchData, cultural data, and employee count)`);
      // Move to RESEARCHING status if still NEW
      if (lead.status === 'NEW') {
        await db.update(leads)
          .set({
            status: 'RESEARCHING',
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));
      }
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
  
  // COMMAND 2: Check throttle status before processing
  const { checkThrottleStatus, pauseOutreach } = await import('@/lib/sales/throttle-governor');
  const throttleStatus = await checkThrottleStatus();
  if (throttleStatus.isThrottled) {
    console.log(`⚠️  ${throttleStatus.reason}`);
    console.log(`   Stats: ${throttleStatus.recentStats.delayed}/${throttleStatus.recentStats.total} delayed (${throttleStatus.recentStats.delayedRate.toFixed(1)}%)`);
    await pauseOutreach(throttleStatus.delayMinutes, throttleStatus.reason);
    console.log(`   ⏸️  Pausing outreach for ${throttleStatus.delayMinutes} minutes...`);
    return 0; // Exit early - don't process leads while throttled
  }
  
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
  
  // WAR MODE: Rate limits removed (Directive 011)
  // Process all available leads without quota restrictions
  const leadsToProcess = MAX_LEADS_TO_PROCESS;
  
  console.log(`   🔢 Processing up to ${leadsToProcess} leads (WAR MODE: Unlimited)`);
  
  const researchingLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.status, 'RESEARCHING'))
    .limit(leadsToProcess)
    .orderBy(leads.updatedAt);
  
  console.log(`   Found ${researchingLeads.length} RESEARCHING leads to contact`);
  
  let sent = 0;
  
  for (const lead of researchingLeads) {
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
    
    // CRITICAL: Check email sequence - only send initial email if no emails sent yet
    const sequence = await getEmailSequenceStep(lead.id);
    if (sequence.emailCount > 0) {
      console.log(`   ⏭️  Skipping ${lead.email}: Already sent ${sequence.emailCount} email(s) - should be in CONTACTED status for follow-ups`);
      // Move to CONTACTED status if still in RESEARCHING
      await db.update(leads)
        .set({
          status: 'CONTACTED',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      continue;
    }
    
    // Check if lead can be contacted
    const contactCheck = await canContactLead(lead.id, db);
    if (!contactCheck.canContact) {
      console.log(`   ⏭️  Skipping ${lead.email}: ${contactCheck.reason}`);
      continue;
    }
    
    // Execution Order 010 v2: Cultural Guardrails - Enforce native language (don't block)
    const detectedRegion = lead.detectedRegion || (lead.researchData as any)?.detectedRegion;
    let requiredLanguage: string | null = null;
    if (detectedRegion) {
      requiredLanguage = determineOutreachLanguage(detectedRegion);
      // Log if we're using native language
      if (requiredLanguage && requiredLanguage !== 'en-US') {
        console.log(`   🌏 Using native language: ${requiredLanguage} for ${detectedRegion} (${lead.email})`);
      }
    }
    
    try {
      console.log(`   Generating initial email (Step ${sequence.step}) for: ${lead.email}`);
      
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
          requiredLanguage: requiredLanguage, // Execution Order 010 v2: Enforce native language
        },
        sequence.emailType,
        1 // Step 1: Initial contact
      );
      
      // Sprint 4: Send email (Resend handles scheduling automatically via scheduledAt)
      const { emailId, threadId } = await sendEmail(
        lead.email,
        email.subject,
        email.body,
        lead.id,
        isScheduled ? optimalSendTime : undefined // Only pass if scheduling
      );
      
      // WAR MODE: Rate limit tracking removed (Directive 011)
      
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
      // v2.1: Update sequence_step to 1 (Step 1: Cold Open)
      await db.update(leads)
        .set({
          status: isScheduled ? 'SCHEDULED' : 'CONTACTED',
          sequenceStep: 1, // v2.1: Set to Step 1 (Cold Open)
          lastContactedAt: isScheduled ? optimalSendTime : new Date(),
          scheduledSendAt: isScheduled ? optimalSendTime : null,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      
      // Log action with sequence step
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: isScheduled ? 'EMAIL_SCHEDULED' : 'EMAIL_SENT',
        aiReasoning: reasoning,
        metadata: {
          emailId,
          threadId,
          subject: email.subject,
          scheduledFor: isScheduled ? optimalSendTime?.toISOString() : undefined,
          sequenceStep: 1, // v2.1: Log sequence step
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
 * Process CONTACTED leads that need follow-ups (with wait period enforcement)
 */
async function processContactedLeads() {
  console.log('📧 Processing CONTACTED leads for follow-ups...');
  
  // COMMAND 2: Check throttle status before processing
  const { checkThrottleStatus, pauseOutreach } = await import('@/lib/sales/throttle-governor');
  const throttleStatus = await checkThrottleStatus();
  if (throttleStatus.isThrottled) {
    console.log(`⚠️  ${throttleStatus.reason}`);
    console.log(`   Stats: ${throttleStatus.recentStats.delayed}/${throttleStatus.recentStats.total} delayed (${throttleStatus.recentStats.delayedRate.toFixed(1)}%)`);
    await pauseOutreach(throttleStatus.delayMinutes, throttleStatus.reason);
    console.log(`   ⏸️  Pausing outreach for ${throttleStatus.delayMinutes} minutes...`);
    return 0; // Exit early - don't process leads while throttled
  }
  
  // WAR MODE: Rate limits removed (Directive 011)
  // Process all available leads without quota restrictions
  const leadsToProcess = MAX_LEADS_TO_PROCESS;
  
  console.log(`   🔢 Processing up to ${leadsToProcess} leads (WAR MODE: Unlimited)`);
  
  // Get CONTACTED leads that have been contacted before
  const contactedLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.status, 'CONTACTED'),
        isNotNull(leads.lastContactedAt)
      )
    )
    .limit(leadsToProcess)
    .orderBy(leads.lastContactedAt); // Oldest first

  console.log(`   Found ${contactedLeads.length} CONTACTED leads to check for follow-ups`);

  let sent = 0;
  let skipped = 0;

  for (const lead of contactedLeads) {
    // WAR MODE: Rate limit checks removed (Directive 011)
    
    // CRITICAL: Skip placeholder emails
    if (isPlaceholderEmail(lead.email)) {
      console.log(`   ⚠️  Skipping placeholder email: ${lead.email}`);
      continue;
    }
    
    // Check email sequence step and wait period
    const sequence = await getEmailSequenceStep(lead.id);
    
    if (sequence.emailCount >= 4) {
      // Already sent all 4 emails - mark as DO_NOT_CONTACT if breakup was sent
      if (sequence.emailCount === 4 && sequence.daysSinceLastContact >= 7) {
        console.log(`   🏁 Marking ${lead.email} as DO_NOT_CONTACT (all sequence emails sent)`);
        await db.update(leads)
          .set({
            status: 'DO_NOT_CONTACT',
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));
        
        await db.insert(auditLogs).values({
          leadId: lead.id,
          action: 'STATUS_CHANGED',
          aiReasoning: 'All 4 email sequence steps completed - no response received',
          metadata: { sequenceStep: 4, emailCount: 4 },
        });
      }
      skipped++;
      continue;
    }
    
    if (!sequence.canSend) {
      console.log(`   ⏭️  Skipping ${lead.email}: Step ${sequence.step}, need ${sequence.waitDays} days, ${sequence.daysSinceLastContact} days passed`);
      skipped++;
      continue;
    }
    
    // Check if lead can be contacted
    const contactCheck = await canContactLead(lead.id, db);
    if (!contactCheck.canContact) {
      console.log(`   ⏭️  Skipping ${lead.email}: ${contactCheck.reason}`);
      skipped++;
      continue;
    }
    
    // Execution Order 010 v2: Cultural Guardrails - Enforce native language (for follow-ups too)
    const detectedRegion = lead.detectedRegion || (lead.researchData as any)?.detectedRegion;
    let requiredLanguage: string | null = null;
    if (detectedRegion) {
      requiredLanguage = determineOutreachLanguage(detectedRegion);
      // Log if we're using native language
      if (requiredLanguage && requiredLanguage !== 'en-US') {
        console.log(`   🌏 Using native language: ${requiredLanguage} for ${detectedRegion} (${lead.email})`);
      }
    }
    
    try {
      console.log(`   Generating follow-up email (Step ${sequence.step}) for: ${lead.email}`);
      
      // Get enriched research data
      const researchData = await enrichLead(lead.id);
      
      // Calculate optimal send time
      const timezone = lead.timezone || researchData.timezone;
      let optimalSendTime: Date | undefined;
      
      if (timezone) {
        optimalSendTime = calculateOptimalSendTime(timezone);
      } else {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(9, 0, 0, 0);
        optimalSendTime = tomorrow;
      }
      
      const isScheduled = optimalSendTime && optimalSendTime > new Date();
      
      // Get cultural context
      const researchDataObj = lead.researchData as any;
      const culturalContext = lead.detectedLanguage && lead.detectedRegion ? {
        detectedLanguage: lead.detectedLanguage,
        detectedRegion: lead.detectedRegion,
        confidence: researchDataObj?.culturalConfidence || 85,
        culturalPrompt: researchDataObj?.culturalPrompt || '',
        greeting: researchDataObj?.culturalGreeting || 'Hi',
      } : undefined;
      
      // Get selected product
      const selectedProduct = getBestProductForLead({
        employeeCount: researchData.employeeCount,
      });
      
      // Generate email with sequence context
      const { email, reasoning } = await generateEmail(
        lead.id,
        {
          firstName: lead.firstName || undefined,
          firstNameReliable: lead.firstName ? isRealFirstName(lead.firstName) : false,
          companyName: lead.companyName,
          techStack: lead.techStackTags || [],
          researchSummary: lead.researchSummary || undefined,
          culturalContext,
          newsSignals: researchData.newsSignals,
          selectedProduct,
          employeeCount: researchData.employeeCount,
          requiredLanguage: requiredLanguage, // Execution Order 010 v2: Enforce native language
        },
        sequence.step === 4 ? 'follow_up' : sequence.emailType, // Step 4 is breakup
        sequence.step // Pass sequence step for Step 4 detection
      );
      
      // Send email
      const { emailId, threadId } = await sendEmail(
        lead.email,
        email.subject,
        email.body,
        lead.id,
        isScheduled ? optimalSendTime : undefined
      );
      
      // WAR MODE: Rate limit tracking removed (Directive 011)
      
      // Save conversation
      await db.insert(conversations).values({
        leadId: lead.id,
        type: sequence.step === 1 ? 'INITIAL_OUTREACH' : 'FOLLOW_UP',
        subject: email.subject,
        body: email.body,
        direction: 'outbound',
        emailId,
        threadId,
        aiReasoning: reasoning,
      });
      
      // Update lead status and sequence_step (v2.1: State Machine)
      const nextStep = sequence.step + 1 as 2 | 3 | 4;
      await db.update(leads)
        .set({
          status: isScheduled ? 'SCHEDULED' : 'CONTACTED',
          sequenceStep: nextStep, // v2.1: Advance to next step
          lastContactedAt: isScheduled ? optimalSendTime : new Date(),
          scheduledSendAt: isScheduled ? optimalSendTime : null,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      
      // If Step 4 (breakup) was sent, mark as DO_NOT_CONTACT after 7 more days
      if (sequence.step === 4) {
        console.log(`   📝 Step 4 (breakup) sent - will mark as DO_NOT_CONTACT if no response`);
      }
      
      // Log action with sequence step transition
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: isScheduled ? 'EMAIL_SCHEDULED' : 'EMAIL_SENT',
        aiReasoning: `Sequence Step ${sequence.step} -> ${nextStep}: ${reasoning}`,
        metadata: {
          emailId,
          sequenceStep: nextStep, // v2.1: Log new sequence step
          threadId,
          subject: email.subject,
          previousSequenceStep: sequence.step,
          newSequenceStep: nextStep,
          emailType: sequence.emailType,
          scheduledFor: isScheduled ? optimalSendTime?.toISOString() : undefined,
        },
      });
      
      sent++;
      if (isScheduled) {
        console.log(`   ✅ Scheduled follow-up (Step ${sequence.step}) to: ${lead.email} for ${optimalSendTime?.toISOString()}`);
      } else {
        console.log(`   ✅ Sent follow-up (Step ${sequence.step}) to: ${lead.email}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to send follow-up to ${lead.email}:`, error.message);
      
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: `Follow-up email failed: ${error.message}`,
        metadata: { error: error.message, originalAction: 'FOLLOW_UP_FAILED' },
      });
    }
  }
  
  console.log(`   📊 Follow-ups: ${sent} sent, ${skipped} skipped (waiting or completed)`);
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
  const initialEmailsSent = await processResearchingLeads();
  const followUpEmailsSent = await processContactedLeads();
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Enriched: ${enriched} leads`);
  console.log(`   Initial Emails Sent: ${initialEmailsSent} emails`);
  console.log(`   Follow-Up Emails Sent: ${followUpEmailsSent} emails`);
  console.log(`   Total Emails Sent: ${initialEmailsSent + followUpEmailsSent} emails`);
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


