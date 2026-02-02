import React from 'react';
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
              name: 'Founders Club Lifetime License',
              price: '100.00',
              priceCurrency: 'GBP',
              availability: 'https://schema.org/LimitedAvailability',
              description: 'One-time payment of £100. Lifetime access with Sovereign Sync (Google Drive), unlimited API access, priority support, and permanent Founder badge.',
              url: 'https://www.pocketportfolio.app/sponsor',
              priceValidUntil: '2026-12-31'
            }
          ],
          description: `Free, privacy-first portfolio tracker for ${normalizedSymbol}. No login required. Upgrade to Founder's Club (£100 lifetime) for Sovereign Sync and unlimited API access.`,
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

