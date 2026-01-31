/**
 * Generate Comprehensive Test Report
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');
const reportFile = join(process.cwd(), 'docs/SITEMAP-TEST-REPORT.md');

if (!existsSync(resultsFile)) {
  console.error('❌ Test results file not found.');
  process.exit(1);
}

const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));

// Analyze results
const byCategory: Record<string, { total: number; passed: number; failed: number; failures: any[] }> = {};
const allFailures: any[] = [];

results.results.forEach((r: any) => {
  const cat = r.category || 'unknown';
  if (!byCategory[cat]) {
    byCategory[cat] = { total: 0, passed: 0, failed: 0, failures: [] };
  }
  byCategory[cat].total++;
  if (r.status === 200) {
    byCategory[cat].passed++;
  } else {
    byCategory[cat].failed++;
    byCategory[cat].failures.push(r);
    allFailures.push(r);
  }
});

// Calculate stats
const passRate = ((results.passed / results.tested) * 100).toFixed(1);
const avgResponseTime = results.results
  .filter((r: any) => r.responseTime)
  .reduce((sum: number, r: any) => sum + (r.responseTime || 0), 0) / results.results.length;

// Generate report
const report = `# Sitemap URL Test Report

**Generated:** ${new Date().toISOString()}

## Executive Summary

- **Total URLs:** ${results.total}
- **Tested:** ${results.tested} (${((results.tested / results.total) * 100).toFixed(1)}%)
- **✅ Passed:** ${results.passed} (${passRate}%)
- **❌ Failed:** ${results.failed} (${((results.failed / results.tested) * 100).toFixed(1)}%)
- **⏱️  Avg Response Time:** ${Math.round(avgResponseTime)}ms

## Results by Category

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
${Object.entries(byCategory).map(([cat, stats]) => {
  const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
  return `| ${cat} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${rate}% |`;
}).join('\n')}

## Failure Analysis

### Status Code Breakdown

${Object.entries(
  allFailures.reduce((acc: Record<number, number>, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {})
).map(([status, count]) => `- **${status}:** ${count} failures`).join('\n')}

### Failed URLs by Category

${Object.entries(byCategory)
  .filter(([_, stats]) => stats.failed > 0)
  .map(([cat, stats]) => {
    return `#### ${cat} (${stats.failed} failures)\n\n${stats.failures.slice(0, 20).map((r: any) => 
      `- ${r.status} - ${r.url}${r.error ? ` (${r.error})` : ''}`
    ).join('\n')}${stats.failures.length > 20 ? `\n\n... and ${stats.failures.length - 20} more` : ''}`;
  }).join('\n\n')}

## Recommendations

${results.failed === 0 
  ? '✅ **All URLs passing!** Ready for production deployment.'
  : `⚠️ **${results.failed} URLs failing.** Review failures above before deployment.

### Common Issues:
- **500 errors:**** Likely timing/instrumentation issues (retry logic should handle these)
- **404 errors:**** Missing routes or incorrect URLs in sitemap
- **Timeout errors:**** Server may be overloaded or URLs taking too long to respond`}

## Next Steps

1. Review failed URLs above
2. Fix any critical issues (404s, timeouts)
3. Re-run test to verify fixes
4. Deploy when pass rate > 99%
`;

writeFileSync(reportFile, report);
console.log(`✅ Report generated: ${reportFile}`);






