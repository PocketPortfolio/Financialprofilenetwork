'use client';

import Link from 'next/link';
import PocketLandingVisual from '@/app/components/pocket-landing/PocketLandingVisual';
import { pocketVisual } from '@/lib/pocket-landing-visuals';

const MOAT_CARDS = [
  {
    title: 'Stateless Edge Processing',
    body:
      'Report generation runs in your browser. Client ledger rows are not warehoused on our servers for PDF inference — reducing third-party data liability.',
  },
  {
    title: 'White-Labeled Client Reports',
    body:
      'Upload your firm logo and preview branded portfolio teardowns instantly. High-resolution PDF export with Corporate License.',
  },
  {
    title: 'GDPR-Aligned Architecture',
    body:
      'Built for advisors who cannot treat client books as SaaS inventory. Edge-compute by construction, not policy slides alone.',
  },
] as const;

export function AdvisorHeroSection() {
  const heroPlate = { ...pocketVisual('portalStorage'), overlay: 'none' as const, aspectRatio: '21 / 9' };

  return (
    <section
      aria-labelledby="advisor-hero-heading"
      style={{
        marginBottom: 'clamp(48px, 8vw, 80px)',
        marginLeft: 'calc(-1 * var(--space-4))',
        marginRight: 'calc(-1 * var(--space-4))',
      }}
    >
      <div className="advisor-hero-shell" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className="advisor-hero-plate"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <PocketLandingVisual visual={heroPlate} priority variant="section" />
        </div>
        <div aria-hidden className="advisor-hero-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '860px',
            margin: '0 auto',
            padding: 'clamp(48px, 8vw, 88px) clamp(20px, 4vw, 32px) clamp(40px, 6vw, 64px)',
            textAlign: 'center',
          }}
        >
          <p className="advisor-eyebrow">For IFAs &amp; Wealth Operators</p>
          <h1
            id="advisor-hero-heading"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              margin: '0 0 20px',
            }}
          >
            Secure Client Intelligence. Zero Data Liability.
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              margin: '0 auto 24px',
              maxWidth: '720px',
            }}
          >
            Equip your firm with institutional-grade portfolio teardowns. Powered by our stateless edge-engine,
            you can generate white-labeled insights without ever warehousing your clients&apos; raw ledgers on
            third-party servers.
          </p>
          <div className="advisor-trust-band">
            GDPR-Compliant. Stateless Processing. Your Firm&apos;s Branding.
          </div>
          <div style={{ marginTop: '28px' }}>
            <a
              href="#advisor-iad"
              className="brand-button brand-button-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Test the Edge Engine
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdvisorMoatSection() {
  return (
    <section
      aria-labelledby="advisor-moat-heading"
      style={{
        marginBottom: 'clamp(48px, 8vw, 72px)',
      }}
    >
      <h2
        id="advisor-moat-heading"
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: '12px',
          color: 'var(--text)',
        }}
      >
        Why advisors trust the architecture
      </h2>
      <p
        style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 32px',
          lineHeight: 1.6,
          fontSize: 'var(--font-size-base)',
        }}
      >
        Before you upload a logo or generate a report, understand the boundary: client books stay on the edge;
        our servers do not warehouse raw ledger rows for this workflow.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-5)',
        }}
      >
        {MOAT_CARDS.map((card) => (
          <div key={card.title} className="brand-card" style={{ padding: 'var(--space-5)' }}>
            <h3
              style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)',
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)',
                margin: 0,
              }}
            >
              {card.body}
            </p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: 'var(--font-size-sm)' }}>
        <Link href="/architecture" className="advisor-architecture-link">
          Read the technical architecture →
        </Link>
      </p>
    </section>
  );
}

export function AdvisorTerminalSectionHeader() {
  return (
    <div
      id="advisor-iad"
      style={{
        scrollMarginTop: '96px',
        marginBottom: 'var(--space-6)',
        textAlign: 'center',
      }}
    >
      <p className="advisor-eyebrow" style={{ marginBottom: '10px' }}>
        Interactive Architecture Demonstration
      </p>
      <h2
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: '12px',
          letterSpacing: '-0.02em',
        }}
      >
        Interactive Terminal: Test the Edge-Generation Engine
      </h2>
      <p
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontSize: 'var(--font-size-base)',
        }}
      >
        Logo upload and report preview run in your browser. Sample data is shown until you import trades — no raw
        client ledger is sent to our servers for this demo.
      </p>
    </div>
  );
}
