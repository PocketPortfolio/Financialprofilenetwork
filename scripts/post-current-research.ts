import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
const cronSecret = process.env.CRON_SECRET;

async function postCurrentResearch() {
  console.log('📡 Posting Current Research Post to Twitter...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!cronSecret) {
    console.error('❌ CRON_SECRET not found in environment variables');
    process.exit(1);
  }

  const url = `${baseUrl}/api/cron/post-current-research`;
  
  try {
    console.log(`🌐 Calling: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Research post tweeted successfully!');
      console.log(`   Tweet ID: ${data.tweetId}`);
      console.log(`   View at: https://x.com/OIntelligenceUK/status/${data.tweetId}`);
      console.log(`   Timestamp: ${data.timestamp}`);
    } else {
      console.error('❌ Failed to post research tweet');
      console.error(`   Error: ${data.error || 'Unknown error'}`);
      console.error(`   Response: ${JSON.stringify(data, null, 2)}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error posting research tweet:', error.message);
    process.exit(1);
  }
}

postCurrentResearch().catch(console.error);

