'use client';

import Logo from './Logo';
import { openSurfaceBaseUrl, pocketSurfaceBaseUrl } from '@/lib/surface-host';
import { useSurfaceHost } from './SurfaceHostContext';

/**
 * Compact cross-surface switcher — monogram + label, no full wordmark.
 * Used in OpenNavbar (→ Pocket) and ProductionNavbar (→ Open).
 */
export default function SurfaceSwitcher({
  target,
  label,
}: {
  target: 'pocket' | 'open';
  label: string;
}) {
  const host = useSurfaceHost();
  const href =
    target === 'open' ? openSurfaceBaseUrl(host) : pocketSurfaceBaseUrl(host);

  const title =
    target === 'open'
      ? 'Open Portfolio — developer & infrastructure surface'
      : 'Pocket Portfolio — consumer wealth terminal';

  return (
    <a
      href={href}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '12px',
        padding: '6px 12px',
        marginLeft: '8px',
        borderLeft: '1px solid var(--border-subtle)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        whiteSpace: 'nowrap',
      }}
    >
      <Logo variant={target} size="small" showWordmark={false} />
      <span>{label}</span>
    </a>
  );
}
