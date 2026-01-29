/**
 * Sitemap: Risk Pages (Part 13)
 * thirteenth sixteenth of risk pages
 * Max 50,000 URLs per sitemap (Google limit)
 * URL Format: /tools/track-{ticker}-risk (public-facing URL, middleware rewrites to /tools/track/{ticker})
 */

import { MetadataRoute } from 'next';
import { getAllTickers } from './lib/pseo/data';

export default async function sitemapRisk13(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  const MAX_URLS_PER_SITEMAP = 50000;
  
  try {
    const tickers = getAllTickers();
    const riskPages: MetadataRoute.Sitemap = [];
    
    if (!Array.isArray(tickers)) {
      console.error('[Sitemap Risk-13] getAllTickers() did not return an array:', typeof tickers);
      return [];
    }
    
    if (tickers.length === 0) {
      console.warn('[Sitemap Risk-13] No tickers returned from getAllTickers()');
      return [];
    }
    
    // Deduplicate tickers first (case-insensitive, remove dots and dashes for consistency with URL normalization)
    const uniqueTickers = Array.from(
      new Map(tickers.map(t => [t.toLowerCase().replace(/\./g, '').replace(/-/g, ''), t])).values()
    );
    
    // Split tickers: thirteenth sixteenth goes to sitemap-risk-1
    const sixteenth = Math.floor(uniqueTickers.length / 16);
    const thirteenthSixteenth = uniqueTickers.slice(sixteenth * 12, sixteenth * 13);
    
    // Track URLs to prevent duplicates within sitemap
    const seenUrls = new Set<string>();
    
    thirteenthSixteenth.forEach((ticker) => {
      if (ticker && typeof ticker === 'string') {
        // Convert ticker to URL-safe format (remove dots, lowercase)
        // BRK.B -> brkb, BF.B -> bfbr
        const tickerLower = ticker.toLowerCase().replace(/\./g, '').replace(/-/g, '');
        
        // Public-facing URL format: /tools/track-{ticker}-risk
        const riskUrl = `${baseUrl}/tools/track-${tickerLower}-risk`;
        
        if (!seenUrls.has(riskUrl)) {
          riskPages.push({
            url: riskUrl,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.85, // High priority for SEO (risk pages are lead magnets)
          });
          seenUrls.add(riskUrl);
        }
      }
    });
    
    if (riskPages.length > MAX_URLS_PER_SITEMAP) {
      console.warn(`[Sitemap Risk-13] WARNING: ${riskPages.length} URLs exceeds Google's 50,000 limit. Truncating to ${MAX_URLS_PER_SITEMAP}.`);
      return riskPages.slice(0, MAX_URLS_PER_SITEMAP);
    }
    
    console.log(`[Sitemap Risk-13] Generated ${riskPages.length} risk pages from ${thirteenthSixteenth.length} tickers (thirteenth sixteenth)`);
    return riskPages;
  } catch (error) {
    console.error('[Sitemap Risk-13] Error generating risk pages:', error);
    return [];
  }
}

