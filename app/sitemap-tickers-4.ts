/**
 * Sitemap: Ticker Pages (Part 4)
 * Fourth quarter of ticker pages + data intent routes
 * Max 50,000 URLs per sitemap (Google limit)
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from './lib/pseo/data';

export default async function sitemapTickers4(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  const MAX_URLS_PER_SITEMAP = 50000;
  
  try {
    const tickers = getAllTickers();
    const tickerPages: MetadataRoute.Sitemap = [];
    
    if (!Array.isArray(tickers)) {
      console.error('[Sitemap Tickers-4] getAllTickers() did not return an array:', typeof tickers);
      return [];
    }
    
    if (tickers.length === 0) {
      console.warn('[Sitemap Tickers-4] No tickers returned from getAllTickers()');
      return [];
    }
    
    // Deduplicate tickers first (case-insensitive)
    const uniqueTickers = Array.from(
      new Map(tickers.map(t => [t.toLowerCase().replace(/-/g, ''), t])).values()
    );
    
    // Split tickers: fourth quarter goes to sitemap-4
    const quarter = Math.floor(uniqueTickers.length / 4);
    const fourthQuarter = uniqueTickers.slice(quarter * 3);
    
    // Track URLs to prevent duplicates within sitemap
    const seenUrls = new Set<string>();
    
    fourthQuarter.forEach((ticker) => {
      if (ticker && typeof ticker === 'string') {
        const tickerLower = ticker.toLowerCase().replace(/-/g, '');
        
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
    });
    
    console.log(`[Sitemap Tickers-4] Generated ${tickerPages.length} ticker-related pages from ${fourthQuarter.length} tickers (fourth quarter)`);
    
    if (tickerPages.length > MAX_URLS_PER_SITEMAP) {
      console.warn(`[Sitemap Tickers-4] WARNING: ${tickerPages.length} URLs exceeds Google's 50,000 limit!`);
    }
    
    return tickerPages;
  } catch (error) {
    console.error('[Sitemap Tickers-4] Error generating ticker sitemap:', error);
    return [];
  }
}

