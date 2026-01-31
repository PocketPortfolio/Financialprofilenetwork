/**
 * Comprehensive Sitemap URL Testing
 * Tests all URLs from all sitemap generators
 * Generates detailed report for CTO review
 */

import sitemapStatic from '../app/sitemap-static';
import sitemapImports from '../app/sitemap-imports';
import sitemapTools from '../app/sitemap-tools';
import sitemapBlog from '../app/sitemap-blog';
import sitemapTickers1 from '../app/sitemap-tickers-1';
import sitemapTickers2 from '../app/sitemap-tickers-2';
import sitemapTickers3 from '../app/sitemap-tickers-3';
import sitemapTickers4 from '../app/sitemap-tickers-4';
import sitemapTickers5 from '../app/sitemap-tickers-5';
import sitemapTickers6 from '../app/sitemap-tickers-6';
import sitemapTickers7 from '../app/sitemap-tickers-7';
import sitemapTickers8 from '../app/sitemap-tickers-8';
import sitemapTickers9 from '../app/sitemap-tickers-9';
import sitemapTickers10 from '../app/sitemap-tickers-10';
import sitemapTickers11 from '../app/sitemap-tickers-11';
import sitemapTickers12 from '../app/sitemap-tickers-12';
import sitemapTickers13 from '../app/sitemap-tickers-13';
import sitemapTickers14 from '../app/sitemap-tickers-14';
import sitemapTickers15 from '../app/sitemap-tickers-15';
import sitemapTickers16 from '../app/sitemap-tickers-16';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const MAX_CONCURRENT = 10;
const SAMPLE_SIZE = 100; // Test sample from each large sitemap

interface TestResult {
  url: string;
  status: number | 'ERROR' | 'TIMEOUT';
  category: string;
  responseTime?: number;
  error?: string;
}

interface CategoryStats {
  category: string;
  total: number;
  tested: number;
  passed: number;
  failed: number;
  errors: number;
  avgResponseTime: number;
  failures: TestResult[];
}

async function testUrl(url: string, category: string): Promise<TestResult> {
  const startTime = Date.now();
  const localUrl = url.replace('https://www.pocketportfolio.app', BASE_URL);
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(localUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Sitemap-Tester/1.0'
      }
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      status: response.status,
      category,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      return {
        url,
        status: 'TIMEOUT',
        category,
        responseTime,
        error: 'Request timeout (10s)'
      };
    }
    
    return {
      url,
      status: 'ERROR',
      category,
      responseTime,
      error: error.message || 'Unknown error'
    };
  }
}

async function testUrlsBatch(
  urls: Array<{ url: string; category: string }>,
  batchSize: number = MAX_CONCURRENT
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(({ url, category }) => testUrl(url, category))
    );
    results.push(...batchResults);
    
    // Progress indicator
    if ((i + batchSize) % 50 === 0 || i + batchSize >= urls.length) {
      process.stdout.write(`\rTesting: ${Math.min(i + batchSize, urls.length)}/${urls.length} URLs...`);
    }
  }
  
  return results;
}

function calculateStats(results: TestResult[]): Map<string, CategoryStats> {
  const statsMap = new Map<string, CategoryStats>();
  
  results.forEach(result => {
    if (!statsMap.has(result.category)) {
      statsMap.set(result.category, {
        category: result.category,
        total: 0,
        tested: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        avgResponseTime: 0,
        failures: []
      });
    }
    
    const stats = statsMap.get(result.category)!;
    stats.tested++;
    
    if (result.status === 200) {
      stats.passed++;
    } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      stats.errors++;
      stats.failures.push(result);
    } else {
      stats.failed++;
      stats.failures.push(result);
    }
    
    if (result.responseTime) {
      stats.avgResponseTime = (stats.avgResponseTime * (stats.tested - 1) + result.responseTime) / stats.tested;
    }
  });
  
  return statsMap;
}

