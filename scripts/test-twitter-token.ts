/**
 * Diagnostic script to test Twitter token validity
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { TwitterApi } from 'twitter-api-v2';

async function testToken() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  console.log('\n🔍 Twitter Token Diagnostic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check if all credentials are present
  console.log('Credentials Check:');
  console.log(`  API Key: ${apiKey ? '✅ SET (' + apiKey.substring(0, 10) + '...)' : '❌ MISSING'}`);
  console.log(`  API Secret: ${apiSecret ? '✅ SET (' + apiSecret.substring(0, 10) + '...)' : '❌ MISSING'}`);
  console.log(`  Access Token: ${accessToken ? '✅ SET (' + accessToken.substring(0, 15) + '...)' : '❌ MISSING'}`);
  console.log(`  Access Token Secret: ${accessTokenSecret ? '✅ SET (' + accessTokenSecret.substring(0, 10) + '...)' : '❌ MISSING'}`);

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.log('\n❌ Missing credentials. Please check .env.local');
    process.exit(1);
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    console.log('\n🔐 Testing Token Validity...');
    
    // Test 1: Get user info (read operation)
    try {
      const me = await client.v2.me();
      console.log('✅ Read permission: WORKING');
      console.log(`   Account: @${me.data.username}`);
      console.log(`   Name: ${me.data.name}`);
    } catch (error: any) {
      console.log('❌ Read permission: FAILED');
      console.log(`   Error: ${error.message}`);
      if (error.code === 401) {
        console.log('   → Token is invalid or expired');
      }
    }

    // Test 2: Try to post (write operation)
    console.log('\n📝 Testing Write Permission...');
    try {
      const testText = `🧪 Test tweet - ${new Date().toISOString()}`;
      const tweet = await client.v2.tweet(testText);
      console.log('✅ Write permission: WORKING');
      console.log(`   Tweet ID: ${tweet.data.id}`);
      console.log(`   View: https://x.com/OIntelligenceUK/status/${tweet.data.id}`);
    } catch (error: any) {
      console.log('❌ Write permission: FAILED');
      console.log(`   Error: ${error.message}`);
      if (error.code === 403) {
        console.log('   → Token has read-only permissions');
        console.log('   → Need to regenerate Access Token after changing app permissions');
      } else if (error.code === 401) {
        console.log('   → Token is invalid or expired');
        console.log('   → Check if Access Token matches the one in Twitter Developer Portal');
      }
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

testToken().catch(console.error);

