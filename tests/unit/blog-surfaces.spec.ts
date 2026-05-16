import { describe, expect, test } from 'vitest';
import {
  OPEN_BLOG_CATEGORIES,
  OPEN_BLOG_FILTER_CHIPS,
  POCKET_BLOG_FILTER_CHIPS,
  isOpenBlogCategory,
  isPocketBlogCategory,
} from '../../lib/canonical-claims';

describe('blog surface pillars', () => {
  test('open categories are substrate-only', () => {
    expect(OPEN_BLOG_CATEGORIES).toEqual([
      'research',
      'sovereign-engineering',
      'how-to-in-tech',
    ]);
  });

  test('open and pocket category helpers are mutually exclusive', () => {
    for (const cat of OPEN_BLOG_CATEGORIES) {
      expect(isOpenBlogCategory(cat)).toBe(true);
      expect(isPocketBlogCategory(cat)).toBe(false);
    }
    expect(isPocketBlogCategory('deep-dive')).toBe(true);
    expect(isOpenBlogCategory('deep-dive')).toBe(false);
  });

  test('pocket filter chips exclude open-only pillars', () => {
    const pocketIds = POCKET_BLOG_FILTER_CHIPS.map((c) => c.id);
    expect(pocketIds).toEqual(['all', 'dev.to', 'coderlegion', 'generated']);
    expect(pocketIds).not.toContain('sovereign-engineering');
    expect(pocketIds).not.toContain('research');
    expect(pocketIds).not.toContain('how-to-in-tech');
  });

  test('open filter chips exclude pocket community pillars', () => {
    const openIds = OPEN_BLOG_FILTER_CHIPS.map((c) => c.id);
    expect(openIds).toEqual([
      'all',
      'sovereign-engineering',
      'how-to-in-tech',
      'research',
    ]);
    expect(openIds).not.toContain('dev.to');
    expect(openIds).not.toContain('coderlegion');
    expect(openIds).not.toContain('generated');
  });
});
