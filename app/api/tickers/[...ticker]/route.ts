/**
 * Ticker Historical Data JSON API
 * GET /api/tickers/{ticker}/json
 * Returns historical stock data in JSON format
 * Free, no API key required
 * 
 * Uses catch-all route [...ticker] to work around Next.js 15 nested dynamic route bug
 * Matches: /api/tickers/AAPL/json -> ticker = ["AAPL", "json"]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTickerMetadata } from '@/app/lib/pseo/data';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0; // Force no caching to ensure Next.js recognizes the route

// Free tier: 50 calls per hour per IP (more generous than price API since this is historical data)
const FREE_TIER_LIMIT = 50;
const FREE_TIER_WINDOW_SECONDS = 3600; // 1 hour in seconds (for KV TTL)

// Cache for historical data (1 hour TTL)
const dataCache = new Map<string, { data: any; expiresAt: number }>();

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Convert historical data to CSV format
 * Using Excel-friendly date format: Convert YYYY-MM-DD to MM/DD/YYYY
 * Excel recognizes MM/DD/YYYY format better when opening CSV files directly
 */
function convertToCSV(data: HistoricalDataPoint[], ticker: string): string {
  const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
  const rows = data.map((d, index) => {
    // Convert ISO date (YYYY-MM-DD) to Excel-friendly format (MM/DD/YYYY)
    // Excel recognizes MM/DD/YYYY format better when opening CSV files
    let excelDate = d.date;
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day && year.length === 4 && month.length === 2 && day.length === 2) {
          excelDate = `${month}/${day}/${year}`;
        }
      }
    } catch (e) {
      // Fallback to original date if conversion fails
    }
    
    return [
      excelDate,
      d.open.toFixed(2),
      d.high.toFixed(2),
      d.low.toFixed(2),
      d.close.toFixed(2),
      d.volume.toString()
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Add UTF-8 BOM for better Excel compatibility (helps Excel recognize UTF-8 encoding)
  // Excel sometimes needs BOM to properly display special characters and dates
  // Note: Excel may show "########" for dates - users should:
  // 1. Widen the Date column (double-click column border)
  // 2. Or use Data > Text to Columns > Date format
  // 3. Or open in Google Sheets (which handles dates correctly)
  return '\uFEFF' + csvContent;
}

/**
 * Fetch historical stock data from Yahoo Finance
 */
