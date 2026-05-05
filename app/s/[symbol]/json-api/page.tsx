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
import JsonApiLivePreview from '@/app/components/JsonApiLivePreview';
import TickerCsvDownload from '@/app/components/TickerCsvDownload';
import BridgeToTerminalCTA from '@/app/components/BridgeToTerminalCTA';
import { jsonApiBridgeCopy } from '@/app/lib/seo/jsonApiInternalLinks';
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
  const metaVariant = process.env.NEXT_PUBLIC_GSC_META_VARIANT === 'B' ? 'B' : 'A';
  const metaTestSet = new Set(['xvlxx', 'vhxxx', 'vvlxx', 'xinxx', 'nse', 'spy', 'qqq', 'aapl']);
  const inMetaTest = metaVariant === 'B' && metaTestSet.has(symbol.toLowerCase().replace(/-/g, ''));
  const metadata = await getTickerMetadata(symbol);

  if (symbol.replace(/-/g, '') === 'NSE') {
    if (inMetaTest) {
      return {
        title: 'NSE JSON Endpoint (REST API) + CSV Export | Pocket Portfolio',
        description:
          'Free NSE JSON endpoint (REST API) + CSV export for historical data. Copy‑paste examples. No API key. No login. Stateless + local-first workflow.',
        openGraph: {
          title: 'NSE JSON Endpoint (REST API) + CSV Export | Pocket Portfolio',
          description:
            'Free NSE JSON endpoint (REST API) + CSV export. No API key. No login. Stateless + local-first workflow.',
          type: 'website',
          url: 'https://www.pocketportfolio.app/s/nse/json-api',
        },
        alternates: {
          canonical: 'https://www.pocketportfolio.app/s/nse/json-api',
        },
      };
    }
    return {
      title: 'NSE Historical Data & CSV Export | Pocket Portfolio',
      description:
        'Download NSE historical CSVs instantly. No login required. Parse normalized JSON data via our free local-first API endpoint for National Stock Exchange tickers.',
      openGraph: {
        title: 'NSE Historical Data & CSV Export | Pocket Portfolio',
        description:
          'Download NSE historical CSVs instantly. No login required. Parse normalized JSON via our free local-first API endpoint.',
        type: 'website',
        url: 'https://www.pocketportfolio.app/s/nse/json-api',
      },
      alternates: {
        canonical: 'https://www.pocketportfolio.app/s/nse/json-api',
      },
    };
  }
  
  if (!metadata) {
    return {
      title: inMetaTest
        ? `${symbol} JSON Endpoint (REST API) + CSV Export | Pocket Portfolio`
        : `${symbol} Historical Data & CSV Export | Pocket Portfolio`,
      description: inMetaTest
        ? `Free ${symbol} JSON endpoint (REST API) + CSV export for historical data. No API key. No login. Copy‑paste examples.`
        : `Download ${symbol} historical CSVs instantly. No login required. Parse normalized JSON data via our free local-first API endpoint.`,
    };
  }

  if (inMetaTest) {
    return {
      title: `${symbol} JSON Endpoint (REST API) + CSV Export | Pocket Portfolio`,
      description: `Free ${symbol} JSON endpoint (REST API) + CSV export for historical data. No API key. No login. Examples for ${metadata.name} (${symbol}).`,
      keywords: [
        `${symbol} JSON endpoint`,
        `${symbol} REST API`,
        `${symbol} historical data JSON`,
        `${symbol} historical data CSV`,
        `${symbol} price API`,
        `${symbol} csv export endpoint`,
        `${symbol} json api example`,
        `download ${symbol} JSON`,
        `download ${symbol} CSV`,
      ],
      openGraph: {
        title: `${symbol} JSON Endpoint (REST API) + CSV Export | Pocket Portfolio`,
        description: `Free ${symbol} JSON endpoint (REST API) + CSV export. No API key. No login. Copy‑paste examples.`,
        type: 'website',
        url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}/json-api`,
      },
    };
  }

  return {
    title: `${symbol} Historical Data & CSV Export | Pocket Portfolio`,
    description: `Download ${metadata.name} (${symbol}) historical CSVs instantly. No login required. Parse normalized JSON data via our free local-first API endpoint.`,
    keywords: [
      `${symbol} historical data json format`,
      `${symbol} historical data csv`,
      `${symbol} stock historical data json`,
      `${symbol} CSV download`,
      `${symbol} JSON API`,
      `${symbol} CSV API`,
      `${symbol} JSON export`,
      `${symbol} CSV export`,
      `${symbol} historical data JSON`,
      `${symbol} historical data CSV`,
      `${symbol} stock data API`,
      `${symbol} price API`,
      `export ${symbol} to JSON`,
      `export ${symbol} to CSV`,
      `download ${symbol} JSON data`,
      `download ${symbol} CSV data`
    ],
    openGraph: {
      title: `${symbol} Historical Data & CSV Export | Pocket Portfolio`,
      description: `Download ${metadata.name} (${symbol}) historical CSVs instantly. No login required. Free local-first JSON API.`,
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
  const bridgeVariant = process.env.NEXT_PUBLIC_BRIDGE_CTA_VARIANT === 'B' ? 'B' : 'A';
  const jsonApiBridge = jsonApiBridgeCopy(normalizedSymbol, bridgeVariant);
  const metadata = await getTickerMetadata(normalizedSymbol);
  
  // Fetch historical data and quote for unique content
  const tickerData = await fetchTickerData(normalizedSymbol);
  const quoteData = await fetchQuoteData(normalizedSymbol);
  
  // 🧠 GENERATE UNIQUE METADATA (The SEO Fix)
  const stats = getDatasetStats(tickerData?.data || null);
  const uniqueDescription = stats 
    ? `Access ${stats.count} data points for ${normalizedSymbol} spanning ${stats.years} years (${stats.startYear}–${stats.lastUpdate}). Optimized JSON format (${stats.sizeKB} KB).`
    : `Instant, normalized JSON data for ${normalizedSymbol}. Free API for developers. No login required.`;
  
  // Generate Dataset schema for AI agents and search engines
  const datasetSchema = getDatasetSchema(
    normalizedSymbol,
    metadata?.name,
    metadata?.exchange
  );

  /** Crawlers and no-JS clients still see a factual JSON excerpt in View Source. */
  const indexableJsonSample = JSON.stringify(
    {
      symbol: normalizedSymbol,
      note: 'Static sample for indexers without JavaScript',
      sample_rows: tickerData?.data?.slice(0, 2) ?? [],
      quote: quoteData
        ? { price: quoteData.price, changePct: quoteData.changePct }
        : null,
      data_points: stats?.count ?? null,
    },
    null,
    2
  );

  // Prepare initial data for client-side component
  // Client component will fetch live data if server data is unavailable

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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 16px',
          color: 'var(--text)',
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px 48px',
        color: 'var(--text)',
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px 20px 28px',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, transparent 48%)',
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
              color: 'var(--accent-warm)',
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

          <BridgeToTerminalCTA
            title={jsonApiBridge.title}
            subtitle={jsonApiBridge.subtitle}
            href={`/dashboard?utm_source=json_api&utm_medium=bridge_cta&utm_campaign=activation&utm_content=${encodeURIComponent(normalizedSymbol.toLowerCase())}`}
            primaryLabel={jsonApiBridge.primaryLabel}
            secondaryHref="/learn/local-first"
            secondaryLabel="How local-first works"
            analytics={{
              source: 'json_api',
              contextId: normalizedSymbol.toLowerCase(),
              bridgeVariant,
              bridgeHook: jsonApiBridge.hook,
              bridgeSurface: 'json_api',
            }}
          />
          
          {/* CROSS-LINK (Internal SEO Juice) */}
          <div style={{ marginBottom: '32px' }}>
            <Link 
              href={`/s/${normalizedSymbol.toLowerCase()}`} 
              style={{
                color: 'var(--accent-warm)',
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

          {/* CSV Download Option */}
          <div style={{
            background: 'var(--card)',
            border: '2px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Download as CSV
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Prefer CSV format? Download {normalizedSymbol} historical data as a CSV file 
              for Excel, Google Sheets, or any spreadsheet application.
            </p>
            <TickerCsvDownload symbol={normalizedSymbol} name={metadata?.name} />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            marginTop: '32px',
            // Mobile CWV: allow below-the-fold content to skip initial render work.
            contentVisibility: 'auto',
            containIntrinsicSize: '1000px'
          }}>
            {/* LEFT COL: Live Preview & NPM Hook */}
            <div>
              <noscript>
                <pre
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '16px',
                    overflow: 'auto',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    lineHeight: 1.6,
                    color: 'var(--text)',
                  }}
                >
                  {indexableJsonSample}
                </pre>
              </noscript>
              {/* 💻 LIVE PREVIEW (The Trust Signal) - Client-side component fetches live data */}
              <JsonApiLivePreview
                symbol={normalizedSymbol}
                initialPrice={quoteData?.price ?? null}
                initialChangePct={quoteData?.changePct ?? null}
                initialHistorySample={tickerData?.data?.slice(0, 2) ?? []}
              />

              {/* ⚡ VIRAL HOOK (The NPM Snippet) */}
              <JsonApiNpmSnippet symbol={normalizedSymbol} />
            </div>

            {/* RIGHT COL: Monetization & Use Cases */}
            <div>
              {/* 💰 MONETIZATION: Sovereign Sync Upsell */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.55) 100%)',
                border: '1px solid var(--border-warm)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
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
                    background: 'var(--accent-warm)',
                    color: '#0a0a0a',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.55)',
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
                border: '2px solid var(--border-warm)',
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
    </>
  );
}

// ISR configuration - 7 day revalidation
export const revalidate = 604800;
