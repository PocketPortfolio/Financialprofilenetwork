import type { ABTestConfig } from './ab-testing';

/**
 * Retail landing IA test — frozen 2026-09-27.
 * Standing face is retail. `?variant=control` still opens the control page.
 * testId stays so historical events still attach. Do not mint a new test.
 */
export const RETAIL_LANDING_IA_TEST: ABTestConfig = {
  testId: 'landing_retail_ia_2026',
  testName: 'Retail Landing IA — Single CTA Funnel',
  description:
    'Frozen. Retail is the standing consumer face. Control remains in the repo, out of rotation.',
  trafficSplit: 100,
  startDate: new Date('2026-06-10'),
  isActive: false,
  conversionEvents: [
    'landing_hero_demo_csv_drop',
    'landing_hero_sanitization_complete',
    'founders_club_cta_click',
  ],
  variants: [
    {
      variantId: 'control',
      variantName: 'Control (Sovereign IA)',
      isControl: true,
      weight: 50,
      config: { surface: 'control' },
    },
    {
      variantId: 'retail',
      variantName: 'Retail (Educational IA)',
      isControl: false,
      weight: 50,
      config: { surface: 'retail' },
    },
  ],
};
