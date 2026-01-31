/**
 * Quick Test - Blog Posts Only
 * Tests all 91 blog posts to verify fixes
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
const timeout = 25000;

async function parseSitemap(filePath: string): Promise<string[]> {
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
          const urls = await parseSitemap(localPath);
          allUrls.push(...urls);
        }
      }
    }
    
    return allUrls;
  }
  
  if (parsed.urlset && parsed.urlset.url) {
    return parsed.urlset.url.map((u: any) => u.loc[0]);
  }
  
  return [];
}

async function testUrl(url: string, retries = 4): Promise<TestResult> {
  const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
  const startTime = Date.now();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(testUrl, {
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
      
      if (response.status === 500 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      
      return {
        url: testUrl,
        status: response.status,
        responseTime
      };
    } catch (error: any) {
      if (attempt === retries) {
        return {
          url: testUrl,
          status: 0,
          error: error.message || 'Request failed',
          responseTime: Date.now() - startTime
        };
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
  
  return {
    url: testUrl,
    status: 0,
    error: 'Max retries exceeded',
    responseTime: Date.now() - startTime
  };
}

async function runTests() {
  console.log('🧪 Quick Test - Blog Posts Only\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found.');
    process.exit(1);
  }
  
  console.log('📖 Parsing sitemap.xml...');
  const allUrls = await parseSitemap(sitemapPath);
  const blogUrls = allUrls.filter(url => url.includes('/blog/'));
  
  console.log(`✅ Found ${blogUrls.length} blog URLs\n`);
  console.log('🚀 Testing blog URLs with enhanced retry logic...\n');
  
  const results: TestResult[] = [];
  
  for (let i = 0; i < blogUrls.length; i++) {
    const url = blogUrls[i];
    process.stdout.write(`\rTesting ${i + 1}/${blogUrls.length}: ${url.split('/').pop()}...`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.status !== 200) {
      console.log(`\n❌ ${url}: ${result.status} ${result.error || ''}`);
    }
    
    // Small delay between requests
    if (i < blogUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n\n📊 Results:');
  const passed = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.status !== 200).length;
  
  console.log(`✅ Passed: ${passed}/${blogUrls.length} (${((passed / blogUrls.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed}/${blogUrls.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => r.status !== 200).forEach(r => {
      console.log(`  ${r.status}: ${r.url} ${r.error || ''}`);
    });
    process.exit(1);
  }
  
  console.log('\n✅ All blog URLs passed!');
}

runTests().catch(console.error);






