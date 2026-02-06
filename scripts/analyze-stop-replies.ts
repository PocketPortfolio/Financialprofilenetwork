/**
 * Analyze STOP Replies and Opt-Out Handling
 * 
 * This script checks:
 * 1. How many conversations have been classified as STOP
 * 2. Whether those leads were properly opted out
 * 3. Whether opt-out confirmation emails were sent
 * 4. Any discrepancies in the opt-out process
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function analyzeStopReplies() {
  console.log('🔍 Analyzing STOP Replies and Opt-Out Handling');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Count STOP conversations
    const stopConversations = await db
      .select({
        id: conversations.id,
        leadId: conversations.leadId,
        subject: conversations.subject,
        body: conversations.body,
        createdAt: conversations.createdAt,
        emailId: conversations.emailId,
      })
      .from(conversations)
      .where(eq(conversations.classification, 'STOP'))
      .orderBy(desc(conversations.createdAt));

    console.log(`📧 Total STOP Conversations: ${stopConversations.length}\n`);

    if (stopConversations.length === 0) {
      console.log('ℹ️  No STOP replies have been received yet.\n');
      return;
    }

    // 2. Check lead status and opt-out for each STOP conversation
    console.log('📊 Analyzing Opt-Out Status:\n');
    
    let properlyOptedOut = 0;
    let missingOptOut = 0;
    let missingStatus = 0;
    let issues: Array<{
      leadId: string;
      email: string;
      issue: string;
    }> = [];

    for (const conv of stopConversations) {
      const [lead] = await db
        .select({
          id: leads.id,
          email: leads.email,
          status: leads.status,
          optOut: leads.optOut,
          companyName: leads.companyName,
        })
        .from(leads)
        .where(eq(leads.id, conv.leadId))
        .limit(1);

      if (!lead) {
        console.log(`⚠️  Lead not found for conversation ${conv.id}`);
        continue;
      }

      const isOptedOut = lead.optOut === true;
      const isDoNotContact = lead.status === 'DO_NOT_CONTACT';

      if (isOptedOut && isDoNotContact) {
        properlyOptedOut++;
      } else {
        if (!isOptedOut) {
          missingOptOut++;
          issues.push({
            leadId: lead.id,
            email: lead.email,
            issue: 'optOut flag is false',
          });
        }
        if (!isDoNotContact) {
          missingStatus++;
          if (!issues.find(i => i.leadId === lead.id)) {
            issues.push({
              leadId: lead.id,
              email: lead.email,
              issue: `status is ${lead.status} (should be DO_NOT_CONTACT)`,
            });
          } else {
            const existing = issues.find(i => i.leadId === lead.id);
            if (existing) {
              existing.issue += `, status is ${lead.status}`;
            }
          }
        }
      }
    }

    console.log(`   ✅ Properly opted out: ${properlyOptedOut}`);
    console.log(`   ⚠️  Missing optOut flag: ${missingOptOut}`);
    console.log(`   ⚠️  Wrong status: ${missingStatus}\n`);

    // 3. Check for opt-out confirmation emails in audit logs
    console.log('📨 Checking Opt-Out Confirmation Emails:\n');
    
    const optOutConfirmations = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          sql`${auditLogs.metadata}->>'emailType' = 'OPT_OUT_CONFIRMATION'`
        )
      )
      .orderBy(desc(auditLogs.createdAt));

    console.log(`   Total confirmation emails sent: ${optOutConfirmations.length}`);
    
    // Match confirmations to STOP conversations
    const stopLeadIds = new Set(stopConversations.map(c => c.leadId));
    const confirmedLeadIds = new Set(optOutConfirmations.map(log => log.leadId).filter(Boolean));
    
    const missingConfirmations = stopConversations.filter(
      conv => !confirmedLeadIds.has(conv.leadId)
    );

    console.log(`   ✅ Confirmed: ${stopConversations.length - missingConfirmations.length}`);
    console.log(`   ⚠️  Missing confirmations: ${missingConfirmations.length}\n`);

    // 4. Show recent STOP conversations
    console.log('📋 Recent STOP Conversations:\n');
    const recentStops = stopConversations.slice(0, 10);
    
    for (const conv of recentStops) {
      const [lead] = await db
        .select({
          email: leads.email,
          companyName: leads.companyName,
          status: leads.status,
          optOut: leads.optOut,
        })
        .from(leads)
        .where(eq(leads.id, conv.leadId))
        .limit(1);

      if (lead) {
        const status = lead.optOut && lead.status === 'DO_NOT_CONTACT' ? '✅' : '⚠️';
        const preview = conv.body.substring(0, 60).replace(/\n/g, ' ');
        console.log(`   ${status} ${lead.email} (${lead.companyName})`);
        console.log(`      Date: ${conv.createdAt.toISOString()}`);
        console.log(`      Status: ${lead.status}, OptOut: ${lead.optOut}`);
        console.log(`      Preview: "${preview}..."`);
        console.log('');
      }
    }

    // 5. Show issues if any
    if (issues.length > 0) {
      console.log('⚠️  Issues Found:\n');
      for (const issue of issues) {
        console.log(`   - ${issue.email}: ${issue.issue}`);
      }
      console.log('');
    }

    // 6. Summary statistics
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:\n');
    console.log(`   Total STOP replies: ${stopConversations.length}`);
    console.log(`   Properly handled: ${properlyOptedOut} (${Math.round((properlyOptedOut / stopConversations.length) * 100)}%)`);
    console.log(`   Issues found: ${issues.length}`);
    console.log(`   Confirmation emails sent: ${optOutConfirmations.length}`);
    
    // 7. Check all opted-out leads (not just from STOP conversations)
    const allOptedOutLeads = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.optOut, true));

    const allDoNotContactLeads = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.status, 'DO_NOT_CONTACT'));

    console.log(`\n   Total opted-out leads (all sources): ${allOptedOutLeads[0]?.count || 0}`);
    console.log(`   Total DO_NOT_CONTACT leads: ${allDoNotContactLeads[0]?.count || 0}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (issues.length === 0 && missingConfirmations.length === 0) {
      console.log('✅ All STOP replies have been properly handled!\n');
    } else {
      console.log('⚠️  Some issues were found. Review the details above.\n');
    }

  } catch (error: any) {
    console.error('❌ Error analyzing STOP replies:', error);
    throw error;
  }
}

// Run the analysis
analyzeStopReplies()
  .then(() => {
    console.log('✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
