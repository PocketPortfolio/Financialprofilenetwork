import type { NextRequest } from 'next/server';

/** Canonical scraper upsell — Developer Utility */
export const DEVELOPER_UTILITY_CHECKOUT_URL =
  'https://www.pocketportfolio.app/sponsor?tier=developer-utility&utm_source=bot_gate&utm_medium=401&utm_campaign=data_surface';

export const FIRST_PARTY_HEADER = 'x-pp-first-party';

const FIRST_PARTY_HOST_SUFFIXES = [
  'pocketportfolio.app',
  'localhost',
  '127.0.0.1',
] as const;

/** App surfaces that may call market data APIs without a paid key (humans in-product). */
const TRUSTED_APP_PATH_PREFIXES = [
  '/dashboard',
  '/import',
  '/positions',
  '/watchlist',
  '/login',
  '/features',
  '/tools/risk-calculator',
  '/tools/track',
  '/static',
] as const;

/**
 * Enterprise allowlist — ONLY Google + Bing may crawl gated surfaces.
 * All other bots/crawlers (SEO farms, LLM scrapers, social previews, etc.) are blocked.
 * Humans with real browser signals remain allowed.
 */
const SEARCH_CRAWLER_HINTS = [
  'googlebot',
  'google-inspectiontool',
  'adsbot-google',
  'bingbot',
  'bingpreview',
  'msnbot',
] as const;

const AUTOMATION_UA_HINTS = [
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
  'headlesschrome',
  'headless',
  'puppeteer',
  'playwright',
  'selenium',
  'webdriver',
  'phantomjs',
  'slurp',
  'semrushbot',
  'ahrefsbot',
  'petalbot',
  'bytespider',
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'ccbot',
  'perplexitybot',
  'duckduckbot',
  'yandexbot',
  'applebot',
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
] as const;

/** Generic crawler tokens — blocked unless on the Google/Bing allowlist. */
const GENERIC_BOT_UA_RE =
  /\b(bot|crawler|spider|slurp|scrapy|fetcher|monitor|checker|archive)\b/i;

export function isSymbolFarmPath(pathname: string): boolean {
  return pathname === '/s' || pathname.startsWith('/s/');
}

export function isMeteredDataApiPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/tickers/') ||
    pathname === '/api/quote' ||
    pathname.startsWith('/api/price/') ||
    pathname === '/api/dividend' ||
    pathname.startsWith('/api/dividend/')
  );
}

export function shouldApplyBotGate(pathname: string): boolean {
  return isSymbolFarmPath(pathname) || isMeteredDataApiPath(pathname);
}

export function extractApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  return (
    request.nextUrl.searchParams.get('key')?.trim() ||
    bearerMatch?.[1]?.trim() ||
    null
  );
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

function pathFromUrlish(value: string | null): string {
  if (!value) return '';
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).pathname;
    }
  } catch {
    return '';
  }
  return '';
}

function isFirstPartyHost(hostname: string | null): boolean {
  if (!hostname) return false;
  const host = hostname.split(':')[0]?.toLowerCase() ?? '';
  return FIRST_PARTY_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

export function refererPath(request: NextRequest): string {
  return pathFromUrlish(request.headers.get('referer'));
}

export function isSymbolFarmReferrer(request: NextRequest): boolean {
  return isSymbolFarmPath(refererPath(request));
}

export function isTrustedAppReferrer(request: NextRequest): boolean {
  const path = refererPath(request);
  if (!path) return false;
  return TRUSTED_APP_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function hasFirstPartySecret(request: NextRequest): boolean {
  const dedicated = process.env.PP_FIRST_PARTY_FETCH_SECRET?.trim();
  const cron = process.env.CRON_SECRET?.trim();
  const secret = dedicated || cron;
  if (!secret) return false;
  return request.headers.get(FIRST_PARTY_HEADER) === secret;
}

/**
 * Trusted in-product browser context (dashboard, import, etc.).
 * Symbol-farm `/s/*` pages are never first-party for data API metering.
 */
export function isFirstPartyTickerRequest(request: NextRequest): boolean {
  if (hasFirstPartySecret(request)) return true;
  if (isSymbolFarmReferrer(request)) return false;

  const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  const sameSite =
    secFetchSite === 'same-origin' || secFetchSite === 'same-site';

  const originHost = hostFromUrlish(request.headers.get('origin'));
  const refererHost = hostFromUrlish(request.headers.get('referer'));
  const onFirstPartyHost =
    isFirstPartyHost(originHost) || isFirstPartyHost(refererHost);

  if (!onFirstPartyHost && !sameSite) return false;

  return isTrustedAppReferrer(request);
}

export function isAllowedSearchCrawler(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return false;
  return SEARCH_CRAWLER_HINTS.some((hint) => ua.includes(hint));
}

export function isLikelyAutomatedClient(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua || ua === 'unknown') return true;

  // Google + Bing only — every other crawler is treated as automation.
  if (isAllowedSearchCrawler(request)) return false;

  if (AUTOMATION_UA_HINTS.some((hint) => ua.includes(hint))) return true;
  if (GENERIC_BOT_UA_RE.test(ua)) return true;

  const secFetchMode = (request.headers.get('sec-fetch-mode') || '').toLowerCase();
  const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  const hasSecFetch = Boolean(secFetchMode || secFetchSite);

  // Spoofed "Chrome" scrapers almost always omit Sec-Fetch-*. Real browsers send them.
  if (!hasSecFetch) return true;

  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (
    accept.includes('application/json') &&
    !accept.includes('text/html') &&
    !request.headers.get('origin') &&
    secFetchMode !== 'cors' &&
    secFetchMode !== 'same-origin'
  ) {
    return true;
  }

  return false;
}

export function isLikelyDatacenterRequest(request: NextRequest): boolean {
  const cfAsn = request.headers.get('cf-asn') || '';
  const cloudAsns = new Set([
    '16509',
    '14618',
    '15169',
    '396982',
    '8075',
    '14061',
    '20473',
    '24940',
    '16276',
    '13335',
    '63949',
  ]);
  return Boolean(cfAsn && cloudAsns.has(cfAsn));
}

export function resolveBotGateClientIp(request: NextRequest): string {
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
  return `ua-${ua.length}-${accept.length}`;
}

export function botGatePaywallUrl(request: NextRequest, campaign: string): string {
  const url = new URL(DEVELOPER_UTILITY_CHECKOUT_URL);
  url.searchParams.set('utm_campaign', campaign);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (returnTo && returnTo !== '/') {
    url.searchParams.set('returnTo', returnTo);
  }
  return url.toString();
}

export function wantsJsonResponse(request: NextRequest): boolean {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (accept.includes('application/json')) return true;
  return isMeteredDataApiPath(request.nextUrl.pathname);
}
