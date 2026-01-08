/**
 * Cleanup Test Data Script
 * Removes all test leads, conversations, and audit logs from the database
 * 
 * Run: ts-node --project scripts/tsconfig.json scripts/run-cleanup-test-data.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads, conversations, auditLogs } from '@/db/sales/schema';
import { sql, eq, or, like, inArray } from 'drizzle-orm';

async function cleanupTestData() {
  console.log('🧹 Starting test data cleanup...\n');

  try {
    // Find test leads
    const testLeads = await db
      .select({ id: leads.id })
      .from(leads)
      .where(
        or(
          like(leads.email, '%test%'),
          like(leads.email, '%example%'),
          eq(leads.companyName, 'Test Corp'),
          like(leads.companyName, '%Test%')
        )
      );

    console.log(`   Found ${testLeads.length} test leads to delete`);

    if (testLeads.length === 0) {
      console.log('   ✅ No test data found. Database is clean.');
      return;
    }

    const testLeadIds = testLeads.map(l => l.id);

    // Delete conversations
    if (testLeadIds.length > 0) {
      await db
        .delete(conversations)
        .where(inArray(conversations.leadId, testLeadIds));
      console.log(`   ✅ Deleted conversations for test leads`);
    }

    // Delete audit logs
    if (testLeadIds.length > 0) {
      await db
        .delete(auditLogs)
        .where(inArray(auditLogs.leadId, testLeadIds));
      console.log(`   ✅ Deleted audit logs for test leads`);
    }

    // Delete test leads
    await db
      .delete(leads)
      .where(
        or(
          like(leads.email, '%test%'),
          like(leads.email, '%example%'),
          eq(leads.companyName, 'Test Corp'),
          like(leads.companyName, '%Test%')
        )
      );
    console.log(`   ✅ Deleted ${testLeads.length} test leads`);

    // Verify cleanup
    const remainingLeads = await db
      .select({ 
        total: sql<number>`COUNT(*)`,
        new: sql<number>`COUNT(CASE WHEN ${leads.status} = 'NEW' THEN 1 END)`,
        researching: sql<number>`COUNT(CASE WHEN ${leads.status} = 'RESEARCHING' THEN 1 END)`,
        contacted: sql<number>`COUNT(CASE WHEN ${leads.status} = 'CONTACTED' THEN 1 END)`,
      })
      .from(leads);

    console.log('\n📊 Remaining leads:');
    console.log(`   Total: ${remainingLeads[0]?.total || 0}`);
    console.log(`   NEW: ${remainingLeads[0]?.new || 0}`);
    console.log(`   RESEARCHING: ${remainingLeads[0]?.researching || 0}`);
    console.log(`   CONTACTED: ${remainingLeads[0]?.contacted || 0}`);

    console.log('\n✅ Cleanup complete!');
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupTestData().catch(console.error);

