/**
 * Real-time Sitemap Test Progress Monitor
 * Refreshes every 5 seconds
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const resultsFile = join(process.cwd(), 'sitemap-full-test-results.json');

function displayProgress() {
  // Clear console
  console.clear();
  
  if (!existsSync(resultsFile)) {
    console.log('⏳ Waiting for test to start...');
    console.log('   (Test results file not found yet)');
    return;
  }

  try {
    const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));
    
    const progress = ((results.tested / results.total) * 100).toFixed(1);
    const passRate = results.tested > 0 ? ((results.passed / results.tested) * 100).toFixed(1) : '0.0';
    const remaining = results.total - results.tested;
    const estimatedMinutes = Math.round(remaining / 5 / 60); // ~5 URLs per second
    
    // Header
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║         SITEMAP URL TEST - REAL-TIME MONITORING             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Overall Progress
    console.log('📊 OVERALL PROGRESS');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`   Total URLs:        ${results.total.toLocaleString()}`);
    console.log(`   Tested:            ${results.tested.toLocaleString()} (${progress}%)`);
    console.log(`   Remaining:         ${remaining.toLocaleString()}`);
    console.log(`   Estimated Time:    ~${estimatedMinutes} minutes`);
    console.log('');
    
    // Results
    console.log('📈 RESULTS');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`   ✅ Passed:         ${results.passed.toLocaleString()} (${passRate}%)`);
    console.log(`   ❌ Failed:         ${results.failed.toLocaleString()} (${((results.failed / results.tested) * 100).toFixed(1)}%)`);
    console.log('');
    
    // Progress Bar
    const barWidth = 50;
    const filled = Math.round((results.tested / results.total) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    console.log(`   [${bar}] ${progress}%`);
    console.log('');
    
    if (results.results && results.results.length > 0) {
      // By Category
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

      console.log('📋 RESULTS BY CATEGORY');
      console.log('─────────────────────────────────────────────────────────────');
      Object.entries(byCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([cat, stats]) => {
          const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
          const icon = stats.failed === 0 ? '✅' : stats.failed < stats.total * 0.1 ? '⚠️' : '❌';
          const bar = '█'.repeat(Math.round((stats.passed / stats.total) * 20));
          console.log(`   ${icon} ${cat.padEnd(15)} ${stats.passed.toString().padStart(5)}/${stats.total.toString().padStart(5)} (${rate.padStart(5)}%) [${bar}]`);
        });
      console.log('');

      // Recent Activity
      const recent = results.results.slice(-10).reverse();
      const recentFailures = recent.filter((r: any) => r.status !== 200);
      
      if (recentFailures.length > 0) {
        console.log('❌ RECENT FAILURES (last 10)');
        console.log('─────────────────────────────────────────────────────────────');
        recentFailures.slice(0, 10).forEach((r: any) => {
          const status = r.status === 0 ? 'TIMEOUT' : r.status.toString();
          const url = r.url.replace('http://localhost:3001', '').substring(0, 50);
          console.log(`   ${status.padEnd(8)} ${url} [${r.category}]`);
        });
        console.log('');
      }
    }
    
    // Status Code Breakdown
    if (results.results && results.results.length > 0) {
      const statusCounts: Record<number, number> = {};
      results.results.forEach((r: any) => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      
      const failures = Object.entries(statusCounts)
        .filter(([status]) => parseInt(status) !== 200)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
      
      if (failures.length > 0) {
        console.log('🔍 STATUS CODE BREAKDOWN');
        console.log('─────────────────────────────────────────────────────────────');
        failures.forEach(([status, count]) => {
          const statusName = status === '0' ? 'TIMEOUT/ERROR' : `HTTP ${status}`;
          console.log(`   ${statusName.padEnd(15)} ${count.toString().padStart(5)} failures`);
        });
        console.log('');
      }
    }
    
    // Footer
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`   Last Updated: ${new Date().toLocaleTimeString()}`);
    console.log('   Press Ctrl+C to stop monitoring');
    console.log('');
    
  } catch (error: any) {
    console.log('❌ Error reading test results:', error.message);
  }
}

// Initial display
displayProgress();

// Refresh every 5 seconds
const interval = setInterval(() => {
  displayProgress();
}, 5000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\n\n✅ Monitoring stopped. Test continues in background.');
  console.log('   Check progress with: npx tsx scripts/monitor-test-progress.ts');
  process.exit(0);
});






