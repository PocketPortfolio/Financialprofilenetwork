/**
 * Check Scheduled Emails
 * Shows all leads with scheduled send times
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { sql, isNotNull } from 'drizzle-orm';

async function checkScheduled() {
  console.log('📅 Checking Scheduled Emails\n');

  const scheduled = await db
    .select({
      email: leads.email,
      companyName: leads.companyName,
      status: leads.status,
      scheduledSendAt: leads.scheduledSendAt,
      timezone: leads.timezone,
    })
    .from(leads)
    .where(isNotNull(leads.scheduledSendAt))
    .orderBy(leads.scheduledSendAt);

  console.log(`   Found ${scheduled.length} scheduled emails\n`);

  if (scheduled.length > 0) {
    console.log('   Scheduled Emails:');
    scheduled.forEach((lead, i) => {
      const sendTime = lead.scheduledSendAt ? new Date(lead.scheduledSendAt).toISOString() : 'N/A';
      const tz = lead.timezone || 'Not detected';
      console.log(`   ${i + 1}. ${lead.companyName} (${lead.email})`);
      console.log(`      Status: ${lead.status}`);
      console.log(`      Scheduled: ${sendTime}`);
      console.log(`      Timezone: ${tz}\n`);
    });
  }

  // Summary by status
  const statusSummary = await db
    .select({
      status: leads.status,
      count: sql<number>`COUNT(*)`,
      scheduled: sql<number>`COUNT(CASE WHEN ${leads.scheduledSendAt} IS NOT NULL THEN 1 END)`,
    })
    .from(leads)
    .groupBy(leads.status);

  console.log('\n📊 Status Summary:');
  statusSummary.forEach(row => {
    console.log(`   ${row.status}: ${row.count} total, ${row.scheduled} scheduled`);
  });
}

checkScheduled().catch(console.error);

