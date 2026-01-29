/**
 * PROGRAMMATIC RISK PAGES - Week 1 SEO Initiative
 * 
 * Strategy: Generate 15,457 unique landing pages for "Track [TICKER] Risk" queries
 * Example: /tools/track-nvda-risk, /tools/track-tsla-risk
 * 
 * URL Format: /tools/track-{ticker}-risk -> middleware rewrites to /tools/track/{ticker}
 * Route folder: app/tools/track/[ticker]/page.tsx (matches rewritten path exactly)
 */

import { Metadata } from 'next';
import { getAllTickers } from '@/app/lib/pseo/data';
import RiskCalculatorPrefilled from './RiskCalculatorPrefilled';

// Helper to map URL-safe ticker back to actual ticker symbol
// URLs remove dots (BRK.B -> brkb), this maps them back
function mapUrlTickerToActualTicker(urlTicker: string, allTickers: string[]): string {
  const normalized = urlTicker.toUpperCase();
  // First try exact match (for tickers without dots)
  if (allTickers.includes(normalized)) {
    return normalized;
  }
  // Try specific known patterns first
  if (normalized === 'BRKB' && allTickers.includes('BRK.B')) {
    return 'BRK.B';
  }
  if (normalized === 'BFBR' && allTickers.includes('BF.B')) {
    return 'BF.B';
  }
  // Try generic pattern: last letter becomes dot (ABC -> AB.C)
  // Only if the result exists in ticker list
  if (normalized.length >= 2) {
    const withDot = normalized.slice(0, -1) + '.' + normalized.slice(-1);
    if (allTickers.includes(withDot)) {
      return withDot;
    }
  }
  // If no match found, return normalized (will show error in UI)
  return normalized;
}

// Generate static params for top 500 tickers (ISR handles the rest)
export async function generateStaticParams() {
  try {
    const allTickers = getAllTickers();
    const popularTickers = allTickers.slice(0, 500);
    
    // URL format after rewrite: /tools/track/aapl -> ticker param = "aapl"
    return popularTickers.map((symbol) => ({
      ticker: symbol.toLowerCase().replace(/-/g, ''),
    }));
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    return [{ ticker: 'aapl' }]; // Fallback
  }
}

// Generate SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const tickerParam = resolvedParams?.ticker || '';
    const ticker = tickerParam.toUpperCase() || 'STOCK';
    
    const title = `Track ${ticker} Risk & Portfolio Beta - Free Risk Calculator | Pocket Portfolio`;
    const description = `Calculate ${ticker} portfolio risk and Beta score instantly. Free tool to analyze ${ticker} volatility exposure. No login required.`;
    
    return {
      title,
      description,
      keywords: `${ticker}, portfolio risk, beta calculator, volatility analysis, investment risk`,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://www.pocketportfolio.app/tools/track-${ticker.toLowerCase()}-risk`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/tools/track-${ticker.toLowerCase()}-risk`,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);
    return {
      title: 'Track Stock Risk - Free Risk Calculator | Pocket Portfolio',
      description: 'Calculate portfolio risk and Beta score instantly.',
    };
  }
}

// Main page component
export default async function TrackTickerRiskPage({ params }: { params: Promise<{ ticker: string }> }) {
  try {
    const resolvedParams = await params;
    const tickerParam = resolvedParams?.ticker || '';
    // Map URL-safe ticker back to actual ticker symbol
    const allTickers = getAllTickers();
    const ticker = mapUrlTickerToActualTicker(tickerParam, allTickers);
    
    return (
      <>
        {/* SEO Schema - SoftwareApplication with pricing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: `Pocket Portfolio ${ticker} Risk Calculator`,
              description: `Free tool to calculate ${ticker} portfolio risk and Beta score. Analyze volatility exposure instantly.`,
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: [
                {
                  '@type': 'Offer',
                  name: 'Founders Club Lifetime License',
                  price: '100.00',
                  priceCurrency: 'GBP',
                  availability: 'https://schema.org/LimitedAvailability',
                  description: 'One-time payment of £100. Lifetime access with Sovereign Sync (Google Drive), unlimited API access, priority support, and permanent Founder badge.',
                  url: 'https://www.pocketportfolio.app/sponsor',
                  priceValidUntil: '2026-12-31'
                },
                {
                  '@type': 'Offer',
                  name: 'Free Tier',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  description: 'Free portfolio risk calculator with no login required.'
                }
              ],
              featureList: [
                'Portfolio Beta Calculation',
                'Risk Analysis',
                'Sector Exposure Preview',
                `${ticker} Volatility Analysis`
              ],
              author: {
                '@type': 'Organization',
                name: 'Pocket Portfolio',
                url: 'https://www.pocketportfolio.app'
              },
              url: `https://www.pocketportfolio.app/tools/track-${ticker.toLowerCase()}-risk`
            })
          }}
        />
        
        {/* FAQ Schema for AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `What is ${ticker} portfolio risk?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${ticker} portfolio risk measures how much your investment portfolio's value moves relative to the market. A Beta above 1.0 means ${ticker} is more volatile than the market, while below 1.0 means less volatile.`
                  }
                },
                {
                  '@type': 'Question',
                  name: `How do I calculate ${ticker} Beta?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Use our free Risk Calculator to instantly calculate ${ticker} Beta. Enter ${ticker} along with your other holdings, and we'll compute your portfolio's weighted average Beta score.`
                  }
                },
                {
                  '@type': 'Question',
                  name: `Is ${ticker} a high-risk investment?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${ticker}'s risk level depends on its Beta score. A Beta above 1.3 indicates high volatility, while below 0.8 indicates lower volatility. Use our calculator to see ${ticker}'s current Beta and how it affects your portfolio.`
                  }
                }
              ]
            })
          }}
        />
        
        <RiskCalculatorPrefilled 
          ticker={ticker}
          tickerName={`${ticker} stock`}
        />
      </>
    );
  } catch (error: any) {
    console.error('[TRACK-TICKER] Error in route handler:', error);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Error Loading Page</h1>
        <p>Error: {error?.message || 'Unknown error'}</p>
        <pre style={{ textAlign: 'left', marginTop: '20px' }}>
          {error?.stack || 'No stack trace'}
        </pre>
      </div>
    );
  }
}

// Route segment config - Match working route pattern
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

