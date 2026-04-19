import Link from 'next/link';
import SovereignStickyPromptClient from '@/app/components/SovereignStickyPromptClient';
import { jsonApiDashboardFooterLink } from '@/app/lib/seo/jsonApiInternalLinks';

export default async function SymbolTickerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const normalizedSymbol = symbol.toUpperCase().replace(/-/g, '');
  const authorityFoot = jsonApiDashboardFooterLink(normalizedSymbol);

  return (
    <>
      <div
        id="symbol-route-main"
        className="terminal-content-scope"
        style={{
          background: 'var(--bg)',
          minHeight: '100vh',
          borderTop: '2px solid var(--border-warm)',
          boxShadow: 'inset 0 1px 0 rgba(245, 158, 11, 0.1)',
          paddingBottom: '100px',
        }}
      >
        {children}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '8px 16px 28px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href={authorityFoot.href}
            title={authorityFoot.title}
            style={{
              color: 'var(--accent-warm)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {authorityFoot.label}
          </Link>
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Link
              href="/architecture?utm_source=symbol_layout&utm_medium=footer&utm_campaign=geo"
              style={{ color: 'var(--text-secondary)' }}
            >
              Local-first architecture & hybrid sovereignty →
            </Link>
          </p>
        </div>
      </div>
      <SovereignStickyPromptClient normalizedSymbol={normalizedSymbol} />
    </>
  );
}
