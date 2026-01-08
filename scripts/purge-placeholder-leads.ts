/**
 * Purge Placeholder Leads
 * Removes all leads with placeholder emails that cannot be contacted
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads, conversations, auditLogs } from '@/db/sales/schema';
import { like, or, inArray } from 'drizzle-orm';

async function purgePlaceholders() {
  console.log('🧹 Purging placeholder leads...\n');

  // Find all placeholder leads
  const placeholderLeads = await db
    .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
    .from(leads)
    .where(
      or(
        like(leads.email, '%.placeholder'),
        like(leads.email, '%@similar.%'),
        like(leads.email, '%@github-hiring.%')
      )
    );

  console.log(`   Found ${placeholderLeads.length} placeholder leads`);

  if (placeholderLeads.length === 0) {
    console.log('   ✅ No placeholder leads found');
    return;
  }

  console.log('\n   Placeholder leads to delete:');
  placeholderLeads.forEach(lead => {
    console.log(`     - ${lead.companyName} (${lead.email})`);
  });

  const leadIds = placeholderLeads.map(l => l.id);

  // Delete related data
  if (leadIds.length > 0) {
    await db.delete(conversations).where(inArray(conversations.leadId, leadIds));
    console.log(`   ✅ Deleted conversations for placeholder leads`);
    
    await db.delete(auditLogs).where(inArray(auditLogs.leadId, leadIds));
    console.log(`   ✅ Deleted audit logs for placeholder leads`);
    
    await db.delete(leads).where(inArray(leads.id, leadIds));
    console.log(`   ✅ Deleted ${placeholderLeads.length} placeholder leads\n`);
  }

  // Verify cleanup
  const remaining = await db
    .select({ count: leads.id })
    .from(leads)
    .where(
      or(
        like(leads.email, '%.placeholder'),
        like(leads.email, '%@similar.%'),
        like(leads.email, '%@github-hiring.%')
      )
    );

  if (remaining.length === 0) {
    console.log('✅ All placeholder leads purged successfully!');
  } else {
    console.log(`⚠️  Warning: ${remaining.length} placeholder leads still remain`);
  }
}

purgePlaceholders().catch(console.error);

