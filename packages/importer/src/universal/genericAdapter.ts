/**
 * Generic parser: transform CSV rows into NormalizedTrade using a column mapping.
 * Reuses existing normalizers (toISO, toNumber, toTicker, hashRow, inferCurrency).
 */

import type { NormalizedTrade, ParseResult } from '../adapters/types';
import type { UniversalMapping } from './types';
import { REQUIRED_FIELDS } from './types';
import { toISO, toNumber, toTicker, hashRow, inferCurrency } from '../normalize';
import { csvParse } from '../io/csvFrom';

/** Tag for analytics: universal/generic import path (distinct from legacy broker adapters). */
const GENERIC_SOURCE = 'generic' as const;

/**
 * Convert one row to NormalizedTrade using the given mapping.
 * Returns null if the row is not a trade (e.g. dividend, transfer) or if normalization fails.
 */
export function genericRowToTrade(
  row: Record<string, string>,
  mapping: UniversalMapping,
  locale: string
): { trade: NormalizedTrade } | { warning: string } {
  const actionCol = mapping.action ? row[mapping.action] : '';
  const action = (actionCol || '').toUpperCase();
  if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
    return { warning: 'skip' };
  }

  const dateCol = mapping.date ? row[mapping.date] : '';
  const tickerCol = mapping.ticker ? row[mapping.ticker] : '';
  const qtyCol = mapping.quantity ? row[mapping.quantity] : '0';
  const priceCol = mapping.price ? row[mapping.price] : '0';

  if (!dateCol?.trim() || !tickerCol?.trim()) {
    return { warning: 'skip' };
  }

  const date = toISO(dateCol, locale);
  const ticker = toTicker(tickerCol);
  const qty = toNumber(qtyCol, locale);
  const price = toNumber(priceCol, locale);
  if (!(qty > 0) || !(price > 0)) {
    return { warning: `Non-positive qty/price: qty=${qty}, price=${price}` };
  }

  const type = /\bSELL\b/i.test(action) ? 'SELL' : 'BUY';
  const currency = mapping.currency && row[mapping.currency]
    ? row[mapping.currency]
    : inferCurrency(row, 'USD');
  const fees = mapping.fees && row[mapping.fees]
    ? toNumber(row[mapping.fees], locale)
    : 0;

  const trade: NormalizedTrade = {
    date,
    ticker,
    type,
    qty,
    price,
    currency,
    fees,
    source: GENERIC_SOURCE,
    rawHash: hashRow(row),
  };
  return { trade };
}

/**
 * Parse full CSV text with the given mapping. Returns ParseResult compatible with existing flow.
 */
export function genericParse(
  rawCsvText: string,
  mapping: UniversalMapping,
  locale: string = 'en-US'
): ParseResult {
  const t0 = performance.now();
  const rows = csvParse(rawCsvText);
  const trades: NormalizedTrade[] = [];
  const warnings: string[] = [];

  const required = REQUIRED_FIELDS.every((f) => mapping[f]);
  if (!required) {
    return {
      broker: GENERIC_SOURCE,
      trades: [],
      warnings: ['Missing required column mapping: date, ticker, action, quantity, price'],
      meta: { rows: rows.length, invalid: 0, durationMs: Math.round(performance.now() - t0), version: '1.0.0' },
    };
  }

  for (const row of rows) {
    try {
      const result = genericRowToTrade(row, mapping, locale);
      if ('trade' in result) {
        trades.push(result.trade);
      } else if (result.warning !== 'skip') {
        warnings.push(`row ${JSON.stringify(row).slice(0, 120)}… → ${result.warning}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      warnings.push(`row ${JSON.stringify(row).slice(0, 120)}… → ${msg}`);
    }
  }

  const meta = {
    rows: rows.length,
    invalid: warnings.length,
    durationMs: Math.round(performance.now() - t0),
    version: '1.0.0',
  };
  return { broker: GENERIC_SOURCE, trades, warnings, meta };
}
