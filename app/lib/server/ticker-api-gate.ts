import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';

/** Canonical scraper upsell — Developer Utility (not Code Supporter, not bare /sponsor). */
export const DEVELOPER_UTILITY_CHECKOUT_URL =
  'https://www.pocketportfolio.app/sponsor?tier=developer-utility&utm_source=api_rate_limit&utm_medium=429&utm_campaign=ticker_api';

export const TICKER_API_ROBOTS_TAG = 'noindex, nofollow';

export const FIRST_PARTY_HEADER = 'x-pp-first-party';

const FIRST_PARTY_HOST_SUFFIXES = [
  'pocketportfolio.app',
  'localhost',
  '127.0.0.1',
] as const;

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

function hostFromUrlish(value: string | null): string | null {
  if (!value) return null;
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).hostname.toLowerCase();
    }
  } catch {
    return null;
  }
  return null;
}

function isFirstPartyHost(hostname: string | null): boolean {
  if (!hostname) return false;
  const host = hostname.split(':')[0]?.toLowerCase() ?? '';
  return FIRST_PARTY_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

/**
 * First-party = browser same-origin/same-site, or SSR with shared secret header.
 * Query flags like ?desktop=true must NEVER grant this.
 */
export function isFirstPartyTickerRequest(request: NextRequest): boolean {
  const secret = getFirstPartySecret();
  const provided = request.headers.get(FIRST_PARTY_HEADER);
  if (secret && provided && provided === secret) {
    return true;
  }

  const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return true;
  }

  const originHost = hostFromUrlish(request.headers.get('origin'));
  if (isFirstPartyHost(originHost)) {
    return true;
  }

  const refererHost = hostFromUrlish(request.headers.get('referer'));
  if (isFirstPartyHost(refererHost)) {
    return true;
  }

  return false;
}

/** Stable client id for rate limiting when IP headers are missing (never use Date.now()). */
export function resolveTickerClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const realIp = request.headers.get('x-real-ip');
  const ip =
    forwardedFor?.split(',')[0]?.trim() ||
    cfConnectingIp?.trim() ||
    realIp?.trim();

  if (ip) return ip;

  const ua = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || '';
  const digest = createHash('sha256')
    .update(`${ua}|${accept}`)
    .digest('hex')
    .slice(0, 24);
  return `ua-${digest}`;
}

/**
 * Phase 2 hard gate: non-browser extractors without a key.
 * Browser-like clients still receive soft metering.
 */
export function isLikelyAutomatedClient(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua || ua === 'unknown') return true;

  const botHints = [
    'curl/',
    'wget/',
    'python-requests',
    'python-urllib',
    'httpx',
    'go-http-client',
    'java/',
    'okhttp',
    'scrapy',
    'aiohttp',
    'node-fetch',
    'axios/',
    'postman',
    'insomnia',
    'httpclient',
    'libwww',
    'mechanize',
  ];
  if (botHints.some((h) => ua.includes(h))) return true;

  const secFetchMode = (request.headers.get('sec-fetch-mode') || '').toLowerCase();
  const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  // Real browsers navigating/fetching same-site usually send Sec-Fetch-*
  if (!secFetchMode && !secFetchSite && !request.headers.get('origin')) {
    // Accept headers that look like raw API clients
    const accept = (request.headers.get('accept') || '').toLowerCase();
    if (
      accept.includes('application/json') &&
      !accept.includes('text/html') &&
      !ua.includes('mozilla/')
    ) {
      return true;
    }
  }

  return false;
}

/** Datacenter / hosting ASN hint via Cloudflare header when present (challenge posture, not hard ban). */
export function isLikelyDatacenterRequest(request: NextRequest): boolean {
  const cfAsn = request.headers.get('cf-asn') || '';
  // Common cloud ASN list — used only to tighten free quota, never hard 403
  const cloudAsns = new Set([
    '16509', // Amazon
    '14618', // Amazon
    '15169', // Google
    '396982', // Google Cloud
    '8075', // Microsoft
    '14061', // DigitalOcean
    '20473', // Choopa/Vultr
    '24940', // Hetzner
    '16276', // OVH
    '13335', // Cloudflare (workers sometimes)
    '63949', // Linode/Akamai
  ]);
  if (cfAsn && cloudAsns.has(cfAsn)) return true;

  return false;
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
    checkout_url: DEVELOPER_UTILITY_CHECKOUT_URL,
  };
}

export function rateLimitExceededCsvBody(retryAfterSeconds: number): string {
  const minutes = Math.ceil(Math.max(0, retryAfterSeconds) / 60);
  const day = new Date().toISOString().split('T')[0];
  return [
    'Date,Error,CheckoutUrl,RetryAfter',
    `${day},"Rate limit exceeded. Upgrade to Developer Utility for unlimited API access.",${DEVELOPER_UTILITY_CHECKOUT_URL},${minutes} minute${minutes !== 1 ? 's' : ''}`,
  ].join('\n');
}

export function unauthorizedJsonBody() {
  return {
    error: 'Unauthorized',
    message:
      'Hosted data extraction requires an active Developer Utility (or Founders Club / Corporate) API key.',
    checkout_url: DEVELOPER_UTILITY_CHECKOUT_URL,
  };
}

export function unauthorizedCsvBody(): string {
  const day = new Date().toISOString().split('T')[0];
  return [
    'Date,Error,CheckoutUrl',
    `${day},"API key required for automated extraction. Upgrade to Developer Utility.",${DEVELOPER_UTILITY_CHECKOUT_URL}`,
  ].join('\n');
}
