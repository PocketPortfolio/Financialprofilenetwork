import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import {
  DEVELOPER_UTILITY_CHECKOUT_URL,
  FIRST_PARTY_HEADER,
  resolveBotGateClientIp,
} from '@/lib/bot-gate';

export {
  DEVELOPER_UTILITY_CHECKOUT_URL,
  FIRST_PARTY_HEADER,
  extractApiKeyFromRequest,
  isFirstPartyTickerRequest,
  isLikelyAutomatedClient,
  isLikelyDatacenterRequest,
  isSymbolFarmPath,
} from '@/lib/bot-gate';

export const TICKER_API_ROBOTS_TAG = 'noindex, nofollow';

function getFirstPartySecret(): string | null {
  const dedicated = process.env.PP_FIRST_PARTY_FETCH_SECRET?.trim();
  if (dedicated) return dedicated;
  const cron = process.env.CRON_SECRET?.trim();
  if (cron) return cron;
  return null;
}

/** Server-side / SSR fetches from our own app must send this header. */
export function getFirstPartyFetchHeaders(): Record<string, string> {
  const secret = getFirstPartySecret();
  if (!secret) return { Accept: 'application/json' };
  return {
    Accept: 'application/json',
    [FIRST_PARTY_HEADER]: secret,
  };
}

/** Stable client id for rate limiting when IP headers are missing. */
export function resolveTickerClientIp(request: NextRequest): string {
  const ip = resolveBotGateClientIp(request);
  if (!ip.startsWith('ua-')) return ip;

  const ua = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || '';
  const digest = createHash('sha256')
    .update(`${ua}|${accept}`)
    .digest('hex')
    .slice(0, 24);
  return `ua-${digest}`;
}

export function tickerApiBaseHeaders(): Record<string, string> {
  return {
    'X-Robots-Tag': TICKER_API_ROBOTS_TAG,
  };
}

export function rateLimitExceededJsonBody() {
  return {
    error: 'Too Many Requests',
    message:
      'Rate limit exceeded. Upgrade to Developer Utility for unlimited API access.',
    checkout_url: `${DEVELOPER_UTILITY_CHECKOUT_URL.split('?')[0]}?tier=developer-utility&utm_source=api_rate_limit&utm_medium=429&utm_campaign=ticker_api`,
  };
}

export function rateLimitExceededCsvBody(retryAfterSeconds: number): string {
  const minutes = Math.ceil(Math.max(0, retryAfterSeconds) / 60);
  const day = new Date().toISOString().split('T')[0];
  const checkout = rateLimitExceededJsonBody().checkout_url;
  return [
    'Date,Error,CheckoutUrl,RetryAfter',
    `${day},"Rate limit exceeded. Upgrade to Developer Utility for unlimited API access.",${checkout},${minutes} minute${minutes !== 1 ? 's' : ''}`,
  ].join('\n');
}

export function unauthorizedJsonBody() {
  return {
    error: 'Unauthorized',
    message:
      'Hosted data extraction requires an active Developer Utility (or Founders Club / Corporate) API key.',
    checkout_url: `${DEVELOPER_UTILITY_CHECKOUT_URL.split('?')[0]}?tier=developer-utility&utm_source=api_rate_limit&utm_medium=401&utm_campaign=ticker_api`,
  };
}

export function unauthorizedCsvBody(): string {
  const day = new Date().toISOString().split('T')[0];
  const checkout = unauthorizedJsonBody().checkout_url;
  return [
    'Date,Error,CheckoutUrl',
    `${day},"API key required for automated extraction. Upgrade to Developer Utility.",${checkout}`,
  ].join('\n');
}
