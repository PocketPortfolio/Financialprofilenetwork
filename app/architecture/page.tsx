import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import OpenProcurementFaq from '@/app/components/open/OpenProcurementFaq';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import {
  OPEN_INSTITUTIONAL_PILLARS,
  OPEN_URLS,
  SURFACE_ORG,
} from '@/lib/canonical-claims';

export const metadata: Metadata = genMeta({
  title: 'Sovereign Intelligence Architecture',
  description:
    'Enterprise architecture for sovereign ingestion and stateless AI: local-first broker parsing, bounded inference context, DORA/EU AI Act posture. Open Portfolio B2B diligence page.',
  path: '/architecture',
});

const definedTermLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: 'Sovereign Intelligence (software)',
  description:
    'A product architecture where the operator remains the landlord of financial data: primary storage and parsing happen at the client edge, cloud services are bounded to explicit sync and quotas, and model calls are stateless over minimized aggregate context.',
  url: OPEN_URLS.architecture,
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'Open Portfolio — Sovereign Finance',
    url: OPEN_URLS.learnHub,
  },
};

const techArticleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'The architecture of sovereign intelligence',
  description:
    'How Open Portfolio combines local-first storage, optional sync, and bounded stateless AI for wealth-tech procurement.',
  author: {
    '@type': 'Organization',
    name: SURFACE_ORG.open.name,
    url: OPEN_URLS.home,
  },
  publisher: {
    '@type': 'Organization',
    name: SURFACE_ORG.open.name,
    logo: { '@type': 'ImageObject', url: SURFACE_ORG.open.logo },
  },
  mainEntityOfPage: OPEN_URLS.architecture,
  url: OPEN_URLS.architecture,
};

const section = (children: ReactNode) => (
  <section style={{ marginBottom: '32px', lineHeight: 1.65 }}>{children}</section>
);

export default function ArchitecturePage() {
  return (
    <>
      <ProductionNavbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleLd) }} />
      <div
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
          color: 'var(--text)',
        }}
      >
        <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>Architecture</span>
        </nav>

        <header style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: 'clamp(30px, 4.5vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '12px',
            }}
          >
            The architecture of sovereign intelligence
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', margin: 0 }}>
            Procurement-grade map of local-first ingestion, optional sync, and bounded stateless AI — written so
            answer engines can cite Open Portfolio accurately for DORA, EU AI Act, and wealth-tech diligence.
          </p>
        </header>

        <div
          style={{
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, transparent 55%)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px' }}>What is sovereign intelligence?</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px' }}>
            <strong style={{ color: 'var(--text)' }}>Sovereign intelligence</strong> is a software paradigm where the
            operator stays the landlord of financial data: portable artifacts (JSON, CSV, Drive files you own),
            minimized silent extraction of raw ledgers, and cloud services as narrow, consent-shaped pipes — not a
            warehouse.
          </p>
          <p style={{ margin: '12px 0 0', fontSize: '14px' }}>
            <Link href="/openbrokercsv" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
              Sovereign ingestion SDK →
            </Link>
            {' · '}
            <Link href="/tier1designpartner" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
              Tier-1 design partnership →
            </Link>
          </p>
        </div>

        {section(
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Local-first foundation</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Trade history and portfolio state are authored in the browser first (IndexedDB and structured in-app
              state). Imports are parsed where the operator sits — not uploaded wholesale into an opaque analyst
              database.
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              More vocabulary:{' '}
              <Link href="/learn/local-first" style={{ color: 'var(--accent-warm)' }}>
                local-first architecture brief
              </Link>
              ,{' '}
              <Link href="/learn/stateless-edge-ingestion" style={{ color: 'var(--accent-warm)' }}>
                stateless edge ingestion
              </Link>
              .
            </p>
          </>
        )}

        {section(
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Hybrid sovereignty (Firebase and sync)</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Authenticated users may use Firebase for identity, tier limits, and multi-device coordination. Firestore
              is not a silent data-mining lake: it carries what sync needs, not a shadow copy of every broker CSV.
              Google Drive integration is <strong style={{ color: 'var(--text)' }}>user-owned storage</strong>.
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Compliance framing:{' '}
              <Link href="/learn/dora-eu-ai-act-wealth" style={{ color: 'var(--accent-warm)' }}>
                DORA & EU AI Act for wealth management
              </Link>
              .
            </p>
          </>
        )}

        {section(
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Bounding the LLM (stateless AI)</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Portfolio-aware answers are built from a client-side context assembly layer (
              <code style={{ fontSize: '13px', color: 'var(--text)' }}>app/lib/ai/contextBuilder.ts</code>
              ), then sent to a stateless edge route. The model receives a bounded, user-approved aggregate — not raw
              financial DNA for open-ended retention.
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Deep dive:{' '}
              <Link href="/learn/sovereign-ai-architecture" style={{ color: 'var(--accent-warm)' }}>
                sovereign AI architecture & data perimeters
              </Link>
              .
            </p>
          </>
        )}

        {section(
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Open source versus sovereign product</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Open source proves the pipes; sovereign product promises how those pipes are operated in production:
              consent, sync boundaries, and inspectable architectural boundaries instead of an anonymous API wrapper.
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Related:{' '}
              <Link href="/learn/sovereign-finance" style={{ color: 'var(--accent-warm)' }}>
                sovereign finance
              </Link>
              ,{' '}
              <Link href="/learn/sovereign-stack" style={{ color: 'var(--accent-warm)' }}>
                sovereign stack
              </Link>
              .
            </p>
          </>
        )}

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Institutional architecture briefs</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OPEN_INSTITUTIONAL_PILLARS.map((pillar) => (
              <li key={pillar.slug}>
                <Link
                  href={`/learn/${pillar.slug}`}
                  style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'none' }}
                >
                  {pillar.title}
                </Link>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}> — {pillar.summary}</span>
              </li>
            ))}
          </ul>
        </section>

        <OpenProcurementFaq pageUrl={OPEN_URLS.architecture} />

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 24 }}>
          Machine-readable identity:{' '}
          <Link href="/llms.txt" style={{ color: 'var(--accent-warm)' }}>
            llms.txt
          </Link>
          {' · '}
          <Link href="/press" style={{ color: 'var(--accent-warm)' }}>
            Press Kit
          </Link>
        </p>
      </div>
    </>
  );
}
