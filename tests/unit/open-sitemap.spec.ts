import { describe, expect, it } from 'vitest';
import openSitemapStatic from '@/app/open/sitemap-static';
import { loadBlogPostSitemapEntries, partitionBlogPostsForSitemap } from '@/lib/blog-sitemap-entries';
import { OPEN_URLS } from '@/lib/canonical-claims';

describe('openSitemapStatic', () => {
  it('includes hub, alias routes, and every Open-category blog slug', async () => {
    const entries = await openSitemapStatic();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(OPEN_URLS.home);
    expect(urls).toContain(`${OPEN_URLS.home}/blog`);
    expect(urls).toContain(OPEN_URLS.architecture);

    const { open } = partitionBlogPostsForSitemap(loadBlogPostSitemapEntries());
    for (const post of open.slice(0, 5)) {
      expect(urls).toContain(`${OPEN_URLS.home}/blog/${post.slug}`);
    }
    expect(urls.filter((u) => u.includes('/blog/')).length).toBe(open.length);
  });
});
