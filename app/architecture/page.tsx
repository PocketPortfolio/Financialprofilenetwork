import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import OpenProcurementFaq from '@/app/components/open/OpenProcurementFaq';
import ArchitectureBookingCta from '@/app/components/open/ArchitectureBookingCta';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import {
  OPEN_INSTITUTIONAL_PILLARS,
  OPEN_URLS,
  SURFACE_ORG,
} from '@/lib/canonical-claims';

export const metadata: Metadata = genMeta({
  title: 'Run AI on Wealth Data Without a Client-Ledger Warehouse',
  description:
    'Keep login and client storage. Edge ingestion builds a small approved summary for the model — book a 30-minute architecture review with Open Portfolio.',
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
  headline: 'Run AI on wealth data without a client-ledger warehouse',
  description:
    'How Open Portfolio supplies edge ingestion and a stateless hop while the buyer keeps IdP and ledger storage. Book a 30-minute architecture review.',
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
            Run AI on wealth data without a client-ledger warehouse
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', margin: 0 }}>
            Keep login and client storage. Edge ingestion builds a small approved summary for the model.
            Written for CTO / CISO diligence — not multi-custodian RIA “open architecture” shopping.
          </p>
        </header>

        <ArchitectureBookingCta />

        <div
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: '28px',
            background: 'var(--surface)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Not an RIA multi-custodian shelf. This is a{' '}
            <strong style={{ color: 'var(--text)' }}>BYOC inference boundary</strong>: edge ingestion, bounded
            summary, forgetful hop — buyer keeps IdP and ledger storage.{' '}
            <Link href="/openbrokercsv" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
              SDK →
            </Link>
            {' · '}
            <Link href="/#contact" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
              Book review →
            </Link>
          </p>
        </div>

        <div
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '1200px',
          }}
        >
          {section(
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                BYOC foundation (buyer keeps the store)
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Broker exports normalize at the edge via{' '}
                <code style={{ fontSize: 13 }}>@pocket-portfolio/importer</code>. Enterprise pilots scope{' '}
                <strong style={{ color: 'var(--text)' }}>your</strong> stores and IdP — not a vendor ledger vault.
                Briefs:{' '}
                <Link href="/learn/stateless-edge-ingestion" style={{ color: 'var(--accent-warm)' }}>
                  edge ingestion
                </Link>
                {' · '}
                <Link href="/learn/dora-eu-ai-act-wealth" style={{ color: 'var(--accent-warm)' }}>
                  DORA / EU AI Act
                </Link>
                {' · '}
                <Link href="/learn/sovereign-ai-architecture" style={{ color: 'var(--accent-warm)' }}>
                  sovereign AI
                </Link>
                .
              </p>
            </>
          )}

          {section(
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                Pocket = live harness (not Open&apos;s store)
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Pocket Portfolio stress-tests adapters under CSV chaos. Those consumer details are not Open&apos;s
                enterprise BYOC contract — Open sells the operated boundary for procurement.
              </p>
            </>
          )}

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Institutional briefs</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OPEN_INSTITUTIONAL_PILLARS.slice(0, 5).map((pillar) => (
                <li key={pillar.slug}>
                  <Link
                    href={`/learn/${pillar.slug}`}
                    style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
                  >
                    {pillar.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <ArchitectureBookingCta anchorId="" />

        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
          <OpenProcurementFaq pageUrl={OPEN_URLS.architecture} />
        </div>

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
