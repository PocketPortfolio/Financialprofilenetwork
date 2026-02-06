/**
 * Diagnose Inbound Email Issues
 * 
 * This script checks:
 * 1. If Resend webhook is receiving emails
 * 2. If leadId extraction is working
 * 3. Why STOP emails aren't being processed
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function diagnoseInboundEmails() {
  console.log('🔍 Diagnosing Inbound Email Processing Issues');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Check if ANY inbound emails have been received
    const allInbound = await db
      .select({
        id: conversations.id,
        leadId: conversations.leadId,
        subject: conversations.subject,
        classification: conversations.classification,
        emailId: conversations.emailId,
        threadId: conversations.threadId,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.direction, 'inbound'))
      .orderBy(desc(conversations.createdAt))
      .limit(20);

    console.log(`📧 Inbound Emails in Database: ${allInbound.length}\n`);

    if (allInbound.length === 0) {
      console.log('❌ CRITICAL ISSUE: No inbound emails found in database!\n');
      console.log('This means the webhook is NOT receiving emails or is failing silently.\n');
      console.log('Possible causes:');
      console.log('1. Resend webhook not configured for email.received events');
      console.log('2. Resend domain not configured to receive inbound emails');
      console.log('3. Webhook endpoint not accessible');
      console.log('4. leadId extraction failing (webhook returns early)\n');
    } else {
      console.log('✅ Some inbound emails found. Showing recent ones:\n');
      for (const email of allInbound.slice(0, 5)) {
        const [lead] = await db
          .select({
            email: leads.email,
            companyName: leads.companyName,
          })
          .from(leads)
          .where(eq(leads.id, email.leadId))
          .limit(1);

        console.log(`   📧 ${lead?.email || 'Unknown'} (${lead?.companyName || 'Unknown'})`);
        console.log(`      Classification: ${email.classification || 'UNCLASSIFIED'}`);
        console.log(`      Date: ${email.createdAt.toISOString()}`);
        console.log(`      ThreadId: ${email.threadId || 'None'}`);
        console.log('');
      }
    }

    // 2. Check audit logs for EMAIL_RECEIVED events
    console.log('📋 Checking Audit Logs for EMAIL_RECEIVED events:\n');
    
    const emailReceivedLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, 'EMAIL_RECEIVED'))
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    console.log(`   Total EMAIL_RECEIVED audit logs: ${emailReceivedLogs.length}\n`);

    if (emailReceivedLogs.length === 0) {
      console.log('   ⚠️  No EMAIL_RECEIVED audit logs found\n');
    } else {
      console.log('   Recent EMAIL_RECEIVED events:\n');
      for (const log of emailReceivedLogs.slice(0, 5)) {
        const metadata = log.metadata as any;
        console.log(`   - ${metadata?.from || 'Unknown sender'}`);
        console.log(`     Classification: ${metadata?.classification || 'Unknown'}`);
        console.log(`     Date: ${log.createdAt.toISOString()}`);
        console.log('');
      }
    }

    // 3. Check recent outbound emails to see if they have threadIds
    console.log('📤 Checking Recent Outbound Emails (to verify threadId setup):\n');
    
    const recentOutbound = await db
      .select({
        id: conversations.id,
        leadId: conversations.leadId,
        subject: conversations.subject,
        emailId: conversations.emailId,
        threadId: conversations.threadId,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.direction, 'outbound'))
      .orderBy(desc(conversations.createdAt))
      .limit(10);

    console.log(`   Recent outbound emails: ${recentOutbound.length}\n`);
    
    const withThreadId = recentOutbound.filter(e => e.threadId);
    const withoutThreadId = recentOutbound.filter(e => !e.threadId);

    console.log(`   ✅ With threadId: ${withThreadId.length}`);
    console.log(`   ⚠️  Without threadId: ${withoutThreadId.length}\n`);

    if (withoutThreadId.length > 0) {
      console.log('   ⚠️  WARNING: Some outbound emails lack threadId!');
      console.log('   This will prevent leadId extraction from replies.\n');
    }

    // 4. Check for leads that should have received STOP replies
    console.log('🛑 Checking for Leads That Should Have STOP Status:\n');
    
    // Look for leads with emails that might have replied
    const contactedLeads = await db
      .select({
        id: leads.id,
        email: leads.email,
        companyName: leads.companyName,
        status: leads.status,
        optOut: leads.optOut,
        lastContactedAt: leads.lastContactedAt,
      })
      .from(leads)
      .where(eq(leads.status, 'CONTACTED'))
      .orderBy(desc(leads.lastContactedAt))
      .limit(20);

    console.log(`   Found ${contactedLeads.length} CONTACTED leads (showing first 20)\n`);
    console.log('   If these leads replied with STOP, they should be DO_NOT_CONTACT\n');

    // 5. Summary and recommendations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Diagnosis Summary:\n');
    
    const issues: string[] = [];
    
    if (allInbound.length === 0) {
      issues.push('❌ No inbound emails in database - webhook not receiving emails');
    }
    
    if (emailReceivedLogs.length === 0) {
      issues.push('❌ No EMAIL_RECEIVED audit logs - webhook not processing emails');
    }
    
    if (withoutThreadId.length > 0) {
      issues.push(`⚠️  ${withoutThreadId.length} outbound emails missing threadId`);
    }

    if (issues.length === 0) {
      console.log('✅ No obvious issues found in database\n');
    } else {
      console.log('Issues Found:\n');
      for (const issue of issues) {
        console.log(`   ${issue}`);
      }
      console.log('');
    }

    console.log('🔧 Recommended Actions:\n');
    console.log('1. Check Resend Dashboard → Webhooks:');
    console.log('   - Verify webhook URL: https://www.pocketportfolio.app/api/agent/webhooks/resend');
    console.log('   - Verify email.received event is subscribed');
    console.log('   - Check webhook logs for errors\n');
    
    console.log('2. Check Resend Dashboard → Domains:');
    console.log('   - Verify pocketportfolio.app domain is verified');
    console.log('   - Verify inbound email routing is enabled\n');
    
    console.log('3. Check webhook handler code:');
    console.log('   - app/api/agent/webhooks/resend/route.ts:155');
    console.log('   - extractLeadIdFromThread() is not implemented (returns null)');
    console.log('   - This causes webhook to silently fail when leadId cannot be extracted\n');
    
    console.log('4. Check email sending code:');
    console.log('   - app/agent/outreach.ts:sendEmail()');
    console.log('   - Verify emails include x-lead-id header or proper threadId\n');

  } catch (error: any) {
    console.error('❌ Error diagnosing inbound emails:', error);
    throw error;
  }
}

// Run the diagnosis
diagnoseInboundEmails()
  .then(() => {
    console.log('✅ Diagnosis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
