/**
 * Ticker Historical Data JSON/CSV API
 * GET /api/tickers/{ticker}/json|csv
 *
 * First-party HTML UI is free (same-origin / SSR secret).
 * External unauthenticated traffic is KV-metered; automated clients require a paid API key.
 * Upsell: Developer Utility Stripe deep-link.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTickerMetadata } from '@/app/lib/pseo/data';
import { kv } from '@vercel/kv';
import {
  DEVELOPER_UTILITY_CHECKOUT_URL,
  isFirstPartyTickerRequest,
  isLikelyAutomatedClient,
  isLikelyDatacenterRequest,
  rateLimitExceededCsvBody,
  rateLimitExceededJsonBody,
  resolveTickerClientIp,
  tickerApiBaseHeaders,
  unauthorizedCsvBody,
  unauthorizedJsonBody,
} from '@/app/lib/server/ticker-api-gate';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0; // Force no caching to ensure Next.js recognizes the route
export const fetchCache = 'force-no-store'; // Required for Next.js 15 production routes
/** GSC/crawl: avoid platform 504s; Yahoo fetches use AbortSignal.timeout below */
export const maxDuration = 60;

/** Upstream Yahoo chart/quote fetches — fail fast before serverless wall clock kills the invocation */
const YAHOO_FETCH_TIMEOUT_MS = 14_000;

// Free tier: 50 calls per hour per IP for unauthenticated external traffic
const FREE_TIER_LIMIT = 50;
const FREE_TIER_WINDOW_SECONDS = 3600; // 1 hour in seconds (for KV TTL)
/** Datacenter ASN clients get a tighter free bucket (challenge posture, not hard ban). */
const DATACENTER_FREE_TIER_LIMIT = 15;

// Cache for historical data (1 hour TTL)
// Limit cache size to prevent memory leaks in serverless functions
const MAX_CACHE_SIZE = 100;
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
 * Escape CSV cell content to prevent injection and parsing errors
 * Escapes commas, quotes, and newlines according to CSV RFC 4180
 */
function escapeCsvCell(cell: string | number): string {
  const str = String(cell);
  // Escape cells containing commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // Double quotes to escape quotes, wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert historical data to CSV format
 * Using Excel-friendly date format: Convert YYYY-MM-DD to MM/DD/YYYY
 * Excel recognizes MM/DD/YYYY format better when opening CSV files directly
 */
function convertToCSV(data: HistoricalDataPoint[], ticker: string): string {
  const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'SOURCE: Pocket Portfolio API'];
  const rows = data.map((d, index) => {
    // Convert ISO date (YYYY-MM-DD) to Excel-friendly format (MM/DD/YYYY)
    // Excel recognizes MM/DD/YYYY format better when opening CSV files
    let excelDate = d.date;
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        // Validate date parts are valid numbers
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        if (year && month && day && 
            year.length === 4 && month.length === 2 && day.length === 2 &&
            !isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum) &&
            yearNum >= 1900 && yearNum <= 2100 &&
            monthNum >= 1 && monthNum <= 12 &&
            dayNum >= 1 && dayNum <= 31) {
          excelDate = `${month}/${day}/${year}`;
        }
      }
    } catch (e) {
      // Fallback to original date if conversion fails
    }
    
    return [
      escapeCsvCell(excelDate),
      escapeCsvCell(d.open.toFixed(2)),
      escapeCsvCell(d.high.toFixed(2)),
      escapeCsvCell(d.low.toFixed(2)),
      escapeCsvCell(d.close.toFixed(2)),
      escapeCsvCell(d.volume.toString()),
      ''
    ];
  });

  const footerRow = [
    'DATA END',
    'For automated updates',
    'upgrade at:',
    DEVELOPER_UTILITY_CHECKOUT_URL,
    '',
    '',
    '',
  ]
    .map(escapeCsvCell)
    .join(',');

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    footerRow
  ].join('\n');
  
  // Add UTF-8 BOM for better Excel compatibility (helps Excel recognize UTF-8 encoding)
  // Excel sometimes needs BOM to properly display special characters and dates
  // Note: Excel may show "########" for dates - users should:
  // 1. Widen the Date column (double-click column border)
  // 2. Or use Data > Text to Columns > Date format
  // 3. Or open in Google Sheets (which handles dates correctly)
  return '\uFEFF' + csvContent;
}

