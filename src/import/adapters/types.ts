export type BrokerId =
  | 'schwab'|'vanguard'|'etrade'|'fidelity'
  | 'trading212'|'freetrade'|'degiro'|'ig'|'saxo'|'interactive_investor'|'revolut'
  | 'ibkr_flex'|'kraken'|'binance'|'coinbase';

export interface RawFile {
  name: string;
  mime: 'text/csv'|'application/vnd.ms-excel'|'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface NormalizedTrade {
  date: string;                // ISO 8601
  ticker: string;              // e.g., AAPL or BTC-USD
  type: 'BUY'|'SELL';
  qty: number;
  price: number;
  currency?: string;
  fees?: number;
  venue?: string;
  notes?: string;
  source: BrokerId;
  rawHash: string;             // sha256 of normalized row for dedupe
}

export interface ParseResult {
  broker: BrokerId;
  trades: NormalizedTrade[];
  warnings: string[];
  meta: { rows: number; invalid: number; durationMs: number; version: string };
}

export interface BrokerAdapter {
  id: BrokerId;
  detect: (sample: string) => boolean;
  parse: (file: RawFile, locale?: string) => Promise<ParseResult>;
}


