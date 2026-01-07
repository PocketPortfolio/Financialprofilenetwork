/**
 * Test script to verify sitemap API routes work correctly
 * Simulates what Google will do when fetching sitemaps
 */

import { NextRequest } from 'next/server';

// Import the route handlers
const sitemapRoute = require('../app/api/sitemap/[name]/route.ts');

async function testSitemapRoute(name: string) {
  console.log(`\n🧪 Testing /api/sitemap/${name}...`);
  
  try {
    // Create a mock request
    const request = new NextRequest(`https://www.pocketportfolio.app/api/sitemap/${name}`);
    const params = Promise.resolve({ name });
    
    // Call the GET handler
    const response = await sitemapRoute.GET(request, { params });
    
    // Check response
    if (!response) {
      console.error(`❌ ${name}: No response returned`);
      return false;
    }
    
    const status = response.status;
    const contentType = response.headers.get('content-type');
    const body = await response.text();
    
    if (status !== 200) {
      console.error(`❌ ${name}: Status ${status} (expected 200)`);
      console.error(`   Body: ${body.substring(0, 200)}`);
      return false;
    }
    
    if (!contentType || !contentType.includes('application/xml')) {
      console.error(`❌ ${name}: Wrong content-type: ${contentType}`);
      return false;
    }
    
    // Validate XML structure
    if (!body.includes('<?xml')) {
      console.error(`❌ ${name}: Response is not valid XML`);
      return false;
    }
    
    if (!body.includes('<urlset') && !body.includes('<url>')) {
      console.error(`❌ ${name}: XML missing urlset/url tags`);
      return false;
    }
    
    // Count URLs
    const urlMatches = body.match(/<url>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    
    if (urlCount === 0) {
      console.warn(`⚠️  ${name}: No URLs found in XML`);
      return false;
    }
    
    console.log(`✅ ${name}: ${urlCount} URLs, ${(body.length / 1024).toFixed(1)}KB XML`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Status: ${status}`);
    
    // Show first URL
    const firstUrlMatch = body.match(/<loc>(.*?)<\/loc>/);
    if (firstUrlMatch) {
      console.log(`   First URL: ${firstUrlMatch[1]}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${name}: Error:`, error);
    if (error instanceof Error) {
      console.error(`   Stack:`, error.stack);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Testing sitemap API routes...\n');
  
  const sitemaps = ['static', 'imports', 'tools', 'blog', 'tickers-1', 'tickers-2'];
  
  const results: Record<string, boolean> = {};
  
  for (const name of sitemaps) {
    results[name] = await testSitemapRoute(name);
  }
  
  console.log('\n📊 Route Test Results:');
  console.log('='.repeat(50));
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} /api/sitemap/${name}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('='.repeat(50));
  if (allPassed) {
    console.log('✅ All sitemap routes working correctly!');
    process.exit(0);
  } else {
    console.log('❌ Some sitemap routes failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

