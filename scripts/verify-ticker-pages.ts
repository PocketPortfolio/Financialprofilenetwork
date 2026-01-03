/**
 * Ticker Page Verifier
 * Checks HTTP status codes for ticker pages
 */

interface VerificationResult {
  url: string;
  status: number;
  statusText: string;
  error?: string;
  responseTime: number;
}

interface VerificationSummary {
  total: number;
  success: number;
  errors: number;
  statusCodes: Record<number, number>;
  slowPages: VerificationResult[];
  failedPages: VerificationResult[];
}

export async function verifyTickerPages(
  tickers: string[],
  options: {
    baseUrl?: string;
    concurrency?: number;
    timeout?: number;
    sampleSize?: number;
  } = {}
): Promise<VerificationSummary> {
  const {
    baseUrl = 'https://www.pocketportfolio.app',
    concurrency = 10,
    timeout = 10000,
    sampleSize,
  } = options;

  // Sample tickers if sampleSize is specified
  const tickersToCheck = sampleSize
    ? tickers.slice(0, sampleSize)
    : tickers;

  const results: VerificationResult[] = [];
  const statusCodes: Record<number, number> = {};

  // Process in batches
  for (let i = 0; i < tickersToCheck.length; i += concurrency) {
    const batch = tickersToCheck.slice(i, i + concurrency);
    const batchPromises = batch.map(async (ticker) => {
      const url = `${baseUrl}/s/${ticker.toLowerCase().replace(/-/g, '')}`;
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Pocket-Portfolio-Sitemap-Verifier/1.0',
          },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        const status = response.status;
        statusCodes[status] = (statusCodes[status] || 0) + 1;

        return {
          url,
          status,
          statusText: response.statusText,
          responseTime,
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
          url,
          status: 0,
          statusText: 'ERROR',
          error: error.message || 'Unknown error',
          responseTime,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Progress indicator
    if ((i + concurrency) % 50 === 0) {
      console.log(`Checked ${Math.min(i + concurrency, tickersToCheck.length)}/${tickersToCheck.length} pages...`);
    }
  }

  // Analyze results
  const success = results.filter((r) => r.status >= 200 && r.status < 300).length;
  const errors = results.filter((r) => r.status === 0 || r.status >= 400).length;
  const slowPages = results.filter((r) => r.responseTime > 3000);
  const failedPages = results.filter((r) => r.status === 0 || r.status >= 400);

  return {
    total: results.length,
    success,
    errors,
    statusCodes,
    slowPages,
    failedPages,
  };
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:');
    console.log('  ts-node verify-ticker-pages.ts --sample <number>');
    console.log('  ts-node verify-ticker-pages.ts <ticker1> <ticker2> ...');
    process.exit(1);
  }

  const sampleIndex = args.indexOf('--sample');
  const sampleSize = sampleIndex >= 0 ? parseInt(args[sampleIndex + 1]) : undefined;

  // If --sample is used, fetch tickers from sitemap
  if (sampleSize) {
    console.log(`Fetching sitemap and sampling ${sampleSize} tickers...`);
    fetch('https://www.pocketportfolio.app/sitemap.xml')
      .then((res) => res.text())
      .then((xml) => {
        const tickerMatches = xml.matchAll(/<loc>https:\/\/www\.pocketportfolio\.app\/s\/([^<]+)<\/loc>/g);
        const tickers: string[] = [];
        for (const match of tickerMatches) {
          tickers.push(match[1]);
        }
        console.log(`Found ${tickers.length} tickers in sitemap, sampling ${sampleSize}...`);
        return verifyTickerPages(tickers, { sampleSize });
      })
      .then((summary) => {
        console.log('\n✅ Verification Summary\n');
        console.log(`Total checked: ${summary.total}`);
        console.log(`Successful (2xx): ${summary.success}`);
        console.log(`Errors (4xx/5xx): ${summary.errors}`);
        console.log('\n📊 Status Code Distribution:');
        Object.entries(summary.statusCodes)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .forEach(([code, count]) => {
            console.log(`  ${code}: ${count}`);
          });

        if (summary.slowPages.length > 0) {
          console.log(`\n⚠️  Slow pages (>3s): ${summary.slowPages.length}`);
          summary.slowPages.slice(0, 10).forEach((page) => {
            console.log(`  ${page.url}: ${page.responseTime}ms`);
          });
        }

        if (summary.failedPages.length > 0) {
          console.log(`\n❌ Failed pages: ${summary.failedPages.length}`);
          summary.failedPages.slice(0, 20).forEach((page) => {
            console.log(`  ${page.url}: ${page.status} ${page.error || ''}`);
          });
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
      });
  } else {
    try {
      const summary = await verifyTickerPages(args);
      console.log(JSON.stringify(summary, null, 2));
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

