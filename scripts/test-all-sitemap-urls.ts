/**
 * Full Sitemap URL Test - Tests ALL URLs
 * WARNING: This will test 62,115+ URLs and may take 30-60 minutes
 * Use test-sitemap-sample.ts for quick verification first
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseStringPromise } from 'xml2js';

interface TestResult {
  url: string;
  status: number;
  error?: string;
  responseTime?: number;
  category?: string;
}

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
const maxConcurrent = 2; // Reduced to avoid server overload
const timeout = 25000; // Increased timeout to 25 seconds for slow pages
const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');

// Parse sitemap XML file recursively
async function parseSitemap(filePath: string): Promise<{ urls: string[]; category: string }> {
  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const parsed = await parseStringPromise(xmlContent);
    
    // Handle sitemap index (contains references to other sitemaps)
    if (parsed.sitemapindex) {
      const allUrls: string[] = [];
      const sitemaps = parsed.sitemapindex.sitemap || [];
      
      for (const sitemap of sitemaps) {
        if (sitemap.loc && sitemap.loc[0]) {
          const sitemapUrl = sitemap.loc[0];
          const filename = sitemapUrl.split('/').pop() || sitemapUrl;
          const localPath = join(process.cwd(), 'public', filename);
          
          if (existsSync(localPath)) {
            const { urls } = await parseSitemap(localPath);
            allUrls.push(...urls);
          }
        }
      }
      
      return { urls: allUrls, category: 'all' };
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
      
      // Determine category from filename
      const filename = filePath.split('/').pop() || '';
      let category = 'unknown';
      if (filename.includes('static')) category = 'static';
      else if (filename.includes('imports')) category = 'imports';
      else if (filename.includes('tools')) category = 'tools';
      else if (filename.includes('blog')) category = 'blog';
      else if (filename.includes('tickers')) category = 'tickers';
      
      return { urls, category };
    }
    
    return { urls: [], category: 'unknown' };
  } catch (error: any) {
    console.error(`Error parsing sitemap ${filePath}:`, error.message);
    return { urls: [], category: 'error' };
  }
}

// Test a single URL with retry logic for 500 errors (timing/instrumentation issues)
async function testUrl(url: string, category: string, retries = 3): Promise<TestResult> {
  const startTime = Date.now();
  const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
  
  // Blog posts and ticker pages need more retries due to server load
  const maxRetries = category === 'blog' || category === 'tickers' ? 4 : retries;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // If 500 error and we have retries left, wait and retry (likely timing/instrumentation issue)
      if (response.status === 500 && attempt < maxRetries) {
        const backoff = category === 'blog' ? 2000 * (attempt + 1) : 1000 * (attempt + 1); // Longer backoff for blog
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      
      return {
        url: testUrl,
        status: response.status,
        responseTime,
        category
      };
    } catch (error: any) {
      // If last attempt, return error
      if (attempt === maxRetries) {
        const responseTime = Date.now() - startTime;
        return {
          url: testUrl,
          status: 0,
          error: error.message || 'Request failed',
          responseTime,
          category
        };
      }
      // Otherwise, wait and retry with exponential backoff
      const backoff = category === 'blog' ? 2000 * (attempt + 1) : 1000 * (attempt + 1);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  // Fallback (shouldn't reach here)
  return {
    url: testUrl,
    status: 0,
    error: 'Max retries exceeded',
    responseTime: Date.now() - startTime,
    category
  };
}

// Test URLs in batches with progress tracking
async function testUrlsBatch(
  urls: Array<{ url: string; category: string }>, 
  batchSize: number = maxConcurrent
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const totalBatches = Math.ceil(urls.length / batchSize);
  let currentBatch = 0;
  
  // Save progress periodically
  const saveProgress = () => {
    const progress = {
      total: urls.length,
      tested: results.length,
      passed: results.filter(r => r.status === 200).length,
      failed: results.filter(r => r.status !== 200).length,
      results: results
    };
    writeFileSync(resultsFile, JSON.stringify(progress, null, 2));
  };
  
  for (let i = 0; i < urls.length; i += batchSize) {
    currentBatch++;
    const batch = urls.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    process.stdout.write(`\rTesting batch ${batchNum}/${totalBatches} (${results.length + 1}-${Math.min(results.length + batch.length, urls.length)}/${urls.length})...`);
    
    const batchResults = await Promise.all(
      batch.map(({ url, category }) => testUrl(url, category))
    );
    results.push(...batchResults);
    
    // Save progress every 100 URLs
    if (results.length % 100 === 0) {
      saveProgress();
    }
    
    // Increased delay between batches to avoid server overload
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between batches
    }
  }
  
  saveProgress();
  return results;
}

// Main test function
async function runTests() {
  console.log('🧪 Starting FULL Sitemap URL Tests...\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`⚠️  WARNING: This will test 60,000+ URLs and may take 30-60 minutes\n`);
  
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found. Run "npm run build:sitemaps" first.');
    process.exit(1);
  }
  
  console.log('📖 Parsing sitemap.xml...');
  const { urls, category } = await parseSitemap(sitemapPath);
  
  if (urls.length === 0) {
    console.error('❌ No URLs found in sitemap.');
    process.exit(1);
  }
  
  // Categorize URLs
  const categorizedUrls = urls.map(url => {
    let cat = 'other';
    if (url.includes('/s/')) cat = 'tickers';
    else if (url.includes('/tools/track-')) cat = 'risk-pages';
    else if (url.includes('/tools/')) cat = 'tools';
    else if (url.includes('/import/')) cat = 'imports';
    else if (url.includes('/blog/')) cat = 'blog';
    else if (url.includes('/compare/')) cat = 'compare';
    else cat = 'static';
    return { url, category: cat };
  });
  
  console.log(`✅ Found ${urls.length} URLs in sitemap\n`);
  console.log('📊 URL Breakdown:');
  const categoryCounts = categorizedUrls.reduce((acc, { category }) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  console.log('');
  
  console.log('🚀 Starting URL tests...\n');
  console.log('💡 Progress is saved to sitemap-full-test-results.json every 100 URLs\n');
  
  // Test all URLs
  const testResults = await testUrlsBatch(categorizedUrls);
  console.log('\n');
  
  // Analyze results by category
  const byCategory: Record<string, { total: number; passed: number; failed: number }> = {};
  testResults.forEach(result => {
    if (!byCategory[result.category || 'unknown']) {
      byCategory[result.category || 'unknown'] = { total: 0, passed: 0, failed: 0 };
    }
    byCategory[result.category || 'unknown'].total++;
    if (result.status === 200) {
      byCategory[result.category || 'unknown'].passed++;
    } else {
      byCategory[result.category || 'unknown'].failed++;
    }
  });
  
  // Overall stats
  const passed = testResults.filter(r => r.status === 200);
  const failed = testResults.filter(r => r.status !== 200);
  const avgResponseTime = testResults
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length;
  
  // Print summary
  console.log('📊 Test Results Summary:\n');
  console.log(`   Total URLs: ${testResults.length}`);
  console.log(`   ✅ Passed (200): ${passed.length} (${((passed.length / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failed.length} (${((failed.length / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`   ⏱️  Avg Response Time: ${avgResponseTime.toFixed(0)}ms\n`);
  
  console.log('📊 Results by Category:\n');
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
    const icon = stats.failed === 0 ? '✅' : '⚠️';
    console.log(`   ${icon} ${cat}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
  });
  console.log('');
  
  // Print failed URLs (limit to first 50)
  if (failed.length > 0) {
    console.log(`❌ Failed URLs (showing first 50 of ${failed.length}):\n`);
    failed.slice(0, 50).forEach(result => {
      console.log(`   ${result.status} - ${result.url} [${result.category}]`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    if (failed.length > 50) {
      console.log(`   ... and ${failed.length - 50} more (see ${resultsFile})`);
    }
    console.log('');
  }
  
  // Save detailed results
  const finalResults = {
    summary: {
      total: testResults.length,
      passed: passed.length,
      failed: failed.length,
      passRate: ((passed.length / testResults.length) * 100).toFixed(1) + '%',
      avgResponseTime: Math.round(avgResponseTime),
      byCategory
    },
    results: testResults
  };
  
  writeFileSync(resultsFile, JSON.stringify(finalResults, null, 2));
  console.log(`📄 Detailed results saved to: ${resultsFile}\n`);
  
  // Exit with error code if any failures
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} URLs failed. Review the results above and in ${resultsFile}`);
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

