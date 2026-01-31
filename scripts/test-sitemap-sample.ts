/**
 * Quick Sitemap URL Test - Sample URLs Only
 * Tests a sample of URLs from each sitemap to verify routes work
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseStringPromise } from 'xml2js';

interface TestResult {
  url: string;
  status: number;
  error?: string;
  responseTime?: number;
}

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
const sampleSize = 20; // Test 20 URLs per sitemap type

// Parse sitemap XML file and get sample URLs
async function parseSitemapSample(filePath: string, maxUrls: number = sampleSize): Promise<string[]> {
  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const parsed = await parseStringPromise(xmlContent);
    
    // Handle sitemap index (contains references to other sitemaps)
    if (parsed.sitemapindex) {
      const sitemapUrls: string[] = [];
      const sitemaps = parsed.sitemapindex.sitemap || [];
      
      // Only process first few sitemaps for quick test
      for (const sitemap of sitemaps.slice(0, 3)) {
        if (sitemap.loc && sitemap.loc[0]) {
          const sitemapUrl = sitemap.loc[0];
          const filename = sitemapUrl.split('/').pop() || sitemapUrl;
          const localPath = join(process.cwd(), 'public', filename);
          
          if (existsSync(localPath)) {
            const urls = await parseSitemapSample(localPath, maxUrls);
            sitemapUrls.push(...urls);
            if (sitemapUrls.length >= maxUrls) break;
          }
        }
      }
      
      return sitemapUrls.slice(0, maxUrls);
    }
    
    // Handle regular sitemap (contains URLs)
    if (parsed.urlset) {
      const urls: string[] = [];
      const urlEntries = parsed.urlset.url || [];
      
      // Take sample from beginning, middle, and end
      const step = Math.max(1, Math.floor(urlEntries.length / maxUrls));
      for (let i = 0; i < urlEntries.length && urls.length < maxUrls; i += step) {
        if (urlEntries[i].loc && urlEntries[i].loc[0]) {
          urls.push(urlEntries[i].loc[0]);
        }
      }
      
      return urls;
    }
    
    return [];
  } catch (error: any) {
    console.error(`Error parsing sitemap ${filePath}:`, error.message);
    return [];
  }
}

// Test a single URL
async function testUrl(url: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Sitemap-Test-Script/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      url: testUrl,
      status: response.status,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      url: url.replace('https://www.pocketportfolio.app', baseUrl),
      status: 0,
      error: error.message || 'Request failed',
      responseTime
    };
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Sitemap URL Sample Tests...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found. Run "npm run build:sitemaps" first.');
    process.exit(1);
  }
  
  console.log('📖 Parsing sitemap.xml (sampling URLs)...');
  const sampleUrls = await parseSitemapSample(sitemapPath, 100);
  
  if (sampleUrls.length === 0) {
    console.error('❌ No URLs found in sitemap.');
    process.exit(1);
  }
  
  console.log(`✅ Testing ${sampleUrls.length} sample URLs\n`);
  console.log('🚀 Starting URL tests...\n');
  
  // Test URLs with progress
  const results: TestResult[] = [];
  for (let i = 0; i < sampleUrls.length; i++) {
    const url = sampleUrls[i];
    process.stdout.write(`\rTesting ${i + 1}/${sampleUrls.length}: ${url.split('/').pop()}...`);
    const result = await testUrl(url);
    results.push(result);
  }
  console.log('\n');
  
  // Analyze results
  const passed = results.filter(r => r.status === 200);
  const failed = results.filter(r => r.status !== 200);
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
  
  // Print summary
  console.log('\n📊 Test Results Summary:\n');
  console.log(`   Total URLs Tested: ${results.length}`);
  console.log(`   ✅ Passed (200): ${passed.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   ⏱️  Avg Response Time: ${avgResponseTime.toFixed(0)}ms\n`);
  
  // Print failed URLs
  if (failed.length > 0) {
    console.log('❌ Failed URLs:\n');
    failed.forEach(result => {
      console.log(`   ${result.status} - ${result.url}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    console.log('');
  }
  
  // Exit with error code if any failures
  if (failed.length > 0) {
    console.log('❌ Some URLs failed. Review the results above.');
    process.exit(1);
  } else {
    console.log('✅ All sample URLs returned 200 OK!');
    console.log('💡 Run full test with: npx ts-node --project scripts/tsconfig.json scripts/test-sitemap-urls.ts');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});






