import type React from 'react';

/** Retail A/B FAQ — no GitHub / open-source bleed. */
export const RETAIL_LANDING_FAQ: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'Is Pocket Portfolio free?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes. Import your portfolio and explore core features for free. Founders Club (£12/mo or £100/yr) unlocks Pocket
        Analyst and advanced risk tools.
      </p>
    ),
  },
  {
    question: 'How do you handle my data?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Your broker statements are parsed on your device. We analyze a bounded portfolio summary for AI features — not
        your raw statements. See our privacy policy for details.
      </p>
    ),
  },
  {
    question: 'What data sources do you use for live prices?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        We use multiple data providers including Yahoo Finance, Alpha Vantage, and others with fallback support to ensure
        reliability.
      </p>
    ),
  },
  {
    question: 'Is my portfolio data secure?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes. Bank-level encryption, no data sold, and secure edge processing. Your financial privacy is enforced by
        design.
      </p>
    ),
  },
  {
    question: 'Can I import data from other platforms?',
    answer: (
      <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
        Yes. We support CSV import from most major brokers with smart normalization to handle different formats.
      </p>
    ),
  },
];
