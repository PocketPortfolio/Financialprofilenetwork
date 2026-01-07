/**
 * Test script to verify all sitemaps generate correctly
 * Run with: npx tsx scripts/test-sitemaps.ts
 */

import sitemapStatic from '../app/sitemap-static';
import sitemapImports from '../app/sitemap-imports';
import sitemapTools from '../app/sitemap-tools';
import sitemapBlog from '../app/sitemap-blog';
import sitemapTickers1 from '../app/sitemap-tickers-1';
import sitemapTickers2 from '../app/sitemap-tickers-2';

async function testSitemap(name: string, generator: () => Promise<any>) {
  console.log(`\n🧪 Testing ${name}...`);
  try {
    const startTime = Date.now();
    const sitemap = await generator();
    const duration = Date.now() - startTime;
    
    if (!Array.isArray(sitemap)) {
      console.error(`❌ ${name}: Not an array! Got:`, typeof sitemap);
      return false;
    }
    
    if (sitemap.length === 0) {
      console.warn(`⚠️  ${name}: Empty sitemap (0 URLs)`);
      return false;
    }
    
    if (sitemap.length > 50000) {
      console.error(`❌ ${name}: Exceeds 50,000 URL limit! Got ${sitemap.length} URLs`);
      return false;
    }
    
    // Validate structure
    const invalid = sitemap.filter(entry => !entry.url || typeof entry.url !== 'string');
    if (invalid.length > 0) {
      console.error(`❌ ${name}: ${invalid.length} invalid entries (missing URL)`);
      return false;
    }
    
    console.log(`✅ ${name}: ${sitemap.length} URLs generated in ${duration}ms`);
    
    // Show sample URLs
    if (sitemap.length > 0) {
      console.log(`   Sample URLs:`);
      sitemap.slice(0, 3).forEach(entry => {
        console.log(`   - ${entry.url}`);
      });
      if (sitemap.length > 3) {
        console.log(`   ... and ${sitemap.length - 3} more`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${name}: Error generating sitemap:`, error);
    if (error instanceof Error) {
      console.error(`   Stack:`, error.stack);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Starting sitemap tests...\n');
  
  const results = {
    static: await testSitemap('sitemap-static', sitemapStatic),
    imports: await testSitemap('sitemap-imports', sitemapImports),
    tools: await testSitemap('sitemap-tools', sitemapTools),
    blog: await testSitemap('sitemap-blog', sitemapBlog),
    tickers1: await testSitemap('sitemap-tickers-1', sitemapTickers1),
    tickers2: await testSitemap('sitemap-tickers-2', sitemapTickers2),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  const totalUrls = Object.values(results).reduce((sum, passed) => {
    // We can't easily get the count here, but we know if it passed
    return sum;
  }, 0);
  
  console.log('='.repeat(50));
  if (allPassed) {
    console.log('✅ All sitemaps generated successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some sitemaps failed to generate');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

