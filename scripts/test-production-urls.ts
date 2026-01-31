/**
 * Test Production URLs
 * Tests a sample of production URLs to verify they're working
 */

const baseUrl = 'https://www.pocketportfolio.app';
const testUrls = [
  '/sitemap.xml',
  '/blog/what-is-portfolio-beta',
  '/blog/the-nvidia-problem-500-retail-portfolios-60-percent-dangerously-exposed',
  '/blog/research-database-migration-performance-zero-downtime-strategies-2026-01-26',
  '/tools/risk-calculator',
  '/tools/track-aapl-risk',
  '/s/aapl',
  '/',
];

interface TestResult {
  url: string;
  status: number;
  error?: string;
  responseTime?: number;
}

async function testUrl(url: string): Promise<TestResult> {
  const testUrl = `${baseUrl}${url}`;
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(testUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
    return {
      url: testUrl,
      status: 0,
      error: error.message || 'Request failed',
      responseTime: Date.now() - startTime
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Production URLs\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  const results: TestResult[] = [];
  
  for (const url of testUrls) {
    process.stdout.write(`Testing ${url}...`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.status === 200) {
      console.log(` ✅ ${result.status} (${result.responseTime}ms)`);
    } else {
      console.log(` ❌ ${result.status || 'ERROR'} ${result.error || ''}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Results Summary:\n');
  const passed = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.status !== 200).length;
  
  console.log(`✅ Passed: ${passed}/${testUrls.length}`);
  console.log(`❌ Failed: ${failed}/${testUrls.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => r.status !== 200).forEach(r => {
      console.log(`  ${r.status || 'ERROR'}: ${r.url} ${r.error || ''}`);
    });
  }
  
  console.log('\n');
  
  if (failed === 0) {
    console.log('✅ All production URLs are working!');
  } else {
    console.log('⚠️  Some production URLs are failing. Review errors above.');
  }
}

runTests().catch(console.error);






