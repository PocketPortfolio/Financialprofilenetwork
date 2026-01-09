/**
 * Test All Sourcing Channels
 * 
 * Tests each sourcing channel individually before production deployment
 * Verifies: GitHub, YC, HN, and Lookalike seeding
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { sourceFromGitHubHiring } from '@/lib/sales/sourcing/github-hiring-scraper';
import { sourceFromYC } from '@/lib/sales/sourcing/yc-scraper';
import { sourceFromHiringPosts } from '@/lib/sales/sourcing/hiring-posts-scraper';
import { sourceFromCrunchbase } from '@/lib/sales/sourcing/crunchbase-scraper';
import { sourceFromProductHunt } from '@/lib/sales/sourcing/producthunt-scraper';
import { sourceFromReddit } from '@/lib/sales/sourcing/reddit-scraper';
import { sourceFromTwitter } from '@/lib/sales/sourcing/twitter-scraper';
import { generateLookalikeLeads } from '@/lib/sales/sourcing/lookalike-seeding';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

interface TestResult {
  channel: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  leadsFound: number;
  validEmails: number;
  placeholderEmails: number;
  invalidEmails: number;
  error?: string;
  details?: string;
}

async function testChannel(
  name: string,
  testFn: () => Promise<any[]>
): Promise<TestResult> {
  console.log(`\n🧪 Testing ${name}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const startTime = Date.now();
    const leads = await testFn();
    const duration = Date.now() - startTime;
    
    let validEmails = 0;
    let placeholderEmails = 0;
    let invalidEmails = 0;
    
    // Validate each lead's email
    for (const lead of leads.slice(0, 10)) { // Test first 10 to avoid rate limits
      if (isPlaceholderEmail(lead.email)) {
        placeholderEmails++;
      } else {
        const validation = await validateEmail(lead.email);
        if (validation.isValid) {
          validEmails++;
        } else {
          invalidEmails++;
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const status = leads.length > 0 && placeholderEmails === 0
      ? 'PASS'
      : leads.length === 0
      ? 'WARNING'
      : 'FAIL';
    
    const details = `Found ${leads.length} leads in ${duration}ms. Sample validation: ${validEmails} valid, ${invalidEmails} invalid, ${placeholderEmails} placeholder`;
    
    console.log(`   ✅ ${name}: ${leads.length} leads found`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📧 Sample validation: ${validEmails} valid, ${invalidEmails} invalid, ${placeholderEmails} placeholder`);
    
    return {
      channel: name,
      status,
      leadsFound: leads.length,
      validEmails,
      placeholderEmails,
      invalidEmails,
      details,
    };
  } catch (error: any) {
    console.error(`   ❌ ${name} failed:`, error.message);
    return {
      channel: name,
      status: 'FAIL',
      leadsFound: 0,
      validEmails: 0,
      placeholderEmails: 0,
      invalidEmails: 0,
      error: error.message,
    };
  }
}

async function testAllChannels() {
  console.log('🚀 Testing All Sourcing Channels');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const results: TestResult[] = [];
  
  // Test 1: GitHub Scraper
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.log('⚠️  GITHUB_TOKEN not found - skipping GitHub test');
    results.push({
      channel: 'GitHub',
      status: 'WARNING',
      leadsFound: 0,
      validEmails: 0,
      placeholderEmails: 0,
      invalidEmails: 0,
      error: 'GITHUB_TOKEN not provided',
    });
  } else {
    const githubResult = await testChannel('GitHub Scraper', async () => {
      return await sourceFromGitHubHiring(githubToken, 20); // Test with 20 leads
    });
    results.push(githubResult);
  }
  
  // Test 2: YC Scraper
  const ycResult = await testChannel('YC Scraper', async () => {
    return await sourceFromYC(20); // Test with 20 leads
  });
  results.push(ycResult);
  
  // Test 3: HN/Hiring Posts Scraper
  const hnResult = await testChannel('HN Hiring Posts Scraper', async () => {
    return await sourceFromHiringPosts(20); // Test with 20 leads
  });
  results.push(hnResult);
  
  // Test 4: Crunchbase Scraper
  const crunchbaseResult = await testChannel('Crunchbase Scraper', async () => {
    return await sourceFromCrunchbase(20); // Test with 20 leads
  });
  results.push(crunchbaseResult);
  
  // Test 5: Product Hunt Scraper
  const producthuntResult = await testChannel('Product Hunt Scraper', async () => {
    return await sourceFromProductHunt(20); // Test with 20 leads
  });
  results.push(producthuntResult);
  
  // Test 6: Reddit Scraper
  const redditResult = await testChannel('Reddit Scraper', async () => {
    return await sourceFromReddit(20); // Test with 20 leads
  });
  results.push(redditResult);
  
  // Test 7: Twitter Scraper
  const twitterToken = process.env.TWITTER_BEARER_TOKEN;
  if (!twitterToken) {
    console.log('⚠️  TWITTER_BEARER_TOKEN not found - skipping Twitter test');
    results.push({
      channel: 'Twitter Scraper',
      status: 'WARNING',
      leadsFound: 0,
      validEmails: 0,
      placeholderEmails: 0,
      invalidEmails: 0,
      error: 'TWITTER_BEARER_TOKEN not provided',
    });
  } else {
    const twitterResult = await testChannel('Twitter Scraper', async () => {
      return await sourceFromTwitter(20); // Test with 20 leads
    });
    results.push(twitterResult);
  }
  
  // Test 8: Lookalike Seeding (requires existing leads)
  try {
    const lookalikeResult = await testChannel('Lookalike Seeding', async () => {
      const lookalikes = await generateLookalikeLeads(70, 10); // Test with 10 leads
      return lookalikes.map(lead => ({
        email: lead.email,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        dataSource: lead.dataSource,
      }));
    });
    results.push(lookalikeResult);
  } catch (error: any) {
    console.log(`   ⚠️  Lookalike Seeding: ${error.message}`);
    results.push({
      channel: 'Lookalike Seeding',
      status: 'WARNING',
      leadsFound: 0,
      validEmails: 0,
      placeholderEmails: 0,
      invalidEmails: 0,
      error: error.message,
      details: 'Requires existing high-scoring leads in database',
    });
  }
  
  // Print Summary
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.channel}:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Leads Found: ${result.leadsFound}`);
    if (result.leadsFound > 0) {
      console.log(`   Valid Emails: ${result.validEmails}`);
      console.log(`   Invalid Emails: ${result.invalidEmails}`);
      console.log(`   Placeholder Emails: ${result.placeholderEmails}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📈 Overall: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Final verdict
  if (failed === 0 && passed >= 2) {
    console.log('\n✅ All critical channels operational - Ready for production');
    process.exit(0);
  } else if (failed === 0 && passed >= 1) {
    console.log('\n⚠️  Some channels have warnings - Review before production');
    process.exit(0);
  } else {
    console.log('\n❌ Critical channels failed - Do not deploy to production');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testAllChannels()
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

