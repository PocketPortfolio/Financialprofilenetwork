import { headers } from 'next/headers';

export type ComplianceBadge = {
  title: string;
  text: string;
  pill: string;
};

export function complianceBadgeForCountry(countryCode: string): ComplianceBadge {
  const code = countryCode.toUpperCase();

  if (code === 'GB') {
    return {
      title: 'UK Operational Resilience',
      text: 'Aligned with FCA operational resilience frameworks and UK GDPR data boundaries.',
      pill: 'UK FCA / GDPR',
    };
  }

  if (['DE', 'FR', 'NL', 'ES', 'IT', 'IE', 'BE', 'AT', 'PL', 'SE', 'DK', 'FI'].includes(code)) {
    return {
      title: 'EU Financial Resilience',
      text: 'Architected for DORA (Digital Operational Resilience Act) and EU AI Act compliance posture.',
      pill: 'EU DORA / AI Act',
    };
  }

  if (['US', 'CA', 'AU'].includes(code)) {
    return {
      title: 'Sovereign Data Perimeter',
      text: 'Zero-trust architecture matching institutional data boundary controls (SOC 2 posture).',
      pill: 'SOC 2 / BYOC',
    };
  }

  return {
    title: 'Sovereign Data Perimeter',
    text: 'Local-first ingestion with stateless inference — raw ledgers stay at the edge.',
    pill: 'Sovereign / BYOC',
  };
}

export function ComplianceBanner({ countryCode = 'US' }: { countryCode?: string }) {
  const badge = complianceBadgeForCountry(countryCode);

  return (
    <div
      role="note"
      aria-label={badge.title}
      style={{
        width: '100%',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 16px',
        fontSize: 12,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            background: 'color-mix(in srgb, var(--accent-warm) 12%, transparent)',
            color: 'var(--accent-warm)',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid color-mix(in srgb, var(--accent-warm) 35%, transparent)',
            whiteSpace: 'nowrap',
          }}
        >
          {badge.pill}
        </span>
        <span>{badge.text}</span>
      </div>
    </div>
  );
}

/** Server wrapper — reads x-user-country injected by middleware. */
export async function ComplianceBannerServer() {
  const h = await headers();
  const country = h.get('x-user-country') || 'US';
  return <ComplianceBanner countryCode={country} />;
}
