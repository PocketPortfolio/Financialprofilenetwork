import { headers } from 'next/headers';
import {
  complianceBadgeForCountry,
  type ComplianceBadge,
} from './complianceBadge';

export type { ComplianceBadge };
export { complianceBadgeForCountry };

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
