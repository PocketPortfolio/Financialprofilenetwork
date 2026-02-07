/**
 * Synonym dictionary for heuristic column mapping.
 * Harvested from existing broker adapters.
 */

import type { StandardField } from './types';

export const SYNONYMS: Record<StandardField, string[]> = {
  date: [
    'Date',
    'Trade Date',
    'Run Date',
    'Time',
    'Timestamp',
    'Transaction Date',
    'Settlement Date',
    'Koinly Date',
    'Purchase Date',
    'Date Sold',
    'Deal Date', // HL
    'Execution Date', // Robinhood
  ],
  ticker: [
    'Symbol',
    'Ticker',
    'Instrument',
    'Product',
    'Stock',
    'Asset',
    'Instrument Code',
    'Security',
    'Epic', // HL
    'Details', // eToro Crypto
  ],
  action: [
    'Action',
    'Type',
    'Transaction Type',
    'Operation',
    'Buy/Sell',
    'Label',
    'Transaction', // BlockFi
    'Transaction Kind', // Crypto.com
    'Order Type', // Fineco
  ],
  quantity: [
    'Quantity',
    'Qty',
    'Shares',
    'Amount',
    'No. of shares',
    'Quantity Transacted',
    'Units',
    'Size', // Plus500
    'Volume', // XTB
  ],
  price: [
    'Price',
    'Unit Price',
    'Trade Price',
    'Execution Price',
    'Price / share',
    'Price per share',
    'OpenRate',
    'Share Price',
    'Spot Price at Transaction',
    'Cost Basis',
    'T.Price',
    'Price in Dollars',
    'unitPrice',
    'Deal Price', // HL
    'Avg Price', // Robinhood
    'Open Price', // eToro, XTB
    'Open Rate', // eToro Crypto
    'To Amount', // Crypto.com fallback
  ],
  currency: [
    'Currency',
    'CCY',
    'Spot Price Currency',
    'Currency (Price / share)',
    'Brokerage Currency',
    'Currency (native)',
    'Sent Currency',
    'Received Currency',
  ],
  fees: [
    'Commission',
    'Fee',
    'Fees',
    'Fee (GBP)',
    'Charge amount (USD)',
    'Brokerage',
    'Fee Amount',
  ],
};

/**
 * Aggressively normalizes a header for matching: trim, strip BOM, lowercase, remove
 * spaces/dots/underscores so "Open Price" and "OpenPrice" match.
 */
export function normalizeHeader(h: string): string {
  return (h || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Check if a header matches a synonym (both normalized the same way). */
export function headerMatchesSynonym(header: string, synonym: string): boolean {
  return normalizeHeader(header) === normalizeHeader(synonym);
}
