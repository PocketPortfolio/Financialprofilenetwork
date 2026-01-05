import { NextRequest, NextResponse } from 'next/server';

// Module loaded - log only in development to avoid production issues
if (process.env.NODE_ENV !== 'production') {
  console.log('[DEBUG] Dividend route module loaded (query param version)', { nodeEnv: process.env.NODE_ENV, timestamp: Date.now() });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Explicitly set runtime for Vercel
export const revalidate = 0; // Force no caching - ensure fresh data
export const fetchCache = 'force-no-store'; // Force no fetch caching

// EODHD API Configuration
const EODHD_API_KEY = process.env.EODHD_API_KEY || '';
const EODHD_BASE_URL = 'https://eodhistoricaldata.com/api';

// Alpha Vantage API Configuration (Free tier: 25 calls/day, includes dividend data)
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

// In-memory cache for hot tickers (survives serverless cold starts via Next.js)
const dividendCache = new Map<string, {
  data: DividendData;
  timestamp: number;
  expiresAt: number;
}>();

// Circuit breaker state for rate-limited APIs (24h cache)
const rateLimitState = new Map<string, {
  isRateLimited: boolean;
  expiresAt: number;
}>();

// Daily usage tracker (resets at midnight UTC)
let dailyUsage = {
  count: 0,
  date: new Date().toISOString().split('T')[0],
  tickers: new Set<string>(),
};

// Free tier: 20 calls/day = ~0.83 calls/hour
// Cache for 24 hours to maximize efficiency
// Increased cache duration to reduce API calls and improve reliability
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DAILY_CALLS = 18; // Leave 2 calls buffer for safety
const STALE_CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for stale cache

interface EODHDDividendResponse {
  date: string;
  value: number;
  currency?: string;
}

interface DividendData {
  symbol: string;
  annualDividendYield: number | null;
  quarterlyPayout: number | null;
  nextExDividendDate: string | null;
  trailingAnnualDividendRate: number | null;
  currency: string;
  historicalDividends?: Array<{
    date: string;
    amount: number;
  }>;
}

// Check if we can make an API call today
function canMakeAPICall(ticker: string): { allowed: boolean; reason?: string } {
  const today = new Date().toISOString().split('T')[0];
  
  // Reset counter if new day
  if (dailyUsage.date !== today) {
    dailyUsage = {
      count: 0,
      date: today,
      tickers: new Set<string>(),
    };
  }
  
  // Check if we've already fetched this ticker today
  if (dailyUsage.tickers.has(ticker)) {
    return { allowed: false, reason: 'Already fetched today' };
  }
  
  // Check daily limit
  if (dailyUsage.count >= MAX_DAILY_CALLS) {
    return { allowed: false, reason: 'Daily API limit reached' };
  }
  
  return { allowed: true };
}

// Calculate dividend metrics from historical data
function calculateDividendMetrics(
  dividends: EODHDDividendResponse[],
  currentPrice?: number
): {
  annualDividendYield: number | null;
  quarterlyPayout: number | null;
  trailingAnnualDividendRate: number | null;
  nextExDividendDate: string | null;
} {
  if (!dividends || dividends.length === 0) {
    return {
      annualDividendYield: null,
      quarterlyPayout: null,
      trailingAnnualDividendRate: null,
      nextExDividendDate: null,
    };
  }

  // Sort by date (most recent first)
  const sorted = [...dividends].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get last 4 dividends (last year)
  const last4Dividends = sorted.slice(0, 4);
  
  // Calculate annual dividend rate (sum of last 4 quarterly dividends)
  const trailingAnnualDividendRate = last4Dividends.reduce(
    (sum, div) => sum + div.value,
    0
  );

  // Calculate quarterly payout (average of last 4)
  const quarterlyPayout = last4Dividends.length > 0
    ? trailingAnnualDividendRate / last4Dividends.length
    : null;

  // Calculate yield if we have current price
  const annualDividendYield = currentPrice && trailingAnnualDividendRate > 0
    ? (trailingAnnualDividendRate / currentPrice) * 100
    : null;

  // Find next ex-dividend date (most recent future date, or most recent past)
  const today = new Date();
  const futureDividends = sorted.filter(d => new Date(d.date) > today);
  const nextExDividendDate = futureDividends.length > 0
    ? futureDividends[0].date
    : sorted[0]?.date || null;

  return {
    annualDividendYield: annualDividendYield ? Number(annualDividendYield.toFixed(2)) : null,
    quarterlyPayout: quarterlyPayout ? Number(quarterlyPayout.toFixed(2)) : null,
    trailingAnnualDividendRate: trailingAnnualDividendRate > 0 
      ? Number(trailingAnnualDividendRate.toFixed(2)) 
      : null,
    nextExDividendDate,
  };
}

// Fetch from EODHD API
async function fetchFromEODHD(ticker: string): Promise<DividendData | null> {
  console.warn(`[DIVIDEND_DEBUG] Source: EODHD | Status: ATTEMPTING | Ticker: ${ticker} | HasKey: ${!!EODHD_API_KEY} | KeyLength: ${EODHD_API_KEY?.length || 0}`);
  
  if (!EODHD_API_KEY) {
    console.warn('[DIVIDEND_DEBUG] Source: EODHD | Status: SKIPPED | Reason: No API key');
    return null;
  }
  
  const check = canMakeAPICall(ticker);
  if (!check.allowed) {
    console.warn(`[DIVIDEND_DEBUG] Source: EODHD | Status: SKIPPED | Reason: ${check.reason}`);
    return null;
  }

  try {
    // Get last 2 years of dividend data (enough to calculate metrics)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 2);
    
    // EODHD endpoint format: /api/splits-dividends/{symbol}?api_token={token}&from={date}&to={date}
    // Try multiple endpoint formats as free tier may have limitations
    const endpoints = [
      `${EODHD_BASE_URL}/splits-dividends/${ticker}.US?api_token=${EODHD_API_KEY}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}`,
      `${EODHD_BASE_URL}/splits-dividends/${ticker}?api_token=${EODHD_API_KEY}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}`,
      `${EODHD_BASE_URL}/div/${ticker}.US?api_token=${EODHD_API_KEY}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}`,
    ];
    
    let response: Response | null = null;
    let lastError: string = '';
    
    for (const url of endpoints) {
      try {
        console.warn(`[DIVIDEND_DEBUG] Source: EODHD | Status: TRYING_ENDPOINT | URL: ${url.substring(0, 80)}...`);
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          console.log(`[Dividend API] ✅ Success with endpoint: ${url.substring(0, 60)}...`);
          break; // Success, exit loop
        } else if (response.status === 404) {
          lastError = `Endpoint not found (404): ${url.substring(0, 60)}...`;
          console.warn(`[Dividend API] ${lastError}`);
          response = null; // Try next endpoint
          continue;
        } else if (response.status === 403) {
          lastError = `Access forbidden (403) - may require paid plan`;
          console.warn(`[Dividend API] ${lastError}`);
          return null; // Don't try other endpoints if 403
        } else if (response.status === 429) {
          console.warn(`[Dividend API] Rate limit exceeded for ${ticker}`);
          return null;
        } else {
          lastError = `HTTP ${response.status}`;
          console.warn(`[Dividend API] ${lastError} for ${url.substring(0, 60)}...`);
          response = null;
          continue;
        }
      } catch (fetchError: any) {
        lastError = fetchError.message;
        console.warn(`[Dividend API] Fetch error: ${lastError}`);
        response = null;
        continue;
      }
    }

    if (!response || !response.ok) {
      console.warn(`[Dividend API] All EODHD endpoints failed for ${ticker}. Last error: ${lastError}`);
      console.warn(`[Dividend API] Note: Free tier may not include dividend endpoints. Consider upgrading or using alternative data source.`);
      return null;
    }

    const data: EODHDDividendResponse[] = await response.json();
    
    // Track usage
    dailyUsage.count++;
    dailyUsage.tickers.add(ticker);
    
    console.warn(`[DIVIDEND_DEBUG] Source: EODHD | Status: SUCCESS | Ticker: ${ticker} | Dividends: ${data.length} | Usage: ${dailyUsage.count}/${MAX_DAILY_CALLS}`);

    // Get current price for yield calculation (optional, from quote API)
    let currentPrice: number | undefined;
    try {
      // Use internal API route if available, otherwise skip
      const quoteUrl = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/quote?symbol=${ticker}`
        : `http://localhost:${process.env.PORT || 3001}/api/quote?symbol=${ticker}`;
      
      const quoteResponse = await fetch(quoteUrl, {
        cache: 'no-store',
      });
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        currentPrice = quoteData.price;
      }
    } catch (e) {
      // Ignore quote fetch errors - not critical
      console.log(`[Dividend API] Could not fetch price for yield calculation: ${ticker}`);
    }

    // Calculate metrics
    const metrics = calculateDividendMetrics(data, currentPrice);

    const dividendData: DividendData = {
      symbol: ticker,
      ...metrics,
      currency: data[0]?.currency || 'USD',
      historicalDividends: data.slice(0, 12).map(d => ({
        date: d.date,
        amount: d.value,
      })),
    };

    // Cache the result
    dividendCache.set(ticker, {
      data: dividendData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    return dividendData;
  } catch (error: any) {
    console.error(`[Dividend API] Error fetching from EODHD for ${ticker}:`, error);
    return null;
  }
}

// Fetch from Alpha Vantage (free tier: 25 calls/day, includes dividend data via OVERVIEW)
async function fetchFromAlphaVantage(ticker: string): Promise<DividendData | null> {
  console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: ATTEMPTING | Ticker: ${ticker} | HasKey: ${!!ALPHA_VANTAGE_API_KEY}`);
  
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: SKIPPED | Reason: No API key`);
    return null;
  }

  // Circuit breaker: Check if we're rate-limited (24h cache)
  const circuitBreakerKey = 'alphavantage_rate_limit';
  const circuitState = rateLimitState.get(circuitBreakerKey);
  if (circuitState && circuitState.isRateLimited && Date.now() < circuitState.expiresAt) {
    const hoursRemaining = Math.round((circuitState.expiresAt - Date.now()) / (1000 * 60 * 60));
    console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: RATE_LIMITED | Circuit Breaker: ACTIVE (${hoursRemaining}h remaining)`);
    return null; // Skip API call entirely
  }

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const keyPrefix = ALPHA_VANTAGE_API_KEY ? `${ALPHA_VANTAGE_API_KEY.substring(0, 4)}...` : 'NONE';
    
    console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: ATTEMPTING | Key_Used: ${keyPrefix}`);
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit exceeded - activate circuit breaker for 24h
        rateLimitState.set(circuitBreakerKey, {
          isRateLimited: true,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        });
        console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: 429 | Key_Used: ${keyPrefix} | Action: CIRCUIT_BREAKER_ACTIVATED`);
      } else {
        console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: ${response.status} | Key_Used: ${keyPrefix}`);
      }
      return null;
    }

    const data = await response.json();
    
    // Check for API limit message - activate circuit breaker
    if (data['Note'] || data['Information']) {
      const message = data['Note'] || data['Information'];
      if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('call frequency')) {
        // Rate limit message - activate circuit breaker for 24h
        rateLimitState.set(circuitBreakerKey, {
          isRateLimited: true,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        });
        console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: RATE_LIMIT_MESSAGE | Key_Used: ${keyPrefix} | Message: ${message.substring(0, 100)} | Action: CIRCUIT_BREAKER_ACTIVATED`);
      } else {
        console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: API_ERROR | Key_Used: ${keyPrefix} | Message: ${message.substring(0, 100)}`);
      }
      return null;
    }

    // Check if we got valid data
    if (!data || data['Symbol'] !== ticker) {
      console.warn(`[Dividend API] Alpha Vantage: Invalid response for ${ticker}`);
      return null;
    }

    // Log raw values for debugging
    const rawYield = data['DividendYield'];
    const rawPerShare = data['DividendPerShare'];
    const rawExDate = data['ExDividendDate'];
    console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: RAW_VALUES | Ticker: ${ticker} | Yield: "${rawYield}" | PerShare: "${rawPerShare}" | ExDate: "${rawExDate}"`);

    // Parse dividend yield - Alpha Vantage returns as decimal (e.g., "0.005" = 0.5%)
    // Handle "None", empty string, or invalid values
    let dividendYield = 0;
    if (rawYield && rawYield !== 'None' && rawYield !== '' && rawYield !== 'N/A') {
      const parsed = parseFloat(rawYield);
      if (!isNaN(parsed) && parsed > 0) {
        dividendYield = parsed;
      }
    }

    // Parse dividend per share - handle "None", empty string
    let dividendPerShare = 0;
    if (rawPerShare && rawPerShare !== 'None' && rawPerShare !== '' && rawPerShare !== 'N/A') {
      const parsed = parseFloat(rawPerShare);
      if (!isNaN(parsed) && parsed > 0) {
        dividendPerShare = parsed;
      }
    }

    const exDividendDate = (rawExDate && rawExDate !== 'None' && rawExDate !== '' && rawExDate !== 'N/A') 
      ? rawExDate 
      : null;
    
    // If no dividend data, return null
    if (!dividendYield && !dividendPerShare) {
      console.warn(`[Dividend API] Alpha Vantage: No dividend data for ${ticker} (raw yield: "${rawYield}", raw perShare: "${rawPerShare}")`);
      return null;
    }

    // Calculate quarterly payout (annual dividend / 4)
    const quarterlyPayout = dividendPerShare > 0 
      ? Number((dividendPerShare / 4).toFixed(2))
      : null;

    // Alpha Vantage DividendYield is a decimal (e.g., 0.005 = 0.5%), so multiply by 100
    const dividendData: DividendData = {
      symbol: ticker,
      annualDividendYield: dividendYield > 0 ? Number((dividendYield * 100).toFixed(2)) : null,
      quarterlyPayout,
      trailingAnnualDividendRate: dividendPerShare > 0 ? Number(dividendPerShare.toFixed(2)) : null,
      nextExDividendDate: exDividendDate || null,
      currency: data['Currency'] || 'USD',
    };

    // Note: Historical dividends require premium API access
    // Alpha Vantage TIME_SERIES_DAILY_ADJUSTED is premium-only
    // EODHD dividend endpoints are premium-only
    // Free tier only provides summary data (yield, payout, ex-date)
    // dividendData.historicalDividends will remain undefined for free tier

    console.log(`[Dividend API] Alpha Vantage parsed result for ${ticker}:`, {
      annualDividendYield: dividendData.annualDividendYield,
      quarterlyPayout: dividendData.quarterlyPayout,
      trailingAnnualDividendRate: dividendData.trailingAnnualDividendRate,
      nextExDividendDate: dividendData.nextExDividendDate,
    });

    // Cache the result (24 hours to respect free tier limits)
    dividendCache.set(ticker, {
      data: dividendData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    console.warn(`[DIVIDEND_DEBUG] Source: AlphaVantage | Status: SUCCESS | Yield: ${dividendData.annualDividendYield}% | Payout: $${dividendData.quarterlyPayout} | Key_Used: ${keyPrefix}`);
    // Reset circuit breaker on success
    rateLimitState.delete('alphavantage_rate_limit');
    return dividendData;
  } catch (error: any) {
    console.warn(`[Dividend API] Alpha Vantage error: ${error.message}`);
    return null;
  }
}

// Fetch from Yahoo Finance Chart endpoint (provides historical dividends via events=div)
// This is the recommended approach for getting dividend history from Yahoo Finance
async function fetchFromYahooFinanceChart(ticker: string): Promise<DividendData | null> {
  console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: ATTEMPTING | Ticker: ${ticker}`);
  
  // Use same headers as quote API (JUA pattern)
  const JUA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  // Calculate date range (10 years as recommended)
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = Math.floor((Date.now() - 10 * 365 * 24 * 60 * 60 * 1000) / 1000);

  // Try multiple endpoints (query1 and query2, with/without .US suffix)
  const endpoints = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?symbol=${ticker}&interval=1d&events=div&period1=${startDate}&period2=${endDate}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?symbol=${ticker}&interval=1d&events=div&period1=${startDate}&period2=${endDate}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.US?symbol=${ticker}.US&interval=1d&events=div&period1=${startDate}&period2=${endDate}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}.US?symbol=${ticker}.US&interval=1d&events=div&period1=${startDate}&period2=${endDate}`,
  ];

  for (const url of endpoints) {
    try {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: TRYING_ENDPOINT | URL: ${url.substring(0, 80)}...`);
      const response = await fetch(url, {
        headers: JUA,
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: ${response.status} | URL: ${url.substring(0, 50)}...`);
        continue; // Try next endpoint
      }

      const data = await response.json();
      
      // Navigate through Yahoo Finance Chart API structure
      // Structure: chart.result[0].events.dividends
      const chartResult = data?.chart?.result?.[0];
      if (!chartResult) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: NO_CHART_RESULT | Ticker: ${ticker}`);
        continue; // Try next endpoint
      }

      const dividends = chartResult.events?.dividends;
      if (!dividends || Object.keys(dividends).length === 0) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: NO_DIVIDENDS | Ticker: ${ticker} | URL: ${url.substring(0, 50)}...`);
        continue; // Try next endpoint
      }

      // Convert dividends object to array format
      // Yahoo returns: { timestamp: { amount: number, date: number } }
      const dividendArray: Array<{date: string; amount: number}> = Object.entries(dividends)
        .map(([timestamp, div]: [string, any]) => ({
          date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
          amount: div.amount || 0,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (dividendArray.length === 0) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: NO_VALID_DIVIDENDS | Ticker: ${ticker}`);
        continue; // Try next endpoint
      }

      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: FOUND_DIVIDENDS | Ticker: ${ticker} | Count: ${dividendArray.length}`);

      // Get current price for yield calculation (optional)
      let currentPrice: number | undefined;
      try {
        const quoteUrl = process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/quote?symbol=${ticker}`
          : `http://localhost:${process.env.PORT || 3001}/api/quote?symbol=${ticker}`;
        
        const quoteResponse = await fetch(quoteUrl, {
          cache: 'no-store',
        });
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          currentPrice = quoteData.price;
        }
      } catch (e) {
        // Ignore quote fetch errors - not critical
        console.log(`[Dividend API] Could not fetch price for yield calculation: ${ticker}`);
      }

      // Convert to EODHD format for calculateDividendMetrics
      const eodhdFormat: EODHDDividendResponse[] = dividendArray.map(d => ({
        date: d.date,
        value: d.amount,
        currency: 'USD',
      }));

      // Calculate metrics from historical data
      const metrics = calculateDividendMetrics(eodhdFormat, currentPrice);

      const dividendData: DividendData = {
        symbol: ticker,
        ...metrics,
        currency: 'USD',
        historicalDividends: dividendArray.slice(0, 50), // Last 50 dividends
      };

      // Cache the result
      dividendCache.set(ticker, {
        data: dividendData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION_MS,
      });

      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: SUCCESS | Ticker: ${ticker} | Yield: ${dividendData.annualDividendYield}% | Payout: $${dividendData.quarterlyPayout} | Historical: ${dividendArray.length} dividends`);
      return dividendData;
    } catch (fetchError: any) {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: FETCH_ERROR | URL: ${url.substring(0, 50)}... | Error: ${fetchError.message}`);
      continue; // Try next endpoint
    }
  }

  // All endpoints failed
  console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceChart | Status: ALL_ENDPOINTS_FAILED | Ticker: ${ticker}`);
  return null;
}

// Fetch from Yahoo Finance as fallback (free, no API key required, but requires auth)
async function fetchFromYahooFinance(ticker: string): Promise<DividendData | null> {
  // Use same headers as quote API (JUA pattern) - exact copy from quote API
  const JUA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  // Try multiple Yahoo Finance endpoints (same pattern as quote API)
  // Try query2 first (more reliable based on quote API), then query1
  // Try with and without .US suffix
  const endpoints = [
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}.US?modules=summaryDetail`,
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}.US?modules=summaryDetail`,
  ];

  for (const url of endpoints) {
    try {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinance | Status: TRYING_ENDPOINT | URL: ${url.substring(0, 70)}...`);
      const response = await fetch(url, {
        headers: JUA,
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[Dividend API] Yahoo Finance ${url.substring(0, 50)}... returned ${response.status}`);
        continue; // Try next endpoint
      }

      const data = await response.json();
      const summaryDetail = data?.quoteSummary?.result?.[0]?.summaryDetail;
      
      if (!summaryDetail) {
        console.warn(`[Dividend API] Yahoo Finance: No summaryDetail in response`);
        continue; // Try next endpoint
      }

      const dividendYield = summaryDetail.dividendYield?.raw;
      const dividendRate = summaryDetail.dividendRate?.raw;
      const exDividendDate = summaryDetail.exDividendDate?.raw;
      const trailingAnnualDividendRate = summaryDetail.trailingAnnualDividendRate?.raw;
      
      // If no dividend data at all, try next endpoint
      if (!dividendYield && !dividendRate && !trailingAnnualDividendRate) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinance | Status: NO_DATA | Ticker: ${ticker} | Endpoint: ${url.substring(0, 50)}...`);
        continue;
      }

      // Calculate quarterly payout from annual rate
      const quarterlyPayout = dividendRate 
        ? Number((dividendRate / 4).toFixed(2))
        : trailingAnnualDividendRate
          ? Number((trailingAnnualDividendRate / 4).toFixed(2))
          : null;

      const dividendData: DividendData = {
        symbol: ticker,
        annualDividendYield: dividendYield ? Number((dividendYield * 100).toFixed(2)) : null,
        quarterlyPayout,
        trailingAnnualDividendRate: dividendRate 
          ? Number(dividendRate.toFixed(2))
          : trailingAnnualDividendRate
            ? Number(trailingAnnualDividendRate.toFixed(2))
            : null,
        nextExDividendDate: exDividendDate 
          ? new Date(exDividendDate * 1000).toISOString().split('T')[0]
          : null,
        currency: 'USD',
      };

      // Cache the result
      dividendCache.set(ticker, {
        data: dividendData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION_MS,
      });

      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinance | Status: SUCCESS | Yield: ${dividendData.annualDividendYield}% | Payout: $${dividendData.quarterlyPayout} | Endpoint: ${url.substring(0, 50)}...`);
      return dividendData;
    } catch (fetchError: any) {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinance | Status: FETCH_ERROR | URL: ${url.substring(0, 50)}... | Error: ${fetchError.message}`);
      continue; // Try next endpoint
    }
  }

  // All JSON API endpoints failed - try HTML scraping as ultimate fallback
  console.warn(`[DIVIDEND_DEBUG] Source: YahooFinance | Status: JSON_API_FAILED | Attempting HTML scrape`);
  return await fetchFromYahooFinanceHTML(ticker);
}

