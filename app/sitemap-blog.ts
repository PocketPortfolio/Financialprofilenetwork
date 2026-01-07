/**
 * OPERATION VELOCITY: Sitemap Segmentation
 * sitemap-blog.xml - Blog and content pages
 */

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
    ];
    
    // Add individual blog post URLs
    try {
      const postsDir = path.join(process.cwd(), 'content', 'posts');
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir);
        const postFiles = files.filter(file => file.endsWith('.mdx'));
        
        for (const file of postFiles) {
          try {
            const filePath = path.join(postsDir, file);
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            const { data } = matter(fileContents);
            const slug = file.replace('.mdx', '');
            
            blogPages.push({
              url: `${baseUrl}/blog/${slug}`,
              lastModified: data.date ? new Date(data.date) : now,
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          } catch (error) {
            console.error(`[Sitemap Blog] Error processing blog post ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('[Sitemap Blog] Error reading blog posts directory:', error);
    }
    
    console.log(`[Sitemap Blog] Generated ${blogPages.length} blog pages`);
    
    return blogPages;
  } catch (error) {
    console.error('[Sitemap Blog] Error generating blog sitemap:', error);
    return [];
  }
}









