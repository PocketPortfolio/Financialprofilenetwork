/**
 * Re-enrich Stale Leads Script
 * 
 * Finds leads with stale research data (score = 0 or researchSummary = "Research pending")
 * and re-enriches them with AI-generated summaries and updated scores
 * 
 * This preserves existing status (CONTACTED/SCHEDULED) while updating research data
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, or, sql } from 'drizzle-orm';
import { enrichLead } from '@/app/agent/researcher';

async function reEnrichStaleLeads() {
  console.log('🔄 Re-enriching stale leads...\n');

  // Find leads with stale data (score = 0 or researchSummary = "Research pending" or null)
  const staleLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      status: leads.status,
      score: leads.score,
      researchSummary: leads.researchSummary,
    })
    .from(leads)
    .where(
      or(
        eq(leads.score, 0),
        eq(leads.researchSummary, 'Research pending'),
        sql`${leads.researchSummary} IS NULL`
      )
    )
    .limit(100); // Process in batches

  console.log(`   Found ${staleLeads.length} leads with stale research data\n`);

  if (staleLeads.length === 0) {
    console.log('✅ No stale leads to re-enrich');
    return;
  }

  let enriched = 0;
  let failed = 0;
  let skipped = 0;

  for (const lead of staleLeads) {
    try {
      // Skip leads that are DO_NOT_CONTACT
      if (lead.status === 'DO_NOT_CONTACT') {
        skipped++;
        continue;
      }

      console.log(`   Re-enriching: ${lead.companyName} (${lead.email}) - Status: ${lead.status}`);
      
      // Re-enrich (will preserve CONTACTED/SCHEDULED status)
      await enrichLead(lead.id);
      
      // Verify update
      const [updated] = await db
        .select({ 
          score: leads.score, 
          researchSummary: leads.researchSummary,
          status: leads.status,
        })
        .from(leads)
        .where(eq(leads.id, lead.id))
        .limit(1);
      
      if (updated && (updated.score ?? 0) > 0 && updated.researchSummary && updated.researchSummary !== 'Research pending') {
        enriched++;
        const summaryPreview = updated.researchSummary.length > 50 
          ? updated.researchSummary.substring(0, 50) + '...'
          : updated.researchSummary;
        console.log(`   ✅ Updated: Score=${updated.score ?? 0}, Status=${updated.status}, Summary="${summaryPreview}"`);
      } else {
        console.log(`   ⚠️  Still stale after enrichment (Score: ${updated?.score ?? 0})`);
      }
    } catch (error: any) {
      failed++;
      console.error(`   ❌ Failed to re-enrich ${lead.companyName}:`, error.message);
    }
  }

  console.log(`\n✅ Re-enrichment complete:`);
  console.log(`   - Enriched: ${enriched}/${staleLeads.length}`);
  console.log(`   - Failed: ${failed}`);
  console.log(`   - Skipped (DO_NOT_CONTACT): ${skipped}`);
}

reEnrichStaleLeads().catch(console.error);

