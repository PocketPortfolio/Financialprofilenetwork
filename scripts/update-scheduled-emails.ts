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
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, and, lte, isNotNull } from 'drizzle-orm';

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
    })
    .from(leads)
    .where(
      and(
        eq(leads.status, 'SCHEDULED'),
        isNotNull(leads.scheduledSendAt),
        lte(leads.scheduledSendAt, now)
      )
    );

  console.log(`   Found ${pastScheduled.length} scheduled emails that should have been sent\n`);

  if (pastScheduled.length === 0) {
    console.log('✅ No scheduled emails to update');
    return;
  }

  let updated = 0;
  for (const lead of pastScheduled) {
    try {
      const scheduledTime = lead.scheduledSendAt ? new Date(lead.scheduledSendAt) : null;
      
      await db.update(leads)
        .set({ 
          status: 'CONTACTED',
          scheduledSendAt: null, // Clear scheduled time
          lastContactedAt: scheduledTime || new Date(), // Use scheduled time if available
          updatedAt: new Date()
        })
        .where(eq(leads.id, lead.id));

      // Log the status change
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: `Scheduled email send time has passed - updated from SCHEDULED to CONTACTED`,
        metadata: {
          previousStatus: 'SCHEDULED',
          newStatus: 'CONTACTED',
          scheduledSendAt: scheduledTime?.toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      updated++;
      console.log(`   ✅ Updated ${lead.companyName} (${lead.email}) - scheduled for ${scheduledTime?.toISOString()}`);
    } catch (error: any) {
      console.error(`   ❌ Failed to update ${lead.companyName}:`, error.message);
    }
  }

  console.log(`\n✅ Updated ${updated}/${pastScheduled.length} scheduled emails to CONTACTED`);
}

updateScheduledEmails().catch(console.error);

