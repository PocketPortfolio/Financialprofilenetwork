'use client';

import { RETAIL_LANDING_COPY } from '@/lib/landing-retail-copy';

export default function RetailTrustSection() {
  const copy = RETAIL_LANDING_COPY.trust;

  return (
    <section
      style={{
        width: '100%',
        padding: 'clamp(40px, 8vw, 80px) clamp(12px, 3vw, 24px)',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
        borderTop: '1px solid var(--border-warm)',
        borderBottom: '1px solid var(--border-warm)',
        marginBottom: 'clamp(32px, 6vw, 56px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(16px, 3vw, 24px)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {copy.badges.map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                background: 'var(--surface)',
                border: '2px solid var(--border-warm)',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-warm)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-warm)" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
