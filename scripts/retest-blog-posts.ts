/**
 * Retest Blog Posts - Tests only blog post URLs that previously failed
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');

interface TestResult {
  url: string;
  status: number;
  error?: string;
  responseTime?: number;
  category?: string;
}

async function testUrl(url: string): Promise<TestResult> {
  const startTime = Date.now();
  const testUrl = url.replace('https://www.pocketportfolio.app', baseUrl);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
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
    
    return {
      url: testUrl,
      status: response.status,
      responseTime,
      category: 'blog'
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      url: testUrl,
      status: 0,
      error: error.message || 'Request failed',
      responseTime,
      category: 'blog'
    };
  }
}

async function retestBlogPosts() {
  if (!existsSync(resultsFile)) {
    console.log('❌ Test results file not found. Run the full test first.');
    process.exit(1);
  }

  const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));
  const blogFailures = results.results.filter((r: any) => 
    r.category === 'blog' && r.status !== 200
  );

  if (blogFailures.length === 0) {
    console.log('✅ All blog posts are passing!');
    return;
  }

  console.log(`🔄 Retesting ${blogFailures.length} blog posts...\n`);

  const newResults: TestResult[] = [];
  for (let i = 0; i < blogFailures.length; i++) {
    const failure = blogFailures[i];
    process.stdout.write(`\rTesting ${i + 1}/${blogFailures.length}: ${failure.url.split('/').pop()}...`);
    
    const result = await testUrl(failure.url);
    newResults.push(result);
    
    // Update the result in the main results array
    const index = results.results.findIndex((r: any) => r.url === failure.url);
    if (index !== -1) {
      results.results[index] = result;
    }
    
    // Small delay to avoid overwhelming the server
    if (i < blogFailures.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Update statistics
  results.passed = results.results.filter((r: any) => r.status === 200).length;
  results.failed = results.results.filter((r: any) => r.status !== 200).length;

  // Save updated results
  writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`\n\n✅ Retest complete!`);
  console.log(`   Passed: ${newResults.filter(r => r.status === 200).length}/${newResults.length}`);
  console.log(`   Failed: ${newResults.filter(r => r.status !== 200).length}/${newResults.length}`);
  
  const stillFailing = newResults.filter(r => r.status !== 200);
  if (stillFailing.length > 0) {
    console.log(`\n❌ Still failing:`);
    stillFailing.forEach(r => {
      console.log(`   ${r.status} - ${r.url}`);
    });
  }
}

retestBlogPosts().catch(console.error);
