/**
 * Fast Sitemap URL Test - Optimized for speed
 * Tests ALL URLs with higher concurrency and shorter delays
 * WARNING: May overload server if too aggressive
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
const maxConcurrent = 5; // Increased from 2 to 5 for faster testing
const timeout = 15000; // Reduced from 25s to 15s (still safe)
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
      
      for (const entry of urlEntries) {
        if (entry.loc && entry.loc[0]) {
          urls.push(entry.loc[0]);
        }
      }
      
      return { urls, category: 'all' };
    }
    
    return { urls: [], category: 'unknown' };
  } catch (error) {
    console.error(`Error parsing sitemap ${filePath}:`, error);
    return { urls: [], category: 'error' };
  }
}

// Test a single URL with retry logic
async function testUrl(
  url: string, 
  category: string, 
  maxRetries: number = 2 // Reduced from 4 to 2 for speed
): Promise<TestResult> {
  const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // If 500 error and we have retries left, wait and retry
      if (response.status === 500 && attempt < maxRetries) {
        const backoff = 1000 * attempt; // Shorter backoff
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
      const backoff = 1000 * attempt;
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
    
    // Reduced delay between batches (200ms instead of 1000ms)
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  saveProgress();
  return results;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting FAST Sitemap URL Tests...\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`⚠️  WARNING: This will test 60,000+ URLs`);
  console.log(`⚡ Optimized settings: ${maxConcurrent} concurrent, ${timeout/1000}s timeout, 200ms delays\n`);
  
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
  
  console.log(`✅ Found ${categorizedUrls.length} URLs to test\n`);
  
  // Show category breakdown
  const categoryCounts: Record<string, number> = {};
  categorizedUrls.forEach(({ category }) => {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  console.log('📊 URLs by category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count.toLocaleString()}`);
  });
  console.log('');
  
  const startTime = Date.now();
  const results = await testUrlsBatch(categorizedUrls);
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  // Final statistics
  const passed = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.status !== 200).length;
  
  console.log(`\n\n✅ Test Complete!\n`);
  console.log(`   Total URLs: ${results.length}`);
  console.log(`   ✅ Passed: ${passed} (${((passed / results.length) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failed} (${((failed / results.length) * 100).toFixed(1)}%)`);
  console.log(`   ⏱️  Duration: ${duration} minutes\n`);
  
  // Show failures by category
  if (failed > 0) {
    const failuresByCategory: Record<string, number> = {};
    results.filter(r => r.status !== 200).forEach(r => {
      const cat = r.category || 'unknown';
      failuresByCategory[cat] = (failuresByCategory[cat] || 0) + 1;
    });
    
    console.log('❌ Failures by category:');
    Object.entries(failuresByCategory).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    console.log('');
  }
  
  console.log(`📄 Results saved to: ${resultsFile}\n`);
}

runTests().catch(console.error);



