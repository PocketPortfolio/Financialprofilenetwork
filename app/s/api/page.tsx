import { Metadata } from 'next';
import Link from 'next/link';
import ApiHubClient from './ApiHubClient';

export const metadata: Metadata = {
  title: 'Free Stock JSON API & CSV Export Endpoints | Pocket Portfolio',
  description:
    'Developer index for stateless financial data endpoints. Get JSON and CSV exports per ticker (no API key). Local-first ingestion: parse broker CSVs in-browser.',
  alternates: {
    canonical: 'https://www.pocketportfolio.app/s/api',
  },
  openGraph: {
    title: 'Free Stock JSON API & CSV Export Endpoints | Pocket Portfolio',
    description:
      'Developer index for stateless JSON and CSV endpoints per ticker. No API key required. Local-first ingestion: parse broker CSVs in-browser.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/s/api',
  },
};

export default function ApiHubPage() {
  const inkBorder = 'rgba(15, 23, 42, 0.16)';
  const inkBorderSoft = 'rgba(15, 23, 42, 0.10)';

  const hubSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pocket Portfolio API Hub',
    description:
      'Developer index for stateless JSON and CSV endpoints for financial historical data. Includes local-first CSV ingestion links.',
    url: 'https://www.pocketportfolio.app/s/api',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Pocket Portfolio',
      url: 'https://www.pocketportfolio.app',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      <div
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '32px 16px 48px',
          color: 'var(--text)',
        }}
      >
        <div
          style={{
            border: `1px solid ${inkBorder}`,
            borderRadius: '18px',
            padding: '22px 18px',
            background:
              'radial-gradient(900px 320px at 10% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 55%), var(--surface)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 260 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: `1px solid ${inkBorderSoft}`,
                  background: 'rgba(245, 158, 11, 0.08)',
                  color: 'var(--accent-warm)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  marginBottom: '12px',
                }}
              >
                Developer Hub
                <span style={{ color: 'var(--text-secondary)', letterSpacing: 0, fontWeight: 700 }}>/s/api</span>
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: 850, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
                Stateless JSON endpoint + CSV export per ticker
              </h1>
              <p style={{ marginTop: '10px', marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Built for developer intent. Copy‑paste URLs, predictable responses, and indexable dataset pages. No API
                key required.
              </p>
            </div>

            <div
              style={{
                flex: '1 1 320px',
                minWidth: 280,
                borderLeft: `1px solid ${inkBorderSoft}`,
                paddingLeft: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 850, marginBottom: '10px' }}>Quick links</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <Link
                  href="/import/interactive-brokers"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${inkBorderSoft}`,
                    background: 'var(--background)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  IBKR importer
                </Link>
                <Link
                  href="/import/ghostfolio"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${inkBorderSoft}`,
                    background: 'var(--background)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Ghostfolio importer
                </Link>
                <Link
                  href="/import"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${inkBorderSoft}`,
                    background: 'var(--background)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  All importers
                </Link>
                <Link
                  href="/s/spy/json-api"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-warm)',
                    background: 'rgba(245, 158, 11, 0.10)',
                    color: 'var(--accent-warm)',
                    fontSize: '12px',
                    fontWeight: 900,
                  }}
                >
                  SPY JSON API page
                </Link>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                Target queries: <code style={{ fontFamily: 'inherit' }}>stock api json</code>,{' '}
                <code style={{ fontFamily: 'inherit' }}>free stock json api</code>,{' '}
                <code style={{ fontFamily: 'inherit' }}>csv export endpoint</code>
              </div>
            </div>
          </div>
        </div>

        <ApiHubClient />

        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              border: `1px solid ${inkBorder}`,
              borderRadius: '14px',
              padding: '16px',
              background: 'var(--surface)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>Local-first ingestion</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Parse broker exports inside your browser. Your raw CSV does not need to be uploaded to normalize
                  trades or visualize a portfolio.
                </div>
              </div>
              <div
                style={{
                  border: `1px solid ${inkBorderSoft}`,
                  borderRadius: '12px',
                  padding: '10px 12px',
                  background: 'var(--background)',
                  minWidth: 260,
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    color: 'var(--text)',
                    marginBottom: '6px',
                  }}
                >
                  Invariant
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  “Your data stays on your device.”
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
              <Link
                href="/import/interactive-brokers"
                style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px', fontWeight: 800 }}
              >
                Interactive Brokers CSV importer →
              </Link>
              <Link
                href="/import/ghostfolio"
                style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px', fontWeight: 800 }}
              >
                Ghostfolio CSV importer →
              </Link>
              <Link
                href="/openbrokercsv"
                style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px', fontWeight: 800 }}
              >
                OpenBrokerCSV format →
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              border: `1px solid ${inkBorder}`,
              borderRadius: '14px',
              padding: '16px',
              background: 'var(--surface)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Example (curl)</div>
            <pre
              style={{
                margin: 0,
                padding: '14px',
                borderRadius: '12px',
                border: `1px solid ${inkBorderSoft}`,
                background: 'var(--background)',
                overflow: 'auto',
                fontSize: '12px',
                lineHeight: 1.6,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                color: 'var(--text)',
              }}
            >{`curl "https://www.pocketportfolio.app/api/tickers/SPY/json?range=max" | head -n 40

curl -L "https://www.pocketportfolio.app/api/tickers/SPY/csv?range=max" -o "SPY.csv"`}</pre>
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Tip: for indexable docs + schema, prefer the dataset page:
              <span style={{ marginLeft: 6 }}>
                <Link href="/s/spy/json-api" style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 900 }}>
                  /s/spy/json-api
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

