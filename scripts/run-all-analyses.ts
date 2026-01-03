/**
 * Run All Sitemap Analyses
 * Executes all three analysis scripts in sequence
 */

import { analyzeSitemap } from './analyze-sitemap';
import { verifyTickerPages } from './verify-ticker-pages';
import { investigateSitemapGap } from './investigate-sitemap-gap';

async function runAllAnalyses() {
  console.log('🚀 Starting Comprehensive Sitemap Analysis\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Analyze sitemap structure
    console.log('\n📊 Step 1: Analyzing Sitemap Structure...\n');
    const sitemapResponse = await fetch('https://www.pocketportfolio.app/sitemap.xml');
    const sitemapXml = await sitemapResponse.text();
    const analysis = analyzeSitemap(sitemapXml);
    
    console.log(`Total URLs: ${analysis.totalUrls}`);
    console.log(`  - Static: ${analysis.staticPages}`);
    console.log(`  - Tickers: ${analysis.tickerPages}`);
    console.log(`  - Exchanges: ${analysis.exchangePages}`);
    
    if (analysis.issues.length > 0) {
      console.log('\n⚠️  Issues:', analysis.issues.join(', '));
    }
    
    // 2. Verify sample ticker pages
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Step 2: Verifying Ticker Pages (Sample of 50)...\n');
    
    const tickerMatches = sitemapXml.matchAll(/<loc>https:\/\/www\.pocketportfolio\.app\/s\/([^<]+)<\/loc>/g);
    const tickers: string[] = [];
    for (const match of tickerMatches) {
      tickers.push(match[1]);
    }
    
    const verification = await verifyTickerPages(tickers, { sampleSize: 50 });
    console.log(`Checked: ${verification.total}`);
    console.log(`Success: ${verification.success}`);
    console.log(`Errors: ${verification.errors}`);
    
    if (verification.failedPages.length > 0) {
      console.log(`\nFailed pages: ${verification.failedPages.length}`);
    }
    
    // 3. Investigate gap
    console.log('\n' + '='.repeat(60));
    console.log('\n🔍 Step 3: Investigating Discovery Gap...\n');
    
    const gapAnalysis = await investigateSitemapGap(undefined, 869);
    console.log(`Gap: ${gapAnalysis.gap} pages (${gapAnalysis.gapPercentage.toFixed(1)}%)`);
    console.log(`\nRecommendations: ${gapAnalysis.recommendations.length}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Summary\n');
    console.log(`Sitemap URLs: ${analysis.totalUrls}`);
    console.log(`Google Discovered: 869`);
    console.log(`Gap: ${gapAnalysis.gap}`);
    console.log(`Sample Error Rate: ${((verification.errors / verification.total) * 100).toFixed(1)}%`);
    
    if (gapAnalysis.gap < 10) {
      console.log('\n✅ Excellent! Gap is minimal. This is normal for ISR pages.');
    } else if (gapAnalysis.gap < 50) {
      console.log('\n⚠️  Small gap detected. Monitor Google Search Console for indexing progress.');
    } else {
      console.log('\n❌ Significant gap detected. Review recommendations above.');
    }
    
  } catch (error) {
    console.error('Error running analyses:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllAnalyses();
}

