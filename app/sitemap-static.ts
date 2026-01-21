/**
 * Sitemap: Static Pages
 * Core application pages, tools, and feature pages
 */

import { MetadataRoute } from 'next';

export default async function sitemapStatic(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Blog page removed - included in sitemap-blog.ts
    {
      url: `${baseUrl}/positions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/watchlist`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/static/portfolio-tracker`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // CSV conversion guide removed - included in sitemap-imports.ts
    {
      url: `${baseUrl}/tools/google-sheets-formula`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ✅ Risk Calculator Lead Magnet
    {
      url: `${baseUrl}/tools/risk-calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority because it's a lead magnet
    },
    // ✅ Tools Index Page (Lists all tools including tax converters)
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - lists all tools
    },
    {
      url: `${baseUrl}/for/advisors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sponsor`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/google-drive-sync`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/koinly`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/turbotax`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/ghostfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/sharesight`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}

