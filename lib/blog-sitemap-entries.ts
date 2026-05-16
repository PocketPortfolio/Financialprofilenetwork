/**
 * Shared MDX scan for sitemap generation — one filesystem read, split by surface
 * using OPEN_BLOG_CATEGORIES vs Pocket-only categories (canonical-claims).
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isOpenBlogCategory, isPocketBlogCategory } from './canonical-claims';

export interface BlogPostSitemapEntry {
  slug: string;
  category: string | undefined;
  lastModified: Date;
}

export function loadBlogPostSitemapEntries(): BlogPostSitemapEntry[] {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  if (!fs.existsSync(postsDir)) return [];

  const now = new Date();
  const entries: BlogPostSitemapEntry[] = [];

  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith('.mdx')) continue;
    try {
      const filePath = path.join(postsDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContents);
      const slug = file.replace(/\.mdx$/i, '');
      entries.push({
        slug,
        category: typeof data.category === 'string' ? data.category : undefined,
        lastModified: data.date ? new Date(data.date) : now,
      });
    } catch (err) {
      console.error(`[blog-sitemap-entries] Error processing ${file}:`, err);
    }
  }

  return entries;
}

export function partitionBlogPostsForSitemap(entries: BlogPostSitemapEntry[]): {
  pocket: BlogPostSitemapEntry[];
  open: BlogPostSitemapEntry[];
} {
  return {
    pocket: entries.filter((e) => isPocketBlogCategory(e.category)),
    open: entries.filter((e) => isOpenBlogCategory(e.category)),
  };
}
