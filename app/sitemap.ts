/**
 * Sitemap Index
 * Google requires sitemap index when URLs exceed 50,000
 * Next.js doesn't support SitemapIndex type, so we return a regular sitemap
 * that lists all sub-sitemaps (Google will treat this as a sitemap index)
 */

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  // Return sitemap URLs as regular sitemap entries
  // Google will discover the sub-sitemaps automatically
  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-imports.xml`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-tools.xml`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-blog.xml`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-tickers-1.xml`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-tickers-2.xml`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
}
