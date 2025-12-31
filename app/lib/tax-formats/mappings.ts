/**
 * Tax Format Mappings
 * Maps normalized trades to tax software CSV formats
 */

import type { NormalizedTrade } from '@pocket-portfolio/importer';

export type TaxSoftware = 'turbotax' | 'koinly' | 'taxact' | 'h&r-block' | 'free-tax-usa';

export interface TaxFormatMapping {
  headers: string[];
  mapRow: (trade: NormalizedTrade) => string[];
}

/**
 * TurboTax CSV Format
 * Format: Date,Description,Category,Amount
 */
export const turbotaxMapping: TaxFormatMapping = {
  headers: ['Date', 'Description', 'Category', 'Amount', 'Symbol', 'Quantity', 'Price'],
  mapRow: (trade: NormalizedTrade) => {
    const description = `${trade.type} ${trade.qty} ${trade.ticker} @ $${trade.price.toFixed(2)}`;
    const category = trade.type === 'BUY' ? 'Investment Purchase' : 'Investment Sale';
    const amount = trade.type === 'BUY' 
      ? -(trade.qty * trade.price + (trade.fees || 0))
      : (trade.qty * trade.price - (trade.fees || 0));
    
    return [
      trade.date, // ISO 8601 format
      description,
      category,
      amount.toFixed(2),
      trade.ticker,
      trade.qty.toString(),
      trade.price.toFixed(2)
    ];
  }
};

/**
 * Koinly CSV Format (Crypto-focused)
 * Format: Date,Type,Base Currency,Base Amount,Quote Currency,Quote Amount,Fee Currency,Fee Amount
 */
export const koinlyMapping: TaxFormatMapping = {
  headers: ['Date', 'Type', 'Base Currency', 'Base Amount', 'Quote Currency', 'Quote Amount', 'Fee Currency', 'Fee Amount', 'Label'],
  mapRow: (trade: NormalizedTrade) => {
    // For crypto pairs like BTC-USD, split them
    const isCrypto = trade.ticker.includes('-');
    const [base, quote] = isCrypto ? trade.ticker.split('-') : [trade.ticker, 'USD'];
    
    const baseAmount = trade.qty.toString();
    const quoteAmount = (trade.qty * trade.price).toFixed(8);
    const feeAmount = (trade.fees || 0).toFixed(8);
    
    return [
      trade.date,
      trade.type === 'BUY' ? 'buy' : 'sell',
      base,
      baseAmount,
      quote,
      quoteAmount,
      quote, // Fee currency
      feeAmount,
      trade.source // Label with broker name
    ];
  }
};

/**
 * TaxAct CSV Format
 * Format: Date,Transaction Type,Security Name,Quantity,Price,Commission,Amount
 */
export const taxactMapping: TaxFormatMapping = {
  headers: ['Date', 'Transaction Type', 'Security Name', 'Quantity', 'Price', 'Commission', 'Amount'],
  mapRow: (trade: NormalizedTrade) => {
    const transactionType = trade.type === 'BUY' ? 'Buy' : 'Sell';
    const amount = trade.type === 'BUY'
      ? -(trade.qty * trade.price + (trade.fees || 0))
      : (trade.qty * trade.price - (trade.fees || 0));
    
    return [
      trade.date,
      transactionType,
      trade.ticker,
      trade.qty.toString(),
      trade.price.toFixed(2),
      (trade.fees || 0).toFixed(2),
      amount.toFixed(2)
    ];
  }
};

/**
 * H&R Block CSV Format
 * Format: Date,Action,Symbol,Quantity,Price,Commission,Amount
 */
export const hrBlockMapping: TaxFormatMapping = {
  headers: ['Date', 'Action', 'Symbol', 'Quantity', 'Price', 'Commission', 'Amount'],
  mapRow: (trade: NormalizedTrade) => {
    const amount = trade.type === 'BUY'
      ? -(trade.qty * trade.price + (trade.fees || 0))
      : (trade.qty * trade.price - (trade.fees || 0));
    
    return [
      trade.date,
      trade.type,
      trade.ticker,
      trade.qty.toString(),
      trade.price.toFixed(2),
      (trade.fees || 0).toFixed(2),
      amount.toFixed(2)
    ];
  }
};

/**
 * FreeTaxUSA CSV Format
 * Format: Date,Description,Amount,Category
 */
export const freeTaxUsaMapping: TaxFormatMapping = {
  headers: ['Date', 'Description', 'Amount', 'Category'],
  mapRow: (trade: NormalizedTrade) => {
    const description = `${trade.type} ${trade.qty} shares of ${trade.ticker} @ $${trade.price.toFixed(2)}`;
    const category = trade.type === 'BUY' ? 'Investment Purchase' : 'Investment Sale';
    const amount = trade.type === 'BUY'
      ? -(trade.qty * trade.price + (trade.fees || 0))
      : (trade.qty * trade.price - (trade.fees || 0));
    
    return [
      trade.date,
      description,
      amount.toFixed(2),
      category
    ];
  }
};

/**
 * Get mapping for a tax software
 */
export function getTaxMapping(software: TaxSoftware): TaxFormatMapping {
  const mappings: Record<TaxSoftware, TaxFormatMapping> = {
    'turbotax': turbotaxMapping,
    'koinly': koinlyMapping,
    'taxact': taxactMapping,
    'h&r-block': hrBlockMapping,
    'free-tax-usa': freeTaxUsaMapping
  };
  
  return mappings[software];
}

/**
 * Convert normalized trades to tax software CSV
 */
export function convertToTaxFormat(
  trades: NormalizedTrade[],
  software: TaxSoftware
): string {
  const mapping = getTaxMapping(software);
  const rows: string[][] = [mapping.headers];
  
  trades.forEach(trade => {
    rows.push(mapping.mapRow(trade));
  });
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => {
      // Escape cells containing commas or quotes
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}



