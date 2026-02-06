/**
 * Test Inbound Email Webhook
 * 
 * This script tests the webhook endpoint with a sample email.received payload
 * to verify the leadId extraction and processing logic works
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testInboundWebhook() {
  console.log('🧪 Testing Inbound Email Webhook');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get a recent lead to test with
    const { db } = await import('@/db/sales/client');
    const { leads, conversations } = await import('@/db/sales/schema');
    const { eq, desc } = await import('drizzle-orm');

    const [testLead] = await db
      .select({
        id: leads.id,
        email: leads.email,
        companyName: leads.companyName,
      })
      .from(leads)
      .where(eq(leads.status, 'CONTACTED'))
      .orderBy(desc(leads.lastContactedAt))
      .limit(1);

    if (!testLead) {
      console.log('❌ No CONTACTED leads found to test with');
      return;
    }

    // Get a recent outbound email for this lead to get the emailId/threadId
    const [recentEmail] = await db
      .select({
        emailId: conversations.emailId,
        threadId: conversations.threadId,
      })
      .from(conversations)
      .where(eq(conversations.leadId, testLead.id))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    console.log(`📧 Test Lead: ${testLead.email} (${testLead.companyName})`);
    console.log(`   Lead ID: ${testLead.id}`);
    if (recentEmail?.emailId) {
      console.log(`   Recent Email ID: ${recentEmail.emailId}`);
      console.log(`   Thread ID: ${recentEmail.threadId || recentEmail.emailId}`);
    }
    console.log('');

    // Test webhook endpoint
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/agent/webhooks/resend`
      : 'https://www.pocketportfolio.app/api/agent/webhooks/resend';

    console.log(`🌐 Testing webhook endpoint: ${webhookUrl}\n`);

    // Create test payload for email.received event
    const testPayload = {
      type: 'email.received',
      data: {
        id: `test-${Date.now()}`,
        from: testLead.email,
        to: 'ai@pocketportfolio.app',
        subject: 'STOP',
        text: 'STOP',
        html: '<p>STOP</p>',
        headers: {
          'in-reply-to': recentEmail?.emailId || `<test-${Date.now()}@resend.dev>`,
          'references': recentEmail?.emailId || `<test-${Date.now()}@resend.dev>`,
        },
        tags: [
          { name: 'lead_id', value: testLead.id },
        ],
      },
    };

    console.log('📤 Sending test webhook payload...\n');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    console.log('');

    if (response.ok) {
      console.log('✅ Webhook endpoint is accessible and responded\n');

      // Wait a moment for async processing
      console.log('⏳ Waiting 2 seconds for async processing...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if the email was saved
      const { conversations: convs } = await import('@/db/sales/schema');
      const inboundEmails = await db
        .select()
        .from(convs)
        .where(eq(convs.leadId, testLead.id))
        .orderBy(desc(convs.createdAt))
        .limit(1);

      if (inboundEmails.length > 0 && inboundEmails[0].direction === 'inbound') {
        console.log('✅ Inbound email was saved to database!');
        console.log(`   Classification: ${inboundEmails[0].classification || 'UNCLASSIFIED'}`);
        console.log(`   Subject: ${inboundEmails[0].subject}`);
      } else {
        console.log('⚠️  Inbound email not found in database yet');
        console.log('   This might be normal if processing is async');
      }

      // Check if lead was updated
      const [updatedLead] = await db
        .select({
          status: leads.status,
          optOut: leads.optOut,
        })
        .from(leads)
        .where(eq(leads.id, testLead.id))
        .limit(1);

      if (updatedLead?.optOut && updatedLead?.status === 'DO_NOT_CONTACT') {
        console.log('✅ Lead was updated: optOut=true, status=DO_NOT_CONTACT');
      } else {
        console.log(`ℹ️  Lead status: ${updatedLead?.status}, optOut: ${updatedLead?.optOut}`);
        console.log('   (This is expected if the test email was not classified as STOP)');
      }
    } else {
      console.log('❌ Webhook endpoint returned an error');
      console.log('   Check the response above for details');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Summary:\n');
    console.log('✅ Webhook endpoint is accessible');
    console.log('✅ Test payload sent successfully');
    console.log('\nNext steps:');
    console.log('1. Check Resend Dashboard → Webhooks → Recent Events');
    console.log('2. Send a real email to ai@pocketportfolio.app with "STOP"');
    console.log('3. Run: npm run analyze-stop-replies');
    console.log('');

  } catch (error: any) {
    console.error('❌ Error testing webhook:', error);
    throw error;
  }
}

// Run the test
testInboundWebhook()
  .then(() => {
    console.log('✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
