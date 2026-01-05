/**
 * OPERATION VELOCITY: Data Intent Expansion
 * /s/[symbol]/dividend-history - Target: Dividend investors
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';
import DividendHistory from '@/app/components/DividendHistory';
import HistoricalDividends from '@/app/components/HistoricalDividends';

// Generate static params for all tickers
export async function generateStaticParams() {
  const allTickers = getAllTickers();
  return allTickers.slice(0, 500).map((symbol) => ({
    symbol: symbol.toLowerCase().replace(/-/g, ''),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const metadata = await getTickerMetadata(symbol);
  
  if (!metadata) {
    return {
      title: `${symbol} Dividend History & JSON Export | Payout Dates & Yields | Pocket Portfolio`,
      description: `View ${symbol} dividend history and export to JSON format. Download ${symbol} dividend payout dates, amounts, and yields. Free API access.`,
    };
  }

  return {
    title: `${symbol} Dividend History & JSON Export | Payout Dates & Yields | Pocket Portfolio`,
    description: `View ${metadata.name} (${symbol}) dividend history and export to JSON format. Download ${symbol} dividend payout dates, amounts, yields, and ex-dividend dates. Free API access.`,
    keywords: [
      `${symbol} dividend history`,
      `${symbol} dividend JSON export`,
      `${symbol} dividend data API`,
      `${symbol} dividend yield`,
      `${symbol} dividend dates`,
      `${symbol} ex-dividend date`,
      `${symbol} dividend payout`,
      `${symbol} dividend income`,
      `export ${symbol} dividends to JSON`
    ],
    openGraph: {
      title: `${symbol} Dividend History & JSON Export`,
      description: `View and export ${symbol} dividend history to JSON format. Free API access.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/dividend-history`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/dividend-history`,
    },
  };
}

export default async function DividendHistoryPage({ params }: { params: Promise<{ symbol: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const normalizedSymbol = resolvedParams.symbol.toUpperCase().replace(/-/g, '');
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
              {normalizedSymbol} Dividend History
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              View complete dividend history for {normalizedSymbol} including payout dates, amounts, and yields.
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
            {metadata.name} ({normalizedSymbol}) Dividend History
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Complete dividend history for {metadata.name} ({normalizedSymbol}) including payout dates, 
            amounts, yields, and ex-dividend dates. Track your dividend income.
          </p>

          {/* Real-time Dividend Data */}
          <DividendHistory symbol={normalizedSymbol} />

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
              Historical Dividend Payments
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Complete history of dividend payments for {normalizedSymbol}:
            </p>
            <HistoricalDividends symbol={normalizedSymbol} />
          </div>

          {/* NEW: JSON Export CTA */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Export {normalizedSymbol} Dividend Data to JSON
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Download {normalizedSymbol} dividend history in JSON format for programmatic access.
            </p>
            <a
              href={`/s/${normalizedSymbol.toLowerCase()}/json-api?utm_source=dividend_page&utm_medium=json_export_cta&utm_campaign=dividend_export`}
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
              Get JSON API Access →
            </a>
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
              Track Your Dividend Income
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Import your {normalizedSymbol} positions to track dividend income in your portfolio.
            </p>
            <a
              href="/dashboard?utm_source=seo&utm_medium=dividend_history&utm_campaign=signup"
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
              Track Dividends
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering - client components fetch data at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;