async function collectAllUrls(): Promise<Array<{ url: string; category: string }>> {
  console.log('📋 Collecting URLs from all sitemaps...\n');
  
  const allUrls: Array<{ url: string; category: string }> = [];
  
  // Static pages
  try {
    const staticUrls = await sitemapStatic();
    staticUrls.forEach(entry => allUrls.push({ url: entry.url, category: 'Static Pages' }));
    console.log(`✅ Static: ${staticUrls.length} URLs`);
  } catch (error) {
    console.error('❌ Error loading static sitemap:', error);
  }
  
  // Imports
  try {
    const importUrls = await sitemapImports();
    importUrls.forEach(entry => allUrls.push({ url: entry.url, category: 'Broker Imports' }));
    console.log(`✅ Imports: ${importUrls.length} URLs`);
  } catch (error) {
    console.error('❌ Error loading imports sitemap:', error);
  }
  
  // Tools
  try {
    const toolUrls = await sitemapTools();
    toolUrls.forEach(entry => allUrls.push({ url: entry.url, category: 'Tools' }));
    console.log(`✅ Tools: ${toolUrls.length} URLs`);
  } catch (error) {
    console.error('❌ Error loading tools sitemap:', error);
  }
  
  // Blog
  try {
    const blogUrls = await sitemapBlog();
    blogUrls.forEach(entry => allUrls.push({ url: entry.url, category: 'Blog' }));
    console.log(`✅ Blog: ${blogUrls.length} URLs`);
  } catch (error) {
    console.error('❌ Error loading blog sitemap:', error);
  }
  
  // Ticker sitemaps (sample from each)
  const tickerSitemaps = [
    { name: 'Tickers-1', fn: sitemapTickers1 },
    { name: 'Tickers-2', fn: sitemapTickers2 },
    { name: 'Tickers-3', fn: sitemapTickers3 },
    { name: 'Tickers-4', fn: sitemapTickers4 },
    { name: 'Tickers-5', fn: sitemapTickers5 },
    { name: 'Tickers-6', fn: sitemapTickers6 },
    { name: 'Tickers-7', fn: sitemapTickers7 },
    { name: 'Tickers-8', fn: sitemapTickers8 },
    { name: 'Tickers-9', fn: sitemapTickers9 },
    { name: 'Tickers-10', fn: sitemapTickers10 },
    { name: 'Tickers-11', fn: sitemapTickers11 },
    { name: 'Tickers-12', fn: sitemapTickers12 },
    { name: 'Tickers-13', fn: sitemapTickers13 },
    { name: 'Tickers-14', fn: sitemapTickers14 },
    { name: 'Tickers-15', fn: sitemapTickers15 },
    { name: 'Tickers-16', fn: sitemapTickers16 },
  ];
  
  for (const { name, fn } of tickerSitemaps) {
    try {
      const tickerUrls = await fn();
      // Sample from each ticker sitemap
      const sample = tickerUrls.slice(0, SAMPLE_SIZE);
      sample.forEach(entry => allUrls.push({ url: entry.url, category: `Tickers (${name})` }));
      console.log(`✅ ${name}: ${tickerUrls.length} total, ${sample.length} sampled`);
    } catch (error) {
      console.error(`❌ Error loading ${name} sitemap:`, error);
    }
  }
  
  return allUrls;
}

async function runTests() {
  console.log('🚀 Comprehensive Sitemap URL Testing\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const startTime = Date.now();
  
  // Collect all URLs
  const allUrls = await collectAllUrls();
  console.log(`\n📊 Total URLs to test: ${allUrls.length}\n`);
  
  // Test all URLs
  console.log('🧪 Testing URLs...\n');
  const results = await testUrlsBatch(allUrls);
  console.log('\n');
  
  // Calculate statistics
  const statsMap = calculateStats(results);
  const totalTime = Date.now() - startTime;
  
  // Print report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  let totalTested = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;
  
  const categoryStats: CategoryStats[] = [];
  statsMap.forEach(stats => {
    categoryStats.push(stats);
    totalTested += stats.tested;
    totalPassed += stats.passed;
    totalFailed += stats.failed;
    totalErrors += stats.errors;
  });
  
  // Sort by category name
  categoryStats.sort((a, b) => a.category.localeCompare(b.category));
  
  categoryStats.forEach(stats => {
    const passRate = stats.tested > 0 ? ((stats.passed / stats.tested) * 100).toFixed(1) : '0.0';
    const status = stats.failed === 0 && stats.errors === 0 ? '✅' : '⚠️';
    
    console.log(`${status} ${stats.category}`);
    console.log(`   Tested: ${stats.tested} | Passed: ${stats.passed} | Failed: ${stats.failed} | Errors: ${stats.errors}`);
    console.log(`   Pass Rate: ${passRate}% | Avg Response: ${Math.round(stats.avgResponseTime)}ms`);
    
    if (stats.failures.length > 0) {
      console.log(`   Failures:`);
      stats.failures.slice(0, 5).forEach(failure => {
        console.log(`     - ${failure.url} (${failure.status})`);
      });
      if (stats.failures.length > 5) {
        console.log(`     ... and ${stats.failures.length - 5} more`);
      }
    }
    console.log('');
  });
  
  console.log('='.repeat(80));
  console.log('OVERALL STATISTICS');
  console.log('='.repeat(80));
  const overallPassRate = totalTested > 0 ? ((totalPassed / totalTested) * 100).toFixed(1) : '0.0';
  console.log(`Total Tested: ${totalTested}`);
  console.log(`✅ Passed: ${totalPassed} (${overallPassRate}%)`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⚠️  Errors: ${totalErrors}`);
  console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log('='.repeat(80) + '\n');
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalTested,
      totalPassed,
      totalFailed,
      totalErrors,
      passRate: parseFloat(overallPassRate),
      totalTime: totalTime / 1000
    },
    categories: categoryStats.map(stats => ({
      category: stats.category,
      total: stats.total,
      tested: stats.tested,
      passed: stats.passed,
      failed: stats.failed,
      errors: stats.errors,
      passRate: stats.tested > 0 ? (stats.passed / stats.tested) * 100 : 0,
      avgResponseTime: Math.round(stats.avgResponseTime),
      failures: stats.failures.slice(0, 10) // Limit failures in report
    }))
  };
  
  const fs = await import('fs');
  const path = await import('path');
  const reportPath = path.join(process.cwd(), 'sitemap-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  
  // Exit code based on results
  if (totalFailed > 0 || totalErrors > 0) {
    console.log('⚠️  Some URLs failed. Review the report above.');
    process.exit(1);
  } else {
    console.log('✅ All tested URLs passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});






