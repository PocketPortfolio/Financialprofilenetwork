/**
 * Test Script: Predator V4 Scaling Test
 * 
 * Tests the scaled Predator V4 with 50+ UK cities and NAPFA enabled
 * Targets: 50+ leads to verify scaling works
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (REQUIRED for ts-node scripts)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { sourceFromPredator } from '@/lib/sales/sourcing/predator-scraper';
import { validateEmail } from '@/lib/sales/email-validation';

async function testPredatorScaling() {
  console.log('🧪 PREDATOR V4 SCALING TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Target: 50+ leads');
  console.log('Sources: SJP (50+ UK cities), VouchedFor, NAPFA (US)');
  console.log('');

  const TARGET_LEADS = 50;
  let created = 0;
  let skipped = 0;
  let rejected = 0;

  try {
    console.log('🦅 Running Predator V4...');
    console.log('   This may take several minutes (searching 50+ cities)...');
    console.log('');

    // Run Predator V4 with target of 50 leads
    const predatorLeads = await sourceFromPredator(TARGET_LEADS);

    console.log('');
    console.log(`✅ Predator V4 extracted ${predatorLeads.length} leads`);
    console.log('');

    if (predatorLeads.length === 0) {
      console.log('❌ No leads extracted. Check Predator V4 configuration.');
      return;
    }

    console.log('💾 Storing leads in database...');
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

      // Insert lead into database
      try {
        await db.insert(leads).values({
          email: lead.email,
          firstName: lead.firstName || null,
          lastName: lead.lastName || null,
          companyName: lead.companyName,
          jobTitle: lead.jobTitle,
          status: 'NEW',
          dataSource: lead.dataSource,
          location: lead.location || null,
          score: 0,
          dataSourceDate: new Date(),
        });

        created++;

        if (created % 10 === 0) {
          console.log(`   ✅ Progress: ${created} leads saved...`);
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
    console.log('✅ TEST COMPLETE');
    console.log('');
    console.log('📊 RESULTS:');
    console.log(`   Created: ${created} leads`);
    console.log(`   Skipped: ${skipped} (duplicates)`);
    console.log(`   Rejected: ${rejected} (invalid)`);
    console.log(`   Total Extracted: ${predatorLeads.length}`);
    console.log(`   Target: ${TARGET_LEADS} leads`);
    console.log('');

    if (created >= TARGET_LEADS) {
      console.log(`✅ SUCCESS: Target met! (${created}/${TARGET_LEADS})`);
      console.log('');
      console.log('📧 Next Steps:');
      console.log('   1. Leads are stored in database with status "NEW"');
      console.log('   2. Run enrichment script to research leads');
      console.log('   3. Run outreach script to send emails');
    } else if (created > 0) {
      console.log(`⚠️  PARTIAL SUCCESS: ${created}/${TARGET_LEADS} leads created`);
      console.log('   This may be due to:');
      console.log('   - Many leads already in database (duplicates)');
      console.log('   - Some cities had no advisors');
      console.log('   - Email validation failures');
    } else {
      console.log(`❌ FAILED: No leads created`);
    }

  } catch (error: any) {
    console.error('');
    console.error('❌ TEST FAILED:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  testPredatorScaling()
    .then(() => {
      console.log('');
      console.log('✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

export { testPredatorScaling };

