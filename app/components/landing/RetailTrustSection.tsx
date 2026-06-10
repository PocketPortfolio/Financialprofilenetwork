'use client';

import DynamicDownloadCount from '@/app/components/DynamicDownloadCount';
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
        marginBottom: 'clamp(60px, 10vw, 120px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: '32px',
            color: 'var(--text-warm)',
            letterSpacing: '-0.02em',
          }}
        >
          {copy.headline}{' '}
          <span style={{ color: 'var(--accent-warm)' }}>
            <DynamicDownloadCount />
          </span>
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(16px, 3vw, 24px)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '16px',
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

        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--text-secondary)',
            marginTop: '16px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {copy.subcopy}
        </p>
      </div>
    </section>
  );
}
