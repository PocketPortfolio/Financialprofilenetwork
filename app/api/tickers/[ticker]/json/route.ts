/**
 * Ticker Historical Data JSON API
 * GET /api/tickers/{ticker}/json
 * Returns historical stock data in JSON format
 * Free, no API key required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTickerMetadata } from '@/app/lib/pseo/data';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0; // Force no caching to ensure Next.js recognizes the route

// Rate limiting storage (in production, use Redis or Vercel KV)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Free tier: 50 calls per hour per IP (more generous than price API since this is historical data)
const FREE_TIER_LIMIT = 50;
const FREE_TIER_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

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
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const pathname = request.nextUrl.pathname;
  
  // Log for debugging (production-safe)
  console.warn(`[TICKERS_JSON_API] Route handler ENTRY | Path: ${pathname} | Method: ${request.method} | Params: ${JSON.stringify(resolvedParams)} | Timestamp: ${new Date().toISOString()}`);
  
  const ticker = resolvedParams.ticker?.toUpperCase();
  
  console.warn(`[TICKERS_JSON_API] Extracted ticker: ${ticker} | Pathname: ${pathname}`);
  
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
  
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Rate limiting for free tier
  const now = Date.now();
  const key = `free:${ip}`;
  const limit = rateLimitMap.get(key);
  
  if (limit) {
    // Check if window has expired
    if (now > limit.resetTime) {
      // Reset counter
      rateLimitMap.set(key, { count: 1, resetTime: now + FREE_TIER_WINDOW });
    } else {
      // Check if limit exceeded
      if (limit.count >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          { 
            error: 'Rate Limit Exceeded. Get Unlimited Key: pocketportfolio.app/sponsor',
            limit: FREE_TIER_LIMIT,
            window: '1 hour',
            retryAfter: Math.ceil((limit.resetTime - now) / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(FREE_TIER_LIMIT),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
              'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000))
            }
          }
        );
      }
      // Increment counter
      limit.count++;
      rateLimitMap.set(key, limit);
    }
  } else {
    // First request from this IP
    rateLimitMap.set(key, { count: 1, resetTime: now + FREE_TIER_WINDOW });
  }

  // Get optional query parameters
  const searchParams = request.nextUrl.searchParams;
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

    // Format response according to documentation
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

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // Cache for 1 hour, stale for 2 hours
        'X-RateLimit-Limit': String(FREE_TIER_LIMIT),
        'X-RateLimit-Remaining': String(FREE_TIER_LIMIT - (rateLimitMap.get(key)?.count || 1)),
        'X-RateLimit-Reset': new Date(rateLimitMap.get(key)?.resetTime || now + FREE_TIER_WINDOW).toISOString(),
      },
    });
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

