/**
 * Fix SJP leads with invalid names (Share, Visit, etc.) by extracting from email
 * Pattern: firstname.lastname@sjpp.co.uk
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, and, or } from 'drizzle-orm';
import { isRealFirstName } from '@/lib/sales/name-validation';

async function fixInvalidNames() {
  console.log('🔧 Fixing SJP leads with invalid names by extracting from emails...\n');

  // Find SJP leads with invalid first names
  const invalidNameLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      firstName: leads.firstName,
      lastName: leads.lastName,
      companyName: leads.companyName,
      location: leads.location,
      dataSource: leads.dataSource,
    })
    .from(leads)
    .where(
      and(
        or(
          eq(leads.dataSource, 'predator_sjp'),
          eq(leads.companyName, "St. James's Place Partner")
        ),
        // Find leads with invalid names
        or(
          eq(leads.firstName, 'Share'),
          eq(leads.firstName, 'Visit'),
          eq(leads.firstName, 'Partner'),
          eq(leads.firstName, 'View'),
          eq(leads.firstName, 'Read'),
          eq(leads.firstName, 'More'),
          eq(leads.firstName, 'Click'),
          eq(leads.firstName, 'Link')
        )
      )
    )
    .limit(500);

  console.log(`   Found ${invalidNameLeads.length} leads with invalid names\n`);

  if (invalidNameLeads.length === 0) {
    console.log('✅ No leads with invalid names to fix');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let extracted = 0;

  for (const lead of invalidNameLeads) {
    try {
      // Extract name from email: firstname.lastname@sjpp.co.uk
      const emailParts = lead.email.split('@')[0];
      if (!emailParts || emailParts.length < 2) {
        skipped++;
        continue;
      }

      const nameParts = emailParts.split(/[._-]/).filter(p => p.length > 0);
      
      if (nameParts.length === 0) {
        skipped++;
        continue;
      }

      // Extract first and last name
      let extractedFirstName = nameParts[0];
      let extractedLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Capitalize first letter
      extractedFirstName = extractedFirstName.charAt(0).toUpperCase() + extractedFirstName.slice(1).toLowerCase();
      if (extractedLastName) {
        extractedLastName = extractedLastName.split(' ').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
      }

      // Validate extracted name
      if (!isRealFirstName(extractedFirstName)) {
        console.log(`   ⚠️  Skipping ${lead.email}: Extracted firstName "${extractedFirstName}" is still invalid`);
        skipped++;
        continue;
      }

      // Generate practice name
      let practiceName = "St. James's Place Partner";
      if (extractedFirstName && extractedLastName) {
        practiceName = `${extractedFirstName} ${extractedLastName} Practice`;
      } else if (extractedFirstName) {
        practiceName = `${extractedFirstName}'s Practice`;
      }

      // Update lead
      await db.update(leads)
        .set({
          firstName: extractedFirstName,
          lastName: extractedLastName || null,
          companyName: practiceName,
          researchSummary: 'Research pending', // Clear to trigger re-enrichment
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      updated++;
      extracted++;
      
      if (updated % 50 === 0) {
        console.log(`   ✅ Progress: ${updated}/${invalidNameLeads.length} leads updated...`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to update ${lead.email}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ Fix complete:`);
  console.log(`   - Updated: ${updated}/${invalidNameLeads.length}`);
  console.log(`   - Names extracted from emails: ${extracted}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`\n💡 Next step: Run 'npm run re-enrich-stale-leads' to regenerate research summaries`);
}

fixInvalidNames().catch(console.error);

