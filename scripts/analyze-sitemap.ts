/**
 * Sitemap Analyzer
 * Counts URLs in sitemap and categorizes them
 */

interface SitemapAnalysis {
  totalUrls: number;
  staticPages: number;
  tickerPages: number;
  exchangePages: number;
  categories: {
    static: string[];
    tickers: string[];
    exchanges: string[];
  };
  issues: string[];
}

export function analyzeSitemap(sitemapXml: string): SitemapAnalysis {
  const analysis: SitemapAnalysis = {
    totalUrls: 0,
    staticPages: 0,
    tickerPages: 0,
    exchangePages: 0,
    categories: {
      static: [],
      tickers: [],
      exchanges: [],
    },
    issues: [],
  };

  // Extract all <url> entries
  const urlMatches = sitemapXml.matchAll(/<url>[\s\S]*?<\/url>/g);
  
  for (const match of urlMatches) {
    const urlBlock = match[0];
    const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
    
    if (!locMatch) {
      analysis.issues.push('Found <url> block without <loc> tag');
      continue;
    }

    const url = locMatch[1];
    analysis.totalUrls++;

    // Categorize URLs
    if (url.includes('/s/')) {
      // Ticker page
      analysis.tickerPages++;
      const ticker = url.split('/s/')[1];
      analysis.categories.tickers.push(ticker);
    } else if (url.includes('/import/')) {
      // Exchange page
      analysis.exchangePages++;
      const exchange = url.split('/import/')[1];
      analysis.categories.exchanges.push(exchange);
    } else {
      // Static page
      analysis.staticPages++;
      analysis.categories.static.push(url);
    }
  }

  // Check for duplicates
  const tickerSet = new Set(analysis.categories.tickers);
  if (tickerSet.size !== analysis.categories.tickers.length) {
    const duplicates = analysis.categories.tickers.filter(
      (t, i) => analysis.categories.tickers.indexOf(t) !== i
    );
    analysis.issues.push(`Found ${duplicates.length} duplicate ticker pages`);
  }

  // Check for invalid ticker formats
  const invalidTickers = analysis.categories.tickers.filter(
    (t) => !/^[a-z0-9.]+$/.test(t)
  );
  if (invalidTickers.length > 0) {
    analysis.issues.push(
      `Found ${invalidTickers.length} tickers with invalid format: ${invalidTickers.slice(0, 5).join(', ')}`
    );
  }

  return analysis;
}

// CLI usage
async function main() {
  const sitemapPath = process.argv[2] || 'https://www.pocketportfolio.app/sitemap.xml';
  
  if (sitemapPath.startsWith('http')) {
    // Fetch from URL
    try {
      const res = await fetch(sitemapPath);
      const xml = await res.text();
      const analysis = analyzeSitemap(xml);
      console.log('\n📊 Sitemap Analysis Results\n');
      console.log(`Total URLs: ${analysis.totalUrls}`);
      console.log(`  - Static pages: ${analysis.staticPages}`);
      console.log(`  - Ticker pages: ${analysis.tickerPages}`);
      console.log(`  - Exchange pages: ${analysis.exchangePages}`);
      console.log('\n📋 Breakdown:');
      console.log(`  Static pages: ${analysis.categories.static.length}`);
      console.log(`  Unique tickers: ${new Set(analysis.categories.tickers).size}`);
      console.log(`  Exchanges: ${analysis.categories.exchanges.join(', ')}`);
      
      if (analysis.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        analysis.issues.forEach((issue) => console.log(`  - ${issue}`));
      }
      
      // Compare with Google's discovered count
      const googleDiscovered = 869;
      const difference = analysis.totalUrls - googleDiscovered;
      console.log(`\n🔍 Google Search Console Comparison:`);
      console.log(`  Sitemap URLs: ${analysis.totalUrls}`);
      console.log(`  Google Discovered: ${googleDiscovered}`);
      console.log(`  Difference: ${difference} (${((difference / analysis.totalUrls) * 100).toFixed(1)}%)`);
      
      if (difference > 0) {
        console.log(`\n💡 Possible reasons for ${difference} undiscovered pages:`);
        console.log(`  1. ISR pages not yet generated (on-demand generation)`);
        console.log(`  2. Pages returning 404 or errors`);
        console.log(`  3. Google hasn't crawled all pages yet`);
        console.log(`  4. Duplicate content filtering`);
        console.log(`  5. Pages blocked by robots.txt or meta tags`);
      }
    } catch (err) {
      console.error('Error fetching sitemap:', err);
      process.exit(1);
    }
  } else {
    // Read from file
    const { readFileSync } = require('fs');
    const xml = readFileSync(sitemapPath, 'utf-8');
    const analysis = analyzeSitemap(xml);
    console.log(JSON.stringify(analysis, null, 2));
  }
}

if (require.main === module) {
  main();
}

