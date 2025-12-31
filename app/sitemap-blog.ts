/**
 * OPERATION VELOCITY: Sitemap Segmentation
 * sitemap-blog.xml - Blog and content pages
 */

import { MetadataRoute } from 'next';

export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  try {
    const blogPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/blog`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      // Add individual blog post URLs here as they're created
      // Example:
      // {
      //   url: `${baseUrl}/blog/post-slug`,
      //   lastModified: now,
      //   changeFrequency: 'monthly',
      //   priority: 0.6,
      // },
    ];
    
    console.log(`[Sitemap Blog] Generated ${blogPages.length} blog pages`);
    
    return blogPages;
  } catch (error) {
    console.error('[Sitemap Blog] Error generating blog sitemap:', error);
    return [];
  }
}









