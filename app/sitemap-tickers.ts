/**
 * OPERATION VELOCITY: Sitemap Segmentation
 * sitemap-tickers.xml - All ticker pages and data intent routes
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';

export default async function sitemapTickers(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  try {
    const tickers = getAllTickers();
    const tickerPages: MetadataRoute.Sitemap = [];
    
    if (Array.isArray(tickers) && tickers.length > 0) {
      // Main ticker pages
      tickers.forEach((ticker) => {
        if (ticker && typeof ticker === 'string') {
          const tickerLower = ticker.toLowerCase().replace(/-/g, '');
          
          // Main ticker page
          tickerPages.push({
            url: `${baseUrl}/s/${tickerLower}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.6,
          });
          
          // Data intent routes (Operation Velocity)
          tickerPages.push({
            url: `${baseUrl}/s/${tickerLower}/json-api`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
          
          tickerPages.push({
            url: `${baseUrl}/s/${tickerLower}/dividend-history`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
          
          tickerPages.push({
            url: `${baseUrl}/s/${tickerLower}/insider-trading`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
      
      console.log(`[Sitemap Tickers] Generated ${tickerPages.length} ticker-related pages from ${tickers.length} tickers`);
    }
    
    return tickerPages;
  } catch (error) {
    console.error('[Sitemap Tickers] Error generating ticker sitemap:', error);
    return [];
  }
}









