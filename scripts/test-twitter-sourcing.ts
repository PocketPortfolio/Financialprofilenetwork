/**
 * Test Twitter Sourcing
 * 
 * Tests the Twitter scraper with the bearer token from .env.local
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { sourceFromTwitter } from '@/lib/sales/sourcing/twitter-scraper';

async function testTwitterSourcing() {
  console.log('🧪 Testing Twitter Sourcing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check if token is set
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    console.error('❌ TWITTER_BEARER_TOKEN not found in environment');
    console.log('   Make sure it\'s set in .env.local');
    process.exit(1);
  }
  
  console.log('✅ TWITTER_BEARER_TOKEN found');
  console.log(`   Token preview: ${token.substring(0, 20)}...`);
  console.log('');
  
  // Test sourcing with small limit to avoid rate limits
  console.log('📡 Testing Twitter API connection...');
  console.log('   Requesting 5 leads for testing (small limit to avoid rate limits)...');
  console.log('');
  
  try {
    const leads = await sourceFromTwitter(5);
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Results:');
    console.log(`   Leads Found: ${leads.length}`);
    
    if (leads.length > 0) {
      console.log('');
      console.log('✅ Twitter sourcing is working!');
      console.log('');
      console.log('Sample leads:');
      leads.slice(0, 5).forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.companyName} - ${lead.jobTitle}`);
        console.log(`      Email: ${lead.email}`);
        console.log(`      Source: ${lead.dataSource}`);
        console.log('');
      });
    } else {
      console.log('');
      console.log('⚠️  No leads found, but API connection successful');
      console.log('   This could mean:');
      console.log('   - No matching tweets found');
      console.log('   - Rate limits hit');
      console.log('   - Search queries need adjustment');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test complete');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('   - Invalid bearer token');
    console.error('   - Twitter API rate limits');
    console.error('   - Network connectivity');
    console.error('   - API endpoint changes');
    process.exit(1);
  }
}

// Run test
testTwitterSourcing().catch(console.error);

