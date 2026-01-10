/**
 * Purge Dead Leads Script
 * 
 * Marks all leads with bounced/delayed emails as UNQUALIFIED
 * This triggers Auto-Replenishment to source fresh leads
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { leads, auditLogs, conversations } from '@/db/sales/schema';
import { eq, inArray, sql } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function purgeDeadLeads() {
  console.log('🧹 Purging Dead Leads (Bounced/Delayed)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Find all email IDs that have bounced or delivery_delayed status
    // This assumes we're tracking delivery status in audit logs metadata
    const deadEmailLogs = await db
      .select({
        leadId: auditLogs.leadId,
        emailId: sql<string>`${auditLogs.metadata}->>'emailId'`,
        deliveryStatus: sql<string>`${auditLogs.metadata}->>'deliveryStatus'`,
      })
      .from(auditLogs)
      .where(
        sql`${auditLogs.metadata}->>'deliveryStatus' IN ('bounced', 'delivery_delayed', 'failed')`
      )
      .where(sql`${auditLogs.leadId} IS NOT NULL`);

    if (deadEmailLogs.length === 0) {
      console.log('✅ No dead leads found');
      return;
    }

    // Get unique lead IDs
    const deadLeadIds = [...new Set(deadEmailLogs.map(log => log.leadId).filter(Boolean))];

    console.log(`📊 Found ${deadEmailLogs.length} dead emails affecting ${deadLeadIds.length} leads`);

    // Mark leads as UNQUALIFIED
    const updated = await db
      .update(leads)
      .set({
        status: 'UNQUALIFIED',
        updatedAt: new Date(),
      })
      .where(inArray(leads.id, deadLeadIds))
      .returning({ id: leads.id, email: leads.email, companyName: leads.companyName });

    console.log(`✅ Marked ${updated.length} leads as UNQUALIFIED`);

    // Log the purge action
    for (const lead of updated) {
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Dead lead purge: Email bounced/delayed - marked as UNQUALIFIED to trigger Auto-Replenishment',
        metadata: {
          previousStatus: 'CONTACTED',
          newStatus: 'UNQUALIFIED',
          purgeReason: 'bounced_or_delayed',
        },
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Purge complete: ${updated.length} leads marked as UNQUALIFIED`);
    console.log(`   This will trigger Auto-Replenishment to source fresh leads`);
  } catch (error: any) {
    console.error('❌ Error purging dead leads:', error);
    throw error;
  }
}

// Execute
purgeDeadLeads()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

