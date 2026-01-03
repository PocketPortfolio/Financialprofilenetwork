export type BrokerId = 'schwab' | 'vanguard' | 'etrade' | 'fidelity' | 'trading212' | 'freetrade' | 'degiro' | 'ig' | 'saxo' | 'interactive_investor' | 'revolut' | 'ibkr_flex' | 'kraken' | 'binance' | 'coinbase' | 'koinly' | 'turbotax' | 'ghostfolio' | 'sharesight';
export interface RawFile {
    name: string;
    mime: 'text/csv' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
}
export interface NormalizedTrade {
    date: string;
    ticker: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    currency?: string;
    fees?: number;
    venue?: string;
    notes?: string;
    source: BrokerId;
    rawHash: string;
}
export interface ParseResult {
    broker: BrokerId;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: {
        rows: number;
        invalid: number;
        durationMs: number;
        version: string;
    };
}
export interface BrokerAdapter {
    id: BrokerId;
    detect: (sample: string) => boolean;
    parse: (file: RawFile, locale?: string) => Promise<ParseResult>;
}
