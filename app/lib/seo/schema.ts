/**
 * SEO Schema Functions
 * Provides structured data for search engines
 */

export interface HomePageSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo?: {
    '@type': string;
    url: string;
  };
  sameAs?: string[];
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

/**
 * Generate structured data for the home page
 */
export function getHomePageSchema(): HomePageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pocket Portfolio',
    description: 'The privacy-first portfolio tracker that turns Google Drive into your personal database. Edit trades in JSON/Excel, own your data, and sync bidirectionally. No vendor lock-in.',
    url: 'https://www.pocketportfolio.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg'
    },
    sameAs: [
      'https://github.com/PocketPortfolio/Financialprofilenetwork',
      'https://twitter.com/pocketportfolio',
      'https://discord.gg/Ch9PpjRzwe',
      'https://dev.to/pocketportfolioapp',
      'https://coderlegion.com/5738/welcome-to-coderlegion-22s'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.pocketportfolio.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Render JSON-LD structured data
 */
export function renderJsonLd(schema: HomePageSchema): { __html: string } {
  return {
    __html: JSON.stringify(schema, null, 2)
  };
}

/**
 * Generate structured data for ticker pages
 */
export function getTickerSchema(symbol: string, name: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${symbol} - ${name}`,
    description: description || `Track ${symbol} performance and analysis`,
    identifier: symbol,
    category: 'Financial Product',
    provider: {
      '@type': 'Organization',
      name: 'Pocket Portfolio'
    }
  };
}

/**
 * Generate structured data for broker import pages
 */
export function getBrokerSchema(brokerName: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Import from ${brokerName}`,
    description: description || `Import your ${brokerName} trades to Pocket Portfolio`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}
