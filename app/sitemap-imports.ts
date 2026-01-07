/**
 * OPERATION VELOCITY: Sitemap Segmentation
 * sitemap-imports.xml - All broker import pages (Priority 1.0 - Money Pages)
 */

import { MetadataRoute } from 'next';
import { SUPPORTED_BROKERS } from './lib/brokers/config';

export default async function sitemapImports(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  try {
    const importPages: MetadataRoute.Sitemap = [
      // Main import page
      {
        url: `${baseUrl}/import`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      // OpenBrokerCSV format page
      {
        url: `${baseUrl}/openbrokercsv`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      // CSV conversion guide
      {
        url: `${baseUrl}/static/csv-etoro-to-openbrokercsv`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
    
    // All broker-specific import pages (50 brokers)
    SUPPORTED_BROKERS.forEach((broker) => {
      importPages.push({
        url: `${baseUrl}/import/${broker.toLowerCase()}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1.0, // Money pages - highest priority
      });
    });
    
    console.log(`[Sitemap Imports] Generated ${importPages.length} import pages (${SUPPORTED_BROKERS.length} brokers)`);
    
    return importPages;
  } catch (error) {
    console.error('[Sitemap Imports] Error generating import sitemap:', error);
    return [];
  }
}