async function fetchHistoricalData(ticker: string, range: string = '1y'): Promise<HistoricalDataPoint[] | null> {
  try {
    // Check cache first
    const cacheKey = `${ticker}:${range}`;
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // Yahoo Finance chart API - supports different ranges: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=${range}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return null;
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const opens = quotes.open || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    const closes = quotes.close || [];
    const volumes = quotes.volume || [];

    const historicalData: HistoricalDataPoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const open = opens[i];
      const high = highs[i];
      const low = lows[i];
      const close = closes[i];
      const volume = volumes[i];

      // Skip if any required field is missing or null
      if (
        timestamp &&
        typeof open === 'number' &&
        typeof high === 'number' &&
        typeof low === 'number' &&
        typeof close === 'number' &&
        typeof volume === 'number'
      ) {
        // Convert timestamp to date string using UTC to avoid timezone shifts
        // Yahoo Finance timestamps are in UTC, so we use UTC methods to get the correct date
        const dateObj = new Date(timestamp * 1000);
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        
        historicalData.push({
          date,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.round(volume),
        });
      }
    }
    
    // Sort by date to ensure chronological order (Yahoo Finance sometimes returns unsorted data)
    historicalData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Cache the result
    dataCache.set(cacheKey, {
      data: historicalData,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    });

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Distributed rate limiting using Vercel KV (Upstash Redis)
 * Returns: { allowed: boolean, remaining: number, resetTime: number }
 */
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `ratelimit:tickers:free:${ip}`;
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const resetTime = now + FREE_TIER_WINDOW_SECONDS;

  try {
    // Get current count
    const currentCount = await kv.get<number>(key) || 0;
    
    // Check if limit exceeded
    if (currentCount >= FREE_TIER_LIMIT) {
      // Get TTL to calculate actual reset time
      const ttl = await kv.ttl(key);
      const actualResetTime = ttl > 0 ? now + ttl : resetTime;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: actualResetTime
      };
    }

    // Increment counter
    const newCount = currentCount + 1;
    
    if (currentCount === 0) {
      // First request - set with expiration
      await kv.set(key, newCount, { ex: FREE_TIER_WINDOW_SECONDS });
    } else {
      // Update existing counter (TTL is preserved)
      await kv.set(key, newCount);
    }

    return {
      allowed: true,
      remaining: FREE_TIER_LIMIT - newCount,
      resetTime: resetTime
    };
  } catch (error) {
    // If KV fails, fail open (allow request) but log error
    // In production, you might want to fail closed instead
    console.error('[RATE_LIMIT_ERROR] KV operation failed:', error);
    return {
      allowed: true, // Fail open to avoid blocking legitimate users
      remaining: FREE_TIER_LIMIT - 1,
      resetTime: resetTime
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string[] }> }
) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const pathname = request.nextUrl.pathname;
  
  // Log for debugging (production-safe)
  console.warn(`[TICKERS_JSON_API] Route handler ENTRY | Path: ${pathname} | Method: ${request.method} | Params: ${JSON.stringify(resolvedParams)} | Timestamp: ${new Date().toISOString()}`);
  
  // Extract ticker and format from pathname as fallback (more reliable than params on Vercel)
  // Path format: /api/tickers/{TICKER}/json or /api/tickers/{TICKER}/csv
  const pathMatchJson = pathname.match(/^\/api\/tickers\/([^\/]+)\/json$/i);
  const pathMatchCsv = pathname.match(/^\/api\/tickers\/([^\/]+)\/csv$/i);
  const searchParams = request.nextUrl.searchParams;
  const formatParam = searchParams.get('format'); // Support ?format=csv
  
  let ticker: string | undefined;
  let format: string | undefined;
  
  if (pathMatchJson) {
    // Extract from pathname (most reliable) - JSON
    ticker = pathMatchJson[1]?.toUpperCase();
    format = formatParam || 'json';
    console.warn(`[TICKERS_API] Extracted from pathname: ticker=${ticker}, format=${format}`);
  } else if (pathMatchCsv) {
    // Extract from pathname - CSV
    ticker = pathMatchCsv[1]?.toUpperCase();
    format = 'csv';
    console.warn(`[TICKERS_API] Extracted from pathname: ticker=${ticker}, format=${format}`);
  } else {
    // Fallback to params (catch-all route)
    const tickerArray = resolvedParams.ticker || [];
    ticker = tickerArray[0]?.toUpperCase();
    const lastParam = tickerArray[tickerArray.length - 1]?.toLowerCase();
    format = formatParam || (lastParam === 'csv' ? 'csv' : 'json');
    console.warn(`[TICKERS_API] Extracted from params: ticker array=${JSON.stringify(tickerArray)}, ticker=${ticker}, format=${format}`);
  }
  
  // Verify format is "json" or "csv"
  if (format !== 'json' && format !== 'csv') {
    return NextResponse.json(
      { 
        error: 'Invalid format. Use /api/tickers/{SYMBOL}/json or /api/tickers/{SYMBOL}/csv',
        diagnostic: {
          params: resolvedParams,
          pathname: pathname,
          url: request.url,
          receivedFormat: format
        }
      },
      { 
        status: 400,
        headers: {
          'X-Tickers-Route': 'called',
          'X-Tickers-Error': 'invalid-format'
        }
      }
    );
  }
  
  if (!ticker) {
    console.warn(`[TICKERS_JSON_API] No ticker found | Pathname: ${pathname} | Params: ${JSON.stringify(resolvedParams)}`);
    return NextResponse.json(
      { 
        error: 'Ticker parameter required. Use /api/tickers/{SYMBOL}/json',
        diagnostic: {
          params: resolvedParams,
          pathname: pathname,
          url: request.url
        }
      },
      { 
        status: 400,
        headers: {
          'X-Tickers-Route': 'called',
          'X-Tickers-Error': 'missing-ticker'
        }
      }
    );
  }
  
  // Get API key from query parameter (optional)
  const apiKey = request.nextUrl.searchParams.get('key');
  const DEMO_KEY = 'demo_key';
  
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check if user has a valid paid API key (bypasses rate limiting)
  let hasValidApiKey = false;
  if (apiKey && apiKey !== DEMO_KEY) {
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      
      // Initialize Firebase Admin if not already done
      if (!getApps().length) {
        try {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          });
        } catch (error) {
          console.error('Firebase Admin initialization error:', error);
        }
      }
      
      const db = getFirestore();
      const apiKeySnapshot = await db.collection('apiKeysByEmail')
        .where('apiKey', '==', apiKey)
        .limit(1)
        .get();
      
      hasValidApiKey = !apiKeySnapshot.empty;
    } catch (error) {
      console.error('API key validation error:', error);
      // Fallback: check if key format is valid (pp_ prefix)
      hasValidApiKey = apiKey.startsWith('pp_');
    }
  }
  
  // Only apply rate limiting for free tier (no API key or demo key)
  // Skip rate limiting in development mode for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  let rateLimitResult: { allowed: boolean; remaining: number; resetTime: number } | null = null;
  if (!hasValidApiKey && !isDevelopment) {
    rateLimitResult = await checkRateLimit(ip);
    
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.max(0, rateLimitResult.resetTime - Math.floor(Date.now() / 1000));
      return NextResponse.json(
        { 
          error: 'Rate Limit Exceeded. Get Unlimited Key: pocketportfolio.app/sponsor',
          limit: FREE_TIER_LIMIT,
          window: '1 hour',
          retryAfter: retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(FREE_TIER_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime * 1000).toISOString(),
            'Retry-After': String(retryAfter)
          }
        }
      );
    }
  }

  // Get optional query parameters (searchParams already defined above)
  const range = searchParams.get('range') || '1y'; // Default to 1 year
  const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
  const requestedRange = validRanges.includes(range) ? range : '1y';

  try {
    // Fetch historical data
    const historicalData = await fetchHistoricalData(ticker, requestedRange);

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        { 
          error: `Historical data not found for ticker: ${ticker}`,
          symbol: ticker
        },
        { status: 404 }
      );
    }

    // Get ticker metadata for name and exchange
    const metadata = await getTickerMetadata(ticker);

    // Handle CSV format
    if (format === 'csv') {
      const csv = convertToCSV(historicalData, ticker);
      const headers: Record<string, string> = {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${ticker}-historical-data.csv"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      };
      
      if (hasValidApiKey) {
        headers['X-RateLimit-Limit'] = 'unlimited';
        headers['X-RateLimit-Remaining'] = 'unlimited';
      } else if (rateLimitResult) {
        headers['X-RateLimit-Limit'] = String(FREE_TIER_LIMIT);
        headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
        headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime * 1000).toISOString();
      }
      
      return new NextResponse(csv, { headers });
    }

    // Format JSON response according to documentation
    const response = {
      symbol: ticker,
      name: metadata?.name || `${ticker} Inc.`,
      exchange: metadata?.exchange || 'Unknown',
      data: historicalData,
      meta: {
        range: requestedRange,
        dataPoints: historicalData.length,
        lastUpdated: new Date().toISOString(),
      }
    };

    // Set rate limit headers (unlimited for paid users)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // Cache for 1 hour, stale for 2 hours
    };
    
    if (hasValidApiKey) {
      headers['X-RateLimit-Limit'] = 'unlimited';
      headers['X-RateLimit-Remaining'] = 'unlimited';
    } else if (rateLimitResult) {
      headers['X-RateLimit-Limit'] = String(FREE_TIER_LIMIT);
      headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
      headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime * 1000).toISOString();
    }
    
    return NextResponse.json(response, { headers });
  } catch (error: any) {
    console.error(`Error fetching ticker data for ${ticker}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical data',
        symbol: ticker,
        message: error.message
      },
      { status: 500 }
    );
  }
}

