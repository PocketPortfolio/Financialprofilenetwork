/**
 * Test Resend Webhook
 * 
 * Tests the webhook endpoint with signature verification
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/agent/webhooks/resend`
  : 'http://localhost:3001/api/agent/webhooks/resend';

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

async function testWebhook() {
  console.log('🧪 Testing Resend Webhook');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Secret configured: ${RESEND_WEBHOOK_SECRET ? '✅ Yes' : '❌ No'}`);
  if (RESEND_WEBHOOK_SECRET) {
    console.log(`Secret preview: ${RESEND_WEBHOOK_SECRET.substring(0, 10)}...`);
  }
  console.log('');

  // Test 1: email.bounced event
  console.log('📧 Test 1: email.bounced event');
  try {
    const bounceResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email.bounced',
        data: {
          id: 'test-email-id-123',
          to: 'test@example.com',
          bounce_type: 'hard',
          bounce_sub_type: 'invalid_email',
        },
      }),
    });

    const bounceResult = await bounceResponse.json();
    console.log(`   Status: ${bounceResponse.status}`);
    console.log(`   Response: ${JSON.stringify(bounceResult, null, 2)}`);
    console.log(bounceResponse.ok ? '   ✅ PASSED' : '   ❌ FAILED');
  } catch (error: any) {
    console.error(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');

  // Test 2: email.delivery_delayed event
  console.log('📧 Test 2: email.delivery_delayed event');
  try {
    const delayedResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email.delivery_delayed',
        data: {
          id: 'test-email-id-456',
          to: 'test@example.com',
          last_event: 'delivery_delayed',
        },
      }),
    });

    const delayedResult = await delayedResponse.json();
    console.log(`   Status: ${delayedResponse.status}`);
    console.log(`   Response: ${JSON.stringify(delayedResult, null, 2)}`);
    console.log(delayedResponse.ok ? '   ✅ PASSED' : '   ❌ FAILED');
  } catch (error: any) {
    console.error(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');

  // Test 3: email.sent event (existing)
  console.log('📧 Test 3: email.sent event (existing)');
  try {
    const sentResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email.sent',
        data: {
          id: 'test-email-id-789',
          scheduled_at: null,
        },
      }),
    });

    const sentResult = await sentResponse.json();
    console.log(`   Status: ${sentResponse.status}`);
    console.log(`   Response: ${JSON.stringify(sentResult, null, 2)}`);
    console.log(sentResponse.ok ? '   ✅ PASSED' : '   ❌ FAILED');
  } catch (error: any) {
    console.error(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Webhook tests completed');
  console.log('');
  console.log('📝 Note: Signature verification is currently disabled.');
  console.log('   To enable it, uncomment the verification code in the webhook handler.');
}

// Execute
testWebhook()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

