'use client';

import Link from 'next/link';
import { trackEvent } from '@/app/lib/analytics/events';

const DILIGENCE_MAIL =
  'mailto:ceo@pocketportfolio.app?subject=Open%20Portfolio%20Architecture%20Review&body=We%20reviewed%20openportfolio.co.uk%2Farchitecture%20and%20want%20to%20book%20a%2030-minute%20architecture%20review.';

/**
 * Above-fold conversion CTA for /architecture — one primary path to the contact form.
 * Discovery → conversion: SERP/AI land here, then book the review.
 */
export default function ArchitectureBookingCta() {
  return (
    <section
      id="contact"
      aria-label="Book architecture review"
      style={{
        marginBottom: 28,
        padding: '20px 22px',
        border: '1px solid var(--accent-warm)',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, transparent 60%)',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        Next step for CTOs / CISOs
      </p>
      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
        Book a 30-minute architecture review
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Tell us where client data lives today and what AI should do. We map the BYOC boundary —
        edge ingestion, bounded summary, forgetful hop — and whether a design partnership fits.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <Link
          href="/#contact"
          onClick={() =>
            trackEvent('architecture_cta_click', {
              cta: 'book_review',
              source_path: '/architecture',
            })
          }
          style={{
            display: 'inline-block',
            border: 'none',
            background: 'var(--accent-warm)',
            color: 'var(--on-accent)',
            fontWeight: 800,
            padding: '12px 18px',
            borderRadius: 8,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Book a 30-minute architecture review →
        </Link>

        <a
          href={DILIGENCE_MAIL}
          onClick={() =>
            trackEvent('architecture_cta_click', {
              cta: 'email_ceo',
              source_path: '/architecture',
            })
          }
          style={{
            display: 'inline-block',
            padding: '12px 18px',
            borderRadius: 8,
            border: '2px solid var(--accent-warm)',
            color: 'var(--text)',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Or email ceo@pocketportfolio.app
        </a>
      </div>
    </section>
  );
}
