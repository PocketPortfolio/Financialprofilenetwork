/**
 * Sitemap: Ticker Pages (Part 5)
 * Fifth eighth of ticker pages + data intent routes
 * Max 50,000 URLs per sitemap (Google limit)
 * Target: ~650KB per sitemap (to prevent Googlebot timeouts) (under Google's recommended 1MB limit)
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from './lib/pseo/data';
import { detectAssetType } from './lib/portfolio/sectorClassification';
import { AssetType } from './lib/portfolio/sectorClassification';

export default async function sitemapTickers5(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  const MAX_URLS_PER_SITEMAP = 50000;
  
  try {
    const tickers = getAllTickers();
    const tickerPages: MetadataRoute.Sitemap = [];
    
    if (!Array.isArray(tickers)) {
      console.error('[Sitemap Tickers-5] getAllTickers() did not return an array:', typeof tickers);
      return [];
    }
    
    if (tickers.length === 0) {
      console.warn('[Sitemap Tickers-5] No tickers returned from getAllTickers()');
      return [];
    }
    
    // Deduplicate tickers first (case-insensitive)
    const uniqueTickers = Array.from(
      new Map(tickers.map(t => [t.toLowerCase().replace(/-/g, ''), t])).values()
    );
    
    // Split tickers: fifth sixteenth goes to sitemap-5
    const sixteenth = Math.floor(uniqueTickers.length / 16);
    const fifthSixteenth = uniqueTickers.slice(sixteenth * 4, sixteenth * 5);
    
    // Track URLs to prevent duplicates within sitemap
    const seenUrls = new Set<string>();
    
    fifthSixteenth.forEach((ticker) => {
      if (ticker && typeof ticker === 'string') {
        const tickerLower = ticker.toLowerCase().replace(/-/g, '');
        
        const assetType = detectAssetType(ticker.toUpperCase());
        const hasInsiderData = assetType === AssetType.STOCK || assetType === AssetType.REIT;
        
        // Main ticker page
        const mainUrl = `${baseUrl}/s/${tickerLower}`;
        if (!seenUrls.has(mainUrl)) {
          tickerPages.push({
            url: mainUrl,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.6,
          });
          seenUrls.add(mainUrl);
        }
        
        // Data intent routes (Operation Velocity)
        const jsonUrl = `${baseUrl}/s/${tickerLower}/json-api`;
        if (!seenUrls.has(jsonUrl)) {
          tickerPages.push({
            url: jsonUrl,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
          seenUrls.add(jsonUrl);
        }
        
        const dividendUrl = `${baseUrl}/s/${tickerLower}/dividend-history`;
        if (!seenUrls.has(dividendUrl)) {
          tickerPages.push({
            url: dividendUrl,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
          seenUrls.add(dividendUrl);
        }
        // Insider trading (ONLY for stocks/REITs)
        if (hasInsiderData) {
          const insiderUrl = `${baseUrl}/s/${tickerLower}/insider-trading`;
          if (!seenUrls.has(insiderUrl)) {
            tickerPages.push({
              url: insiderUrl,
              lastModified: now,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
            seenUrls.add(insiderUrl);
          }
        }
      }
    });
    
    console.log(`[Sitemap Tickers-5] Generated ${tickerPages.length} ticker-related pages from ${fifthSixteenth.length} tickers (fifth eighth)`);
    
    if (tickerPages.length > MAX_URLS_PER_SITEMAP) {
      console.warn(`[Sitemap Tickers-5] WARNING: ${tickerPages.length} URLs exceeds Google's 50,000 limit!`);
    }
    
    return tickerPages;
  } catch (error) {
    console.error('[Sitemap Tickers-5] Error generating ticker sitemap:', error);
    return [];
  }
}

