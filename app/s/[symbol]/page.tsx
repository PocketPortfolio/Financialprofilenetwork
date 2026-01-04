import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTickerMetadata, getAllTickers } from '@/app/lib/pseo/data';
import { generateTickerContent } from '@/app/lib/pseo/content';
import { generateFAQStructuredData } from '@/app/lib/pseo/content';
import StructuredData from '@/app/components/StructuredData';
import TickerPageContent from '@/app/components/TickerPageContent';


// Server-side quote fetching for SEO (runs during ISR revalidation)
async function fetchQuoteData(symbol: string) {
  try {
    // During build time, skip API call (API routes aren't available)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build';
    
    // Skip API call during build, only fetch during ISR revalidation
    if (isBuildTime || typeof window !== 'undefined') {
      return null;
    }
    
    // Fetch from API during ISR revalidation
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app';
    const response = await fetch(`${baseUrl}/api/quote?symbols=${symbol}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (response.ok) {
      const data = await response.json();
      const quote = Array.isArray(data) ? data[0] : data;
      if (quote) {
        return {
          price: quote.price,
          change: quote.change,
          changePct: quote.changePct,
          currency: quote.currency || 'USD',
        };
      }
    }
  } catch (error) {
    // Silently fail - client-side will handle it
    // This is expected during build time or if API is unavailable
  }
  return null;
}

// Generate static params for popular tickers (ISR will handle the rest)
export async function generateStaticParams() {
  // Pre-generate top 500 most popular REAL tickers for faster initial load
  // ISR will handle the remaining on-demand
  // Growth Mandate: Only real tickers = real traffic
  const allTickers = getAllTickers();
  const popularTickers = allTickers.slice(0, 500); // Reduced from 1000 since we have ~1000-1200 real tickers total
  
  return popularTickers.map((symbol) => ({
    symbol: symbol.toLowerCase().replace(/-/g, ''), // Remove dashes for URL
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const metadata = await getTickerMetadata(symbol);
  
  if (!metadata) {
    return {
      title: `${symbol} Price & Dividends (No Login Required) - Pocket Portfolio`,
      description: `Analyze ${symbol} stock without signing up. Import your CSV from Robinhood, eToro, or Fidelity directly in the browser. Privacy-first.`,
    };
  }
  
  const content = await generateTickerContent(symbol, metadata);
  
  return {
    title: content.title,
    description: content.description,
    keywords: metadata.keywords.join(', '),
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'website',
      url: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/s/${symbol.toLowerCase()}`,
    },
  };
}

// Main component
export default async function SymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  // Normalize symbol (remove dashes, handle crypto pairs)
  const normalizedSymbol = resolvedParams.symbol.toUpperCase().replace(/-/g, '');
  const metadata = await getTickerMetadata(normalizedSymbol);
  
  // Fetch quote data server-side for SEO (only during ISR revalidation, not during build)
  const initialQuoteData = await fetchQuoteData(normalizedSymbol);
  
  // For generated tickers that don't have metadata, still generate a page
  // This allows all 10K+ pages to be accessible
  if (!metadata) {
    // Generate basic metadata for unknown tickers
    const basicMetadata = {
      symbol: normalizedSymbol,
      name: `${normalizedSymbol} Inc.`,
      exchange: 'NYSE',
      description: `Export ${normalizedSymbol} historical data to JSON or import ${normalizedSymbol} positions from Robinhood, Fidelity, eToro CSV. Free portfolio integration API.`,
      keywords: [normalizedSymbol, `${normalizedSymbol} stock`, `${normalizedSymbol} JSON export`, `${normalizedSymbol} CSV import`],
      relatedTickers: [],
      faqs: [
        {
          question: `What is ${normalizedSymbol}?`,
          answer: `${normalizedSymbol} is a stock you can integrate into your portfolio using Pocket Portfolio's free portfolio integration platform.`
        },
        {
          question: `How do I track ${normalizedSymbol}?`,
          answer: `Import your ${normalizedSymbol} trades from any supported broker (Robinhood, Fidelity, eToro, etc.) via CSV import, or export ${normalizedSymbol} historical data to JSON format.`
        }
      ],
      contentTemplate: 'default'
    };
    const content = await generateTickerContent(normalizedSymbol, basicMetadata as any);
    const faqStructuredData = generateFAQStructuredData(basicMetadata.faqs);
    
    return (
      <>
        <StructuredData type="FinancialProduct" data={content.structuredData} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
        <div style={{
          background: 'var(--bg)',
          minHeight: '100vh'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '32px 16px'
          }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              {content.h1}
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              {content.description}
            </p>
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                Track {normalizedSymbol} in Your Portfolio
              </h2>
              <a
                href={content.cta.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--accent-warm)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                {content.cta.text}
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Main content generation for known tickers
  const content = await generateTickerContent(normalizedSymbol, metadata);
  const faqStructuredData = generateFAQStructuredData(metadata.faqs);
  
  return (
    <TickerPageContent
      normalizedSymbol={normalizedSymbol}
      metadata={metadata}
      content={content}
      faqStructuredData={faqStructuredData}
      initialQuoteData={initialQuoteData}
    />
  );
}

// ISR configuration - revalidate every 6 hours for SEO freshness
export const revalidate = 21600; // 6 hours






