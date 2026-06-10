/**
 * Pocket Portfolio B2C landing — retail A/B variant copy SSOT.
 * Command Team approved 2026-06-10. No absolute privacy claims; no dev substrate language.
 */

export const RETAIL_LANDING_COPY = {
  hero: {
    headline: 'Master your wealth across every broker, in one secure place.',
    subhead:
      'See your entire wealth in one place. Drag, drop, and understand your risk.',
    privacyBand:
      'Your statements stay on your device. We analyze the big picture. Your financial privacy is enforced by design.',
    primaryCta: 'Import your portfolio (Free)',
    secondaryCta: "Explore Founder's Club",
    dropzoneHint: 'Drop your broker CSV here — parsed locally in your browser for this demo.',
    dropzoneAria:
      'Upload or drop a broker CSV to preview your portfolio locally in your browser',
  },
  foundersSnare: {
    headline: "Your portfolio is ready. Unlock Pocket Analyst with Founder's Club.",
    primaryCta: "Join Founder's Club",
    secondaryCta: 'Try another file',
  },
  productDemo: {
    caption: 'Instantly spot overweight positions with the allocation heatmap.',
    metricsHint:
      'Annualized return and volatility help you see whether your risk matches your goals.',
  },
  analyst: {
    eyebrow: 'Pocket Analyst',
    headline: 'Your intelligent portfolio sounding board.',
    body: 'Ask questions about allocations, risk, and performance. Get clear answers grounded in your portfolio summary — not your raw statements.',
    privacy:
      'Your statements stay on your device. We analyze the big picture. Your financial privacy is enforced by design.',
    tryCta: 'Try Ask AI',
    watchCta: 'Watch Demo',
  },
  trust: {
    headline: 'Trusted by investors and wealth professionals',
    subcopy: 'Bank-level encryption. No data sold. Secure edge processing.',
    badges: ['Bank-level encryption', 'No data sold', 'Secure edge processing'] as const,
  },
} as const;

export type RetailLandingCopy = typeof RETAIL_LANDING_COPY;
