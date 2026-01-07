/**
 * pSEO Infrastructure - Data Layer
 * Centralized data source for ticker, exchange, and sector metadata
 * 
 * Architecture: This can be extended to use Firestore or external APIs
 * For now, using static data with ability to fetch from most-traded API
 */

import { TickerMetadata, ExchangeMetadata, SectorMetadata } from './types';
import { getAllTickersExpanded } from './ticker-generator';

// Popular tickers - can be expanded to 10K+
// In production, this would be fetched from Firestore or external API
export const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
  'UNH', 'JNJ', 'V', 'JPM', 'WMT', 'PG', 'MA', 'HD', 'DIS', 'BAC',
  'ADBE', 'NFLX', 'CRM', 'PYPL', 'INTC', 'CMCSA', 'PEP', 'TMO', 'COST',
  'AVGO', 'ABT', 'CSCO', 'NKE', 'MRK', 'ACN', 'TXN', 'QCOM', 'DHR',
  'VZ', 'LIN', 'NEE', 'BMY', 'PM', 'HON', 'UPS', 'RTX', 'LOW', 'SPGI',
  'INTU', 'AMGN', 'BKNG', 'AMAT', 'DE', 'ADI', 'GE', 'CAT', 'GS',
  'AXP', 'SYK', 'ISRG', 'BLK', 'TJX', 'GILD', 'MDT', 'ZTS', 'ADP',
  'CB', 'CI', 'ELV', 'EQIX', 'FI', 'ICE', 'KLAC', 'MCHP', 'MNST',
  'NXPI', 'ODFL', 'PCAR', 'SNPS', 'SPLK', 'TTD', 'VRSK', 'WDAY', 'ZBRA'
];

// Exchange metadata
export const EXCHANGES: Record<string, ExchangeMetadata> = {
  'NASDAQ': {
    code: 'NASDAQ',
    name: 'NASDAQ Stock Market',
    region: 'US',
    country: 'United States',
    description: 'The NASDAQ Stock Market is the second-largest stock exchange in the world by market capitalization. It specializes in technology, biotechnology, and growth companies.',
    popularTickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'],
    keywords: ['NASDAQ', 'tech stocks', 'growth stocks', 'technology exchange', 'US stocks'],
    faqs: [
      {
        question: 'What is NASDAQ?',
        answer: 'NASDAQ is the second-largest stock exchange in the world, known for listing technology and growth companies.'
      },
      {
        question: 'How do I track NASDAQ stocks in Pocket Portfolio?',
        answer: 'Import your trades from any supported broker, and Pocket Portfolio will automatically track your NASDAQ positions with real-time price data.'
      }
    ]
  },
  'NYSE': {
    code: 'NYSE',
    name: 'New York Stock Exchange',
    region: 'US',
    country: 'United States',
    description: 'The New York Stock Exchange is the world\'s largest stock exchange by market capitalization. It lists many blue-chip and established companies.',
    popularTickers: ['JPM', 'JNJ', 'V', 'WMT', 'PG', 'MA', 'HD', 'DIS', 'BAC'],
    keywords: ['NYSE', 'blue chip stocks', 'large cap stocks', 'US stocks', 'New York Stock Exchange'],
    faqs: [
      {
        question: 'What is the NYSE?',
        answer: 'The New York Stock Exchange is the world\'s largest stock exchange, home to many established blue-chip companies.'
      },
      {
        question: 'Can I track NYSE stocks in Pocket Portfolio?',
        answer: 'Yes! Pocket Portfolio supports tracking stocks from all major exchanges including NYSE. Simply import your trades and we\'ll track your positions.'
      }
    ]
  },
  'LSE': {
    code: 'LSE',
    name: 'London Stock Exchange',
    region: 'UK',
    country: 'United Kingdom',
    description: 'The London Stock Exchange is one of the oldest and largest stock exchanges in the world, listing companies from the UK and internationally.',
    popularTickers: ['BP', 'GSK', 'HSBC', 'RIO', 'BT', 'VOD'],
    keywords: ['LSE', 'London Stock Exchange', 'UK stocks', 'FTSE', 'British stocks'],
    faqs: [
      {
        question: 'What is the LSE?',
        answer: 'The London Stock Exchange is one of the world\'s oldest stock exchanges, listing companies primarily from the UK.'
      }
    ]
  }
};

// Sector metadata
export const SECTORS: Record<string, SectorMetadata> = {
  'Technology': {
    name: 'Technology',
    description: 'Technology sector includes companies involved in software, hardware, semiconductors, and IT services.',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'ORCL', 'CRM', 'ADBE'],
    keywords: ['tech stocks', 'technology sector', 'software stocks', 'semiconductor stocks']
  },
  'Finance': {
    name: 'Financial Services',
    description: 'Financial services sector includes banks, insurance companies, and financial technology firms.',
    tickers: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'MA', 'V'],
    keywords: ['finance stocks', 'banking stocks', 'financial services', 'fintech']
  },
  'Healthcare': {
    name: 'Healthcare',
    description: 'Healthcare sector includes pharmaceutical companies, medical device manufacturers, and healthcare services.',
    tickers: ['JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'DHR', 'SYK', 'ISRG'],
    keywords: ['healthcare stocks', 'pharmaceutical stocks', 'medical stocks', 'biotech']
  }
};

/**
 * Get sector for a ticker symbol
 */
export function getPositionSector(ticker: string): string {
  const upperTicker = ticker.toUpperCase();
  for (const [sectorName, sectorData] of Object.entries(SECTORS)) {
    if (sectorData.tickers.includes(upperTicker)) {
      return sectorName;
    }
  }
  return 'General';
}

