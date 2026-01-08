/**
 * Enhanced Lookalike Seeding Script
 * Expands existing NEW leads to reach 50-lead target
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { generateLookalikeLeads } from '@/lib/sales/sourcing/lookalike-seeding';
import { sql } from 'drizzle-orm';

async function seedLookalikes() {
  console.log('🌱 Enhanced Lookalike Seeding Started\n');

  // Count current NEW leads
  const currentStats = await db
    .select({
      new: sql<number>`COUNT(CASE WHEN ${leads.status} = 'NEW' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(leads);

  const currentNew = currentStats[0]?.new || 0;
  const target = 50;
  const needed = Math.max(0, target - currentNew);

  console.log(`   Current NEW leads: ${currentNew}`);
  console.log(`   Target: ${target}`);
  console.log(`   Needed: ${needed}\n`);

  if (needed === 0) {
    console.log('✅ Already at target! No seeding needed.');
    return;
  }

  // Generate lookalike leads
  const lookalikes = await generateLookalikeLeads(0, needed);

  if (lookalikes.length === 0) {
    console.log('⚠️  No lookalike leads generated');
    return;
  }

  // Insert lookalike leads
  let created = 0;
  let duplicates = 0;

  for (const lookalike of lookalikes) {
    try {
      await db.insert(leads).values({
        email: lookalike.email,
        companyName: lookalike.companyName,
        jobTitle: lookalike.jobTitle,
        status: 'NEW',
        dataSource: lookalike.dataSource,
        score: lookalike.similarityScore,
        researchData: {
          seedLeadId: lookalike.seedLeadId,
          similarityScore: lookalike.similarityScore,
        },
      });
      created++;
    } catch (error: any) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        duplicates++;
      } else {
        console.error(`   ❌ Error inserting ${lookalike.email}:`, error.message);
      }
    }
  }

  // Final stats
  const finalStats = await db
    .select({
      new: sql<number>`COUNT(CASE WHEN ${leads.status} = 'NEW' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(leads);

  console.log('\n📊 Results:');
  console.log(`   Created: ${created} new leads`);
  console.log(`   Skipped: ${duplicates} duplicates`);
  console.log(`   Final NEW count: ${finalStats[0]?.new || 0}`);
  console.log(`   Final Total: ${finalStats[0]?.total || 0}`);

  if (finalStats[0]?.new >= target) {
    console.log(`\n✅ Target reached! ${finalStats[0]?.new} NEW leads ready.`);
  } else {
    console.log(`\n⚠️  Still need ${target - (finalStats[0]?.new || 0)} more leads to reach target.`);
  }
}

seedLookalikes().catch(console.error);

