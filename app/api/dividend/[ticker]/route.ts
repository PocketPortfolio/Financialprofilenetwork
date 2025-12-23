import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

// Daily usage tracker (resets at midnight UTC)
let dailyUsage = {
  count: 0,
  date: new Date().toISOString().split('T')[0],
  tickers: new Set<string>(),
};

// Free tier: 20 calls/day = ~0.83 calls/hour
// Cache for 24 hours to maximize efficiency
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DAILY_CALLS = 18; // Leave 2 calls buffer for safety

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
  if (!EODHD_API_KEY) {
    console.warn('[Dividend API] EODHD_API_KEY not configured');
    return null;
  }

  const check = canMakeAPICall(ticker);
  if (!check.allowed) {
    console.warn(`[Dividend API] Cannot fetch ${ticker}: ${check.reason}`);
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
        console.log(`[Dividend API] Trying EODHD endpoint: ${url.substring(0, 80)}...`);
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
    
    console.log(`[Dividend API] ✅ EODHD response received for ${ticker}: ${data.length} dividends`);
    console.log(`[Dividend API] Daily usage: ${dailyUsage.count}/${MAX_DAILY_CALLS}`);

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
  if (!ALPHA_VANTAGE_API_KEY) {
    console.log(`[Dividend API] ALPHA_VANTAGE_API_KEY not configured, skipping Alpha Vantage`);
    return null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    console.log(`[Dividend API] Trying Alpha Vantage: ${url.substring(0, 70)}...`);
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[Dividend API] Alpha Vantage returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Check for API limit message
    if (data['Note'] || data['Information']) {
      const message = data['Note'] || data['Information'];
      console.warn(`[Dividend API] Alpha Vantage: ${message}`);
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
    console.log(`[Dividend API] Alpha Vantage raw values for ${ticker}:`, {
      DividendYield: rawYield,
      DividendPerShare: rawPerShare,
      ExDividendDate: rawExDate,
    });

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

    console.log(`[Dividend API] ✅ Successfully fetched from Alpha Vantage for ${ticker}`);
    return dividendData;
  } catch (error: any) {
    console.warn(`[Dividend API] Alpha Vantage error: ${error.message}`);
    return null;
  }
}

// Fetch historical dividends from Alpha Vantage TIME_SERIES_DAILY_ADJUSTED
// NOTE: This endpoint is PREMIUM-ONLY and not available on free tier
// Keeping function for future use if premium API access is obtained
// async function fetchHistoricalDividendsFromAlphaVantage(ticker: string): Promise<Array<{date: string; amount: number}> | null> {
async function _fetchHistoricalDividendsFromAlphaVantage_UNUSED(ticker: string): Promise<Array<{date: string; amount: number}> | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return null;
  }

  try {
    // Use TIME_SERIES_DAILY_ADJUSTED to get historical dividends
    // This endpoint includes dividend amounts in the daily data
    // Using compact output to get last 100 days (enough for recent dividends)
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`;
    
    console.log(`[Dividend API] Fetching historical dividends from Alpha Vantage TIME_SERIES for ${ticker}...`);
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[Dividend API] Alpha Vantage TIME_SERIES returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Check for API limit message
    if (data['Note'] || data['Information']) {
      const message = data['Note'] || data['Information'];
      console.warn(`[Dividend API] Alpha Vantage TIME_SERIES: ${message}`);
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      console.warn(`[Dividend API] Alpha Vantage: No time series data for ${ticker}`);
      console.log(`[Dividend API] Available keys in response:`, Object.keys(data));
      return null;
    }

    // Extract dividends from time series
    // The "7. dividend amount" field contains dividend payments
    const dividends: Array<{date: string; amount: number}> = [];
    
    // Log first entry to see structure
    const firstEntry = Object.entries(timeSeries)[0];
    if (firstEntry) {
      const sampleKeys = Object.keys(firstEntry[1] as any);
      console.log(`[Dividend API] Sample time series entry keys for ${ticker}:`, sampleKeys);
      console.log(`[Dividend API] Sample entry data:`, firstEntry[1]);
    }
    
    let checkedDates = 0;
    let datesWithDividends = 0;
    
    for (const [date, dayData] of Object.entries(timeSeries)) {
      checkedDates++;
      const dayInfo = dayData as any;
      // Try multiple possible field names
      const dividendAmount = parseFloat(
        dayInfo['7. dividend amount'] || 
        dayInfo['7. Dividend Amount'] || 
        dayInfo['dividend amount'] ||
        dayInfo['Dividend Amount'] ||
        dayInfo['7. Dividend'] ||
        dayInfo['dividend'] ||
        '0'
      );
      if (dividendAmount > 0) {
        datesWithDividends++;
        dividends.push({
          date,
          amount: dividendAmount,
        });
      }
    }
    
    console.log(`[Dividend API] Checked ${checkedDates} dates, found ${datesWithDividends} with dividends for ${ticker}`);

    // Sort by date (most recent first)
    dividends.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (dividends.length > 0) {
      console.log(`[Dividend API] ✅ Extracted ${dividends.length} historical dividends from Alpha Vantage for ${ticker}`);
      return dividends;
    }

    return null;
  } catch (error: any) {
    console.warn(`[Dividend API] Alpha Vantage TIME_SERIES error: ${error.message}`);
    return null;
  }
}

// Fetch from Yahoo Finance as fallback (free, no API key required, but requires auth)
async function fetchFromYahooFinance(ticker: string): Promise<DividendData | null> {
  // Use same headers as quote API (JUA pattern)
  const JUA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  // Try both query1 and query2 (same pattern as quote API)
  const endpoints = [
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`[Dividend API] Trying Yahoo Finance: ${url}`);
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
        console.warn(`[Dividend API] Yahoo Finance: No dividend data in summaryDetail for ${ticker}`);
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

      console.log(`[Dividend API] ✅ Successfully fetched from Yahoo Finance for ${ticker} via ${url.substring(0, 50)}...`);
      return dividendData;
    } catch (fetchError: any) {
      console.warn(`[Dividend API] Yahoo Finance error for ${url.substring(0, 50)}...: ${fetchError.message}`);
      continue; // Try next endpoint
    }
  }

  // All endpoints failed
  console.warn(`[Dividend API] All Yahoo Finance endpoints failed for ${ticker}`);
  return null;
}

interface RouteParams {
  params: {
    ticker: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const ticker = params.ticker.toUpperCase();
  console.log(`[Dividend API] Request received for ${ticker}`);
  console.log(`[Dividend API] EODHD_API_KEY configured: ${EODHD_API_KEY ? 'YES (' + EODHD_API_KEY.substring(0, 8) + '...)' : 'NO'}`);
  console.log(`[Dividend API] ALPHA_VANTAGE_API_KEY configured: ${ALPHA_VANTAGE_API_KEY ? 'YES (' + ALPHA_VANTAGE_API_KEY.substring(0, 8) + '...)' : 'NO'}`);

  // Check in-memory cache first
  const cached = dividendCache.get(ticker);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[Dividend API] ✅ Serving from cache: ${ticker}`);
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24h cache, 48h stale
        'X-Cache': 'HIT',
        'X-Cache-Expires': new Date(cached.expiresAt).toISOString(),
      },
    });
  }

  // Try multiple data sources in order:
  // 1. EODHD (for paid tier users)
  // 2. Alpha Vantage (free tier, includes dividend data)
  // 3. Yahoo Finance (free but requires auth, may fail)
  
  let dividendData = await fetchFromEODHD(ticker);

  if (!dividendData) {
    console.log(`[Dividend API] EODHD failed, trying Alpha Vantage...`);
    dividendData = await fetchFromAlphaVantage(ticker);
  }

  if (!dividendData) {
    console.log(`[Dividend API] Alpha Vantage failed, trying Yahoo Finance fallback...`);
    dividendData = await fetchFromYahooFinance(ticker);
  }

  if (dividendData) {
    return NextResponse.json(dividendData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
        'X-Cache': 'MISS',
        'X-API-Usage': `${dailyUsage.count}/${MAX_DAILY_CALLS}`,
      },
    });
  }

  // If we have stale cache, serve it
  if (cached) {
    console.log(`[Dividend API] ⚠️ Serving stale cache: ${ticker}`);
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
        'X-Cache': 'STALE',
        'X-Cache-Expires': new Date(cached.expiresAt).toISOString(),
      },
    });
  }

  // No data available
  console.warn(`[Dividend API] No data available for ${ticker}`);
  return NextResponse.json({
    symbol: ticker,
    annualDividendYield: null,
    quarterlyPayout: null,
    nextExDividendDate: null,
    trailingAnnualDividendRate: null,
    currency: 'USD',
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Short cache for null responses
      'X-Cache': 'MISS',
      'X-API-Usage': `${dailyUsage.count}/${MAX_DAILY_CALLS}`,
    },
  });
}
