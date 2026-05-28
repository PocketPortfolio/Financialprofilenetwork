import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import {
  OPEN_SOVEREIGN_INGESTION_COPY,
  OPEN_URLS,
  ORG,
  PACKAGES,
  SDK,
  SURFACE_ORG,
  VERIFIED_BROKER_ADAPTER_GROUPS,
} from '@/lib/canonical-claims';

const OPENBROKERCSV_SPEC = `Date, Ticker, Type, Currency, Quantity, Price, Commission, Fees
2025-01-15, AAPL, Stock, USD, 10, 175.50, 0, 0
2025-01-14, GOOGL, Stock, USD, 5, 142.30, 0, 0
2025-01-13, MSFT, Stock, USD, 8, 378.20, 0, 0`;

const cardStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--accent-warm)',
  borderRadius: '12px',
  padding: '24px',
};

const sectionStyle: CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
  color: 'var(--text)',
};

export const metadata: Metadata = genMeta({
  title: 'Sovereign Ingestion — OpenBrokerCSV SDK',
  description: `${SDK.name} v${SDK.version} (${SDK.license}): ${SDK.brokerAdapterCount}+ broker CSV/Excel adapters, local-first parsing, zero PII egress. Open Portfolio B2B substrate.`,
  path: '/openbrokercsv',
});

export default function SovereignIngestionPage() {
  const copy = OPEN_SOVEREIGN_INGESTION_COPY;
  const pocketImportUrl = `${ORG.url}${copy.pocketImportPath}`;
  const adapterCount = SDK.brokerAdapterCount;

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SDK.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: PACKAGES[0]?.description,
    url: OPEN_URLS.openBrokerCsv,
    license: SDK.license,
    softwareVersion: SDK.version,
    author: { '@type': 'Organization', name: SURFACE_ORG.open.name, url: SURFACE_ORG.open.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <div style={sectionStyle}>
        <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Open Portfolio
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>Sovereign ingestion</span>
        </nav>

        <header style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-warm)',
              margin: '0 0 12px',
            }}
          >
            {copy.eyebrow}
          </p>
          <h1
            style={{
              fontSize: 'clamp(30px, 4.5vw, 42px)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 16px',
            }}
          >
            {copy.title}
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
            {copy.heroBody.replace('19+', `${adapterCount}+`)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
            <a
              href={`${SDK.registry}/package/${SDK.name}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: 'var(--accent-warm)',
                color: '#0b0d10',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              {copy.cta.npm}
            </a>
            <a
              href={SDK.repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                border: '2px solid var(--accent-warm)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              {copy.cta.github}
            </a>
          </div>
        </header>

        <section style={{ ...cardStyle, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>{copy.dualSurfaceTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>{copy.dualSurfaceIntro}</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--accent-warm)' }}>
                {copy.openSurfaceLabel}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {copy.openSurfaceBody}
              </p>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>{copy.pocketSurfaceLabel}</h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {copy.pocketSurfaceBody}
              </p>
              <a
                href={pocketImportUrl}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                Try CSV import on Pocket Portfolio →
              </a>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>{copy.adaptersTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
            {copy.adaptersIntro.replace('19+', `${adapterCount}+`)}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {VERIFIED_BROKER_ADAPTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px', color: 'var(--accent-warm)' }}>
                  {group.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {group.brokers.map((broker) => (
                    <li key={broker} style={{ marginBottom: '6px' }}>
                      · {broker}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '20px 0 0', lineHeight: 1.55 }}>
            {copy.smartImportNote}
          </p>
        </section>

        <section style={{ ...cardStyle, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>{copy.formatTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>{copy.formatBody}</p>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '13px',
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0 }}>{OPENBROKERCSV_SPEC}</pre>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 0' }}>
            Full column rules:{' '}
            <a href={`${SDK.repo}/blob/main/docs/open-broker-csv.md`} style={{ color: 'var(--accent-warm)' }}>
              docs/open-broker-csv.md
            </a>
          </p>
        </section>

        <section style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px' }}>npm substrate packages</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PACKAGES.map((pkg) => (
              <li
                key={pkg.name}
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  padding: '12px 16px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                }}
              >
                <code style={{ color: 'var(--accent-warm)', fontSize: '13px' }}>{pkg.name}</code>
                <span style={{ marginLeft: '8px' }}>{pkg.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <nav
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px 24px',
            fontSize: '14px',
          }}
        >
          <Link href="/designchallenge" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>
            {copy.cta.designChallenge} →
          </Link>
          <Link href="/tier1designpartner" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>
            {copy.cta.tier1} →
          </Link>
          <Link href="/learn/sovereign-stack" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>
            {copy.cta.sovereignStack} →
          </Link>
          <Link href="/architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Stateless inference →
          </Link>
        </nav>
      </div>
    </>
  );
}
