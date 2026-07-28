import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
  isAllowedSearchCrawler,
  isFirstPartyTickerRequest,
  isLikelyAutomatedClient,
  isSymbolFarmPath,
  isSymbolFarmReferrer,
  isTrustedAppReferrer,
} from '@/lib/bot-gate';

function req(
  url: string,
  init?: { headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(url, init);
}

describe('bot-gate', () => {
  it('detects symbol farm paths', () => {
    expect(isSymbolFarmPath('/s/spy')).toBe(true);
    expect(isSymbolFarmPath('/s/spy/json-api')).toBe(true);
    expect(isSymbolFarmPath('/dashboard')).toBe(false);
  });

  it('treats symbol-farm referrers as untrusted for first-party API', () => {
    const request = req('https://www.pocketportfolio.app/api/tickers/spy/json', {
      headers: {
        referer: 'https://www.pocketportfolio.app/s/spy/json-api',
        'sec-fetch-site': 'same-origin',
      },
    });
    expect(isSymbolFarmReferrer(request)).toBe(true);
    expect(isFirstPartyTickerRequest(request)).toBe(false);
  });

  it('allows dashboard referrers as first-party', () => {
    const request = req('https://www.pocketportfolio.app/api/tickers/spy/json', {
      headers: {
        referer: 'https://www.pocketportfolio.app/dashboard',
        'sec-fetch-site': 'same-origin',
      },
    });
    expect(isTrustedAppReferrer(request)).toBe(true);
    expect(isFirstPartyTickerRequest(request)).toBe(true);
  });

  it('flags obvious automation user agents', () => {
    const request = req('https://www.pocketportfolio.app/s/spy', {
      headers: { 'user-agent': 'python-requests/2.31.0' },
    });
    expect(isLikelyAutomatedClient(request)).toBe(true);
  });

  it('allows Googlebot for HTML indexing', () => {
    const request = req('https://www.pocketportfolio.app/s/spy', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });
    expect(isAllowedSearchCrawler(request)).toBe(true);
    expect(isLikelyAutomatedClient(request)).toBe(false);
  });

  it('allows Bingbot for HTML indexing', () => {
    const request = req('https://www.pocketportfolio.app/s/spy', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      },
    });
    expect(isAllowedSearchCrawler(request)).toBe(true);
    expect(isLikelyAutomatedClient(request)).toBe(false);
  });

  it('blocks non-Google/Bing crawlers (enterprise allowlist)', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; DuckDuckBot/1.0)',
      'Mozilla/5.0 (compatible; YandexBot/3.0)',
      'Mozilla/5.0 Applebot/0.1',
      'facebookexternalhit/1.1',
      'GPTBot/1.0',
      'ClaudeBot/1.0',
      'PerplexityBot/1.0',
      'Bytespider',
    ]) {
      const request = req('https://www.pocketportfolio.app/s/spy', {
        headers: { 'user-agent': ua },
      });
      expect(isAllowedSearchCrawler(request)).toBe(false);
      expect(isLikelyAutomatedClient(request)).toBe(true);
    }
  });

  it('blocks spoofed Chrome UA without Sec-Fetch (Realtime farm gap)', () => {
    const request = req('https://www.pocketportfolio.app/s/apacu/json-api', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        accept: 'text/html',
      },
    });
    expect(isLikelyAutomatedClient(request)).toBe(true);
  });

  it('allows real browser navigations with Sec-Fetch', () => {
    const request = req('https://www.pocketportfolio.app/s/spy', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-dest': 'document',
      },
    });
    expect(isLikelyAutomatedClient(request)).toBe(false);
  });
});
