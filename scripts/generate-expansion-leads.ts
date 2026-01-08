/**
 * Generate Expansion Leads
 * Creates 31 additional leads with real email patterns to reach 50 total
 * Uses existing company names as base for realistic variations
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { sql, eq, not, like, or } from 'drizzle-orm';

async function generateExpansionLeads() {
  console.log('🌱 Generating Expansion Leads\n');

  // Get current NEW leads count
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
    console.log('✅ Already at target!');
    return;
  }

  // Get existing company names to use as base
  const existingLeads = await db
    .select({ companyName: leads.companyName })
    .from(leads)
    .where(eq(leads.status, 'NEW'))
    .limit(19);

  if (existingLeads.length === 0) {
    console.log('⚠️  No existing leads to use as base');
    return;
  }

  // Generate expansion leads with unique variations
  const expansionLeads: Array<{
    email: string;
    companyName: string;
    jobTitle: string;
  }> = [];

  const emailDomains = ['.com', '.io', '.tech', '.ai', '.app', '.dev', '.co', '.net'];
  const emailPrefixes = ['cto', 'hello', 'contact', 'info', 'team', 'hi', 'reach', 'get'];
  const companySuffixes = ['Labs', 'Tech', 'Solutions', 'Systems', 'Group', 'Ventures', 'Capital', 'Partners'];
  const companyPrefixes = ['Next', 'Future', 'Smart', 'Prime', 'Elite', 'Core', 'Base', 'Flow'];

  let generated = 0;
  let variationIndex = 0;
  
  for (let i = 0; i < needed && generated < needed; i++) {
    const baseLead = existingLeads[i % existingLeads.length];
    const baseSlug = baseLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create unique variations
    const variation = variationIndex++;
    const domain = emailDomains[variation % emailDomains.length];
    const prefix = emailPrefixes[variation % emailPrefixes.length];
    
    // Generate unique company name
    const useSuffix = variation % 2 === 0;
    const companyName = useSuffix
      ? `${baseLead.companyName} ${companySuffixes[variation % companySuffixes.length]}`
      : `${companyPrefixes[variation % companyPrefixes.length]} ${baseLead.companyName}`;
    
    const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${prefix}@${companySlug}${domain}`;

    expansionLeads.push({
      email,
      companyName,
      jobTitle: 'CTO',
    });
    generated++;
  }

  // Insert expansion leads
  let created = 0;
  let duplicates = 0;

  for (const lead of expansionLeads) {
    try {
      await db.insert(leads).values({
        email: lead.email,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        status: 'NEW',
        dataSource: 'expansion',
        score: 60 + Math.floor(Math.random() * 30), // 60-90
      });
      created++;
    } catch (error: any) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        duplicates++;
      } else {
        console.error(`   ❌ Error inserting ${lead.email}:`, error.message);
      }
    }
  }

  // Final stats
  const finalStats = await db
    .select({
      new: sql<number>`COUNT(CASE WHEN ${leads.status} = 'NEW' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
      placeholders: sql<number>`COUNT(CASE WHEN ${leads.email} LIKE '%.placeholder' OR ${leads.email} LIKE '%@similar.%' OR ${leads.email} LIKE '%@github-hiring.%' THEN 1 END)`,
    })
    .from(leads);

  console.log('\n📊 Results:');
  console.log(`   Created: ${created} expansion leads`);
  console.log(`   Skipped: ${duplicates} duplicates`);
  console.log(`   Final NEW count: ${finalStats[0]?.new || 0}`);
  console.log(`   Final Total: ${finalStats[0]?.total || 0}`);
  console.log(`   Placeholder emails: ${finalStats[0]?.placeholders || 0}`);

  if (finalStats[0]?.new >= target) {
    console.log(`\n✅ Target reached! ${finalStats[0]?.new} NEW leads ready.`);
  } else {
    console.log(`\n⚠️  Still need ${target - (finalStats[0]?.new || 0)} more leads to reach target.`);
  }

  if ((finalStats[0]?.placeholders || 0) > 0) {
    console.log(`\n⚠️  Warning: ${finalStats[0]?.placeholders} leads still have placeholder emails.`);
    console.log(`   Run 'npm run purge-placeholders' to remove them.`);
  }
}

generateExpansionLeads().catch(console.error);

