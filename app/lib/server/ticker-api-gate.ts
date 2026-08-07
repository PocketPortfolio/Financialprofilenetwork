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

/** Deterministic synthetic close — not live market data (cannot be paginated into history). */
export function syntheticPreviewClose(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
  return Math.round((40 + (Math.abs(hash) % 20000) / 100) * 100) / 100;
}

/** Unpaid human browser stub for OHLCV / price series (HTTP 402). */
export function paymentRequiredJsonBody(symbol?: string | null) {
  const sym = (symbol || 'SYMBOL').toUpperCase().replace(/[^A-Z0-9.\-^=]/gi, '') || 'SYMBOL';
  const returnTo = `/s/${sym.toLowerCase()}`;
  const close = syntheticPreviewClose(sym);
  const day0 = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const d0 = iso(day0);
  const d1 = iso(new Date(day0.getTime() - 86400000));
  const d2 = iso(new Date(day0.getTime() - 172800000));
  const checkout = new URL(
    `${DEVELOPER_UTILITY_CHECKOUT_URL.split('?')[0]}?tier=developer-utility`,
  );
  checkout.searchParams.set('utm_source', 'api_series_gate');
  checkout.searchParams.set('utm_medium', '402');
  checkout.searchParams.set('utm_campaign', 'ticker_api');
  checkout.searchParams.set('returnTo', returnTo);

  return {
    status: 'payment_required',
    message: 'Developer Tier required for full OHLCV and price series.',
    preview: {
      symbol: sym,
      schema: ['date', 'open', 'high', 'low', 'close', 'volume'],
      sample: [
        { date: d0, close },
        { date: d1, close: Math.round(close * 0.997 * 100) / 100 },
        { date: d2, close: Math.round(close * 0.994 * 100) / 100 },
      ],
      total_records_locked: '[UPGRADE_REQUIRED]',
    },
    checkout_url: checkout.toString(),
  };
}

export function paymentRequiredCsvBody(symbol?: string | null): string {
  const body = paymentRequiredJsonBody(symbol);
  const day = new Date().toISOString().split('T')[0];
  return [
    'Date,Error,Status,CheckoutUrl',
    `${day},"${body.message}",payment_required,${body.checkout_url}`,
  ].join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Browser address-bar navigations get a clickable HTML lock page.
 * API clients (Accept JSON / XHR) keep the structured 402 JSON stub.
 */
export function paymentRequiredHtmlBody(symbol?: string | null): string {
  const body = paymentRequiredJsonBody(symbol);
  const sym = escapeHtml(String(body.preview.symbol));
  const message = escapeHtml(body.message);
  const checkout = escapeHtml(body.checkout_url);
  const sampleJson = escapeHtml(JSON.stringify(body.preview.sample, null, 2));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${sym} API · Developer Tier Required</title>
  <style>
    :root { color-scheme: dark; --bg:#0b0d10; --surface:#111; --text:#f5f5f5; --muted:#a3a3a3; --accent:#f59e0b; --border:rgba(255,255,255,0.12); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; background:radial-gradient(1200px 600px at 20% -10%, rgba(245,158,11,0.12), transparent), var(--bg); color:var(--text); }
    main { max-width:720px; margin:0 auto; padding:48px 20px 72px; }
    .eyebrow { font:700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing:0.08em; text-transform:uppercase; color:var(--accent); margin-bottom:12px; }
    h1 { font-size:clamp(28px,5vw,40px); letter-spacing:-0.02em; margin:0 0 10px; }
    p { color:var(--muted); line-height:1.55; margin:0 0 24px; }
    .card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:20px; }
    pre { margin:0; overflow:auto; font:13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color:#d4d4d4; }
    .cta { display:inline-flex; align-items:center; justify-content:center; padding:14px 22px; background:var(--accent); color:#0b0d10; font-weight:800; border-radius:8px; text-decoration:none; }
    .cta:hover { filter:brightness(1.05); }
    .meta { margin-top:18px; font-size:12px; color:var(--muted); word-break:break-all; }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">JSON API · Payment required</div>
    <h1>${sym}</h1>
    <p>${message}</p>
    <div class="card">
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Preview sample (≤3 points · not full history)</div>
      <pre>${sampleJson}</pre>
    </div>
    <a class="cta" href="${checkout}">Unlock Developer API Access →</a>
    <p class="meta">Programmatic clients receive <code>application/json</code> 402 with <code>checkout_url</code>.</p>
  </main>
</body>
</html>`;
}

/** True when a human opened the API URL in the browser (not XHR/curl JSON clients). */
export function prefersHtmlPaymentPage(request: {
  headers: { get(name: string): string | null };
}): boolean {
  const dest = (request.headers.get('sec-fetch-dest') || '').toLowerCase();
  if (dest === 'document') return true;
  const mode = (request.headers.get('sec-fetch-mode') || '').toLowerCase();
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (mode === 'navigate' && accept.includes('text/html')) return true;
  return false;
}
