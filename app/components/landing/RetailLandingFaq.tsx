'use client';

import { RETAIL_LANDING_FAQ } from '@/lib/landing-retail-faq';

export default function RetailLandingFaq() {
  return (
    <section
      id="faq"
      style={{ marginBottom: '120px', padding: '0 clamp(12px, 3vw, 24px)', boxSizing: 'border-box' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2
          className="brand-text"
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.25rem)',
            fontWeight: 'bold',
            marginBottom: '24px',
            letterSpacing: '-0.02em',
          }}
        >
          FAQ
        </h2>
        <p style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', color: 'var(--muted)', lineHeight: '1.6' }}>
          Common questions about tracking your wealth with Pocket Portfolio
        </p>
      </div>

      <div
        className="pp-landing-faq-shell"
        style={{
          border: '1px solid var(--border-warm)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'hsl(var(--card))',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {RETAIL_LANDING_FAQ.map((item, index) => (
          <details
            key={item.question}
            style={{
              margin: 0,
              background: 'hsl(var(--card))',
              borderTop: index === 0 ? 'none' : '1px solid rgba(245, 158, 11, 0.35)',
            }}
          >
            <summary
              style={{
                padding: '24px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 600,
                listStyle: 'none',
              }}
            >
              {item.question}
            </summary>
            <div style={{ padding: '0 24px 24px' }}>{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
