/**
 * LSE tickers that must be quoted as SYMBOL.L.
 * Single list for quote API + dashboard lookup so replica and consumer stay aligned.
 */
export const UK_LISTED_TICKERS = [
  'HSBA',
  'ULVR',
  'VOD',
  'BP',
  'RDS',
  'RDS-A',
  'RDS-B',
  'GSK',
  'AZN',
  'BATS',
  'BT',
  'LLOY',
  'BARC',
  'RBS',
  'TSCO',
  'SBRY',
  'MKS',
  'NXT',
  'ASOS',
  'JD',
  'ITV',
  'PSN',
  'BA',
  'RR',
  'BDEV',
  'TW',
  'PURP',
  'III',
  'SMT',
  'FGT',
  'SHEL',
  'EQQQ',
  'IUIT',
  'VGOV',
  'SLXX',
  'SGLN',
  'CSH2',
] as const;

export const UK_STOCKS = new Set<string>(UK_LISTED_TICKERS);

export function isUkListedTicker(symbol: string): boolean {
  return UK_STOCKS.has(symbol.trim().toUpperCase());
}
