/**
 * Sitemap Gap Investigation
 * Analyzes why Google might not discover all pages
 */

interface GapAnalysis {
  sitemapCount: number;
  googleCount: number;
  gap: number;
  gapPercentage: number;
  potentialReasons: {
    isrNotGenerated: boolean;
    errorPages: number;
    duplicateContent: boolean;
    robotsBlocked: boolean;
    slowGeneration: boolean;
  };
  recommendations: string[];
}

export async function investigateSitemapGap(
  sitemapUrl: string = 'https://www.pocketportfolio.app/sitemap.xml',
  googleDiscoveredCount: number = 869
): Promise<GapAnalysis> {
  // Fetch sitemap
  const sitemapResponse = await fetch(sitemapUrl);
  const sitemapXml = await sitemapResponse.text();

  // Count URLs in sitemap
  const urlMatches = sitemapXml.matchAll(/<url>/g);
  const sitemapCount = Array.from(urlMatches).length;

  const gap = sitemapCount - googleDiscoveredCount;
  const gapPercentage = (gap / sitemapCount) * 100;

  // Sample check for ISR generation
  const tickerMatches = sitemapXml.matchAll(
    /<loc>https:\/\/www\.pocketportfolio\.app\/s\/([^<]+)<\/loc>/g
  );
  const tickers: string[] = [];
  for (const match of tickerMatches) {
    tickers.push(match[1]);
  }

  // Sample 20 random tickers to check if they're accessible
  const sampleTickers = tickers
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);

  console.log('Checking sample of 20 random ticker pages...');
  let errorPages = 0;
  for (const ticker of sampleTickers) {
    try {
      const response = await fetch(
        `https://www.pocketportfolio.app/s/${ticker}`,
        { method: 'HEAD' }
      );
      if (response.status >= 400) {
        errorPages++;
        console.log(`  ❌ ${ticker}: ${response.status}`);
      } else {
        console.log(`  ✅ ${ticker}: ${response.status}`);
      }
    } catch (error: any) {
      errorPages++;
      console.log(`  ❌ ${ticker}: Error - ${error.message}`);
    }
  }

  const errorRate = (errorPages / sampleTickers.length) * 100;

  // Check robots.txt
  let robotsBlocked = false;
  try {
    const robotsResponse = await fetch('https://www.pocketportfolio.app/robots.txt');
    const robotsTxt = await robotsResponse.text();
    if (robotsTxt.includes('Disallow: /s/')) {
      robotsBlocked = true;
    }
  } catch (error) {
    // robots.txt might not exist, which is fine
  }

  const analysis: GapAnalysis = {
    sitemapCount,
    googleCount: googleDiscoveredCount,
    gap,
    gapPercentage,
    potentialReasons: {
      isrNotGenerated: gap > 0 && errorRate < 50, // If gap exists but most pages work, likely ISR
      errorPages: errorPages,
      duplicateContent: false, // Would need deeper analysis
      robotsBlocked,
      slowGeneration: errorRate > 20, // High error rate suggests generation issues
    },
    recommendations: [],
  };

  // Generate recommendations
  if (analysis.potentialReasons.isrNotGenerated) {
    analysis.recommendations.push(
      'Consider pre-generating more popular ticker pages at build time using generateStaticParams()'
    );
    analysis.recommendations.push(
      'Monitor ISR cache hit rates - low hit rates indicate pages need pre-generation'
    );
  }

  if (analysis.potentialReasons.errorPages > 0) {
    analysis.recommendations.push(
      `Fix ${errorPages} error pages found in sample - these prevent Google from indexing`
    );
  }

  if (analysis.potentialReasons.robotsBlocked) {
    analysis.recommendations.push(
      'Remove /s/ from robots.txt Disallow rules to allow Google to crawl ticker pages'
    );
  }

  if (gap > 100) {
    analysis.recommendations.push(
      'Consider submitting sitemap index if sitemap exceeds 50,000 URLs (Google limit per sitemap)'
    );
  }

  analysis.recommendations.push(
    'Monitor Google Search Console Coverage report for specific error types'
  );
  analysis.recommendations.push(
    'Use Google Search Console URL Inspection tool to test individual ticker pages'
  );

  return analysis;
}

// CLI usage
async function main() {
  const googleCount = process.argv[2] ? parseInt(process.argv[2]) : 869;

  try {
    const analysis = await investigateSitemapGap(undefined, googleCount);
    console.log('\n🔍 Sitemap Gap Investigation\n');
    console.log(`Sitemap URLs: ${analysis.sitemapCount}`);
    console.log(`Google Discovered: ${analysis.googleCount}`);
    console.log(`Gap: ${analysis.gap} (${analysis.gapPercentage.toFixed(1)}%)`);
    console.log('\n🔎 Potential Reasons:');
    console.log(`  ISR Not Generated: ${analysis.potentialReasons.isrNotGenerated ? '✅ Likely' : '❌ Unlikely'}`);
    console.log(`  Error Pages: ${analysis.potentialReasons.errorPages}`);
    console.log(`  Robots Blocked: ${analysis.potentialReasons.robotsBlocked ? '⚠️  Yes' : '✅ No'}`);
    console.log(`  Slow Generation: ${analysis.potentialReasons.slowGeneration ? '⚠️  Yes' : '✅ No'}`);
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

