/**
 * Test Script for Operation Metronome
 * Tests Twitter credentials and content generation before deployment
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { TwitterClient } from '../lib/social/twitter-client';
import { SocialScheduler } from '../lib/social/scheduler';
import { generateWarModeUpdate, generateResearchDrop } from '../lib/social/content-fetcher';

async function testTwitterCredentials() {
  console.log('\n🔐 Testing Twitter Credentials...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const client = new TwitterClient();
    const isValid = await client.verifyCredentials();
    
    if (isValid) {
      console.log('✅ Twitter credentials are VALID');
      const accountInfo = await client.getAccountInfo();
      if (accountInfo) {
        console.log(`   Account: @${accountInfo.username}`);
        console.log(`   Name: ${accountInfo.name}`);
      }
      return true;
    } else {
      console.log('❌ Twitter credentials are INVALID');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error testing credentials:', error.message);
    return false;
  }
}

async function testWarModeContent() {
  console.log('\n📊 Testing War Mode Content Generation...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const text = await generateWarModeUpdate();
    console.log('✅ War Mode content generated:');
    console.log(`   Length: ${text.length} characters`);
    console.log(`   Preview: ${text.substring(0, 100)}...`);
    
    if (text.length > 280) {
      console.log('⚠️  WARNING: Content exceeds 280 characters!');
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Error generating War Mode content:', error.message);
    return false;
  }
}

async function testResearchDropContent() {
  console.log('\n📡 Testing Research Drop Content Generation...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const text = await generateResearchDrop();
    
    if (!text) {
      console.log('⚠️  No research post found (this is OK if no research posts exist)');
      return true; // Not an error, just no content
    }
    
    console.log('✅ Research Drop content generated:');
    console.log(`   Length: ${text.length} characters`);
    console.log(`   Preview: ${text.substring(0, 100)}...`);
    
    if (text.length > 280) {
      console.log('⚠️  WARNING: Content exceeds 280 characters!');
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Error generating Research Drop content:', error.message);
    return false;
  }
}

async function testPostTweet(dryRun: boolean = true) {
  console.log('\n🐦 Testing Tweet Posting...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No tweet will be posted');
    console.log('   To actually post a tweet, run with --post flag');
    return true;
  }
  
  try {
    const scheduler = new SocialScheduler();
    const testText = `🧪 Test tweet from Operation Metronome - ${new Date().toISOString()}`;
    
    console.log(`   Posting: ${testText}`);
    const result = await scheduler.postWarModeUpdate();
    
    if (result.success) {
      console.log(`✅ Test tweet posted successfully!`);
      console.log(`   Tweet ID: ${result.tweetId}`);
      console.log(`   View at: https://x.com/P0cketP0rtf0li0/status/${result.tweetId}`);
      return true;
    } else {
      console.error(`❌ Failed to post tweet: ${result.error}`);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error posting tweet:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 OPERATION METRONOME - Pre-Deployment Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const args = process.argv.slice(2);
  const shouldPost = args.includes('--post');
  const dryRun = !shouldPost;
  
  if (shouldPost) {
    console.log('⚠️  LIVE MODE: Will post actual tweets to X.com');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  const results = {
    credentials: false,
    warMode: false,
    researchDrop: false,
    posting: false,
  };
  
  // Test 1: Credentials
  results.credentials = await testTwitterCredentials();
  
  if (!results.credentials) {
    console.log('\n❌ Credentials test failed. Please check your Twitter API keys.');
    process.exit(1);
  }
  
  // Test 2: War Mode Content
  results.warMode = await testWarModeContent();
  
  // Test 3: Research Drop Content
  results.researchDrop = await testResearchDropContent();
  
  // Test 4: Post Tweet (optional)
  if (shouldPost) {
    results.posting = await testPostTweet(false);
  } else {
    results.posting = await testPostTweet(true);
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Twitter Credentials: ${results.credentials ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`War Mode Content:   ${results.warMode ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Research Drop:       ${results.researchDrop ? '✅ PASS' : '⚠️  NO CONTENT'}`);
  console.log(`Tweet Posting:       ${results.posting ? '✅ PASS' : dryRun ? '🔍 SKIPPED (dry run)' : '❌ FAIL'}`);
  
  const allPassed = results.credentials && results.warMode && results.researchDrop;
  
  if (allPassed) {
    console.log('\n✅ All tests passed! Ready for deployment.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Add credentials to Vercel Environment Variables');
    console.log('   2. Commit and push code');
    console.log('   3. Deploy to Vercel');
    console.log('   4. Verify cron jobs in Vercel Dashboard');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please fix issues before deploying.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

