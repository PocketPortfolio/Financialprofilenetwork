/**
 * Fix existing SJP leads with generic company names
 * Updates company names to practice-specific names and clears research for re-enrichment
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { isRealFirstName } from '@/lib/sales/name-validation';

async function fixSjpLeads() {
  console.log('🔧 Fixing SJP leads with generic company names...\n');

  // Find SJP leads with generic company name
  const sjpLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      firstName: leads.firstName,
      lastName: leads.lastName,
      companyName: leads.companyName,
      location: leads.location,
      dataSource: leads.dataSource,
      researchSummary: leads.researchSummary,
    })
    .from(leads)
    .where(
      and(
        or(
          eq(leads.dataSource, 'predator_sjp'),
          eq(leads.companyName, "St. James's Place Partner")
        ),
        // Only update if company name is generic
        eq(leads.companyName, "St. James's Place Partner")
      )
    )
    .limit(500); // Process in batches

  console.log(`   Found ${sjpLeads.length} SJP leads with generic company names\n`);

  if (sjpLeads.length === 0) {
    console.log('✅ No SJP leads to fix');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let invalidNames = 0;

  for (const lead of sjpLeads) {
    try {
      // Validate firstName - skip if invalid
      if (lead.firstName && !isRealFirstName(lead.firstName)) {
        console.log(`   ⚠️  Skipping ${lead.email}: Invalid firstName "${lead.firstName}"`);
        invalidNames++;
        skipped++;
        continue;
      }

      // Generate practice name
      let practiceName = "St. James's Place Partner"; // Default fallback
      
      if (lead.firstName && lead.lastName) {
        practiceName = `${lead.firstName} ${lead.lastName} Practice`;
      } else if (lead.firstName) {
        practiceName = `${lead.firstName}'s Practice`;
      } else {
        // No valid name - skip
        console.log(`   ⚠️  Skipping ${lead.email}: No valid name`);
        skipped++;
        continue;
      }

      // Update company name and clear research summary for re-enrichment
      await db.update(leads)
        .set({
          companyName: practiceName,
          researchSummary: 'Research pending', // Clear to trigger re-enrichment with practice-specific research
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      updated++;
      
      if (updated % 50 === 0) {
        console.log(`   ✅ Progress: ${updated}/${sjpLeads.length} leads updated...`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to update ${lead.email}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ Fix complete:`);
  console.log(`   - Updated: ${updated}/${sjpLeads.length}`);
  console.log(`   - Skipped (invalid names): ${invalidNames}`);
  console.log(`   - Skipped (other): ${skipped - invalidNames}`);
  console.log(`\n💡 Next step: Run 'npm run re-enrich-stale-leads' to regenerate research summaries with practice-specific data`);
}

fixSjpLeads().catch(console.error);

