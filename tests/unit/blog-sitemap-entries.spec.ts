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
  it('sends indexable Open categories to open only (farm how-to/research excluded)', () => {
    const { pocket, open } = partitionBlogPostsForSitemap([
      base({ slug: 'a', category: 'research' }),
      base({ slug: 'b', category: 'how-to-in-tech' }),
      base({ slug: 'c', category: 'sovereign-engineering' }),
      base({
        slug: 'sovereign-engineering-serial-09-admin-analytics',
        category: 'sovereign-engineering',
      }),
      base({
        slug: 'data-chasm-wealth-management-llms',
        category: 'sovereign-engineering',
        excludeFromLanding: true,
      }),
    ]);
    expect(pocket).toHaveLength(0);
    expect(open.map((e) => e.slug)).toEqual(['c']);
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
