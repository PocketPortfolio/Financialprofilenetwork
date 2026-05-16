import { describe, expect, it } from 'vitest';
import { isOpenSurfaceRoute, isPocketOnlyMarketingPath, isOpenStaticAssetPath } from '@/lib/surface-host';

describe('isOpenStaticAssetPath', () => {
  it('includes press kit files under /press/ but not HTML routes', () => {
    expect(isOpenStaticAssetPath('/press/abba/abba-uk-black-business-show-820.webp')).toBe(true);
    expect(isOpenStaticAssetPath('/press/abba-lawal')).toBe(false);
  });
});

describe('isOpenSurfaceRoute', () => {
  it('allows B2B alias paths and blog', () => {
    expect(isOpenSurfaceRoute('/')).toBe(true);
    expect(isOpenSurfaceRoute('/architecture')).toBe(true);
    expect(isOpenSurfaceRoute('/blog')).toBe(true);
    expect(isOpenSurfaceRoute('/blog/sovereign-engineering-example')).toBe(true);
  });

  it('allows institutional and press routes on the B2B surface', () => {
    expect(isOpenSurfaceRoute('/press')).toBe(true);
    expect(isOpenSurfaceRoute('/press/abba-lawal')).toBe(true);
    expect(isOpenSurfaceRoute('/sponsor')).toBe(true);
    expect(isOpenSurfaceRoute('/learn')).toBe(true);
    expect(isOpenSurfaceRoute('/privacy')).toBe(true);
    expect(isOpenSurfaceRoute('/terms')).toBe(true);
    expect(isOpenSurfaceRoute('/static/csv-etoro-to-openbrokercsv')).toBe(true);
    expect(isOpenSurfaceRoute('/static/portfolio-tracker')).toBe(true);
  });

  it('allows all glossary term pages under /learn/', () => {
    expect(isOpenSurfaceRoute('/learn/portfolio-beta')).toBe(true);
    expect(isOpenSurfaceRoute('/learn/sector-drift')).toBe(true);
    expect(isOpenSurfaceRoute('/learn/json-finance')).toBe(true);
    expect(isOpenSurfaceRoute('/learn/sovereign-stack')).toBe(true);
  });
  it('denies unknown /learn paths', () => {
    expect(isOpenSurfaceRoute('/learn/not-a-term')).toBe(false);
    expect(isOpenSurfaceRoute('/learn/foo/bar')).toBe(false);
  });

  it('treats consumer tools and dashboard as Pocket-only (Open host should redirect)', () => {
    expect(isOpenSurfaceRoute('/tools/risk-calculator')).toBe(false);
    expect(isPocketOnlyMarketingPath('/tools/risk-calculator')).toBe(true);
    expect(isOpenSurfaceRoute('/tools')).toBe(false);
    expect(isPocketOnlyMarketingPath('/tools')).toBe(true);
    expect(isOpenSurfaceRoute('/features/google-drive-sync')).toBe(false);
    expect(isPocketOnlyMarketingPath('/features/google-drive-sync')).toBe(true);
  });

  it('denies other consumer-only paths without B2B rewrite', () => {
    expect(isOpenSurfaceRoute('/dashboard')).toBe(false);
    expect(isOpenSurfaceRoute('/for/advisors')).toBe(false);
  });
});

describe('isPocketOnlyMarketingPath', () => {
  it('matches features without blocking press or aliased learn articles', () => {
    expect(isPocketOnlyMarketingPath('/press')).toBe(false);
    expect(isPocketOnlyMarketingPath('/press/abba-lawal')).toBe(false);
    expect(isPocketOnlyMarketingPath('/features/google-drive-sync')).toBe(true);
    expect(isPocketOnlyMarketingPath('/learn/sovereign-stack')).toBe(false);
  });
});
