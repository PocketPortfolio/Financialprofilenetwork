/**
 * OPERATION VELOCITY: Data Intent Expansion
 * /s/[symbol]/json-api - Target: Developers looking for JSON data API
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';

interface JsonApiPageProps {
  params: { symbol: string };
}

// Generate static params for all tickers
export async function generateStaticParams() {
  const allTickers = getAllTickers();
  return allTickers.slice(0, 500).map((symbol) => ({
    symbol: symbol.toLowerCase().replace(/-/g, ''),
  }));
}

export async function generateMetadata({ params }: JsonApiPageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const metadata = await getTickerMetadata(symbol);
  
  if (!metadata) {
    return {
      title: `${symbol} JSON API - Historical Data Export | Pocket Portfolio`,
      description: `Export ${symbol} historical stock data to JSON format. Free API for developers to integrate ${symbol} price data into applications.`,
    };
  }

  return {
    title: `${metadata.name} (${symbol}) JSON API - Historical Data Export | Pocket Portfolio`,
    description: `Export ${metadata.name} (${symbol}) historical stock data to JSON format. Free API for developers to integrate ${symbol} price, volume, and dividend data into applications.`,
    keywords: [
      `${symbol} JSON API`,
      `${symbol} JSON export`,
      `${symbol} historical data JSON`,
      `${symbol} stock data API`,
      `${symbol} price API`,
      `export ${symbol} to JSON`
    ],
    openGraph: {
      title: `${metadata.name} (${symbol}) JSON API`,
      description: `Export ${symbol} historical data to JSON format for developers.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
    },
  };
}

export default async function JsonApiPage({ params }: JsonApiPageProps) {
  const normalizedSymbol = params.symbol.toUpperCase().replace(/-/g, '');
  const metadata = await getTickerMetadata(normalizedSymbol);
  
  if (!metadata) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 16px'
        }}>
          <div style={{
            maxWidth: '896px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              {normalizedSymbol} JSON API
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Export {normalizedSymbol} historical data to JSON format for programmatic access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            {metadata.name} ({normalizedSymbol}) JSON API
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Export {metadata.name} ({normalizedSymbol}) historical stock data to JSON format. 
            Free API for developers to integrate {normalizedSymbol} price, volume, and dividend data into applications.
          </p>

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              JSON API Endpoint
            </h2>
            <div style={{
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid var(--border-subtle)'
            }}>
              <code style={{
                fontSize: '14px',
                color: 'var(--text)',
                fontFamily: 'monospace'
              }}>
                GET /api/tickers/{normalizedSymbol}/json
              </code>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Returns historical price data for {normalizedSymbol} in JSON format.
            </p>
          </div>

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Example Response
            </h2>
            <pre style={{
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '16px',
              overflowX: 'auto',
              fontSize: '14px',
              color: 'var(--text)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}>
{`{
  "symbol": "${normalizedSymbol}",
  "name": "${metadata.name}",
  "exchange": "${metadata.exchange}",
  "data": [
    {
      "date": "2024-01-01",
      "open": 150.00,
      "high": 152.00,
      "low": 149.50,
      "close": 151.50,
      "volume": 1000000
    }
  ]
}`}
            </pre>
          </div>

          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Use Cases
            </h2>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.6'
            }}>
              <li>Build custom analytics dashboards</li>
              <li>Integrate {normalizedSymbol} data into trading algorithms</li>
              <li>Create portfolio analysis tools</li>
              <li>Generate historical performance reports</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--warm-bg)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Get Started
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Sign in to Pocket Portfolio to access the JSON API for {normalizedSymbol}.
            </p>
            <a
              href="/dashboard?utm_source=seo&utm_medium=json_api&utm_campaign=signup"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent-warm)',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              Access JSON API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration - 7 day revalidation
export const revalidate = 604800;
