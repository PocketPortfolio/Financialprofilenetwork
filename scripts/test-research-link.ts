import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { generateResearchDrop } from '../lib/social/content-fetcher';

async function testResearchLink() {
  console.log('🔍 Testing Research Link Generation...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const tweet = await generateResearchDrop();
    
    if (!tweet) {
      console.error('❌ No tweet generated');
      return;
    }
    
    console.log(`\n📝 Generated Tweet:`);
    console.log(`   Length: ${tweet.length} characters`);
    console.log(`   Content: ${tweet}`);
    
    // Extract link
    const linkMatch = tweet.match(/https:\/\/[^\s]+/);
    if (linkMatch) {
      const link = linkMatch[0];
      console.log(`\n🔗 Extracted Link:`);
      console.log(`   ${link}`);
      console.log(`   Length: ${link.length} characters`);
      
      // Check if link is complete
      const expectedSlug = 'research-api-response-time-optimization-best-practices-2026';
      if (link.includes(expectedSlug)) {
        console.log(`   ✅ Link contains correct slug`);
      } else {
        console.error(`   ❌ Link does NOT contain correct slug!`);
        console.error(`   Expected slug: ${expectedSlug}`);
        console.error(`   Link slug: ${link.split('/blog/')[1] || 'NOT FOUND'}`);
      }
      
      // Check if link ends tweet
      if (tweet.endsWith(link)) {
        console.log(`   ✅ Link is at end of tweet (not truncated)`);
      } else {
        console.error(`   ❌ Link is NOT at end of tweet!`);
        console.error(`   Tweet ends with: ${tweet.substring(Math.max(0, tweet.length - 50))}`);
      }
    } else {
      console.error('❌ No link found in tweet!');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testResearchLink().catch(console.error);

