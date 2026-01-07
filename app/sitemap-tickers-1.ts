/**
 * Sitemap: Ticker Pages (Part 1)
 * First half of ticker pages + data intent routes
 * Max 50,000 URLs per sitemap (Google limit)
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from './lib/pseo/data';

export default async function sitemapTickers1(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  const MAX_URLS_PER_SITEMAP = 50000;
  
  try {
    const tickers = getAllTickers();
    const tickerPages: MetadataRoute.Sitemap = [];
    
    if (!Array.isArray(tickers)) {
      console.error('[Sitemap Tickers-1] getAllTickers() did not return an array:', typeof tickers);
      return [];
    }
    
    if (tickers.length === 0) {
      console.warn('[Sitemap Tickers-1] No tickers returned from getAllTickers()');
      return [];
    }
    
    // Split tickers: first half goes to sitemap-1
    const midpoint = Math.floor(tickers.length / 2);
    const firstHalf = tickers.slice(0, midpoint);
    
    firstHalf.forEach((ticker) => {
      if (ticker && typeof ticker === 'string') {
        const tickerLower = ticker.toLowerCase().replace(/-/g, '');
        
        // Main ticker page
        tickerPages.push({
          url: `${baseUrl}/s/${tickerLower}`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.6,
        });
        
        // Data intent routes (Operation Velocity)
        tickerPages.push({
          url: `${baseUrl}/s/${tickerLower}/json-api`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
        
        tickerPages.push({
          url: `${baseUrl}/s/${tickerLower}/dividend-history`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
        
        tickerPages.push({
          url: `${baseUrl}/s/${tickerLower}/insider-trading`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
    });
    
    console.log(`[Sitemap Tickers-1] Generated ${tickerPages.length} ticker-related pages from ${firstHalf.length} tickers (first half)`);
    
    if (tickerPages.length > MAX_URLS_PER_SITEMAP) {
      console.warn(`[Sitemap Tickers-1] WARNING: ${tickerPages.length} URLs exceeds Google's 50,000 limit!`);
    }
    
    return tickerPages;
  } catch (error) {
    console.error('[Sitemap Tickers-1] Error generating ticker sitemap:', error);
    return [];
  }
}

