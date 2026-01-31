/**
 * Memory-Efficient Sitemap URL Test
 * Streams results to disk to avoid memory issues
 * Can resume from previous progress
 */

import { readFileSync, existsSync, writeFileSync, appendFileSync } from 'fs';
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
const maxConcurrent = 3; // Balanced for speed and memory
const timeout = 15000;
const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');
const progressFile = join(process.cwd(), 'sitemap-test-progress.json'); // Separate progress file

// Parse sitemap XML file recursively
async function parseSitemap(filePath: string): Promise<{ urls: string[]; category: string }> {
  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const parsed = await parseStringPromise(xmlContent);
    
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

// Load existing progress
function loadProgress(): { testedUrls: Set<string>; stats: { total: number; passed: number; failed: number } } {
  if (!existsSync(progressFile)) {
    return { testedUrls: new Set(), stats: { total: 0, passed: 0, failed: 0 } };
  }
  
  try {
    const progress = JSON.parse(readFileSync(progressFile, 'utf-8'));
    return {
      testedUrls: new Set(progress.testedUrls || []),
      stats: progress.stats || { total: 0, passed: 0, failed: 0 }
    };
  } catch {
    return { testedUrls: new Set(), stats: { total: 0, passed: 0, failed: 0 } };
  }
}

// Save progress (lightweight - only stats and tested URLs)
function saveProgress(testedUrls: Set<string>, stats: { total: number; passed: number; failed: number }) {
  writeFileSync(progressFile, JSON.stringify({
    testedUrls: Array.from(testedUrls),
    stats,
    lastUpdate: new Date().toISOString()
  }, null, 2));
}

// Append result to file (streaming - doesn't load all results into memory)
function appendResult(result: TestResult) {
  const line = JSON.stringify(result) + '\n';
  appendFileSync(resultsFile + '.stream', line, 'utf-8');
}

// Test a single URL
async function testUrl(url: string, category: string, maxRetries: number = 2): Promise<TestResult> {
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
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.status === 500 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return {
        url: testUrl,
        status: response.status,
        responseTime,
        category
      };
    } catch (error: any) {
      if (attempt === maxRetries) {
        return {
          url: testUrl,
          status: 0,
          error: error.message || 'Request failed',
          responseTime: Date.now() - startTime,
          category
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return {
    url: testUrl,
    status: 0,
    error: 'Max retries exceeded',
    responseTime: Date.now() - startTime,
    category
  };
}

// Check if server is available
async function checkServer(): Promise<boolean> {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    return response.status < 500; // Server is up if we get any response
  } catch {
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Memory-Efficient Sitemap URL Tests...\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  // Check if server is running
  console.log('🔍 Checking if server is available...');
  const serverAvailable = await checkServer();
  if (!serverAvailable) {
    console.error('❌ ERROR: Server is not available!');
    console.error(`   Cannot connect to ${baseUrl}`);
    console.error('   Please start the server first: npm run dev');
    console.error('   Then wait for it to be ready and run this test again.\n');
    process.exit(1);
  }
  console.log('✅ Server is available\n');
  
  // Load existing progress
  const { testedUrls, stats: existingStats } = loadProgress();
  if (testedUrls.size > 0) {
    console.log(`📊 Resuming from previous run:`);
    console.log(`   Already tested: ${testedUrls.size} URLs`);
    console.log(`   Passed: ${existingStats.passed}, Failed: ${existingStats.failed}\n`);
  }
  
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found. Run "npm run build:sitemaps" first.');
    process.exit(1);
  }
  
  console.log('📖 Parsing sitemap.xml...');
  const { urls } = await parseSitemap(sitemapPath);
  
  // Categorize and filter out already tested URLs
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
  }).filter(({ url }) => {
    const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
    return !testedUrls.has(testUrl);
  });
  
  const totalUrls = urls.length;
  const remainingUrls = categorizedUrls.length;
  
  console.log(`✅ Found ${totalUrls} total URLs`);
  console.log(`   Already tested: ${testedUrls.size}`);
  console.log(`   Remaining: ${remainingUrls}\n`);
  
  if (remainingUrls === 0) {
    console.log('✅ All URLs already tested!');
    return;
  }
  
  // Initialize stats
  let stats = { ...existingStats, total: totalUrls };
  const testedSet = new Set(testedUrls);
  
  // Process in chunks to manage memory
  const chunkSize = 1000; // Process 1000 URLs, then save progress
  let processed = 0;
  
  for (let i = 0; i < categorizedUrls.length; i += chunkSize) {
    const chunk = categorizedUrls.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const totalChunks = Math.ceil(categorizedUrls.length / chunkSize);
    
    console.log(`\n📦 Processing chunk ${chunkNum}/${totalChunks} (${chunk.length} URLs)...`);
    
    // Process chunk in batches with error handling
    try {
      for (let j = 0; j < chunk.length; j += maxConcurrent) {
        const batch = chunk.slice(j, j + maxConcurrent);
        const batchNum = Math.floor(j / maxConcurrent) + 1;
        const totalBatches = Math.ceil(chunk.length / maxConcurrent);
        
        process.stdout.write(`\r  Batch ${batchNum}/${totalBatches}...`);
        
        try {
          const batchResults = await Promise.allSettled(
            batch.map(({ url, category }) => testUrl(url, category))
          );
          
          // Stream results to disk and update stats
          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              appendResult(result.value);
              testedSet.add(result.value.url);
              
              if (result.value.status === 200) {
                stats.passed++;
              } else {
                stats.failed++;
              }
            } else {
              // Handle rejected promise
              const errorResult: TestResult = {
                url: batch[0]?.url || 'unknown',
                status: 0,
                error: result.reason?.message || 'Promise rejected',
                category: batch[0]?.category || 'unknown'
              };
              appendResult(errorResult);
              testedSet.add(errorResult.url);
              stats.failed++;
            }
          }
          
          processed += batchResults.length;
        } catch (batchError: any) {
          console.error(`\n⚠️  Error in batch ${batchNum}:`, batchError.message);
          // Mark batch URLs as failed but continue
          for (const { url, category } of batch) {
            const errorResult: TestResult = {
              url: url.replace('https://www.pocketportfolio.app', baseUrl),
              status: 0,
              error: batchError.message || 'Batch error',
              category
            };
            appendResult(errorResult);
            testedSet.add(errorResult.url);
            stats.failed++;
            processed++;
          }
        }
        
        // Small delay between batches
        if (j + maxConcurrent < chunk.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (chunkError: any) {
      console.error(`\n⚠️  Error processing chunk ${chunkNum}:`, chunkError.message);
      // Save progress even if chunk failed
      saveProgress(testedSet, stats);
      // Continue to next chunk instead of crashing
      continue;
    }
    
    // Save progress after each chunk
    saveProgress(testedSet, stats);
    console.log(`\n  ✅ Chunk complete. Progress: ${processed}/${remainingUrls} (${((processed / remainingUrls) * 100).toFixed(1)}%)`);
    console.log(`     Passed: ${stats.passed}, Failed: ${stats.failed}`);
    
    // Force garbage collection hint (if available)
    if (global.gc) {
      global.gc();
    }
  }
  
  // Final summary
  console.log(`\n\n✅ Test Complete!\n`);
  console.log(`   Total URLs: ${stats.total}`);
  console.log(`   ✅ Passed: ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`\n📄 Results streamed to: ${resultsFile}.stream`);
  console.log(`📊 Progress saved to: ${progressFile}\n`);
}

// Enhanced error handling to prevent crashes
runTests().catch((error) => {
  console.error('\n❌ Fatal error in test script:');
  console.error(error);
  console.error('\n💾 Progress has been saved. You can resume by running the script again.\n');
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error);
  console.error('💾 Progress has been saved. You can resume by running the script again.\n');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection at:', promise, 'reason:', reason);
  console.error('💾 Progress has been saved. You can resume by running the script again.\n');
  process.exit(1);
});

