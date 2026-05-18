import { Metadata } from 'next';
import Link from 'next/link';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import NewsRoomBriefingCard from '../components/newsroom/NewsRoomBriefingCard';
import { getNewsroomPayload } from '@/lib/newsroom/store';
import { SURFACE_CROSS_LINKS } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'News Room — Wealth-Tech & Market Briefings | Pocket Portfolio',
  description:
    'Curated UK wealth-management, regulatory, and market intelligence briefings. Local-first delivery — no reading history warehoused.',
  alternates: {
    canonical: 'https://www.pocketportfolio.app/newsroom',
  },
};

/** Next.js requires a literal — keep in sync with NEWSROOM_CACHE_SECONDS (1800) in lib/newsroom/constants.ts */
export const revalidate = 1800;

export default async function NewsroomPage() {
  const payload = await getNewsroomPayload();
  const openLink = SURFACE_CROSS_LINKS.pocket;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      <ProductionNavbar />
      <main
        className="brand-surface mobile-container"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(100px, 12vw, 120px) 24px 80px',
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-warm)',
              fontFamily: 'ui-monospace, Menlo, monospace',
              marginBottom: '12px',
            }}
          >
            News Room
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            Industry Briefings
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Distributed, local-first wealth-tech and financial market briefings for advisors and operators.
            Refreshed via scheduled ingest — we do not store your reading history.
          </p>
          <p
            style={{
              marginTop: '12px',
              fontSize: '12px',
              color: 'var(--muted)',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            {payload.briefings.length === 0
              ? 'Briefings updating — no live feed yet'
              : `Last updated ${new Date(payload.updatedAt).toLocaleString('en-GB')} · live RSS`}
          </p>
        </header>

        {payload.briefings.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: '14px',
              marginBottom: '40px',
            }}
          >
            Publisher feeds are being refreshed. Cron ingest runs every 4 hours.
          </p>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {payload.briefings.map((briefing) => (
            <NewsRoomBriefingCard key={briefing.id} briefing={briefing} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              padding: '12px 24px',
              background: 'var(--accent-warm)',
              color: '#0f1216',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            Access Wealth Dashboard →
          </Link>
          <Link
            href="/for/advisors"
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border-warm)',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--text)',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            Advisor tools →
          </Link>
          <a
            href={openLink.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border-warm)',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--text)',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            {openLink.label}
          </a>
          <Link
            href="/blog"
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border-warm)',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            Engineering blog →
          </Link>
        </div>
      </main>
    </div>
  );
}
