import { describe, expect, test } from 'vitest';

import { RETAIL_LANDING_IA_TEST } from '../../app/lib/analytics/retail-landing-ab';
import { RETAIL_LANDING_COPY } from '../../lib/landing-retail-copy';
import {
  LANDING_AB_IS_ACTIVE,
  landingVariantCookieForRequest,
} from '../../lib/landing-retail-variant';
import {
  mapFirstTouchToAttributionChannel,
  parseAttributionChannel,
} from '../../lib/open-portfolio/attribution-channel';

const APPROVED_PRIVACY = 'Bank-grade privacy. Zero inference warehousing.';

describe('landing retail freeze', () => {
  test('A/B is inactive and the standing cookie is retail', () => {
    expect(LANDING_AB_IS_ACTIVE).toBe(false);
    expect(RETAIL_LANDING_IA_TEST.isActive).toBe(false);
    expect(RETAIL_LANDING_IA_TEST.testId).toBe('landing_retail_ia_2026');
    expect(landingVariantCookieForRequest(null)).toBe('retail');
    expect(landingVariantCookieForRequest('retail')).toBe('retail');
    expect(landingVariantCookieForRequest('control')).toBe('control');
  });

  test('retail copy keeps the approved privacy line and drops the redlines', () => {
    expect(RETAIL_LANDING_COPY.hero.headline).toBe(
      'Master your wealth across your brokers, in one secure place.',
    );
    expect(RETAIL_LANDING_COPY.hero.privacyBand).toBe(APPROVED_PRIVACY);
    expect(RETAIL_LANDING_COPY.analyst.eyebrow).toBe('Pocket Analyst');
    expect(RETAIL_LANDING_COPY.analyst.body).toContain('OP-Hosted Sovereign');
    expect(RETAIL_LANDING_COPY.trust.badges).toEqual(['No data sold', 'Secure edge processing']);

    const blob = JSON.stringify(RETAIL_LANDING_COPY);
    expect(blob).not.toContain('Bank-level encryption');
    expect(blob).not.toContain('Trusted by investors');
    expect(blob).not.toContain('New: Sovereign routing');
    expect(blob).not.toContain('privacy is enforced by design');
    expect(blob).not.toContain('every broker');
    expect(blob).not.toContain('100% analytical command');
  });
});

describe('open attribution channel', () => {
  test('maps first-touch in the locked order', () => {
    expect(mapFirstTouchToAttributionChannel({ utm_medium: 'outbound' })).toBe('outbound');
    expect(mapFirstTouchToAttributionChannel({ utm_source: 'sales' })).toBe('outbound');
    expect(mapFirstTouchToAttributionChannel({ utm_medium: 'aeo' })).toBe('ai');
    expect(mapFirstTouchToAttributionChannel({ utm_source: 'chatgpt' })).toBe('ai');
    expect(
      mapFirstTouchToAttributionChannel({ referrer: 'https://www.perplexity.ai/search' }),
    ).toBe('ai');
    expect(mapFirstTouchToAttributionChannel({ utm_medium: 'organic' })).toBe('organic');
    expect(
      mapFirstTouchToAttributionChannel({ referrer: 'https://www.google.co.uk/search?q=open' }),
    ).toBe('organic');
    expect(
      mapFirstTouchToAttributionChannel({
        utm_medium: 'cpc',
        referrer: 'https://www.google.com/search',
      }),
    ).toBe('unknown');
    expect(mapFirstTouchToAttributionChannel({ utm_medium: 'referral' })).toBe('authority');
    expect(mapFirstTouchToAttributionChannel({})).toBe('unknown');
  });

  test('rejects values outside the enum', () => {
    expect(parseAttributionChannel('organic')).toBe('organic');
    expect(parseAttributionChannel('soc2')).toBe('unknown');
    expect(parseAttributionChannel(undefined)).toBe('unknown');
  });
});
