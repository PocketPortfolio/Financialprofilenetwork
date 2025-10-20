import { MetadataRoute } from 'next';

// Popular tickers for static generation
const POPULAR_TICKERS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
  'JPM', 'BAC', 'WMT', 'JNJ', 'PG', 'V', 'MA', 'DIS', 'ADBE', 'CRM',
  'PYPL', 'ABNB', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'SQ', 'ROKU', 'ZM', 'PTON',
  'COIN', 'HOOD', 'SOFI', 'PLTR', 'RBLX', 'GME', 'AMC', 'BB', 'NOK', 'SPCE',
  'ARKK', 'QQQ', 'SPY', 'VTI', 'VOO', 'IVV', 'SCHD', 'DIA', 'IWM', 'EFA',
  'BTC-USD', 'ETH-USD', 'ADA-USD', 'DOT-USD', 'LINK-USD', 'UNI-USD', 'AAVE-USD', 'SOL-USD', 'MATIC-USD', 'AVAX-USD'
];

// Supported brokers
const SUPPORTED_BROKERS = [
  'etoro', 'trading212', 'coinbase', 'interactive-brokers', 'revolut',
  'freetrade', 'robinhood', 'webull', 'schwab', 'fidelity'
];

// Static routes
const STATIC_ROUTES = [
  {
    url: 'https://pocketportfolio.app',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: 'https://pocketportfolio.app/landing',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://pocketportfolio.app/dashboard',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: 'https://pocketportfolio.app/live',
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  },
  {
    url: 'https://pocketportfolio.app/join',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: 'https://pocketportfolio.app/csv-portfolio-tracker',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: 'https://pocketportfolio.app/reliable-stock-prices',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
  {
    url: 'https://pocketportfolio.app/investment-tracking-guide',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [...STATIC_ROUTES];

  // Add ticker pages
  POPULAR_TICKERS.forEach((ticker) => {
    sitemap.push({
      url: `https://pocketportfolio.app/s/${ticker.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Add broker import pages
  SUPPORTED_BROKERS.forEach((broker) => {
    sitemap.push({
      url: `https://pocketportfolio.app/import/${broker}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return sitemap;
}