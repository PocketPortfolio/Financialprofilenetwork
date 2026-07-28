import { afterEach, describe, expect, it } from 'vitest';
import {
  isBlogFarmPaused,
  isCronEligibleBlogCategory,
} from '@/lib/blog-generator-cron';

describe('blog farm allowlist (admin analytics + cron)', () => {
  const original = process.env.OP_BLOG_FARM_PAUSED;

  afterEach(() => {
    if (original === undefined) delete process.env.OP_BLOG_FARM_PAUSED;
    else process.env.OP_BLOG_FARM_PAUSED = original;
  });

  it('defaults farm pause ON when env unset', () => {
    delete process.env.OP_BLOG_FARM_PAUSED;
    expect(isBlogFarmPaused()).toBe(true);
    expect(isCronEligibleBlogCategory('deep-dive')).toBe(true);
    expect(isCronEligibleBlogCategory(undefined)).toBe(true);
    expect(isCronEligibleBlogCategory('how-to-in-tech')).toBe(false);
    expect(isCronEligibleBlogCategory('research')).toBe(false);
  });

  it('allows all categories when farm pause explicitly off', () => {
    process.env.OP_BLOG_FARM_PAUSED = 'false';
    expect(isBlogFarmPaused()).toBe(false);
    expect(isCronEligibleBlogCategory('how-to-in-tech')).toBe(true);
    expect(isCronEligibleBlogCategory('research')).toBe(true);
    expect(isCronEligibleBlogCategory('deep-dive')).toBe(true);
  });
});
