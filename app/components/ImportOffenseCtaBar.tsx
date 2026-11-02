'use client';

import Link from 'next/link';

type Props = {
  brokerSlug: string;
  brokerDisplayName: string;
};

/**
 * Above-fold offense strip on /import/[broker] — import path + Developer Utility.
 * Growth plan Pillar 3: lander → DU → paid key.
 */
export default function ImportOffenseCtaBar({ brokerSlug, brokerDisplayName }: Props) {
  const duHref = `/sponsor?tier=developer-utility&utm_source=import_page&utm_medium=offense_cta&utm_campaign=paid_key&utm_content=${encodeURIComponent(brokerSlug)}`;

  return (
    <section
      aria-label="Import and Developer Utility"
      style={{
        marginBottom: 28,
        padding: '16px 18px',
        border: '1px solid var(--accent-warm)',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: '1 1 220px' }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-warm)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          Next step
        </p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
          Import {brokerDisplayName} CSV locally — then unlock Developer Utility for API + sync.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          onClick={() =>
            document.getElementById('import-now')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
          style={{
            border: 'none',
            background: 'var(--accent-warm)',
            color: 'var(--on-accent)',
            fontWeight: 800,
            padding: '11px 16px',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Import CSV now →
        </button>
        <Link
          href={duHref}
          style={{
            display: 'inline-block',
            padding: '11px 16px',
            borderRadius: 8,
            border: '2px solid var(--accent-warm)',
            color: 'var(--text)',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Developer Utility
        </Link>
      </div>
    </section>
  );
}
