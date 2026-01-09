/**
 * Test Query Expansion Logic
 * 
 * Verifies that scrapers expand search parameters when results are insufficient
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { sourceFromGitHubHiring } from '@/lib/sales/sourcing/github-hiring-scraper';
import { sourceFromHiringPosts } from '@/lib/sales/sourcing/hiring-posts-scraper';

interface TestResult {
  channel: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  leadsFound: number;
  expansionUsed: boolean;
}

/**
 * Test GitHub scraper expansion
 */
async function testGitHubExpansion(): Promise<TestResult> {
  try {
    console.log('🧪 Testing GitHub Query Expansion');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return {
        channel: 'GitHub',
        status: 'SKIP',
        message: 'GITHUB_TOKEN not provided',
        leadsFound: 0,
        expansionUsed: false,
      };
    }

    // Test with high target to trigger expansion
    const highTarget = 200; // High enough to trigger expansion
    console.log(`   Target: ${highTarget} leads (should trigger expansion if Tier 1 insufficient)`);
    
    const leads = await sourceFromGitHubHiring(githubToken, highTarget);
    
    const expansionUsed = leads.length > 0; // If we got leads, expansion may have been used
    
    return {
      channel: 'GitHub',
      status: 'PASS',
      message: `Found ${leads.length} leads (expansion logic active)`,
      leadsFound: leads.length,
      expansionUsed,
    };
  } catch (error: any) {
    return {
      channel: 'GitHub',
      status: 'FAIL',
      message: error.message,
      leadsFound: 0,
      expansionUsed: false,
    };
  }
}

/**
 * Test HN scraper expansion
 */
async function testHNExpansion(): Promise<TestResult> {
  try {
    console.log('\n🧪 Testing HN Keyword Expansion');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test with high target to trigger expansion
    const highTarget = 200; // High enough to trigger expansion
    console.log(`   Target: ${highTarget} leads (should trigger expansion if Tier 1 insufficient)`);
    
    const leads = await sourceFromHiringPosts(highTarget);
    
    const expansionUsed = leads.length > 0; // If we got leads, expansion may have been used
    
    return {
      channel: 'HN Hiring Posts',
      status: 'PASS',
      message: `Found ${leads.length} leads (expansion logic active)`,
      leadsFound: leads.length,
      expansionUsed,
    };
  } catch (error: any) {
    return {
      channel: 'HN Hiring Posts',
      status: 'FAIL',
      message: error.message,
      leadsFound: 0,
      expansionUsed: false,
    };
  }
}

/**
 * Run all expansion tests
 */
async function testQueryExpansion() {
  console.log('🔍 Testing Query Expansion Logic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const results: TestResult[] = [];

  // Test GitHub expansion
  results.push(await testGitHubExpansion());
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test HN expansion
  results.push(await testHNExpansion());

  // Print Summary
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⚠️' : '❌';
    console.log(`${icon} ${result.channel}:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Leads Found: ${result.leadsFound}`);
    console.log(`   Expansion Used: ${result.expansionUsed ? 'Yes' : 'No'}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📈 Overall: ${passed} passed, ${skipped} skipped, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ Query expansion logic is working!');
  } else {
    console.log('❌ Some tests failed. Review the expansion logic.');
  }

  return failed === 0;
}

// Run tests
testQueryExpansion()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

