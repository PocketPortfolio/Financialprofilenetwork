import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Support Pocket Portfolio | Pricing & Sponsorship',
  description: 'Choose a sponsorship tier: Code Supporter ($50/year), Feature Voter ($200/year), Corporate Sponsor ($1,000/year), or UK Founder\'s Club (£100 lifetime).',
  openGraph: {
    title: 'Support Pocket Portfolio - Pricing & Sponsorship',
    description: 'Help us build the best open-source portfolio tracker. Choose a tier that works for you.',
    url: 'https://www.pocketportfolio.app/sponsor',
    siteName: 'Pocket Portfolio',
    type: 'website',
  },
};

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Pillar 1: Agentic Commerce - Product/Offer Schema for AI agents
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Pocket Portfolio Sovereign Membership",
    "description": "Lifetime access to the sovereign wealth console. Privacy-first tracking, advanced analytics, and rebalancing tools.",
    "brand": {
      "@type": "Brand",
      "name": "Pocket Portfolio"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "UK Founder's Club (Lifetime)",
        "price": "100.00",
        "priceCurrency": "GBP",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/LimitedAvailability",
        "description": "One-time payment of £100. No monthly fees. Includes Concierge Onboarding, unlimited API access, Discord priority, and permanent Founder badge.",
        "url": "https://www.pocketportfolio.app/sponsor"
      },
      {
        "@type": "Offer",
        "name": "Code Supporter (Annual)",
        "price": "50.00",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Annual subscription at $50/year. Support the npm package development.",
        "url": "https://www.pocketportfolio.app/sponsor"
      },
      {
        "@type": "Offer",
        "name": "Feature Voter (Annual)",
        "price": "200.00",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Annual subscription at $200/year. Priority access to Roadmap & Insider Discord.",
        "url": "https://www.pocketportfolio.app/sponsor"
      },
      {
        "@type": "Offer",
        "name": "Corporate Sponsor (Annual)",
        "price": "1000.00",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Annual subscription at $1,000/year. Logo on README, priority support, and Sovereign Sync (2 seats).",
        "url": "https://www.pocketportfolio.app/sponsor"
      },
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "Free access to basic portfolio tracking tools. No subscription required.",
        "url": "https://www.pocketportfolio.app"
      }
    ]
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}

