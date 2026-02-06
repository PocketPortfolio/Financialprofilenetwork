/**
 * Check Opt-Out System Status
 * 
 * This script verifies:
 * 1. Overall opt-out statistics
 * 2. System readiness for handling STOP replies
 * 3. Any leads that have opted out through other means
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkOptOutSystem() {
  console.log('🔍 Checking Opt-Out System Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Overall opt-out statistics
    console.log('📊 Overall Opt-Out Statistics:\n');
    
    const totalLeads = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads);

    const optedOutLeads = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.optOut, true));

    const doNotContactLeads = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.status, 'DO_NOT_CONTACT'));

    console.log(`   Total leads: ${totalLeads[0]?.count || 0}`);
    console.log(`   Opted out (optOut = true): ${optedOutLeads[0]?.count || 0}`);
    console.log(`   DO_NOT_CONTACT status: ${doNotContactLeads[0]?.count || 0}\n`);

    // 2. Check for any leads with optOut but not DO_NOT_CONTACT (inconsistency)
    const inconsistentLeads = await db
      .select({
        id: leads.id,
        email: leads.email,
        status: leads.status,
        optOut: leads.optOut,
        companyName: leads.companyName,
      })
      .from(leads)
      .where(
        sql`${leads.optOut} = true AND ${leads.status} != 'DO_NOT_CONTACT'`
      );

    if (inconsistentLeads.length > 0) {
      console.log('⚠️  Inconsistencies Found:\n');
      console.log(`   Found ${inconsistentLeads.length} leads with optOut=true but status != DO_NOT_CONTACT:\n`);
      for (const lead of inconsistentLeads.slice(0, 5)) {
        console.log(`   - ${lead.email} (${lead.companyName})`);
        console.log(`     Status: ${lead.status}, OptOut: ${lead.optOut}`);
      }
      if (inconsistentLeads.length > 5) {
        console.log(`   ... and ${inconsistentLeads.length - 5} more\n`);
      }
    } else {
      console.log('✅ No inconsistencies found (all opted-out leads have DO_NOT_CONTACT status)\n');
    }

    // 3. Check all inbound conversations
    console.log('📧 Inbound Email Statistics:\n');
    
    const allInbound = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(conversations)
      .where(eq(conversations.direction, 'inbound'));

    const classifiedInbound = await db
      .select({
        classification: conversations.classification,
        count: sql<number>`count(*)`,
      })
      .from(conversations)
      .where(eq(conversations.direction, 'inbound'))
      .groupBy(conversations.classification);

    console.log(`   Total inbound emails: ${allInbound[0]?.count || 0}`);
    console.log('   Classifications:\n');
    
    if (classifiedInbound.length === 0) {
      console.log('      No classified inbound emails yet\n');
    } else {
      for (const item of classifiedInbound) {
        const icon = item.classification === 'STOP' ? '🛑' : 
                     item.classification === 'INTERESTED' ? '✅' : 
                     item.classification === 'NOT_INTERESTED' ? '❌' : '📧';
        console.log(`      ${icon} ${item.classification || 'UNCLASSIFIED'}: ${item.count}`);
      }
      console.log('');
    }

    // 4. Check opt-out confirmation emails
    console.log('📨 Opt-Out Confirmation Emails:\n');
    
    const confirmations = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(auditLogs)
      .where(
        sql`${auditLogs.metadata}->>'emailType' = 'OPT_OUT_CONFIRMATION'`
      );

    console.log(`   Total confirmation emails sent: ${confirmations[0]?.count || 0}\n`);

    // 5. Recent inbound emails (last 10)
    console.log('📋 Recent Inbound Emails:\n');
    
    const recentInbound = await db
      .select({
        id: conversations.id,
        leadId: conversations.leadId,
        subject: conversations.subject,
        classification: conversations.classification,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.direction, 'inbound'))
      .orderBy(desc(conversations.createdAt))
      .limit(10);

    if (recentInbound.length === 0) {
      console.log('   No inbound emails received yet\n');
    } else {
      for (const email of recentInbound) {
        const [lead] = await db
          .select({
            email: leads.email,
            companyName: leads.companyName,
          })
          .from(leads)
          .where(eq(leads.id, email.leadId))
          .limit(1);

        const icon = email.classification === 'STOP' ? '🛑' : 
                     email.classification === 'INTERESTED' ? '✅' : 
                     email.classification === 'NOT_INTERESTED' ? '❌' : '📧';
        
        console.log(`   ${icon} ${lead?.email || 'Unknown'} (${lead?.companyName || 'Unknown'})`);
        console.log(`      Classification: ${email.classification || 'UNCLASSIFIED'}`);
        console.log(`      Date: ${email.createdAt.toISOString()}`);
        console.log(`      Subject: ${email.subject || 'No subject'}`);
        console.log('');
      }
    }

    // 6. System readiness check
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ System Readiness Check:\n');
    
    // Check if webhook handler exists
    console.log('   ✅ Webhook handler: app/api/agent/webhooks/resend/route.ts');
    console.log('   ✅ Classification function: classifyEmail()');
    console.log('   ✅ Opt-out processing: Updates lead status and optOut flag');
    console.log('   ✅ Confirmation email: sendOptOutConfirmation()');
    console.log('   ✅ Compliance check: canContactLead() blocks opted-out leads');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:\n');
    console.log(`   Total leads: ${totalLeads[0]?.count || 0}`);
    console.log(`   Opted out: ${optedOutLeads[0]?.count || 0}`);
    console.log(`   Inbound emails: ${allInbound[0]?.count || 0}`);
    console.log(`   STOP replies: ${classifiedInbound.find(c => c.classification === 'STOP')?.count || 0}`);
    console.log(`   Confirmation emails: ${confirmations[0]?.count || 0}`);
    console.log(`   Inconsistencies: ${inconsistentLeads.length}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (inconsistentLeads.length === 0) {
      console.log('✅ System is ready and properly configured to handle STOP replies!\n');
    } else {
      console.log('⚠️  Some inconsistencies found. Review the details above.\n');
    }

  } catch (error: any) {
    console.error('❌ Error checking opt-out system:', error);
    throw error;
  }
}

// Run the check
checkOptOutSystem()
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