/**
 * Get industry classification (simplified - can be extended)
 */
export function getPositionIndustry(ticker: string): string {
  // This is a simplified implementation
  // In production, this would come from a comprehensive industry database
  const sector = getPositionSector(ticker);
  
  const industryMap: Record<string, string> = {
    'Technology': 'Information Technology',
    'Finance': 'Financial Services',
    'Healthcare': 'Healthcare',
  };
  
  return industryMap[sector] || 'General';
}

// Ticker metadata generator - fetches from API or uses static data
export async function getTickerMetadata(symbol: string): Promise<TickerMetadata | null> {
  const upperSymbol = symbol.toUpperCase();
  
  // In server context, try to fetch from most-traded API for real-time data
  // Skip during build time - API routes aren't available during static generation
  // Only fetch at runtime (ISR revalidation) to avoid build-time errors
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build';
  
  if (!isBuildTime && typeof fetch !== 'undefined' && typeof window === 'undefined') {
    // Only fetch at runtime, not during build
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pocketportfolio.app';
      const response = await fetch(`${baseUrl}/api/most-traded?count=100`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      if (response.ok) {
        const data = await response.json();
        const ticker = data.find((t: any) => t.symbol === upperSymbol);
        if (ticker) {
          return generateTickerMetadata(upperSymbol, ticker);
        }
      }
    } catch (error) {
      // Silently fallback to static data
      // This is expected during build time
    }
  }
  
  // Fallback to static metadata
  return generateTickerMetadata(upperSymbol);
}

function generateTickerMetadata(symbol: string, apiData?: any): TickerMetadata {
  // Determine exchange based on symbol patterns
  const exchange = symbol.includes('.') ? 'NYSE' : 
                   ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'].includes(symbol) ? 'NASDAQ' : 'NYSE';
  
  // Determine sector
  const techTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'ORCL', 'CRM', 'ADBE'];
  const financeTickers = ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'MA', 'V'];
  const healthTickers = ['JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'DHR'];
  
  let sector = 'General';
  let template: TickerMetadata['contentTemplate'] = 'default';
  
  if (techTickers.includes(symbol)) {
    sector = 'Technology';
    template = 'tech';
  } else if (financeTickers.includes(symbol)) {
    sector = 'Financial Services';
    template = 'finance';
  } else if (healthTickers.includes(symbol)) {
    sector = 'Healthcare';
  }
  
  // Generate related tickers (same sector)
  const relatedTickers = sector === 'Technology' ? techTickers.filter(t => t !== symbol).slice(0, 5) :
                         sector === 'Financial Services' ? financeTickers.filter(t => t !== symbol).slice(0, 5) :
                         sector === 'Healthcare' ? healthTickers.filter(t => t !== symbol).slice(0, 5) :
                         POPULAR_TICKERS.filter(t => t !== symbol).slice(0, 5);
  
  const name = apiData?.name || `${symbol} Inc.`;
  const description = `Track ${symbol} stock price, performance, and portfolio analysis with Pocket Portfolio. Free, open-source portfolio tracking for ${symbol} investors.`;
  
  return {
    symbol,
    name,
    exchange,
    sector,
    description,
    keywords: [
      symbol,
      `${symbol} stock`,
      `${symbol} price`,
      `${symbol} analysis`,
      `${sector} stocks`,
      'portfolio tracker',
      'stock tracking',
      'investment tracking'
    ],
    relatedTickers,
    faqs: [
      {
        question: `What is ${symbol}?`,
        answer: `${symbol} (${name}) is a stock listed on ${exchange}. Import your ${symbol} positions from broker CSVs or export ${symbol} historical data to JSON using Pocket Portfolio's free portfolio integration platform.`
      },
      {
        question: `How do I track ${symbol} in my portfolio?`,
        answer: `Import your ${symbol} trades from any supported broker (Robinhood, Fidelity, eToro, Trading212, Coinbase, etc.) via CSV import, or export ${symbol} historical data to JSON format for programmatic access.`
      },
      {
        question: `Is ${symbol} tracking free?`,
        answer: `Yes! Pocket Portfolio is completely free and open-source. Track unlimited ${symbol} positions without any fees or subscriptions.`
      }
    ],
    contentTemplate: template
  };
}

export function getExchangeMetadata(exchangeCode: string): ExchangeMetadata | null {
  return EXCHANGES[exchangeCode.toUpperCase()] || null;
}

export function getSectorMetadata(sectorName: string): SectorMetadata | null {
  return SECTORS[sectorName] || null;
}

// Get all tickers for static generation (can be expanded)
export function getAllTickers(): string[] {
  // Use expanded ticker list for real tickers only
  try {
    if (getAllTickersExpanded && typeof getAllTickersExpanded === 'function') {
      const tickers = getAllTickersExpanded();
      if (Array.isArray(tickers) && tickers.length > 0) {
        console.log(`[pSEO] Loaded ${tickers.length} tickers from ticker-generator`);
        return tickers;
      } else {
        console.warn(`[pSEO] getAllTickersExpanded returned empty or invalid array:`, typeof tickers);
      }
    } else {
      console.warn('[pSEO] getAllTickersExpanded is not a function');
    }
  } catch (error) {
    // Log the error for debugging
    console.error('[pSEO] Failed to load ticker generator:', error);
    console.warn('[pSEO] Falling back to static POPULAR_TICKERS list');
  }
  // Fallback to popular tickers if generator not available
  console.warn(`[pSEO] Using fallback: ${POPULAR_TICKERS.length} popular tickers`);
  return POPULAR_TICKERS;
}

// Get all exchanges for static generation
export function getAllExchanges(): string[] {
  return Object.keys(EXCHANGES);
}

