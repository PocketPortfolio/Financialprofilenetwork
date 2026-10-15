import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_INTELLIGENCE, OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'Open Intelligence — Sovereign AI Briefings | Open Portfolio',
  description: OPEN_INTELLIGENCE.tagline,
  alternates: { canonical: OPEN_URLS.openIntelligence },
  openGraph: {
    title: 'Open Intelligence | Open Portfolio',
    description: OPEN_INTELLIGENCE.tagline,
    url: OPEN_URLS.openIntelligence,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};

/**
 * Thin discovery surface for the Open Intelligence briefing series.
 * Education / GEO TOFU — diligence CTA stays on /architecture and homepage contact.
 */
export default function OpenIntelligencePage() {
  return (
    <main
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        Open Portfolio · Series
      </p>
      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 44px)',
          fontWeight: 800,
          color: 'var(--text)',
          margin: '0 0 16px',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        {OPEN_INTELLIGENCE.name}
      </h1>
      <p
        style={{
          fontSize: 'clamp(17px, 2.2vw, 19px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: '0 0 20px',
        }}
      >
        {OPEN_INTELLIGENCE.tagline}
      </p>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          margin: '0 0 36px',
        }}
      >
        {OPEN_INTELLIGENCE.summary}
      </p>

      <section
        aria-label="Watch"
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px',
          background: 'var(--surface)',
          marginBottom: '28px',
        }}
      >
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 10px',
            color: 'var(--text)',
          }}
        >
          Intro trailer
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Next briefing: {OPEN_INTELLIGENCE.nextBriefing}.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <a
            href={OPEN_INTELLIGENCE.youtubeWatch}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'var(--accent-warm)',
              color: 'var(--on-accent)',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Watch on YouTube
          </a>
          <a
            href={OPEN_INTELLIGENCE.youtubeChannel}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text)',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            @OpenIntelligenceUK
          </a>
        </div>
      </section>

      <section aria-label="Read next" style={{ marginBottom: '36px' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
          }}
        >
          On Open Portfolio
        </h2>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <li>
            <Link
              href={OPEN_INTELLIGENCE.architectureHref}
              style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'none' }}
            >
              Architecture map →
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {' '}
              BYOC boundary for diligence
            </span>
          </li>
          <li>
            <Link
              href={OPEN_INTELLIGENCE.learnWarehouseHref}
              style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'none' }}
            >
              Edge ingestion vs warehouse →
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {' '}
              written brief for the S1 fork
            </span>
          </li>
          <li>
            <a
              href={OPEN_INTELLIGENCE.linkedInCompany}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'none' }}
            >
              Open Portfolio on LinkedIn →
            </a>
          </li>
        </ul>
      </section>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: 0,
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        Hosted by Abba Lawal, Head of AI &amp; Ecosystem Partnerships. Claim posture: architecture
        and governance — no certification theatre, no zero-leakage claims.
      </p>
    </main>
  );
}
