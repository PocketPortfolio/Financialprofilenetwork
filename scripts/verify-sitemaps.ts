/**
 * Verify all sitemap URLs are accessible
 */

const baseUrl = 'https://www.pocketportfolio.app';
const sitemaps = [
  'sitemap-static.xml',
  'sitemap-imports.xml',
  'sitemap-tools.xml',
  'sitemap-blog.xml',
  'sitemap-tickers-1.xml',
  'sitemap-tickers-2.xml',
];

async function verifySitemap(url: string): Promise<{ url: string; status: number; accessible: boolean; urlCount?: number }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapVerifier/1.0)',
      },
    });

    const status = response.status;
    const accessible = status === 200;
    
    let urlCount: number | undefined;
    if (accessible) {
      const text = await response.text();
      // Count <url> tags in the XML
      const urlMatches = text.match(/<url>/g);
      urlCount = urlMatches ? urlMatches.length : 0;
    }

    return { url, status, accessible, urlCount };
  } catch (error) {
    return { url, status: 0, accessible: false };
  }
}

async function main() {
  console.log('🔍 Verifying Sitemap Index...\n');
  
  // Verify main sitemap index
  const indexResult = await verifySitemap(`${baseUrl}/sitemap.xml`);
  console.log(`Main Sitemap Index: ${indexResult.url}`);
  console.log(`  Status: ${indexResult.status} ${indexResult.accessible ? '✅' : '❌'}`);
  console.log(`  Accessible: ${indexResult.accessible ? 'Yes' : 'No'}\n`);

  console.log('🔍 Verifying Sub-Sitemaps...\n');
  
  const results = await Promise.all(
    sitemaps.map(sitemap => verifySitemap(`${baseUrl}/${sitemap}`))
  );

  let allAccessible = true;
  let totalUrls = 0;

  results.forEach((result) => {
    const name = result.url.split('/').pop();
    console.log(`${name}:`);
    console.log(`  Status: ${result.status} ${result.accessible ? '✅' : '❌'}`);
    console.log(`  Accessible: ${result.accessible ? 'Yes' : 'No'}`);
    if (result.urlCount !== undefined) {
      console.log(`  URLs: ${result.urlCount.toLocaleString()}`);
      totalUrls += result.urlCount;
    }
    console.log('');
    
    if (!result.accessible) {
      allAccessible = false;
    }
  });

  console.log('📊 Summary:');
  console.log(`  All sitemaps accessible: ${allAccessible ? '✅ Yes' : '❌ No'}`);
  console.log(`  Total URLs across all sitemaps: ${totalUrls.toLocaleString()}`);
  console.log(`  Expected: ~62,000+ URLs`);
  console.log(`  Status: ${totalUrls >= 60000 ? '✅ Target met' : '⚠️  Below target'}`);
}

main().catch(console.error);

