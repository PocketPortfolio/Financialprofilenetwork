/**
 * Pocket Portfolio B2C landing — standing retail face (A/B frozen 2026-09-27).
 * Privacy band is the claim-gate allow-list line. Analyst body may name the shipped Ask AI route.
 */

export const RETAIL_LANDING_COPY = {
  hero: {
    headline: 'Master your wealth across your brokers, in one secure place.',
    subhead:
      'See your entire wealth in one place. Drag, drop, and understand your risk.',
    privacyBand: 'Bank-grade privacy. Zero inference warehousing.',
    rails: [
      {
        label: 'Brokers',
        body: '19 dedicated adapters, including Trading 212, Interactive Brokers, Freetrade, Charles Schwab, and Ghostfolio. Other CSVs use Smart Import.',
      },
      {
        label: 'Sign-in',
        body: 'Google or Microsoft. Optional Drive or OneDrive folder you own.',
      },
      {
        label: 'Models',
        body: 'Cloud Auto (Gemini, then OpenAI) or OP-Hosted Sovereign.',
      },
    ] as const,
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
    body: 'Ask questions about allocations, risk, and performance. Get clear answers grounded in your portfolio summary — not your raw statements. Switch Cloud Auto or OP-Hosted Sovereign in Ask AI.',
    privacy:
      'Your statements stay on your device for ingestion. Ask AI uses a bounded summary for reasoning — you choose Cloud Auto or Sovereign.',
    tryCta: 'Try Ask AI',
    watchCta: 'Watch Demo',
  },
  trust: {
    badges: ['No data sold', 'Secure edge processing'] as const,
  },
} as const;

export type RetailLandingCopy = typeof RETAIL_LANDING_COPY;
