/**
 * Update Scheduled Emails Script
 * 
 * Checks all SCHEDULED leads where scheduledSendAt has passed
 * and updates their status to CONTACTED
 * 
 * This should run periodically (e.g., every 15 minutes) to catch emails
 * that were sent but status wasn't updated via webhook
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads, auditLogs, conversations } from '@/db/sales/schema';
import { eq, and, lte, isNotNull, or, sql } from 'drizzle-orm';

async function updateScheduledEmails() {
  console.log('🔄 Checking for past scheduled emails...\n');

  const now = new Date();
  
  // Find all SCHEDULED leads where scheduledSendAt has passed
  const pastScheduled = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      scheduledSendAt: leads.scheduledSendAt,
      status: leads.status,
      lastContactedAt: leads.lastContactedAt,
    })
    .from(leads)
    .where(
      and(
        eq(leads.status, 'SCHEDULED'),
        or(
          // Case 1: scheduledSendAt has passed
          and(
            isNotNull(leads.scheduledSendAt),
            lte(leads.scheduledSendAt, now)
          ),
          // Case 2: scheduledSendAt is null but lastContactedAt exists (email was sent)
          and(
            sql`${leads.scheduledSendAt} IS NULL`,
            isNotNull(leads.lastContactedAt),
            lte(leads.lastContactedAt, now)
          )
        )
      )
    );

  console.log(`   Found ${pastScheduled.length} scheduled emails with past scheduledSendAt or lastContactedAt\n`);

  // Also check for SCHEDULED leads that have outbound conversations (email was sent)
  const scheduledWithEmails = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      scheduledSendAt: leads.scheduledSendAt,
      status: leads.status,
      lastContactedAt: leads.lastContactedAt,
    })
    .from(leads)
    .innerJoin(conversations, eq(conversations.leadId, leads.id))
    .where(
      and(
        eq(leads.status, 'SCHEDULED'),
        eq(conversations.direction, 'outbound')
      )
    )
    .groupBy(leads.id, leads.email, leads.companyName, leads.scheduledSendAt, leads.status, leads.lastContactedAt);

  console.log(`   Found ${scheduledWithEmails.length} SCHEDULED leads with outbound conversations\n`);

  // Combine both sets and deduplicate by lead ID
  const allScheduled = new Map();
  pastScheduled.forEach(lead => allScheduled.set(lead.id, lead));
  scheduledWithEmails.forEach(lead => allScheduled.set(lead.id, lead));

  const leadsToUpdate = Array.from(allScheduled.values());
  console.log(`   Total SCHEDULED leads to update: ${leadsToUpdate.length}\n`);

  if (leadsToUpdate.length === 0) {
    console.log('✅ No scheduled emails to update');
    return;
  }

  let updated = 0;
  for (const lead of leadsToUpdate) {
    try {
      // Determine the best timestamp to use for lastContactedAt
      const scheduledTime = lead.scheduledSendAt ? new Date(lead.scheduledSendAt) : null;
      const contactedTime = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null;
      const bestTime = scheduledTime || contactedTime || new Date();
      
      await db.update(leads)
        .set({ 
          status: 'CONTACTED',
          scheduledSendAt: null, // Clear scheduled time
          lastContactedAt: bestTime,
          updatedAt: new Date()
        })
        .where(eq(leads.id, lead.id));

      // Log the status change
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: `Scheduled email send time has passed or email was sent - updated from SCHEDULED to CONTACTED`,
        metadata: {
          previousStatus: 'SCHEDULED',
          newStatus: 'CONTACTED',
          scheduledSendAt: scheduledTime?.toISOString(),
          lastContactedAt: contactedTime?.toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      updated++;
      const timeInfo = scheduledTime 
        ? `scheduled for ${scheduledTime.toISOString()}`
        : contactedTime 
        ? `last contacted ${contactedTime.toISOString()}`
        : 'has outbound email';
      console.log(`   ✅ Updated ${lead.companyName} (${lead.email}) - ${timeInfo}`);
    } catch (error: any) {
      console.error(`   ❌ Failed to update ${lead.companyName}:`, error.message);
    }
  }

  console.log(`\n✅ Updated ${updated}/${leadsToUpdate.length} scheduled emails to CONTACTED`);
}

updateScheduledEmails().catch(console.error);

