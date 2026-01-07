/**
 * Sitemap Index
 * Google requires sitemap index when URLs exceed 50,000
 * This index references all segmented sitemaps
 */

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.SitemapIndex> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemap-imports.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemap-tools.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemap-blog.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemap-tickers-1.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemap-tickers-2.xml`,
      lastModified: now,
    },
  ];
}
