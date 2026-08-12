import { describe, expect, test } from 'vitest';
import {
  OPEN_BLOG_CATEGORIES,
  OPEN_BLOG_FILTER_CHIPS,
  POCKET_BLOG_FILTER_CHIPS,
  isOpenBlogCategory,
  isOpenBlogListingCategory,
  isOpenInternalEngineeringDiary,
  isPocketBlogCategory,
  shouldNoindexOpenBlogFarm,
  shouldNoindexOpenBlogPost,
} from '../../lib/canonical-claims';

describe('blog surface pillars', () => {
  test('open categories still include farm for dual-surface routing', () => {
    expect(OPEN_BLOG_CATEGORIES).toEqual([
      'research',
      'sovereign-engineering',
      'how-to-in-tech',
    ]);
  });

  test('open listing excludes farm how-to/research', () => {
    expect(
      isOpenBlogListingCategory(
        'sovereign-engineering',
        'data-chasm-wealth-management-llms',
      ),
    ).toBe(true);
    expect(isOpenBlogListingCategory('research')).toBe(false);
    expect(isOpenBlogListingCategory('how-to-in-tech')).toBe(false);
    expect(shouldNoindexOpenBlogFarm('research')).toBe(true);
    expect(shouldNoindexOpenBlogFarm('how-to-in-tech')).toBe(true);
  });

  test('open listing excludes internal sovereign-engineering serial diaries', () => {
    expect(
      isOpenInternalEngineeringDiary('sovereign-engineering-serial-09-admin-analytics'),
    ).toBe(true);
    expect(
      isOpenBlogListingCategory(
        'sovereign-engineering',
        'sovereign-engineering-serial-09-admin-analytics',
      ),
    ).toBe(false);
    expect(
      shouldNoindexOpenBlogPost(
        'sovereign-engineering',
        'sovereign-engineering-serial-08-amber-email',
      ),
    ).toBe(true);
    expect(
      shouldNoindexOpenBlogPost(
        'sovereign-engineering',
        'data-chasm-wealth-management-llms',
      ),
    ).toBe(false);
  });

  test('open and pocket category helpers are mutually exclusive', () => {
    for (const cat of OPEN_BLOG_CATEGORIES) {
      expect(isOpenBlogCategory(cat)).toBe(true);
      expect(isPocketBlogCategory(cat)).toBe(false);
    }
    expect(isPocketBlogCategory('deep-dive')).toBe(true);
    expect(isOpenBlogCategory('deep-dive')).toBe(false);
  });

  test('pocket filter chips map to MDX pillar frontmatter', () => {
    const pocketIds = POCKET_BLOG_FILTER_CHIPS.map((c) => c.id);
    expect(pocketIds).toEqual(['all', 'technical', 'product', 'philosophy', 'market']);
    expect(pocketIds).not.toContain('dev.to');
    expect(pocketIds).not.toContain('coderlegion');
    expect(pocketIds).not.toContain('generated');
    expect(pocketIds).not.toContain('sovereign-engineering');
    expect(pocketIds).not.toContain('research');
    expect(pocketIds).not.toContain('how-to-in-tech');
  });

  test('open filter chips are institutional only', () => {
    const openIds = OPEN_BLOG_FILTER_CHIPS.map((c) => c.id);
    expect(openIds).toEqual(['all', 'sovereign-engineering']);
    expect(openIds).not.toContain('how-to-in-tech');
    expect(openIds).not.toContain('research');
    expect(openIds).not.toContain('dev.to');
  });
});
