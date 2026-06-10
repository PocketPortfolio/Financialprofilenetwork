import type { ABTestConfig } from './ab-testing';

/**
 * Retail landing IA test — control (sovereign/infrastructure) vs retail (single-CTA funnel).
 * Active: 50/50 split on `/` via middleware cookie. Force override: ?variant=retail|control.
 */
export const RETAIL_LANDING_IA_TEST: ABTestConfig = {
  testId: 'landing_retail_ia_2026',
  testName: 'Retail Landing IA — Single CTA Funnel',
  description:
    'Educational B2C variant: outcome copy, CSV-first hero, no dev substrate bleed. Measures Founders Club snare conversion.',
  trafficSplit: 100,
  startDate: new Date('2026-06-10'),
  isActive: true,
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
