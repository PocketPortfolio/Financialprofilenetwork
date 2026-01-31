/**
 * Sitemap URL Test Script
 * Tests all URLs in sitemap to ensure they return 200 status
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

interface SitemapUrl {
  loc: string[];
  lastmod?: string[];
  changefreq?: string[];
  priority?: string[];
}

const results: TestResult[] = [];
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
const maxConcurrent = 10; // Limit concurrent requests
const timeout = 10000; // 10 second timeout per request

// Parse sitemap XML file
async function parseSitemap(filePath: string): Promise<string[]> {
  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const parsed = await parseStringPromise(xmlContent);
    
    // Handle sitemap index (contains references to other sitemaps)
    if (parsed.sitemapindex) {
      const sitemapUrls: string[] = [];
      const sitemaps = parsed.sitemapindex.sitemap || [];
      
      for (const sitemap of sitemaps) {
        if (sitemap.loc && sitemap.loc[0]) {
          const sitemapUrl = sitemap.loc[0];
          // Extract filename from URL
          const filename = sitemapUrl.split('/').pop() || sitemapUrl;
          const localPath = join(process.cwd(), 'public', filename);
          
          if (existsSync(localPath)) {
            const urls = await parseSitemap(localPath);
            sitemapUrls.push(...urls);
          }
        }
      }
      
      return sitemapUrls;
    }
    
    // Handle regular sitemap (contains URLs)
    if (parsed.urlset) {
      const urls: string[] = [];
      const urlEntries = parsed.urlset.url || [];
      
      for (const urlEntry of urlEntries) {
        if (urlEntry.loc && urlEntry.loc[0]) {
          urls.push(urlEntry.loc[0]);
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
    // Convert production URL to local URL if needed
    const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
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

// Test URLs in batches
async function testUrlsBatch(urls: string[], batchSize: number = maxConcurrent): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`Testing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)} (${batch.length} URLs)...`);
    
    const batchResults = await Promise.all(batch.map(url => testUrl(url)));
    results.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming the server
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Sitemap URL Tests...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found. Run "npm run build:sitemaps" first.');
    process.exit(1);
  }
  
  console.log('📖 Parsing sitemap.xml...');
  const allUrls = await parseSitemap(sitemapPath);
  
  if (allUrls.length === 0) {
    console.error('❌ No URLs found in sitemap.');
    process.exit(1);
  }
  
  console.log(`✅ Found ${allUrls.length} URLs in sitemap\n`);
  console.log('🚀 Starting URL tests...\n');
  
  // Test all URLs
  const testResults = await testUrlsBatch(allUrls);
  
  // Analyze results
  const passed = testResults.filter(r => r.status === 200);
  const failed = testResults.filter(r => r.status !== 200);
  const avgResponseTime = testResults
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length;
  
  // Print summary
  console.log('\n📊 Test Results Summary:\n');
  console.log(`   Total URLs: ${testResults.length}`);
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
  
  // Print slow URLs (>2s)
  const slowUrls = testResults.filter(r => (r.responseTime || 0) > 2000);
  if (slowUrls.length > 0) {
    console.log('⚠️  Slow URLs (>2s):\n');
    slowUrls.slice(0, 10).forEach(result => {
      console.log(`   ${result.responseTime}ms - ${result.url}`);
    });
    if (slowUrls.length > 10) {
      console.log(`   ... and ${slowUrls.length - 10} more`);
    }
    console.log('');
  }
  
  // Save detailed results to file
  const resultsPath = join(process.cwd(), 'sitemap-test-results.json');
  const fs = require('fs');
  fs.writeFileSync(resultsPath, JSON.stringify({
    summary: {
      total: testResults.length,
      passed: passed.length,
      failed: failed.length,
      avgResponseTime
    },
    results: testResults
  }, null, 2));
  
  console.log(`📄 Detailed results saved to: ${resultsPath}\n`);
  
  // Exit with error code if any failures
  if (failed.length > 0) {
    console.log('❌ Some URLs failed. Review the results above.');
    process.exit(1);
  } else {
    console.log('✅ All URLs returned 200 OK!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

