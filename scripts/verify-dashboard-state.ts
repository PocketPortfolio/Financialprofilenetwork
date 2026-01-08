/**
 * Verify Dashboard State
 * Check current lead counts and status
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { sql } from 'drizzle-orm';

async function verifyState() {
  const stats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      new: sql<number>`COUNT(CASE WHEN ${leads.status} = 'NEW' THEN 1 END)`,
      researching: sql<number>`COUNT(CASE WHEN ${leads.status} = 'RESEARCHING' THEN 1 END)`,
      contacted: sql<number>`COUNT(CASE WHEN ${leads.status} = 'CONTACTED' THEN 1 END)`,
    })
    .from(leads);

  console.log('\n📊 Current Database State:');
  console.log(`   Total Leads: ${stats[0]?.total || 0}`);
  console.log(`   NEW: ${stats[0]?.new || 0}`);
  console.log(`   RESEARCHING: ${stats[0]?.researching || 0}`);
  console.log(`   CONTACTED: ${stats[0]?.contacted || 0}`);
  console.log('\n✅ Dashboard verification complete!\n');
}

verifyState().catch(console.error);