// Ultimate fallback: Scrape Yahoo Finance HTML page
async function fetchFromYahooFinanceHTML(ticker: string): Promise<DividendData | null> {
  try {
    // Try both with and without .US suffix
    const urls = [
      `https://finance.yahoo.com/quote/${ticker}`,
      `https://finance.yahoo.com/quote/${ticker}.US`,
    ];
    
    // Try to find dividend data in embedded JSON (Yahoo Finance embeds data in script tags)
    let dividendYield: number | null = null;
    let dividendRate: number | null = null;
    
    for (const url of urls) {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: ATTEMPTING | URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: ${response.status} | Ticker: ${ticker} | URL: ${url}`);
        continue; // Try next URL
      }

      const html = await response.text();
      
      // Reset for each URL attempt
      dividendYield = null;
      dividendRate = null;
    
    // Method 1: Look for embedded JSON data in script tags
    const jsonMatch = html.match(/root\.App\.main\s*=\s*({.+?});/s);
    if (jsonMatch) {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: JSON_MATCH_FOUND | Ticker: ${ticker}`);
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        // Navigate through Yahoo Finance's nested structure
        const quoteSummary = jsonData?.context?.dispatcher?.stores?.QuoteSummaryStore?.summaryDetail;
        if (quoteSummary) {
          console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: QUOTE_SUMMARY_FOUND | Ticker: ${ticker} | HasYield: ${!!quoteSummary.dividendYield?.raw} | HasRate: ${!!quoteSummary.dividendRate?.raw}`);
          if (quoteSummary.dividendYield?.raw) {
            dividendYield = quoteSummary.dividendYield.raw * 100; // Convert to percentage
          }
          if (quoteSummary.dividendRate?.raw) {
            dividendRate = quoteSummary.dividendRate.raw;
          } else if (quoteSummary.trailingAnnualDividendRate?.raw) {
            dividendRate = quoteSummary.trailingAnnualDividendRate.raw;
          }
        } else {
          console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: NO_QUOTE_SUMMARY | Ticker: ${ticker}`);
        }
      } catch (e: any) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: JSON_PARSE_ERROR | Ticker: ${ticker} | Error: ${e.message}`);
        // JSON parsing failed, try regex patterns
      }
    } else {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: NO_JSON_MATCH | Ticker: ${ticker} | HTML length: ${html.length}`);
    }
    
    // Method 2: If JSON method failed, try regex patterns on HTML
    if (!dividendYield && !dividendRate) {
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: TRYING_REGEX | Ticker: ${ticker}`);
      // Extract dividend yield using regex patterns
      const yieldPatterns = [
        /Forward Dividend & Yield[^<]*\$?(\d+\.?\d*)\s*\((\d+\.?\d*)%\)/i,
        /Dividend Yield[^<]*(\d+\.?\d*)%/i,
        /Yield[^<]*(\d+\.?\d*)%/i,
        /"yield"[^:]*:\s*"?(\d+\.?\d*)"?/i,
      ];

      let regexMatches = 0;
      for (const pattern of yieldPatterns) {
        const match = html.match(pattern);
        if (match) {
          regexMatches++;
          // Try match[2] first (percentage in parentheses), then match[1]
          const yieldStr = (match[2] || match[1])?.replace('%', '');
          if (yieldStr) {
            const parsed = parseFloat(yieldStr);
            if (!isNaN(parsed) && parsed > 0) {
              dividendYield = parsed;
              console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: REGEX_YIELD_FOUND | Ticker: ${ticker} | Yield: ${dividendYield}%`);
              break;
            }
          }
        }
      }
      if (regexMatches === 0) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: NO_YIELD_REGEX_MATCH | Ticker: ${ticker}`);
      }

      // Extract dividend rate (annual)
      const dividendRatePatterns = [
        /Forward Annual Dividend Rate[^<]*\$?(\d+\.?\d*)/i,
        /Annual Dividend[^<]*\$?(\d+\.?\d*)/i,
        /"dividendRate"[^:]*:\s*"?(\d+\.?\d*)"?/i,
      ];

      regexMatches = 0;
      for (const pattern of dividendRatePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          regexMatches++;
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed) && parsed > 0) {
            dividendRate = parsed;
            console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: REGEX_RATE_FOUND | Ticker: ${ticker} | Rate: $${dividendRate}`);
            break;
          }
        }
      }
      if (regexMatches === 0) {
        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: NO_RATE_REGEX_MATCH | Ticker: ${ticker}`);
      }
    }

      // If we found at least yield or rate, return data
      if (dividendYield || dividendRate) {
        const quarterlyPayout = dividendRate ? Number((dividendRate / 4).toFixed(2)) : null;
        
        const dividendData: DividendData = {
          symbol: ticker,
          annualDividendYield: dividendYield,
          quarterlyPayout,
          trailingAnnualDividendRate: dividendRate,
          nextExDividendDate: null, // HTML doesn't provide ex-date easily
          currency: 'USD',
        };

        // Cache the result
        dividendCache.set(ticker, {
          data: dividendData,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_DURATION_MS,
        });

        console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: SUCCESS | Yield: ${dividendYield}% | Rate: $${dividendRate} | URL: ${url}`);
        return dividendData;
      }

      // No data found in this URL, try next
      console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: NO_DATA_FOUND | URL: ${url}`);
    }
    
    // All URLs failed
    console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: ALL_URLS_FAILED | Ticker: ${ticker}`);
    return null;
  } catch (error: any) {
    console.warn(`[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: ERROR | Ticker: ${ticker} | Message: ${error.message}`);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Get ticker from query parameter instead of path segment
  const { searchParams } = new URL(request.url);
  const tickerParam = searchParams.get('ticker');
  
  console.warn(`[DIVIDEND_DEBUG] Route handler ENTRY (query param) | Path: ${request.nextUrl.pathname} | Method: ${request.method} | Ticker: ${tickerParam} | Timestamp: ${new Date().toISOString()}`);

  try {
    if (!tickerParam) {
      console.warn(`[DIVIDEND_DEBUG] Ticker parameter missing | Path: ${request.nextUrl.pathname} | Query: ${request.nextUrl.search}`);
      return NextResponse.json(
        { 
          error: 'Ticker parameter required. Use ?ticker=AAPL', 
          diagnostic: {
            pathname: request.nextUrl.pathname,
            search: request.nextUrl.search,
            url: request.url
          }
        }, 
        { 
          status: 400,
          headers: {
            'X-Dividend-Route': 'called',
            'X-Dividend-Error': 'missing-ticker',
          }
        }
      );
    }
    
    const ticker = tickerParam.toUpperCase();
    
    console.warn(`[DIVIDEND_DEBUG] Ticker extracted: ${ticker}`);
    
    if (!ticker) {
      console.warn(`[DIVIDEND_DEBUG] Empty ticker after extraction | Path: ${request.nextUrl.pathname}`);
      return NextResponse.json(
        { error: 'Ticker parameter required' }, 
        { 
          status: 400,
          headers: {
            'X-Dividend-Route': 'called',
            'X-Dividend-Error': 'empty-ticker'
          }
        }
      );
    }

  console.log(`[Dividend API] Request received for ${ticker}`);
  console.log(`[Dividend API] EODHD_API_KEY configured: ${EODHD_API_KEY ? 'YES (' + EODHD_API_KEY.substring(0, 8) + '...)' : 'NO'}`);
  console.log(`[Dividend API] ALPHA_VANTAGE_API_KEY configured: ${ALPHA_VANTAGE_API_KEY ? 'YES (' + ALPHA_VANTAGE_API_KEY.substring(0, 8) + '...)' : 'NO'}`);
  
  // Production-safe diagnostic header (survives removeConsole)
  const diagnosticHeaders = {
    'X-Dividend-Route': 'called',
    'X-Dividend-Ticker': ticker,
    'X-Dividend-Timestamp': new Date().toISOString(),
    'X-Dividend-EODHD-Key': EODHD_API_KEY ? 'YES' : 'NO',
    'X-Dividend-AlphaVantage-Key': ALPHA_VANTAGE_API_KEY ? 'YES' : 'NO',
    'X-Dividend-Circuit-Breaker': rateLimitState.get('alphavantage_rate_limit')?.isRateLimited ? 'ACTIVE' : 'INACTIVE',
  };

  // Check in-memory cache first
  const cached = dividendCache.get(ticker);
  const now = Date.now();
  if (cached) {
    const cacheData = cached!.data;
    const expiresAt = cached!.expiresAt;
    if (cacheData && expiresAt !== undefined && now < expiresAt) {
      console.warn(`[DIVIDEND_DEBUG] Source: CACHE | Status: HIT | Ticker: ${ticker} | Age: ${Math.round((now - cached.timestamp) / (1000 * 60))}m | Yield: ${cacheData.annualDividendYield}%`);
      return NextResponse.json(cacheData, {
        headers: {
          ...diagnosticHeaders,
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24h cache, 48h stale
          'X-Cache': 'HIT',
          'X-Cache-Expires': new Date(expiresAt).toISOString(),
        },
      });
    }
  }

  // Try multiple data sources in order:
  // 1. EODHD (for paid tier users) - skip if not configured
  // 2. Yahoo Finance Chart (best free source for historical dividends + summary) - prioritized for complete data
  // 3. Alpha Vantage (free tier, summary data only, no historical on free tier)
  // 4. Yahoo Finance quoteSummary (summary data only)
  // 5. Yahoo Finance HTML scraping (last resort)
  
  let dividendData: DividendData | null = null;
  
  // Priority 1: EODHD (if configured) - provides both summary and historical data
  if (EODHD_API_KEY) {
    dividendData = await fetchFromEODHD(ticker);
    console.warn(`[DIVIDEND_DEBUG] After EODHD | Ticker: ${ticker} | HasData: ${!!dividendData} | Yield: ${dividendData?.annualDividendYield}% | Historical: ${dividendData?.historicalDividends?.length || 0} dividends`);
  } else {
    console.warn(`[DIVIDEND_DEBUG] EODHD not configured, skipping to Yahoo Finance Chart...`);
  }

  // Priority 2: Yahoo Finance Chart - BEST free source for historical dividends
  // Provides both historical dividend list AND can calculate summary metrics
  // Prioritized over Alpha Vantage because it provides complete data (historical + summary)
  if (!dividendData) {
    console.warn(`[DIVIDEND_DEBUG] Trying Yahoo Finance Chart endpoint (best free source for historical dividends)...`);
    dividendData = await fetchFromYahooFinanceChart(ticker);
    console.warn(`[DIVIDEND_DEBUG] After YahooFinanceChart | Ticker: ${ticker} | HasData: ${!!dividendData} | Yield: ${dividendData?.annualDividendYield}% | Historical: ${dividendData?.historicalDividends?.length || 0} dividends`);
  }

  // Priority 3: Alpha Vantage - summary data only (no historical dividends on free tier)
  if (!dividendData) {
    console.warn(`[DIVIDEND_DEBUG] Yahoo Finance Chart failed, trying Alpha Vantage (summary data only, no historical on free tier)...`);
    dividendData = await fetchFromAlphaVantage(ticker);
    console.warn(`[DIVIDEND_DEBUG] After AlphaVantage | Ticker: ${ticker} | HasData: ${!!dividendData} | Yield: ${dividendData?.annualDividendYield}%`);
  }

  if (!dividendData) {
    console.warn(`[DIVIDEND_DEBUG] Yahoo Finance Chart failed, trying Yahoo Finance quoteSummary fallback...`);
    dividendData = await fetchFromYahooFinance(ticker);
    console.warn(`[DIVIDEND_DEBUG] After YahooFinance | Ticker: ${ticker} | HasData: ${!!dividendData} | Yield: ${dividendData?.annualDividendYield}%`);
  }

  if (!dividendData) {
    console.warn(`[DIVIDEND_DEBUG] Yahoo Finance API failed, trying Yahoo Finance HTML scrape fallback...`);
    dividendData = await fetchFromYahooFinanceHTML(ticker);
    console.warn(`[DIVIDEND_DEBUG] After YahooFinanceHTML | Ticker: ${ticker} | HasData: ${!!dividendData} | Yield: ${dividendData?.annualDividendYield}%`);
  }

  if (dividendData) {
    return NextResponse.json(dividendData, {
      headers: {
        ...diagnosticHeaders,
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
        'X-Cache': 'MISS',
        'X-API-Usage': `${dailyUsage.count}/${MAX_DAILY_CALLS}`,
      },
    });
  }

  // If we have stale cache (within 7 days), serve it
  // This helps when APIs hit rate limits - we serve cached data instead of nulls
  if (cached) {
    const cacheData = cached!.data;
    const expiresAt = cached!.expiresAt;
    const now = Date.now();
    // Serve stale cache if it's within 7 days old
    if (cacheData && expiresAt !== undefined && (now - expiresAt) < STALE_CACHE_DURATION_MS) {
      const ageHours = Math.round((now - expiresAt) / (1000 * 60 * 60));
      console.log(`[Dividend API] ⚠️ Serving stale cache: ${ticker} (expired ${ageHours} hours ago)`);
      return NextResponse.json(cacheData, {
        headers: {
          ...diagnosticHeaders,
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 7 days stale
          'X-Cache': 'STALE',
          'X-Cache-Expires': new Date(expiresAt).toISOString(),
          'X-Cache-Age-Hours': ageHours.toString(),
        },
      });
    }
  }

  // No data available
  console.warn(`[Dividend API] No data available for ${ticker}`);
  

  // No data available - log comprehensive diagnostic
  const circuitState = rateLimitState.get('alphavantage_rate_limit');
  const diagnosticInfo = {
    ticker,
    eodhdKeyConfigured: !!EODHD_API_KEY,
    alphaVantageKeyConfigured: !!ALPHA_VANTAGE_API_KEY,
    circuitBreakerActive: circuitState?.isRateLimited || false,
    circuitBreakerExpires: circuitState?.expiresAt ? new Date(circuitState.expiresAt).toISOString() : null,
    hasStaleCache: !!cached,
    staleCacheAge: cached ? Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60)) : null,
    dailyUsage: `${dailyUsage.count}/${MAX_DAILY_CALLS}`,
  };
  
  console.warn(`[DIVIDEND_DEBUG] Source: ALL_FAILED | Status: NO_DATA | Ticker: ${ticker} | Diagnostic: ${JSON.stringify(diagnosticInfo)}`);

  return NextResponse.json({
    symbol: ticker,
    annualDividendYield: null,
    quarterlyPayout: null,
    nextExDividendDate: null,
    trailingAnnualDividendRate: null,
    currency: 'USD',
    _diagnostic: diagnosticInfo, // Include diagnostic info in response
  }, {
    status: 200,
    headers: {
      ...diagnosticHeaders,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Short cache for null responses
      'X-Cache': 'MISS',
      'X-API-Usage': `${dailyUsage.count}/${MAX_DAILY_CALLS}`,
      'X-Dividend-Diagnostic': JSON.stringify(diagnosticInfo), // Diagnostic in header
    },
  });
  } catch (error: any) {
    console.error(`[Dividend API] Error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { 
        status: 500,
        headers: {
          'X-Dividend-Route': 'called',
          'X-Dividend-Error': 'handler-error',
          'X-Dividend-Error-Message': error?.message?.substring(0, 100) || 'unknown'
        }
      }
    );
  }
}

