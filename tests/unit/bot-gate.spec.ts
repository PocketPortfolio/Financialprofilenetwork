import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
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

  it('allows verified search crawlers for HTML indexing', () => {
    const request = req('https://www.pocketportfolio.app/s/spy', {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    });
    expect(isLikelyAutomatedClient(request)).toBe(false);
  });
});
