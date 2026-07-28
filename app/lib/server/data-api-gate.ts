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
  rateLimitExceededJsonBody,
  tickerApiBaseHeaders,
  unauthorizedJsonBody,
} from '@/app/lib/server/ticker-api-gate';

const DEMO_KEY = 'demo_key';
const WINDOW_SECONDS = 3600;
const FREE_TIER_LIMIT = 50;
const DATACENTER_LIMIT = 12;
const SYMBOL_FARM_LIMIT = 6;

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
  const now = Math.floor(Date.now() / 1000);

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

function unauthorizedResponse(): NextResponse {
  return NextResponse.json(unauthorizedJsonBody(), {
    status: 401,
    headers: gateHeaders(),
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
      }),
    },
  );
}

/**
 * Enforce paid-key / rate-limit policy on market data APIs.
 * Automated clients always need a key. Symbol-farm referrers get a tight bucket.
 */
export async function enforceDataApiGate(
  request: NextRequest,
): Promise<DataApiGateResult> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) return { allowed: true, hasValidApiKey: false };

  const apiKey = extractApiKeyFromRequest(request);
  const hasValidApiKey = apiKey ? await validatePaidApiKey(apiKey) : false;
  if (hasValidApiKey) return { allowed: true, hasValidApiKey: true };

  const isAutomated = isLikelyAutomatedClient(request);
  const isFirstParty = isFirstPartyTickerRequest(request);

  if (isAutomated) {
    return { allowed: false, response: unauthorizedResponse() };
  }

  if (isFirstParty) {
    return { allowed: true, hasValidApiKey: false };
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
