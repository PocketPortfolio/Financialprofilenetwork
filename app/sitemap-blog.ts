/**
 * OPERATION VELOCITY: Sitemap Segmentation
 * sitemap-blog.xml - Blog and content pages (Pocket / B2C canonical URLs only)
 *
 * Open-category posts (research, sovereign-engineering, how-to-in-tech) canonicalise
 * on www.openportfolio.co.uk — those URLs live in app/open/sitemap-static.ts.
 */

import { MetadataRoute } from 'next';
import {
  loadBlogPostSitemapEntries,
  partitionBlogPostsForSitemap,
} from '@/lib/blog-sitemap-entries';

export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();

  try {
    const entries = loadBlogPostSitemapEntries();
    const { pocket } = partitionBlogPostsForSitemap(entries);

    const blogPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/blog`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      ...pocket.map((e) => ({
        url: `${baseUrl}/blog/${e.slug}`,
        lastModified: e.lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];

    console.log(`[Sitemap Blog] Pocket B2C: ${blogPages.length} URLs (hub + posts)`);

    return blogPages;
  } catch (error) {
    console.error('[Sitemap Blog] Error generating blog sitemap:', error);
    return [];
  }
}