const YAHOO_QUOTE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
};

/**
 * Fallback for mutual funds / symbols with no chart: build 1–2 rows from quoteSummary (NAV).
 */
async function fetchNavFromQuoteSummary(ticker: string): Promise<HistoricalDataPoint[] | null> {
  const urls = [
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=summaryDetail`,
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=summaryDetail`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: YAHOO_QUOTE_HEADERS,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(YAHOO_FETCH_TIMEOUT_MS),
      });
      if (!r.ok) continue;
      const data = await r.json();
      const summary = data?.quoteSummary?.result?.[0]?.summaryDetail;
      if (!summary) continue;
      const raw = (x: any) => (x != null && typeof x === 'object' && 'raw' in x ? (x as { raw: number }).raw : typeof x === 'number' ? x : undefined);
      const price = raw(summary.regularMarketPrice);
      const previousClose = raw(summary.previousClose);
      if (typeof price !== 'number' || !Number.isFinite(price)) continue;
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const points: HistoricalDataPoint[] = [
        { date: todayStr, open: price, high: price, low: price, close: price, volume: 0 },
      ];
      if (typeof previousClose === 'number' && Number.isFinite(previousClose)) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yyyy2 = yesterday.getFullYear();
        const mm2 = String(yesterday.getMonth() + 1).padStart(2, '0');
        const dd2 = String(yesterday.getDate()).padStart(2, '0');
        points.unshift({
          date: `${yyyy2}-${mm2}-${dd2}`,
          open: previousClose,
          high: previousClose,
          low: previousClose,
          close: previousClose,
          volume: 0,
        });
      }
      return points;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Fetch historical stock data from Yahoo Finance.
 * For mutual funds with no chart data, falls back to quoteSummary (NAV) to return 1–2 rows.
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
      headers: YAHOO_QUOTE_HEADERS,
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(YAHOO_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${ticker}: ${response.status}`);
      const navFallback = await fetchNavFromQuoteSummary(ticker);
      if (navFallback?.length) {
        if (dataCache.size >= MAX_CACHE_SIZE) {
          const entries = Array.from(dataCache.entries());
          entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
          entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)).forEach(([k]) => dataCache.delete(k));
        }
        dataCache.set(cacheKey, { data: navFallback, expiresAt: Date.now() + 3600 * 1000 });
        return navFallback;
      }
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    const timestamps = result?.timestamp || [];
    const quotes = result?.indicators?.quote?.[0] || {};
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

      if (
        timestamp &&
        typeof open === 'number' &&
        typeof high === 'number' &&
        typeof low === 'number' &&
        typeof close === 'number' &&
        typeof volume === 'number'
      ) {
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

    // If chart returned no usable rows (e.g. mutual fund), try quoteSummary for NAV
    if (historicalData.length === 0) {
      const navFallback = await fetchNavFromQuoteSummary(ticker);
      if (navFallback?.length) {
        if (dataCache.size >= MAX_CACHE_SIZE) {
          const entries = Array.from(dataCache.entries());
          entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
          entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)).forEach(([k]) => dataCache.delete(k));
        }
        dataCache.set(cacheKey, { data: navFallback, expiresAt: Date.now() + 3600 * 1000 });
        return navFallback;
      }
    }

    historicalData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    if (dataCache.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(dataCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)).forEach(([k]) => dataCache.delete(k));
    }

    dataCache.set(cacheKey, {
      data: historicalData,
      expiresAt: Date.now() + 3600 * 1000,
    });

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    const navFallback = await fetchNavFromQuoteSummary(ticker);
    return navFallback;
  }
}

/**
 * Distributed rate limiting using Vercel KV (Upstash Redis)
 * Returns: { allowed: boolean, remaining: number, resetTime: number, limit: number }
 */
async function checkRateLimit(
  ip: string,
  limit: number = FREE_TIER_LIMIT
): Promise<{ allowed: boolean; remaining: number; resetTime: number; limit: number }> {
  const key = `ratelimit:tickers:free:${ip}:${limit}`;
  const now = Math.floor(Date.now() / 1000);
  const resetTime = now + FREE_TIER_WINDOW_SECONDS;

  try {
    const currentCount = (await kv.get<number>(key)) || 0;

    if (currentCount >= limit) {
      const ttl = await kv.ttl(key);
      const actualResetTime = ttl > 0 ? now + ttl : resetTime;
      return {
        allowed: false,
        remaining: 0,
        resetTime: actualResetTime,
        limit,
      };
    }

    const newCount = currentCount + 1;

    if (currentCount === 0) {
      await kv.set(key, newCount, { ex: FREE_TIER_WINDOW_SECONDS });
    } else {
      await kv.set(key, newCount);
    }

    return {
      allowed: true,
      remaining: limit - newCount,
      resetTime,
      limit,
    };
  } catch (error) {
    console.error('[RATE_LIMIT_ERROR] KV operation failed:', error);
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime,
      limit,
    };
  }
}

function withTickerHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  return { ...tickerApiBaseHeaders(), ...headers };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string[] }> }
) {
  try {
    // Next.js 15: params is always a Promise
    const resolvedParams = await params;
    const pathname = request.nextUrl.pathname;
    
  // Extract ticker and format from pathname as fallback (more reliable than params on Vercel)
  // Path format: /api/tickers/{TICKER}/json or /api/tickers/{TICKER}/csv
  const pathMatchJson = pathname.match(/^\/api\/tickers\/([^\/]+)\/json$/i);
  const pathMatchCsv = pathname.match(/^\/api\/tickers\/([^\/]+)\/csv$/i);
  const searchParams = request.nextUrl.searchParams;
  const formatParam = searchParams.get('format'); // Support ?format=csv

  let ticker: string | undefined;
  let format: string | undefined;

  const decodeTicker = (raw: string | undefined): string | undefined => {
    if (!raw) return raw;
    try {
      return decodeURIComponent(raw).toUpperCase();
    } catch {
      return raw.toUpperCase();
    }
  };

  if (pathMatchJson) {
    ticker = decodeTicker(pathMatchJson[1]);
    format = formatParam || 'json';
  } else if (pathMatchCsv) {
    ticker = decodeTicker(pathMatchCsv[1]);
    format = 'csv';
  } else {
    const tickerArray = resolvedParams.ticker || [];
    ticker = decodeTicker(tickerArray[0]);
    const lastParam = tickerArray[tickerArray.length - 1]?.toLowerCase();
    format = formatParam || (lastParam === 'csv' ? 'csv' : 'json');
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
        headers: withTickerHeaders({
          'X-Tickers-Route': 'called',
          'X-Tickers-Error': 'invalid-format'
        })
      }
    );
  }
  
  if (!ticker) {
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
        headers: withTickerHeaders({
          'X-Tickers-Route': 'called',
          'X-Tickers-Error': 'missing-ticker'
        })
      }
    );
  }
  
  // Validate ticker format (alphanumeric, dots, hyphens, max 10 chars)
  // Prevents path traversal attacks and invalid input
  const TICKER_REGEX = /^[A-Z0-9.\-^=]{1,12}$/i;
  if (!TICKER_REGEX.test(ticker)) {
    return NextResponse.json(
      { 
        error: 'Invalid ticker symbol format. Ticker must be 1-10 alphanumeric characters (may include . or -).',
        symbol: ticker,
        diagnostic: {
          pathname: pathname,
          url: request.url
        }
      },
      { 
        status: 400,
        headers: withTickerHeaders({
          'X-Tickers-Route': 'called',
          'X-Tickers-Error': 'invalid-ticker-format'
        })
      }
    );
  }
  
  // API key: ?key=... or Authorization: Bearer ...
  const authHeader = request.headers.get('authorization') || '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const apiKey =
    request.nextUrl.searchParams.get('key') ||
    (bearerMatch?.[1]?.trim() || null);
  const DEMO_KEY = 'demo_key';

  const ip = resolveTickerClientIp(request);
  const isFirstParty = isFirstPartyTickerRequest(request);
  const isAutomated = isLikelyAutomatedClient(request);
  const isDatacenter = isLikelyDatacenterRequest(request);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Check if user has a valid paid API key (bypasses rate limiting)
  // Developer Utility / Founders Club / Corporate keys live in apiKeysByEmail
  let hasValidApiKey = false;
  if (apiKey && apiKey !== DEMO_KEY) {
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');

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
      const apiKeySnapshot = await db
        .collection('apiKeysByEmail')
        .where('apiKey', '==', apiKey)
        .limit(1)
        .get();

      hasValidApiKey = !apiKeySnapshot.empty;
    } catch (error) {
      console.error('API key validation error:', error);
      // Do NOT fail-open on pp_ prefix — treat as unauthenticated + meter
      hasValidApiKey = false;
    }
  }

  let rateLimitResult: {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
  } | null = null;

  // Phase 2: automated external clients without a key → hard 401 (no free firehose)
  if (!hasValidApiKey && !isFirstParty && !isDevelopment && isAutomated) {
    if (format === 'csv') {
      return new NextResponse(unauthorizedCsvBody(), {
        status: 401,
        headers: withTickerHeaders({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${ticker}-api-key-required.csv"`,
        }),
      });
    }
    return NextResponse.json(unauthorizedJsonBody(), {
      status: 401,
      headers: withTickerHeaders(),
    });
  }

  // Soft meter: all external unauthenticated formats (JSON + CSV). No desktop/csv/source bypasses.
  // First-party UI (dashboard, symbol pages, SSR with secret) is exempt.
  if (!hasValidApiKey && !isFirstParty && !isDevelopment) {
    const limit = isDatacenter ? DATACENTER_FREE_TIER_LIMIT : FREE_TIER_LIMIT;
    rateLimitResult = await checkRateLimit(ip, limit);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.max(
        0,
        rateLimitResult.resetTime - Math.floor(Date.now() / 1000)
      );
      // Phase 2 end-state on breach: 401 for machines; keep 429 body shape with checkout for clarity
      const status = isAutomated ? 401 : 429;
      const jsonBody = isAutomated
        ? unauthorizedJsonBody()
        : {
            ...rateLimitExceededJsonBody(),
            limit: rateLimitResult.limit,
            window: '1 hour',
            retryAfter,
          };
      const csvBody = isAutomated
        ? unauthorizedCsvBody()
        : rateLimitExceededCsvBody(retryAfter);

      if (format === 'csv') {
        return new NextResponse(csvBody, {
          status,
          headers: withTickerHeaders({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${ticker}-rate-limit-error.csv"`,
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(
              rateLimitResult.resetTime * 1000
            ).toISOString(),
            'Retry-After': String(retryAfter),
          }),
        });
      }

      return NextResponse.json(jsonBody, {
        status,
        headers: withTickerHeaders({
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(
            rateLimitResult.resetTime * 1000
          ).toISOString(),
          'Retry-After': String(retryAfter),
        }),
      });
    }
  }

  // Get optional query parameters (searchParams already defined above)
  const range = searchParams.get('range') || '1y'; // Default to 1 year
  const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
  const requestedRange = validRanges.includes(range) ? range : '1y';

  try {
    // Fetch historical data
    const historicalData = await fetchHistoricalData(ticker, requestedRange);

    // No data (e.g. mutual funds, delisted, or unsupported symbols) → 200 with empty data, not 404
    // So /s/[symbol] and API stay consistent: symbol exists, data may be empty
    if (!historicalData || historicalData.length === 0) {
      const metadata = await getTickerMetadata(ticker);
      const name = metadata?.name || `${ticker} Inc.`;
      const exchange = metadata?.exchange || 'Unknown';

      if (format === 'csv') {
        // Valid CSV with headers + one note row (200, not 404)
        const note = `No historical data available for ${ticker} (e.g. mutual funds may have limited data).`;
        const noteRow = [new Date().toISOString().split('T')[0], '', '', '', '', '0', note].map(escapeCsvCell).join(',');
        const csvContent = '\uFEFFDate,Open,High,Low,Close,Volume,SOURCE: Pocket Portfolio API\n' + noteRow + '\n';
        const headers: Record<string, string> = withTickerHeaders({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${ticker}-historical-data.csv"`,
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Data-Status': 'no-data',
        });
        if (hasValidApiKey) {
          headers['X-RateLimit-Limit'] = 'unlimited';
          headers['X-RateLimit-Remaining'] = 'unlimited';
        } else if (rateLimitResult) {
          headers['X-RateLimit-Limit'] = String(rateLimitResult.limit);
          headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
          headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime * 1000).toISOString();
        }
        return new NextResponse(csvContent, { status: 200, headers });
      }

      // JSON: same shape as success response, with empty data array (200)
      const emptyResponse = {
        symbol: ticker,
        name,
        exchange,
        data: [] as HistoricalDataPoint[],
        meta: {
          range: requestedRange,
          dataPoints: 0,
          lastUpdated: new Date().toISOString(),
          message: 'No historical data available for this symbol (e.g. mutual funds may have limited data).',
        },
      };
      const headers: Record<string, string> = withTickerHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Data-Status': 'no-data',
      });
      if (hasValidApiKey) {
        headers['X-RateLimit-Limit'] = 'unlimited';
        headers['X-RateLimit-Remaining'] = 'unlimited';
      } else if (rateLimitResult) {
        headers['X-RateLimit-Limit'] = String(rateLimitResult.limit);
        headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
        headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime * 1000).toISOString();
      }
      return NextResponse.json(emptyResponse, { status: 200, headers });
    }

    // Get ticker metadata for name and exchange
    const metadata = await getTickerMetadata(ticker);

    // Handle CSV format
    if (format === 'csv') {
      const csv = convertToCSV(historicalData, ticker);
      const headers: Record<string, string> = withTickerHeaders({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${ticker}-historical-data.csv"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      });
      
      if (hasValidApiKey) {
        headers['X-RateLimit-Limit'] = 'unlimited';
        headers['X-RateLimit-Remaining'] = 'unlimited';
      } else if (rateLimitResult) {
        headers['X-RateLimit-Limit'] = String(rateLimitResult.limit);
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
    const headers: Record<string, string> = withTickerHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    });
    
    if (hasValidApiKey) {
      headers['X-RateLimit-Limit'] = 'unlimited';
      headers['X-RateLimit-Remaining'] = 'unlimited';
    } else if (rateLimitResult) {
      headers['X-RateLimit-Limit'] = String(rateLimitResult.limit);
      headers['X-RateLimit-Remaining'] = String(rateLimitResult.remaining);
      headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime * 1000).toISOString();
    }
    
    return NextResponse.json(response, { headers });
  } catch (error: any) {
    console.error(`Error fetching ticker data for ${ticker}:`, error);
    // 503 (not 500): transient upstream/handler failure — better for crawlers than generic 5xx
    return NextResponse.json(
      {
        error: 'Data source temporarily unavailable',
        symbol: ticker,
        message: error?.message || 'Retry later',
      },
      {
        status: 503,
        headers: withTickerHeaders({
          'Retry-After': '120',
          'Cache-Control': 'no-store',
        }),
      }
    );
  }
  } catch (error: any) {
    // Catch any initialization errors or unexpected errors outside the main try-catch
    console.error('[TICKERS_API] Unexpected error in route handler:', error);
    return NextResponse.json(
      {
        error: 'Service temporarily unavailable',
        message: error?.message || 'An unexpected error occurred',
        diagnostic: {
          errorType: error?.constructor?.name || 'Unknown',
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 503,
        headers: withTickerHeaders({
          'Retry-After': '120',
          'Cache-Control': 'no-store',
        }),
      }
    );
  }
}

