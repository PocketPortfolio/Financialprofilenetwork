/**
 * Test Script: Predator Bot 100-Lead Test Run
 * 
 * Performs end-to-end test with 100 high-intent leads:
 * 1. Source new leads (100 target)
 * 2. Enrich and send emails
 * 3. Process inbound emails
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { sourceFromPredator } from '@/lib/sales/sourcing/predator-scraper';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { enrichLead } from '@/app/agent/researcher';
import { generateEmail, sendEmail } from '@/app/agent/outreach';
import { canContactLead } from '@/lib/sales/compliance';
import { calculateOptimalSendTime, isOptimalSendWindow } from '@/lib/sales/timezone-utils';
import { getBestProductForLead } from '@/lib/stripe/product-catalog';
import { isRealFirstName } from '@/lib/sales/name-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import { determineOutreachLanguage } from '@/lib/sales/cultural-guardrails';
import { handleInboundEmail } from '@/app/agent/conversation-handler';

const TEST_TARGET_LEADS = 100;

/**
 * Step 1: Source new leads
 */
async function step1SourceLeads() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 STEP 1: SOURCE NEW LEADS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let created = 0;
  let skipped = 0;
  let rejected = 0;

  try {
    console.log(`🦅 Releasing Predator Bot (Target: ${TEST_TARGET_LEADS} leads)...`);
    console.log('   Sources: SJP Directory (UK)');
    console.log('');
    
    const predatorLeads = await sourceFromPredator(TEST_TARGET_LEADS);
    
    console.log(`✅ Predator Bot extracted ${predatorLeads.length} leads`);
    console.log('');

    // Process and save leads to database
    for (const lead of predatorLeads) {
      // Check if lead already exists
      const existing = await db
        .select()
        .from(leads)
        .where(eq(leads.email, lead.email))
        .limit(1);
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Validate email
      const validation = await validateEmail(lead.email);
      if (!validation.isValid) {
        rejected++;
        continue;
      }

      // Validate firstName - reject if invalid (Share, Visit, Partner, etc.)
      const { isRealFirstName } = await import('@/lib/sales/name-validation');
      if (lead.firstName && !isRealFirstName(lead.firstName)) {
        console.log(`   ⚠️  Rejecting lead ${lead.email}: Invalid firstName "${lead.firstName}"`);
        rejected++;
        continue;
      }

      // Insert lead into database
      try {
        await db.insert(leads).values({
          email: lead.email,
          firstName: lead.firstName || null,
          lastName: lead.lastName || null,
          companyName: lead.companyName,
          jobTitle: lead.jobTitle,
          status: 'NEW', // Will be enriched in next step
          dataSource: lead.dataSource,
          location: lead.location || null,
          score: 0, // Will be scored during enrichment
          dataSourceDate: new Date(),
        });

        created++;
        
        if (created % 10 === 0) {
          console.log(`   ✅ Progress: ${created}/${TEST_TARGET_LEADS} leads saved...`);
        }
      } catch (error: any) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          skipped++;
        } else {
          console.error(`   ❌ Error saving lead ${lead.email}:`, error.message);
          rejected++;
        }
      }
    }

    console.log('');
    console.log('✅ Step 1 Complete:');
    console.log(`   Created: ${created} leads`);
    console.log(`   Skipped: ${skipped} (duplicates)`);
    console.log(`   Rejected: ${rejected} (invalid)`);
    console.log(`   Total Processed: ${predatorLeads.length}`);
    
    return created;
  } catch (error: any) {
    console.error('❌ Step 1 Failed:', error.message);
    throw error;
  }
}

/**
 * Step 2: Enrich and send emails
 * Uses the existing process-leads-autonomous script
 */
async function step2EnrichAndSend() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 STEP 2: ENRICH AND SEND EMAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run the existing process-leads-autonomous script
  // It will process NEW leads (enrichment) and RESEARCHING leads (email sending)
  const { execSync } = require('child_process');
  
  try {
    console.log('   Running enrichment and email generation...');
    execSync('npm run process-leads-autonomous', { 
      stdio: 'inherit',
      env: { ...process.env, MAX_LEADS_TO_PROCESS: TEST_TARGET_LEADS.toString() }
    });
    
    console.log('');
    console.log('✅ Step 2 Complete');
    
    return { enriched: 0, emailsSent: 0 }; // Counts will be in the script output
  } catch (error: any) {
    console.error('❌ Step 2 Failed:', error.message);
    throw error;
  }
}

/**
 * Step 3: Process inbound emails
 */
async function step3ProcessInbound() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 STEP 3: PROCESS INBOUND EMAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run the existing process-inbound-autonomous script
  const { execSync } = require('child_process');
  
  try {
    console.log('   Processing inbound emails...');
    execSync('npm run process-inbound-autonomous', { 
      stdio: 'inherit'
    });
    
    console.log('');
    console.log('✅ Step 3 Complete');
    
    // Check for leads with status that might need inbound processing
    const contactedLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.status, 'CONTACTED'))
      .limit(10);

    console.log(`   ${contactedLeads.length} CONTACTED leads ready for replies`);
    console.log('');
    
    return { contactedLeads: contactedLeads.length };
  } catch (error: any) {
    console.error('❌ Step 3 Failed:', error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 PREDATOR BOT 100-LEAD TEST RUN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Target: ${TEST_TARGET_LEADS} high-intent leads`);
  console.log('');

  try {
    // Step 1: Source leads
    const sourced = await step1SourceLeads();
    
    if (sourced === 0) {
      console.log('⚠️  No leads sourced. Cannot proceed with enrichment.');
      return;
    }

    // Wait a bit for database to sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Enrich and send
    const { enriched, emailsSent } = await step2EnrichAndSend();

    // Step 3: Process inbound (verification only)
    await step3ProcessInbound();

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST RUN COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Results:`);
    console.log(`   Leads Sourced: ${sourced}`);
    console.log(`   Leads Enriched: ${enriched}`);
    console.log(`   Emails Sent: ${emailsSent}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Monitor email delivery in Resend dashboard');
    console.log('   2. Check for inbound email replies');
    console.log('   3. Verify lead status updates in database');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTest()
    .then(() => {
      console.log('✅ Test run completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test run failed:', error);
      process.exit(1);
    });
}

export { runTest };

