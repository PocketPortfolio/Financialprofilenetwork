/**
 * OPERATION VELOCITY: Data Intent Expansion
 * /s/[symbol]/insider-trading - Target: Active traders and analysts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';


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
      title: `${symbol} Insider Trading - Form 4 Filings & Transactions | Pocket Portfolio`,
      description: `Track ${symbol} insider trading activity including Form 4 filings, executive transactions, and insider ownership changes.`,
    };
  }

  return {
    title: `${metadata.name} (${symbol}) Insider Trading - Form 4 Filings & Transactions | Pocket Portfolio`,
    description: `Track ${metadata.name} (${symbol}) insider trading activity including Form 4 filings, executive transactions, insider ownership changes, and transaction types.`,
    keywords: [
      `${symbol} insider trading`,
      `${symbol} Form 4`,
      `${symbol} insider transactions`,
      `${symbol} executive trades`,
      `${symbol} insider ownership`,
      `${symbol} SEC filings`
    ],
    openGraph: {
      title: `${metadata.name} (${symbol}) Insider Trading`,
      description: `Track insider trading activity and Form 4 filings for ${symbol}.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/insider-trading`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/insider-trading`,
    },
  };
}

export default async function InsiderTradingPage({ params }: { params: Promise<{ symbol: string }> }) {
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
              {normalizedSymbol} Insider Trading
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Track insider trading activity for {normalizedSymbol} including Form 4 filings and executive transactions.
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
            {metadata.name} ({normalizedSymbol}) Insider Trading
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Track insider trading activity for {metadata.name} ({normalizedSymbol}) including Form 4 filings, 
            executive transactions, insider ownership changes, and transaction types.
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
              Recent Insider Transactions
            </h2>
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: 'var(--text-secondary)'
            }}>
              Insider trading data loading...
            </div>
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
              Transaction Types
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
              <li>Open Market Purchases</li>
              <li>Open Market Sales</li>
              <li>Option Exercises</li>
              <li>Grants and Awards</li>
              <li>Dispositions</li>
            </ul>
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
              Why Track Insider Trading?
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Insider trading activity can provide insights into company performance and executive confidence. 
              Track {normalizedSymbol} insider transactions to make informed investment decisions.
            </p>
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
              Monitor Insider Activity
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Sign in to Pocket Portfolio to track insider trading activity for {normalizedSymbol} and other holdings.
            </p>
            <a
              href="/dashboard?utm_source=seo&utm_medium=insider_trading&utm_campaign=signup"
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
              Track Insider Activity
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration - 7 day revalidation
export const revalidate = 604800;
