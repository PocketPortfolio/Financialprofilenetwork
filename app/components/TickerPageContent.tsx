import React from 'react';
import Link from 'next/link';
import StructuredData from './StructuredData';
import MobileTickerView from './MobileTickerView';
import DesktopTerminalView from './DesktopTerminalView';

interface TickerPageContentProps {
  normalizedSymbol: string;
  metadata: any;
  content: any;
  faqStructuredData: any;
  initialQuoteData: any;
}

export default function TickerPageContent({
  normalizedSymbol,
  metadata,
  content,
  faqStructuredData,
  initialQuoteData
}: TickerPageContentProps) {
  const props = {
    normalizedSymbol,
    metadata,
    content,
    faqStructuredData,
    initialQuoteData
  };

  return (
    <>
      {/* Structured Data - Rendered once for both views */}
      <StructuredData type="FinancialProduct" data={content.structuredData} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Pocket Portfolio',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: [
            {
              '@type': 'Offer',
              name: 'Free Tier',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description: 'Free portfolio tracking with no login required. Privacy-first local-first architecture.'
            },
            {
              '@type': 'Offer',
              name: 'Founders Club (Annual or Monthly)',
              price: '100.00',
              priceCurrency: 'GBP',
              availability: 'https://schema.org/LimitedAvailability',
              description: '£12/mo or £100/yr. Sovereign Sync (Google Drive), unlimited API access, priority support, and permanent Founder badge. Cancel anytime.',
              url: 'https://www.pocketportfolio.app/sponsor',
              priceValidUntil: '2026-12-31'
            }
          ],
          description: `Free, privacy-first portfolio tracker for ${normalizedSymbol}. No login required. Upgrade to Founder's Club (£12/mo or £100/yr) for Sovereign Sync and unlimited API access.`,
          url: `https://www.pocketportfolio.app/s/${normalizedSymbol.toLowerCase()}`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '200'
          }
        }) }}
      />
      
      {/* CSS-First Bifurcation: Zero CLS */}
      {/* Both views in DOM - CSS handles visibility instantly */}
      {/* Browser hides one before paint, no layout shift */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ticker-mobile-view { display: block; }
        .ticker-desktop-view { display: none; }
        @media (min-width: 1024px) {
          .ticker-mobile-view { display: none !important; }
          .ticker-desktop-view { display: block !important; }
        }
      ` }} />

      {/* Developer wedge: pass authority to JSON API surfaces */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '12px auto 0',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.07) 0%, transparent 60%)',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 220 }}>
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                color: 'var(--accent-warm)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                marginBottom: '4px',
              }}
            >
              Developer API
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              JSON endpoint + CSV export for {normalizedSymbol}. No API key.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href={`/s/${normalizedSymbol.toLowerCase()}/json-api`}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid var(--border-warm)',
                background: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--accent-warm)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              View JSON API page →
            </Link>
            <a
              href={`/api/tickers/${encodeURIComponent(normalizedSymbol)}/json?range=max`}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              Open JSON
            </a>
            <a
              href={`/api/tickers/${encodeURIComponent(normalizedSymbol)}/csv?range=max`}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              CSV
            </a>
          </div>
        </div>
      </div>
      
      {/* Mobile: Visible < 1024px */}
      <div className="ticker-mobile-view">
        <MobileTickerView {...props} />
      </div>

      {/* Desktop: Visible >= 1024px */}
      <div className="ticker-desktop-view">
        <DesktopTerminalView {...props} />
      </div>
    </>
  );
}

