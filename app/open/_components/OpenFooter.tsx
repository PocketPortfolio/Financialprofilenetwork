import Link from 'next/link';
import { headers } from 'next/headers';
import { SURFACE_CROSS_LINKS } from '@/lib/canonical-claims';
import { pocketSurfaceBaseUrl } from '@/lib/surface-host';

/**
 * Shared site footer for every route under app/open/layout.tsx (B2B surface).
 * Matches the strip previously rendered only on the Open landing page.
 */
export default async function OpenFooter() {
  const rawHost = (await headers()).get('host') ?? '';
  const pocketHref = pocketSurfaceBaseUrl(rawHost);
  const hostname = rawHost.split(':')[0] ?? '';
  const leftLine =
    hostname === 'open.localhost' || hostname === 'www.open.localhost'
      ? `${hostname} — Open Portfolio.`
      : 'openportfolio.co.uk — Open Portfolio.';

  return (
    <footer
      aria-label="Open Portfolio site"
      style={{
        marginTop: 'auto',
        padding: '32px 24px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        <span>{leftLine}</span>
        <nav style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }} aria-label="Open Portfolio footer">
          <Link href="/architecture" style={{ color: 'inherit', textDecoration: 'none' }}>
            Architecture
          </Link>
          <Link href="/learn/sovereign-stack" style={{ color: 'inherit', textDecoration: 'none' }}>
            Sovereign Stack
          </Link>
          <Link href="/learn/local-first" style={{ color: 'inherit', textDecoration: 'none' }}>
            Local-First
          </Link>
          <a href={pocketHref} style={{ color: 'inherit', textDecoration: 'none' }}>
            {SURFACE_CROSS_LINKS.open.label}
          </a>
        </nav>
      </div>
    </footer>
  );
}
