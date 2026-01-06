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

/**
 * Generate Dataset schema for JSON API pages
 * This helps AI agents and search engines recognize our data as a public dataset
 */
export function getDatasetSchema(
  symbol: string,
  name?: string,
  exchange?: string
) {
  const normalizedSymbol = symbol.toUpperCase();
  const symbolLower = normalizedSymbol.toLowerCase();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${normalizedSymbol} Historical Stock Data`,
    description: `Free JSON API providing historical price, volume, and dividend data for ${normalizedSymbol}${name ? ` (${name})` : ''}. No API key required.`,
    url: `https://www.pocketportfolio.app/s/${symbolLower}/json-api`,
    identifier: `https://www.pocketportfolio.app/api/tickers/${normalizedSymbol}/json`,
    keywords: [
      `${normalizedSymbol} historical data`,
      `${normalizedSymbol} JSON API`,
      `${normalizedSymbol} stock data`,
      'free stock data API',
      'historical price data',
      'JSON financial data'
    ],
    license: 'https://www.pocketportfolio.app',
    creator: {
      '@type': 'Organization',
      name: 'Pocket Portfolio',
      url: 'https://www.pocketportfolio.app'
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `https://www.pocketportfolio.app/api/tickers/${normalizedSymbol}/json`,
        description: `JSON endpoint for ${normalizedSymbol} historical data`
      }
    ],
    temporalCoverage: '2000-01-01/..',
    spatialCoverage: {
      '@type': 'Place',
      name: exchange || 'Global'
    },
    about: {
      '@type': 'FinancialProduct',
      name: name || normalizedSymbol,
      tickerSymbol: normalizedSymbol
    }
  };
}
