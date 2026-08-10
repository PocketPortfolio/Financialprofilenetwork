import { describe, expect, it } from 'vitest';
import { sanitizeSafeReturnTo } from '@/lib/safe-return-to';

describe('sanitizeSafeReturnTo', () => {
  it('allows relative app paths', () => {
    expect(sanitizeSafeReturnTo('/s/aapl')).toBe('/s/aapl');
    expect(sanitizeSafeReturnTo('/s/googl/json-api')).toBe('/s/googl/json-api');
  });

  it('rejects open redirects', () => {
    expect(sanitizeSafeReturnTo('https://evil.com')).toBeNull();
    expect(sanitizeSafeReturnTo('//evil.com')).toBeNull();
    expect(sanitizeSafeReturnTo('javascript:alert(1)')).toBeNull();
  });
});
