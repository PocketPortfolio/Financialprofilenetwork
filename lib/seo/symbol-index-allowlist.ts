/**
 * Day-28 curated Top-100 symbol index allowlist (NYSE Analyst ratified).
 * Default farm routes are noindex; only these stay indexable.
 * Do NOT derive from GSC/volume APIs — those optimize for scraper residue.
 */

import { POPULAR_TICKERS } from '@/app/lib/pseo/data';

/** Extra liquid names not already in POPULAR_TICKERS (buyer-intent + CMD2). */
const ALLOWLIST_EXTRAS = [
  // Mega / high-intent equities
  'PLTR',
  'AMD',
  'ORCL',
  'IBM',
  'UBER',
  'COIN',
  'SHOP',
  'SNOW',
  'CRWD',
  'PANW',
  'MU',
  'ARM',
  'APP',
  'MSTR',
  'SOFI',
  'HOOD',
  'RIVN',
  'LCID',
  'NIO',
  'BABA',
  'PDD',
  'TSM',
  'ASML',
  'SAP',
  'SONY',
  // Core ETFs / macro
  'SPY',
  'QQQ',
  'IWM',
  'DIA',
  'VOO',
  'VTI',
  'VEA',
  'VWO',
  'AGG',
  'BND',
  'TLT',
  'HYG',
  'LQD',
  'GLD',
  'SLV',
  'USO',
  'XLF',
  'XLE',
  'XLK',
  'XLV',
  'ARKK',
  'SMH',
  'SOXX',
  'SCHD',
  'VYM',
  // UK / LSE-relevant (ICP)
  'BP',
  'GSK',
  'HSBA',
  'HSBC',
  'RIO',
  'VOD',
  'SHEL',
  'ULVR',
  'AZN',
  'LLOY',
  // Crypto entry points (product URL norms)
  'BTC',
  'ETH',
  'BTCUSD',
  'ETHUSD',
] as const;

function normalizeSymbolKey(symbol: string): string {
  return symbol.toUpperCase().replace(/-/g, '').replace(/\//g, '');
}

const ALLOWLIST_SET: ReadonlySet<string> = new Set(
  [...POPULAR_TICKERS, ...ALLOWLIST_EXTRAS].map(normalizeSymbolKey),
);

/** Stable sorted allowlist for sitemaps / docs. */
export const TOP_100_SYMBOL_INDEX_ALLOWLIST: readonly string[] = Array.from(ALLOWLIST_SET).sort();

export function isSymbolIndexAllowlisted(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') return false;
  return ALLOWLIST_SET.has(normalizeSymbolKey(symbol));
}

/** Next.js Metadata robots for farm routes. */
export function symbolFarmRobots(symbol: string): { index: boolean; follow: true } {
  return {
    index: isSymbolIndexAllowlisted(symbol),
    follow: true,
  };
}
