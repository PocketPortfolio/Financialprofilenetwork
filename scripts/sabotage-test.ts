/**
 * Sabotage Test Script
 * Marks 20 high-value leads as UNQUALIFIED to test feedback loop
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, inArray, and, or, sql } from 'drizzle-orm';

async function sabotageTest() {
  console.log('🕵️  SABOTAGE TEST: Marking 20 high-value leads as UNQUALIFIED...\n');

  // Find 20 high-value leads (NEW, RESEARCHING, CONTACTED, SCHEDULED)
  const leadsToSabotage = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      status: leads.status,
      score: leads.score,
    })
    .from(leads)
    .where(
      and(
        inArray(leads.status, ['NEW', 'RESEARCHING', 'CONTACTED', 'SCHEDULED']),
        sql`${leads.status} != 'UNQUALIFIED'`
      )
    )
    .orderBy(sql`${leads.score} DESC NULLS LAST, ${leads.createdAt} DESC`)
    .limit(20);

  if (leadsToSabotage.length === 0) {
    console.log('⚠️  No leads found to sabotage. All leads may already be UNQUALIFIED or in other statuses.');
    return;
  }

  console.log(`   Found ${leadsToSabotage.length} leads to mark as UNQUALIFIED:\n`);
  leadsToSabotage.forEach((lead, idx) => {
    console.log(`   ${idx + 1}. ${lead.email} (${lead.companyName}) - Status: ${lead.status}, Score: ${lead.score ?? 'N/A'}`);
  });

  const leadIds = leadsToSabotage.map(l => l.id);

  // Mark them as UNQUALIFIED
  const updated = await db
    .update(leads)
    .set({
      status: 'UNQUALIFIED',
      updatedAt: new Date(),
    })
    .where(inArray(leads.id, leadIds))
    .returning({ id: leads.id, email: leads.email, status: leads.status });

  // Log the sabotage in audit logs
  for (const lead of leadsToSabotage) {
    await db.insert(auditLogs).values({
      leadId: lead.id,
      action: 'STATUS_CHANGED',
      aiReasoning: 'SABOTAGE TEST: Marked as UNQUALIFIED to test feedback loop',
      metadata: {
        previousStatus: lead.status,
        newStatus: 'UNQUALIFIED',
        testType: 'sabotage',
      },
    });
  }

  console.log(`\n✅ Successfully marked ${updated.length} leads as UNQUALIFIED`);
  console.log('   The system should now detect the revenue gap and increase sourcing target.\n');
}

sabotageTest()
  .then(() => {
    console.log('✅ Sabotage test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sabotage test failed:', error);
    process.exit(1);
  });

