import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import {
  DEVELOPER_UTILITY_CHECKOUT_URL,
  extractApiKeyFromRequest,
  isFirstPartyTickerRequest,
  isLikelyAutomatedClient,
  isLikelyDatacenterRequest,
  isSymbolFarmReferrer,
  resolveBotGateClientIp,
} from '@/lib/bot-gate';
import {
  paymentRequiredCsvBody,
  paymentRequiredHtmlBody,
  paymentRequiredJsonBody,
  prefersHtmlPaymentPage,
  rateLimitExceededJsonBody,
  tickerApiBaseHeaders,
  unauthorizedCsvBody,
  unauthorizedJsonBody,
} from '@/app/lib/server/ticker-api-gate';

const DEMO_KEY = 'demo_key';
const WINDOW_SECONDS = 3600;
/** Soft meter for non-series surfaces (quote, dividend) — not full OHLCV vault. */
const FREE_TIER_LIMIT = 50;
const DATACENTER_LIMIT = 12;
const SYMBOL_FARM_LIMIT = 6;

export type DataApiGateSurface = 'series' | 'metered';

export type DataApiGateOptions = {
  /**
   * `series` — /api/tickers/* + /api/price/* : zero free full payloads.
   * `metered` — quote/dividend soft KV buckets (no bulk OHLCV dump).
   */
  surface?: DataApiGateSurface;
};

export type DataApiGateResult =
  | { allowed: true; hasValidApiKey: boolean }
  | { allowed: false; response: NextResponse };

async function validatePaidApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey === DEMO_KEY) return false;
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
    const snap = await db
      .collection('apiKeysByEmail')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();
    return !snap.empty;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

async function checkKvRateLimit(
  ip: string,
  bucket: string,
  limit: number,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const key = `ratelimit:data-api:${bucket}:${ip}:${limit}`;

  try {
    const current = (await kv.get<number>(key)) || 0;
    if (current >= limit) {
      const ttl = await kv.ttl(key);
      return { allowed: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS };
    }
    const next = current + 1;
    if (current === 0) {
      await kv.set(key, next, { ex: WINDOW_SECONDS });
    } else {
      await kv.set(key, next);
    }
    return { allowed: true, retryAfter: 0 };
  } catch (error) {
    console.error('[data-api-gate] KV rate limit failed:', error);
    return { allowed: true, retryAfter: 0 };
  }
}

function gateHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...tickerApiBaseHeaders(), ...extra };
}

function wantsCsv(request: NextRequest): boolean {
  const path = request.nextUrl.pathname.toLowerCase();
  if (path.endsWith('/csv') || path.includes('/csv')) return true;
  const format = (request.nextUrl.searchParams.get('format') || '').toLowerCase();
  return format === 'csv';
}

function unauthorizedResponse(request: NextRequest): NextResponse {
  if (wantsCsv(request)) {
    return new NextResponse(unauthorizedCsvBody(), {
      status: 401,
      headers: gateHeaders({
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'no-store',
      }),
    });
  }
  return NextResponse.json(unauthorizedJsonBody(), {
    status: 401,
    headers: gateHeaders({ 'Cache-Control': 'no-store' }),
  });
}

function paymentRequiredResponse(request: NextRequest): NextResponse {
  const symbol = extractTickerFromDataApiPath(request.nextUrl.pathname);
  if (wantsCsv(request)) {
    return new NextResponse(paymentRequiredCsvBody(symbol), {
      status: 402,
      headers: gateHeaders({
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'no-store',
      }),
    });
  }
  if (prefersHtmlPaymentPage(request)) {
    return new NextResponse(paymentRequiredHtmlBody(symbol), {
      status: 402,
      headers: gateHeaders({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      }),
    });
  }
  return NextResponse.json(paymentRequiredJsonBody(symbol), {
    status: 402,
    headers: gateHeaders({ 'Cache-Control': 'no-store' }),
  });
}

function rateLimitedResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      ...rateLimitExceededJsonBody(),
      retryAfter,
    },
    {
      status: 429,
      headers: gateHeaders({
        'Retry-After': String(Math.max(1, retryAfter)),
        'Cache-Control': 'no-store',
      }),
    },
  );
}

/** Pull symbol from /api/tickers/{SYM}/… or /api/price/{SYM}. */
export function extractTickerFromDataApiPath(pathname: string): string | null {
  const tickers = pathname.match(/^\/api\/tickers\/([^/]+)/i);
  if (tickers?.[1]) {
    try {
      return decodeURIComponent(tickers[1]).toUpperCase();
    } catch {
      return tickers[1].toUpperCase();
    }
  }
  const price = pathname.match(/^\/api\/price\/([^/]+)/i);
  if (price?.[1]) {
    try {
      return decodeURIComponent(price[1]).toUpperCase();
    } catch {
      return price[1].toUpperCase();
    }
  }
  return null;
}

/**
 * Enforce paid-key / first-party policy on market data APIs.
 * `series` surfaces never emit full OHLCV without a key (human → 402 stub, bot → 401).
 */
export async function enforceDataApiGate(
  request: NextRequest,
  options: DataApiGateOptions = {},
): Promise<DataApiGateResult> {
  const surface: DataApiGateSurface = options.surface ?? 'metered';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Soft surfaces keep local DX bypass; series vault is always locked (incl. localhost).
  if (isDevelopment && surface === 'metered') {
    return { allowed: true, hasValidApiKey: false };
  }

  const apiKey = extractApiKeyFromRequest(request);
  const hasValidApiKey = apiKey ? await validatePaidApiKey(apiKey) : false;
  if (hasValidApiKey) return { allowed: true, hasValidApiKey: true };

  const isAutomated = isLikelyAutomatedClient(request);
  const isFirstParty = isFirstPartyTickerRequest(request);

  if (isAutomated) {
    return { allowed: false, response: unauthorizedResponse(request) };
  }

  if (isFirstParty) {
    return { allowed: true, hasValidApiKey: false };
  }

  // Unpaid human on OHLCV/price vault → sales stub (never full series).
  if (surface === 'series') {
    return { allowed: false, response: paymentRequiredResponse(request) };
  }

  const ip = resolveBotGateClientIp(request);
  const isDatacenter = isLikelyDatacenterRequest(request);
  const fromSymbolFarm = isSymbolFarmReferrer(request);
  const limit = fromSymbolFarm
    ? SYMBOL_FARM_LIMIT
    : isDatacenter
      ? DATACENTER_LIMIT
      : FREE_TIER_LIMIT;
  const bucket = fromSymbolFarm ? 'symbol-farm' : isDatacenter ? 'dc' : 'external';

  const rate = await checkKvRateLimit(ip, bucket, limit);
  if (!rate.allowed) {
    return { allowed: false, response: rateLimitedResponse(rate.retryAfter) };
  }

  return { allowed: true, hasValidApiKey: false };
}

export { DEVELOPER_UTILITY_CHECKOUT_URL };
