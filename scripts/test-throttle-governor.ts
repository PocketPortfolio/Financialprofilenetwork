/**
 * Test Throttle Governor
 * 
 * Tests the throttle governor system to ensure it correctly detects
 * throttling and pauses outreach when delivery_delayed rate exceeds thresholds
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { checkThrottleStatus, pauseOutreach } from '@/lib/sales/throttle-governor';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testThrottleGovernor() {
  console.log('🧪 Testing Throttle Governor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const status = await checkThrottleStatus();
    
    console.log('📊 Throttle Status:');
    console.log(`   Is Throttled: ${status.isThrottled}`);
    console.log(`   Delay Minutes: ${status.delayMinutes}`);
    console.log(`   Reason: ${status.reason || 'No throttling detected'}`);
    console.log('');
    console.log('📈 Recent Stats (Last Hour):');
    console.log(`   Total Emails: ${status.recentStats.total}`);
    console.log(`   Delayed: ${status.recentStats.delayed}`);
    console.log(`   Bounced: ${status.recentStats.bounced}`);
    console.log(`   Delivered: ${status.recentStats.delivered}`);
    console.log(`   Delayed Rate: ${status.recentStats.delayedRate.toFixed(2)}%`);
    console.log('');

    if (status.isThrottled) {
      console.log(`⚠️  Throttling detected! System would pause for ${status.delayMinutes} minutes.`);
      console.log(`   Reason: ${status.reason}`);
      
      // Optionally test pause function (commented out to avoid actual pause)
      // await pauseOutreach(status.delayMinutes, status.reason);
      // console.log(`✅ Pause logged successfully`);
    } else {
      console.log('✅ No throttling detected - system can continue sending emails');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test completed');
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Execute
testThrottleGovernor()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

