import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async () => 0),
    set: vi.fn(async () => 'OK'),
    ttl: vi.fn(async () => 3600),
  },
}));

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [{}]),
  cert: vi.fn((v) => v),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: () => ({
      where: () => ({
        limit: () => ({
          get: async () => ({ empty: true }),
        }),
      }),
    }),
  })),
}));

function req(url: string, init?: { headers?: Record<string, string> }) {
  return new NextRequest(url, {
    headers: init?.headers,
  });
}

const chromeHuman = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/json',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-dest': 'document',
};

describe('data-api-gate series surface', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'production');
  });

  it('returns HTML lock page with clickable CTA for browser document navigation', async () => {
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/googl/json?range=max', {
        headers: chromeHuman,
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(402);
    expect(result.response.headers.get('content-type')).toContain('text/html');
    const html = await result.response.text();
    expect(html).toContain('Unlock Developer API Access');
    expect(html).toContain('href="https://www.pocketportfolio.app/sponsor?tier=developer-utility');
    expect(html).toContain('GOOGL');
  });

  it('returns 402 JSON stub for unpaid human JSON clients', async () => {
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/googl/json?range=max', {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          accept: 'application/json',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-fetch-dest': 'empty',
        },
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(402);
    const body = await result.response.json();
    expect(body.status).toBe('payment_required');
    expect(body.preview.symbol).toBe('GOOGL');
    expect(Array.isArray(body.preview.sample)).toBe(true);
    expect(body.preview.sample.length).toBeLessThanOrEqual(3);
    expect(body.checkout_url).toContain('tier=developer-utility');
    expect(body.checkout_url).toContain('returnTo');
  });

  it('returns 401 for automated clients with no teaser sample series', async () => {
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/googl/json?range=max', {
        headers: { 'user-agent': 'python-requests/2.31.0', accept: 'application/json' },
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(401);
    const body = await result.response.json();
    expect(body.error).toBe('Unauthorized');
    expect(body.preview).toBeUndefined();
  });

  it('allows first-party SSR secret through', async () => {
    vi.stubEnv('PP_FIRST_PARTY_FETCH_SECRET', 'test-secret');
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const { FIRST_PARTY_HEADER } = await import('@/lib/bot-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/googl/json?range=max', {
        headers: {
          ...chromeHuman,
          [FIRST_PARTY_HEADER]: 'test-secret',
        },
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(true);
  });

  it('allows trusted dashboard referrer through', async () => {
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/SPY/json?range=1y', {
        headers: {
          ...chromeHuman,
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          origin: 'https://www.pocketportfolio.app',
          referer: 'https://www.pocketportfolio.app/dashboard',
        },
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(true);
  });

  it('returns 402 CSV stub for unpaid human on csv format', async () => {
    const { enforceDataApiGate } = await import('@/app/lib/server/data-api-gate');
    const result = await enforceDataApiGate(
      req('https://www.pocketportfolio.app/api/tickers/aapl/csv?range=max', {
        headers: chromeHuman,
      }),
      { surface: 'series' },
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(402);
    const text = await result.response.text();
    expect(text).toContain('payment_required');
    expect(text).toContain('CheckoutUrl');
  });

  it('extracts ticker from price and tickers paths', async () => {
    const { extractTickerFromDataApiPath } = await import('@/app/lib/server/data-api-gate');
    expect(extractTickerFromDataApiPath('/api/tickers/googl/json')).toBe('GOOGL');
    expect(extractTickerFromDataApiPath('/api/price/MSFT')).toBe('MSFT');
  });
});
