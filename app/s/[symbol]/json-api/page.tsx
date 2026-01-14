/**
 * OPERATION VELOCITY: Data Intent Expansion
 * /s/[symbol]/json-api - Target: Developers looking for JSON data API
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';
import { getDatasetSchema } from '@/app/lib/seo/schema';
import { getDatasetStats } from '@/app/lib/utils/dataset';
import JsonApiNpmSnippet from '@/app/components/JsonApiNpmSnippet';
import Link from 'next/link';


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
      title: `${symbol} Historical Data & JSON API | Free Download | Pocket Portfolio`,
      description: `Download ${symbol} historical stock data in JSON format. Free API for developers. Export ${symbol} price, volume, and dividend data. No login required.`,
    };
  }

  return {
    title: `${symbol} Historical Data & JSON API | Free Download | Pocket Portfolio`,
    description: `Download ${metadata.name} (${symbol}) historical stock data in JSON format. Free API for developers. Export price, volume, and dividend data. No login required.`,
    keywords: [
      `${symbol} historical data json format`,
      `${symbol} stock historical data json`,
      `${symbol} JSON API`,
      `${symbol} JSON export`,
      `${symbol} historical data JSON`,
      `${symbol} stock data API`,
      `${symbol} price API`,
      `export ${symbol} to JSON`,
      `download ${symbol} JSON data`
    ],
    openGraph: {
      title: `${symbol} Historical Data & JSON API | Free Download`,
      description: `Download ${symbol} historical stock data in JSON format. Free API for developers.`,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
    },
  };
}

// Fetch historical data for unique content generation
async function fetchTickerData(symbol: string) {
  try {
    // Skip during build time - API routes aren't available during static generation
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build';
    
    if (isBuildTime || typeof window !== 'undefined') {
      return null;
    }
    
    // Use Vercel's internal URL during ISR revalidation for better reliability
    // VERCEL_URL is automatically set by Vercel during server-side rendering
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app');
    
    const response = await fetch(`${baseUrl}/api/tickers/${symbol}/json?range=max`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`[JSON-API] Failed to fetch ticker data for ${symbol}: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[JSON-API] Error fetching ticker data for ${symbol}:`, error);
    // Will use fallback content
  }
  return null;
}

// Fetch quote data for live preview
async function fetchQuoteData(symbol: string) {
  try {
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build';
    
    if (isBuildTime || typeof window !== 'undefined') {
      return null;
    }
    
    // Use Vercel's internal URL during ISR revalidation for better reliability
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app');
    
    const response = await fetch(`${baseUrl}/api/quote?symbols=${symbol}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } else {
      console.error(`[JSON-API] Failed to fetch quote data for ${symbol}: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[JSON-API] Error fetching quote data for ${symbol}:`, error);
  }
  return null;
}

export default async function JsonApiPage({ params }: { params: Promise<{ symbol: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const normalizedSymbol = resolvedParams.symbol.toUpperCase().replace(/-/g, '');
  const metadata = await getTickerMetadata(normalizedSymbol);
  
  // Fetch historical data and quote for unique content
  const tickerData = await fetchTickerData(normalizedSymbol);
  const quoteData = await fetchQuoteData(normalizedSymbol);
  
  // 🧠 GENERATE UNIQUE METADATA (The SEO Fix)
  const stats = getDatasetStats(tickerData?.data || null);
  const uniqueDescription = stats 
    ? `Access ${stats.count} data points for ${normalizedSymbol} spanning ${stats.years} years (${stats.startYear}–${stats.lastUpdate}). Optimized JSON format (${stats.sizeKB} KB).`
    : `Real-time normalized JSON data for ${normalizedSymbol}. Free API for developers. No login required.`;
  
  // Generate Dataset schema for AI agents and search engines
  const datasetSchema = getDatasetSchema(
    normalizedSymbol,
    metadata?.name,
    metadata?.exchange
  );
  
  // Prepare live preview data
  const previewData = {
    symbol: normalizedSymbol,
    timestamp: new Date().toISOString(),
    price: quoteData?.price || null,
    change_24h: quoteData?.changePct || null,
    history_sample: tickerData?.data?.slice(0, 2) || []
  };

  if (!metadata) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datasetSchema)
          }}
        />
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
                {normalizedSymbol} Historical Data & JSON API
              </h1>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Download {normalizedSymbol} historical stock data in JSON format. Free API for developers. No login required.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetSchema)
        }}
      />
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
          {/* HEADER: The "Unique" Hook */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '20px' }}>🗄️</span>
            <span style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#34d399',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600'
            }}>
              Developer Resource // JSON Endpoint
            </span>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            {normalizedSymbol} JSON Data API
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.7',
            maxWidth: '800px'
          }}>
            {uniqueDescription}
          </p>
          
          {/* CROSS-LINK (Internal SEO Juice) */}
          <div style={{ marginBottom: '32px' }}>
            <Link 
              href={`/s/${normalizedSymbol.toLowerCase()}`} 
              style={{
                color: '#34d399',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
            >
              View {normalizedSymbol} Market Intelligence & Forecast →
            </Link>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            marginTop: '32px'
          }}>
            {/* LEFT COL: Live Preview & NPM Hook */}
            <div>

              {/* 💻 LIVE PREVIEW (The Trust Signal) */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <code style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)'
                  }}>
                    GET /api/tickers/{normalizedSymbol}/json
                  </code>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#34d399'
                  }}>
                    ● 200 OK (Live)
                  </span>
                </div>
                <div style={{
                  padding: '16px',
                  overflowX: 'auto'
                }}>
                  <pre style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: 'var(--text)',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* ⚡ VIRAL HOOK (The NPM Snippet) */}
              <JsonApiNpmSnippet symbol={normalizedSymbol} />
            </div>

            {/* RIGHT COL: Monetization & Use Cases */}
            <div>
              {/* 💰 MONETIZATION: Sovereign Sync Upsell */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <h3 style={{
                  color: 'var(--text)',
                  fontWeight: '700',
                  fontSize: '20px',
                  marginBottom: '12px',
                  margin: 0
                }}>
                  Need to archive this data?
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  Don't rely on ephemeral endpoints. Automatically sync <strong>{normalizedSymbol}.json</strong> updates to your private Google Drive for backtesting and compliance.
                </p>
                <Link
                  href="/sponsor?utm_source=json_api&utm_medium=sovereign_cta"
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    padding: '12px 24px',
                    background: '#10b981',
                    color: '#000000',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                  }}
                >
                  Enable Sovereign Sync
                </Link>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '16px',
                  margin: '16px 0 0 0'
                }}>
                  Includes unlimited API calls & historical CSV exports.
                </p>
              </div>

              {/* SEO BREADCRUMBS / SCHEMA */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{
                  color: 'var(--text)',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Dataset Specifications
                </h4>
                <ul style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <strong style={{ color: 'var(--text)' }}>Format:</strong> Standardized JSON (OHLCV)
                  </li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <strong style={{ color: 'var(--text)' }}>Frequency:</strong> End-of-Day (EOD) + Real-time delay
                  </li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <strong style={{ color: 'var(--text)' }}>Adjustments:</strong> Split-adjusted, Dividend-adjusted
                  </li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <strong style={{ color: 'var(--text)' }}>Source:</strong> Multi-provider aggregation (AlphaVantage, Yahoo fallback)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// ISR configuration - 7 day revalidation
export const revalidate = 604800;
