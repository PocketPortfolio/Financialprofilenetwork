/**
 * Market Data Service
 * Fetches real-time market context data for dynamic recommendations
 * Includes VIX, sector performance, and market momentum
 */

/**
 * Fetch VIX (Volatility Index) for market regime detection
 * VIX >30 = Extreme volatility, 20-30 = High, 15-20 = Normal, <15 = Low
 */
export async function fetchVIX(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v10/finance/quoteSummary/^VIX?modules=summaryDetail',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 900 }, // Cache for 15 minutes
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const vix = data.quoteSummary?.result?.[0]?.summaryDetail?.regularMarketPrice?.raw;
    
    return vix ? Number(vix) : null;
  } catch (error) {
    console.error('Error fetching VIX:', error);
    return null;
  }
}

/**
 * Sector ETF mapping for GICS sectors
 */
const SECTOR_ETFS: Record<string, string> = {
  'Energy': 'XLE',
  'Materials': 'XLB',
  'Industrials': 'XLI',
  'Consumer Discretionary': 'XLY',
  'Consumer Staples': 'XLP',
  'Health Care': 'XLV',
  'Financials': 'XLF',
  'Information Technology': 'XLK',
  'Communication Services': 'XLC',
  'Utilities': 'XLU',
  'Real Estate': 'XLRE',
};

/**
 * Fetch 30-day return for a ticker
 */
async function fetch30DayReturn(ticker: string): Promise<number | null> {
  try {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${startDate}&period2=${endDate}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    const quotes = result?.indicators?.quote?.[0]?.close;
    
    if (!quotes || quotes.length < 2) {
      return null;
    }

    const firstPrice = quotes[0];
    const lastPrice = quotes[quotes.length - 1];
    
    if (!firstPrice || !lastPrice || firstPrice === 0) {
      return null;
    }

    return ((lastPrice - firstPrice) / firstPrice) * 100;
  } catch (error) {
    console.error(`Error fetching 30-day return for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch sector performance (30-day returns) for all GICS sectors
 */
export async function fetchSectorPerformance(): Promise<Record<string, number>> {
  const sectorPerformance: Record<string, number> = {};
  
  // Fetch all sector ETFs in parallel
  const promises = Object.entries(SECTOR_ETFS).map(async ([sector, etf]) => {
    const return_ = await fetch30DayReturn(etf);
    if (return_ !== null) {
      sectorPerformance[sector] = return_;
    }
  });

  await Promise.all(promises);
  
  return sectorPerformance;
}

/**
 * Fetch S&P 500 30-day return for market momentum
 */
export async function fetchMarketMomentum(): Promise<number | null> {
  return fetch30DayReturn('^GSPC');
}

/**
 * Fetch current S&P 500 price
 */
export async function fetchSP500Price(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v10/finance/quoteSummary/^GSPC?modules=summaryDetail',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 900 }, // Cache for 15 minutes
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const price = data.quoteSummary?.result?.[0]?.summaryDetail?.regularMarketPrice?.raw;
    
    return price ? Number(price) : null;
  } catch (error) {
    console.error('Error fetching S&P 500 price:', error);
    return null;
  }
}











