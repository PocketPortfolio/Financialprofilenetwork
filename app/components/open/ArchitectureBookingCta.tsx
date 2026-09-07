'use client';

import Link from 'next/link';
import IdentityGate from '@/app/components/auth/IdentityGate';

const DILIGENCE_MAIL =
  'mailto:ceo@pocketportfolio.app?subject=Open%20Portfolio%20Design%20Partnership%20Diligence&body=We%20reviewed%20openportfolio.co.uk%2Farchitecture%20and%20want%20to%20discuss%20a%20Tier-1%20design%20partnership.';

/**
 * Executive booking pathway for /architecture — Tier-1 brief gate + direct diligence email.
 */
export default function ArchitectureBookingCta() {
  return (
    <section
      aria-label="Design partnership booking"
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
        Book a Tier-1 design partnership diligence call
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Architecture is the diligence map. Partnership is the commercial gate — clean-room embed of sovereign
        ingestion without warehousing client ledgers.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <IdentityGate
          action="tier1_brief"
          contextId="architecture_booking"
          onContinue={() => {
            window.location.href = '/tier1designpartner';
          }}
        >
          {({ request, isUnlocked }) => (
            <button
              type="button"
              onClick={request}
              style={{
                border: 'none',
                background: 'var(--accent-warm)',
                color: '#0b0d10',
                fontWeight: 800,
                padding: '12px 18px',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {isUnlocked ? 'Continue to Tier-1 program →' : 'Request design partner brief →'}
            </button>
          )}
        </IdentityGate>

        <a
          href={DILIGENCE_MAIL}
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
          Email ceo@pocketportfolio.app
        </a>

        <Link
          href="/tier1designpartner"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--accent-warm)',
            textDecoration: 'none',
          }}
        >
          Read Tier-1 program →
        </Link>
      </div>
    </section>
  );
}
