import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio Tracker — Import CSVs, Live Prices & P/L | Pocket Portfolio',
  description: 'Import broker CSVs, see real-time prices, and track performance. Works with stocks, ETFs, and crypto. Free, open-source portfolio tracker.',
  keywords: 'portfolio tracker, CSV import, live stock prices, investment tracking, broker import, P&L calculator',
  alternates: {
    canonical: 'https://www.pocketportfolio.app/static/portfolio-tracker',
  },
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Pocket Portfolio Tracker",
      "description": "Free, open-source portfolio tracker with CSV import, live prices, and P/L tracking",
      "url": "https://www.pocketportfolio.app/static/portfolio-tracker",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "CSV import with automatic broker normalization",
        "Live prices with staleness badge",
        "FIFO / average cost with fees",
        "Per-position breakdowns",
        "News cards & Most Traded panel",
        "PWA: offline app shell, no API caching"
      ],
      "author": {
        "@type": "Organization",
        "name": "Pocket Portfolio"
      }
    })
  }
};

export default function PortfolioTrackerPage() {
  return (
    <div style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src="/brand/pp-wordmark.svg" alt="Pocket Portfolio" width="156" height="20" />
        </Link>
        <Link href="/dashboard" style={{
          padding: '8px 16px',
          backgroundColor: 'var(--accent)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600'
        }}>
          Launch App
        </Link>
      </header>

      <main>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
          Portfolio Tracker: import broker CSVs, get live prices &amp; P/L
        </h1>
        <p style={{ opacity: 0.75, fontSize: '1.1rem', marginBottom: '2rem' }}>
          Works with stocks, ETFs, and crypto. Import via OpenBrokerCSV for clean positions and accurate P/L.
        </p>

        <section style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Key features</h2>
          <div style={{ 
            columns: '2', 
            gap: '16px',
            marginBottom: '2rem'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ CSV import with automatic broker normalization</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Live prices with staleness badge</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ FIFO / average cost with fees</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Per-position breakdowns</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ News cards &amp; "Most Traded" panel</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ PWA: offline app shell, no API caching</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/dashboard" style={{
              padding: '12px 24px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              Open the App
            </Link>
            <Link href="/openbrokercsv" style={{
              padding: '12px 24px',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text)'
            }}>
              What is OpenBrokerCSV?
            </Link>
          </div>
        </section>

        <section style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Import from any broker</h2>
          <ol style={{ lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}>Export your trade history from your broker as CSV</li>
            <li style={{ marginBottom: '0.5rem' }}>Convert to OpenBrokerCSV (<Link href="/static/csv-etoro-to-openbrokercsv">eToro example</Link>)</li>
            <li style={{ marginBottom: '0.5rem' }}>Open the app and import in the <strong>Add trade</strong> panel</li>
          </ol>
          <p>Try a sample file: <Link href="/fixtures/csv/sample-etoro.csv">sample-etoro.csv</Link></p>
        </section>

        <section style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Real-time &amp; freshness</h2>
          <p>We fetch quotes from multiple providers and display a freshness badge. See <Link href="/dashboard">app</Link> for live data.</p>
        </section>

        <section style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>FAQ</h2>
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Is it free?</summary>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Yes, the core tracker is free.</p>
          </details>
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>What data do you store?</summary>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Imports can be kept local or synced to your account if you sign in.</p>
          </details>
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Does it support crypto?</summary>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Yes — BTC, ETH and other assets are supported via symbol pairs (e.g., BTC-USD).</p>
          </details>
        </section>
      </main>
    </div>
  );
}
