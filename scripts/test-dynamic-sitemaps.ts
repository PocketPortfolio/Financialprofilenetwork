/**
 * Test Dynamic Sitemap Routes
 * Verifies all sitemap API routes return valid XML before deployment
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const SITEMAPS = [
  'sitemap-static',
  'sitemap-imports',
  'sitemap-tools',
  'sitemap-blog',
  'sitemap-tickers-1',
  'sitemap-tickers-2',
];

async function testSitemap(name: string): Promise<{ success: boolean; urlCount: number; error?: string }> {
  const url = `${BASE_URL}/api/sitemap/${name}`;
  
  try {
    console.log(`\n📝 Testing ${name}...`);
    console.log(`   URL: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml',
      },
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        success: false,
        urlCount: 0,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const xml = await response.text();
    
    // Basic XML validation
    if (!xml.includes('<?xml version="1.0"')) {
      return {
        success: false,
        urlCount: 0,
        error: 'Invalid XML format (missing XML declaration)',
      };
    }
    
    if (!xml.includes('<urlset')) {
      return {
        success: false,
        urlCount: 0,
        error: 'Invalid sitemap format (missing urlset)',
      };
    }
    
    // Count URLs
    const urlMatches = xml.match(/<url>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    
    const fileSizeKB = (Buffer.byteLength(xml, 'utf-8') / 1024).toFixed(1);
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ URLs: ${urlCount.toLocaleString()}`);
    console.log(`   ✅ Size: ${fileSizeKB}KB`);
    console.log(`   ✅ Duration: ${duration}ms`);
    console.log(`   ✅ Content-Type: ${response.headers.get('Content-Type')}`);
    
    return {
      success: true,
      urlCount,
    };
  } catch (error: any) {
    return {
      success: false,
      urlCount: 0,
      error: error.message || 'Unknown error',
    };
  }
}

async function testSitemapIndex(): Promise<boolean> {
  const url = `${BASE_URL}/sitemap.xml`;
  
  try {
    console.log(`\n📝 Testing sitemap index...`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
    
    const xml = await response.text();
    
    // Check for sitemap index structure
    if (!xml.includes('<sitemapindex')) {
      console.log(`   ❌ Invalid sitemap index format`);
      return false;
    }
    
    // Check that all sitemaps are referenced
    const allReferenced = SITEMAPS.every(name => 
      xml.includes(`/api/sitemap/${name}`)
    );
    
    if (!allReferenced) {
      console.log(`   ❌ Not all sitemaps referenced in index`);
      return false;
    }
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ All ${SITEMAPS.length} sitemaps referenced`);
    console.log(`   ✅ Content-Type: ${response.headers.get('Content-Type')}`);
    
    return true;
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Dynamic Sitemap Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('⏳ Waiting for dev server to be ready...\n');
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test sitemap index first
  const indexSuccess = await testSitemapIndex();
  
  if (!indexSuccess) {
    console.error('\n❌ Sitemap index test failed!');
    process.exit(1);
  }
  
  // Test all sub-sitemaps
  const results = await Promise.all(
    SITEMAPS.map(name => testSitemap(name))
  );
  
  const successCount = results.filter(r => r.success).length;
  const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0);
  
  console.log(`\n📊 Test Summary:`);
  console.log(`   Successful: ${successCount}/${SITEMAPS.length}`);
  console.log(`   Total URLs: ${totalUrls.toLocaleString()}`);
  
  // Show failures
  const failures = results
    .map((r, i) => ({ name: SITEMAPS[i], ...r }))
    .filter(r => !r.success);
  
  if (failures.length > 0) {
    console.log(`\n❌ Failures:`);
    failures.forEach(f => {
      console.log(`   - ${f.name}: ${f.error || 'Unknown error'}`);
    });
    process.exit(1);
  }
  
  console.log(`\n✅ All sitemap routes working correctly!`);
  console.log(`\n🚀 Ready for deployment!`);
}

main().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

