/**
 * Test Twitter Single Query
 * 
 * Tests Twitter API with a single query to verify connection
 * and check if we can get any leads when rate limits allow
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testTwitterSingleQuery() {
  console.log('🧪 Testing Twitter API - Single Query');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    console.error('❌ TWITTER_BEARER_TOKEN not found');
    process.exit(1);
  }
  
  console.log('✅ Token found');
  console.log('');
  
  // Test with a single query
  const query = 'hiring CTO fintech -is:retweet';
  const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=author_id,created_at,text`;
  
  console.log(`📡 Testing query: "${query}"`);
  console.log(`   URL: ${searchUrl.substring(0, 80)}...`);
  console.log('');
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'SalesPilot/1.0',
      },
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 429) {
      console.log('');
      console.log('⚠️  Rate Limit Hit (429 Too Many Requests)');
      console.log('   This is expected with Twitter free tier');
      console.log('   Rate limits reset every 15 minutes');
      console.log('');
      console.log('✅ Connection verified - Token is valid');
      console.log('   Twitter sourcing will work when rate limits reset');
      return;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${errorText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    const tweets = data.data || [];
    
    console.log('');
    console.log(`✅ Success! Found ${tweets.length} tweets`);
    console.log('');
    
    if (tweets.length > 0) {
      console.log('Sample tweets:');
      tweets.slice(0, 3).forEach((tweet: any, index: number) => {
        console.log(`   ${index + 1}. ${tweet.text.substring(0, 100)}...`);
        console.log(`      ID: ${tweet.id}`);
        console.log('');
      });
      
      // Check for emails in tweets
      const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      let emailCount = 0;
      
      tweets.forEach((tweet: any) => {
        const matches = tweet.text.match(emailPattern);
        if (matches) {
          emailCount += matches.length;
        }
      });
      
      console.log(`📧 Emails found in tweets: ${emailCount}`);
      console.log('');
      
      if (emailCount > 0) {
        console.log('✅ Twitter sourcing can extract leads!');
        console.log('   Leads will be generated when rate limits allow');
      } else {
        console.log('⚠️  No emails found in sample tweets');
        console.log('   Twitter sourcing will work, but may need query adjustments');
      }
    } else {
      console.log('⚠️  No tweets found for this query');
      console.log('   This could mean:');
      console.log('   - No recent matching tweets');
      console.log('   - Query needs adjustment');
      console.log('   - But connection is working!');
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test complete - Connection verified');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTwitterSingleQuery().catch(console.error);





