import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { SocialScheduler } from '../lib/social/scheduler';

async function testResearchDebug() {
  console.log('🔍 Testing Research Drop with Debug Logging...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const scheduler = new SocialScheduler();
    const result = await scheduler.postResearchDrop();
    
    if (result.success) {
      console.log('✅ Tweet posted successfully!');
      console.log(`   Tweet ID: ${result.tweetId}`);
    } else {
      console.error('❌ Failed to post tweet:', result.error);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testResearchDebug().catch(console.error);

