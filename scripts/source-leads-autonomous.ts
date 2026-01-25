/**
 * Autonomous B2B Lead Sourcing Script
 * 
 * v4.0: B2B FOCUS - Predator V4 Only (UK/US Wealth Managers)
 * CEO MANDATE: No developer sources. Only high-intent B2B leads.
 * 
 * Sources leads from:
 * - Predator V4: SJP Directory (UK), VouchedFor (UK), NAPFA (US)
 * 
 * Features:
 * - Direct email extraction from advisor directories
 * - Autonomous location discovery
 * - B2B strategy routing (White Label campaign)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { sourceFromPredator } from '@/lib/sales/sourcing/predator-scraper';
import { validateEmail } from '@/lib/sales/email-validation';


/**
 * Check if lead already exists
 */
async function leadExists(email: string, companyName: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(leads)
    .where(
      eq(leads.email, email)
    )
    .limit(1);
  
  return existing.length > 0;
}

/**
 * Main sourcing function
 * v4.0: B2B FOCUS - Predator V4 Only (UK/US Wealth Managers)
 * CEO MANDATE: No developer sources. Only high-intent B2B leads.
 */
async function sourceLeadsAutonomous() {
  console.log('🚀 Autonomous B2B Lead Sourcing Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🦅 Source: Predator V4 (SJP/VouchedFor/NAPFA)');
  console.log('❌ Disabled: GitHub, HN, Reddit, Product Hunt (Developer Sources)');
  console.log('');
  
  // v3.0: SCALE MODE - Always target 10K/day minimum for pipeline building
  // Workflow runs every 2 hours = 12 runs/day
  // Per-run target: 10,000 / 12 = ~833 leads/run
  const WORKFLOW_RUNS_PER_DAY = 12; // Every 2 hours
  const TARGET_LEADS_PER_DAY = 10000; // Always target 10K minimum
  const TARGET_LEADS_PER_RUN = Math.ceil(TARGET_LEADS_PER_DAY / WORKFLOW_RUNS_PER_DAY); // ~833/run

  console.log(`📊 Sourcing Target:`);
  console.log(`   Target: ${TARGET_LEADS_PER_RUN} leads/run (${TARGET_LEADS_PER_DAY} leads/day)`);
  console.log(`   Workflow Frequency: ${WORKFLOW_RUNS_PER_DAY} runs/day (every 2 hours)`);
  console.log('');

  let created = 0;
  let skipped = 0;
  let rejected = 0;

  try {
    console.log('🦅 Releasing Predator Bot V4...');
    console.log('   Sources: SJP Directory (UK), VouchedFor (UK), NAPFA (US)');
    console.log('   Strategy: Direct email extraction + Deep crawl');
    console.log('');
    
    // Run Predator V4 - returns leads array
    const predatorLeads = await sourceFromPredator(TARGET_LEADS_PER_RUN);
    
    console.log(`✅ Predator V4 extracted ${predatorLeads.length} leads`);
    console.log('');

    // Process and save leads to database
    for (const lead of predatorLeads) {
      // Check if lead already exists
      if (await leadExists(lead.email, lead.companyName)) {
        skipped++;
        continue;
      }

      // Validate email
      const validation = await validateEmail(lead.email);
      if (!validation.isValid) {
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
          status: 'NEW', // Will be enriched in next workflow run
          dataSource: lead.dataSource,
          location: lead.location || null,
          score: 0, // Will be scored during enrichment
          dataSourceDate: new Date(),
        });

        created++;
        
        if (created % 50 === 0) {
          console.log(`   ✅ Progress: ${created}/${TARGET_LEADS_PER_RUN} leads saved...`);
        }
      } catch (error: any) {
        // Handle duplicate key errors gracefully
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          skipped++;
        } else {
          console.error(`   ❌ Error saving lead ${lead.email}:`, error.message);
          rejected++;
        }
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ B2B Sourcing Complete');
    console.log(`   Created: ${created} leads`);
    console.log(`   Skipped: ${skipped} (duplicates)`);
    console.log(`   Rejected: ${rejected} (invalid)`);
    console.log(`   Total Processed: ${predatorLeads.length}`);
    console.log(`   Per-Run Target: ${TARGET_LEADS_PER_RUN} leads/run`);
    console.log(`   Progress: ${created}/${TARGET_LEADS_PER_RUN} (${Math.round((created / TARGET_LEADS_PER_RUN) * 100)}%)`);
    console.log(`   Projected Daily: ${created * WORKFLOW_RUNS_PER_DAY} leads/day`);
    console.log('');
    console.log('📧 Next: Leads will be enriched and emailed in next workflow run (every 2 hours)');

    if (created >= TARGET_LEADS_PER_RUN) {
      console.log(`✅ Per-run target met! (${created}/${TARGET_LEADS_PER_RUN})`);
    } else if (created > 0) {
      console.log(`⚠️  Partial success: ${created}/${TARGET_LEADS_PER_RUN} leads created this run`);
      console.log('   System will retry in next scheduled run (every 2 hours)');
    } else {
      console.log(`❌ No leads created. Check Predator V4 configuration.`);
    }

  } catch (error: any) {
    console.error('❌ Predator V4 Failed:', error.message);
    console.error(error.stack);
    throw error; // Fail the workflow so it can be retried
  }
}

// Run if called directly
if (require.main === module) {
  sourceLeadsAutonomous()
    .then(() => {
      console.log('✅ Lead sourcing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Lead sourcing failed:', error);
      process.exit(1);
    });
}

export { sourceLeadsAutonomous };

