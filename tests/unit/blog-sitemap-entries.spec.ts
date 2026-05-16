import { describe, expect, it } from 'vitest';
import {
  partitionBlogPostsForSitemap,
  type BlogPostSitemapEntry,
} from '@/lib/blog-sitemap-entries';

const base = (overrides: Partial<BlogPostSitemapEntry>): BlogPostSitemapEntry => ({
  slug: 'x',
  category: undefined,
  lastModified: new Date('2026-01-01'),
  ...overrides,
});

describe('partitionBlogPostsForSitemap', () => {
  it('sends Open categories to open only', () => {
    const { pocket, open } = partitionBlogPostsForSitemap([
      base({ slug: 'a', category: 'research' }),
      base({ slug: 'b', category: 'how-to-in-tech' }),
      base({ slug: 'c', category: 'sovereign-engineering' }),
    ]);
    expect(pocket).toHaveLength(0);
    expect(open.map((e) => e.slug).sort()).toEqual(['a', 'b', 'c']);
  });

  it('treats missing category as Pocket (deep-dive default)', () => {
    const { pocket, open } = partitionBlogPostsForSitemap([
      base({ slug: 'consumer', category: undefined }),
    ]);
    expect(open).toHaveLength(0);
    expect(pocket).toHaveLength(1);
    expect(pocket[0].slug).toBe('consumer');
  });

  it('keeps deep-dive on Pocket', () => {
    const { pocket, open } = partitionBlogPostsForSitemap([
      base({ slug: 'd', category: 'deep-dive' }),
    ]);
    expect(open).toHaveLength(0);
    expect(pocket).toHaveLength(1);
  });
});
