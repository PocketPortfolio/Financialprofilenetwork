/**
 * Sitemap: Tax Conversion Tools
 * Q1 tax season traffic - high priority monetization pages
 */

import { MetadataRoute } from 'next';

export default async function sitemapTools(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  try {
    const { CONVERSION_PAIRS } = await import('./lib/tax-formats/conversion-pairs');
    const toolPages: MetadataRoute.Sitemap = CONVERSION_PAIRS.map((pair) => ({
      url: `${baseUrl}/tools/${pair.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
    
    console.log(`[Sitemap Tools] Generated ${toolPages.length} tax conversion tool pages`);
    return toolPages;
  } catch (error) {
    console.error('[Sitemap Tools] Error generating tool pages:', error);
    return [];
  }
}

