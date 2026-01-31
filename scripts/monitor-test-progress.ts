/**
 * Monitor Sitemap Test Progress
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');

if (!existsSync(resultsFile)) {
  console.log('❌ Test results file not found. Test may not have started yet.');
  process.exit(1);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));

console.log('📊 Sitemap URL Test Progress\n');
console.log(`   Total URLs: ${results.total}`);
console.log(`   Tested: ${results.tested} (${((results.tested / results.total) * 100).toFixed(1)}%)`);
console.log(`   ✅ Passed: ${results.passed} (${((results.passed / results.tested) * 100).toFixed(1)}%)`);
console.log(`   ❌ Failed: ${results.failed} (${((results.failed / results.tested) * 100).toFixed(1)}%)`);
console.log(`   ⏱️  Remaining: ~${Math.round((results.total - results.tested) / 5 / 60)} minutes\n`);

if (results.results && results.results.length > 0) {
  // Analyze by category
  const byCategory: Record<string, { total: number; passed: number; failed: number }> = {};
  results.results.forEach((r: any) => {
    const cat = r.category || 'unknown';
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, passed: 0, failed: 0 };
    }
    byCategory[cat].total++;
    if (r.status === 200) {
      byCategory[cat].passed++;
    } else {
      byCategory[cat].failed++;
    }
  });

  console.log('📊 Results by Category:\n');
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
    const icon = stats.failed === 0 ? '✅' : '⚠️';
    console.log(`   ${icon} ${cat}: ${stats.passed}/${stats.total} (${passRate}%)`);
  });

  // Show recent failures
  const failures = results.results.filter((r: any) => r.status !== 200);
  if (failures.length > 0) {
    console.log(`\n❌ Recent Failures (last 10):\n`);
    failures.slice(-10).forEach((r: any) => {
      console.log(`   ${r.status} - ${r.url} [${r.category}]`);
    });
  }
}






