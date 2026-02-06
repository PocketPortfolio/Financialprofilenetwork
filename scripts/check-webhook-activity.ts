/**
 * Check Webhook Activity
 * 
 * Check audit logs for any webhook activity or errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { auditLogs } from '@/db/sales/schema';
import { eq, sql, desc, or } from 'drizzle-orm';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkWebhookActivity() {
  console.log('🔍 Checking Webhook Activity');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check for EMAIL_RECEIVED events
    const emailReceived = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, 'EMAIL_RECEIVED'))
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    console.log(`📧 EMAIL_RECEIVED events: ${emailReceived.length}\n`);

    if (emailReceived.length > 0) {
      console.log('Recent EMAIL_RECEIVED events:\n');
      for (const log of emailReceived) {
        const metadata = log.metadata as any;
        console.log(`   - ${log.createdAt.toISOString()}`);
        console.log(`     From: ${metadata?.from || 'Unknown'}`);
        console.log(`     Classification: ${metadata?.classification || 'Unknown'}`);
        if (metadata?.error) {
          console.log(`     ⚠️  Error: ${metadata.error}`);
          console.log(`     Tags: ${JSON.stringify(metadata.tags)}`);
          console.log(`     Headers: ${JSON.stringify(metadata.headers)}`);
        }
        console.log('');
      }
    } else {
      console.log('   No EMAIL_RECEIVED events found\n');
    }

    // Check for any errors related to leadId extraction
    const leadIdErrors = await db
      .select()
      .from(auditLogs)
      .where(
        sql`${auditLogs.metadata}->>'error' = 'leadId_not_found'`
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    console.log(`⚠️  LeadId extraction errors: ${leadIdErrors.length}\n`);

    if (leadIdErrors.length > 0) {
      console.log('Recent leadId extraction errors:\n');
      for (const log of leadIdErrors) {
        const metadata = log.metadata as any;
        console.log(`   - ${log.createdAt.toISOString()}`);
        console.log(`     From: ${metadata?.from || 'Unknown'}`);
        console.log(`     To: ${metadata?.to || 'Unknown'}`);
        console.log(`     Subject: ${metadata?.subject || 'Unknown'}`);
        if (metadata?.tags) {
          console.log(`     Tags received: ${JSON.stringify(metadata.tags)}`);
        }
        if (metadata?.headers) {
          console.log(`     Headers: ${JSON.stringify(metadata.headers)}`);
        }
        console.log('');
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:\n');
    console.log(`   EMAIL_RECEIVED events: ${emailReceived.length}`);
    console.log(`   LeadId extraction errors: ${leadIdErrors.length}`);
    
    if (emailReceived.length === 0 && leadIdErrors.length === 0) {
      console.log('\n⚠️  No webhook activity found.');
      console.log('   This could mean:');
      console.log('   1. Webhook is not receiving emails from Resend');
      console.log('   2. Webhook endpoint is not being called');
      console.log('   3. DNS/MX records not fully propagated yet');
      console.log('   4. Emails are going to a different address');
    }

    console.log('');

  } catch (error: any) {
    console.error('❌ Error checking webhook activity:', error);
    throw error;
  }
}

// Run the check
checkWebhookActivity()
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
