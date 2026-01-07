/**
 * Sitemap: Ticker Pages (Part 2)
 * Second half of ticker pages + data intent routes
 * Max 50,000 URLs per sitemap (Google limit)
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';

export default async function sitemapTickers2(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  const MAX_URLS_PER_SITEMAP = 50000;
  
  try {
    const tickers = getAllTickers();
    const tickerPages: MetadataRoute.Sitemap = [];
    
    if (!Array.isArray(tickers)) {
      console.error('[Sitemap Tickers-2] getAllTickers() did not return an array:', typeof tickers);
      return [];
    }
    
    if (tickers.length === 0) {
      console.warn('[Sitemap Tickers-2] No tickers returned from getAllTickers()');
      return [];
    }
    
    // Split tickers: second half goes to sitemap-2
    const midpoint = Math.floor(tickers.length / 2);
    const secondHalf = tickers.slice(midpoint);
    
    secondHalf.forEach((ticker) => {
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
    
    console.log(`[Sitemap Tickers-2] Generated ${tickerPages.length} ticker-related pages from ${secondHalf.length} tickers (second half)`);
    
    if (tickerPages.length > MAX_URLS_PER_SITEMAP) {
      console.warn(`[Sitemap Tickers-2] WARNING: ${tickerPages.length} URLs exceeds Google's 50,000 limit!`);
    }
    
    return tickerPages;
  } catch (error) {
    console.error('[Sitemap Tickers-2] Error generating ticker sitemap:', error);
    return [];
  }
}

