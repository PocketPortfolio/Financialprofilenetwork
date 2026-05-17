import { describe, expect, test } from 'vitest';
import { isNextNavigationError } from '@/lib/next-navigation-errors';

describe('isNextNavigationError', () => {
  test('detects NEXT_REDIRECT by digest', () => {
    expect(isNextNavigationError({ digest: 'NEXT_REDIRECT;replace;/foo;307;' })).toBe(true);
  });

  test('detects NEXT_NOT_FOUND by message', () => {
    expect(isNextNavigationError({ message: 'NEXT_NOT_FOUND' })).toBe(true);
  });

  test('ignores ordinary errors', () => {
    expect(isNextNavigationError(new Error('parse failed'))).toBe(false);
  });
});
