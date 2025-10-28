/**
 * Portfolio Calculation Utilities
 * Ensures data integrity and accurate calculations for consolidated portfolios
 */

export interface Trade {
  id: string;
  ticker: string;
  qty: number;
  price: number;
  date: string;
  type: 'BUY' | 'SELL';
  currency: string;
  mock: boolean;
}

export interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  totalTrades: number;
  lastTradeDate: string;
  isMock: boolean;
  currency: string;
  totalInvested: number; // Add this for transparency
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate trade data integrity
 */
export function validateTrade(trade: Trade): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required fields
  if (!trade.ticker || trade.ticker.trim() === '') {
    errors.push(`Trade ${trade.id}: Missing ticker`);
  }

  if (typeof trade.qty !== 'number' || isNaN(trade.qty)) {
    errors.push(`Trade ${trade.id} (${trade.ticker}): Invalid quantity`);
  } else if (trade.qty <= 0) {
    errors.push(`Trade ${trade.id} (${trade.ticker}): Quantity must be positive (${trade.qty})`);
  }

  if (typeof trade.price !== 'number' || isNaN(trade.price)) {
    errors.push(`Trade ${trade.id} (${trade.ticker}): Invalid price`);
  } else if (trade.price <= 0) {
    errors.push(`Trade ${trade.id} (${trade.ticker}): Price must be positive (${trade.price})`);
  }

  if (!trade.type || (trade.type !== 'BUY' && trade.type !== 'SELL')) {
    errors.push(`Trade ${trade.id} (${trade.ticker}): Invalid type (${trade.type})`);
  }

  if (!trade.currency || trade.currency.trim() === '') {
    warnings.push(`Trade ${trade.id} (${trade.ticker}): Missing currency, defaulting to USD`);
  }

  if (!trade.date || trade.date.trim() === '') {
    warnings.push(`Trade ${trade.id} (${trade.ticker}): Missing date`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate all trades in a portfolio
 */
export function validateTrades(trades: Trade[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  trades.forEach(trade => {
    const result = validateTrade(trade);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Calculate positions from trades with full data integrity checks
 */
export function calculatePositions(trades: Trade[]): { 
  positions: { [ticker: string]: Position };
  validation: ValidationResult;
} {
  const validation = validateTrades(trades);
  const positions: { [ticker: string]: Position } = {};

  // Filter out invalid trades
  const validTrades = trades.filter(trade => {
    const result = validateTrade(trade);
    return result.isValid;
  });

  // Sort trades by date to ensure chronological processing
  const sortedTrades = [...validTrades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTrades.forEach(trade => {
    const { ticker, qty, price, type, date, currency } = trade;

    if (!positions[ticker]) {
      positions[ticker] = {
        ticker,
        shares: 0,
        avgCost: 0,
        currentPrice: 0,
        currentValue: 0,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        totalTrades: 0,
        lastTradeDate: date,
        isMock: false,
        currency: currency || 'USD',
        totalInvested: 0
      };
    }

    if (type === 'BUY') {
      // Weighted average cost calculation
      const currentTotalCost = positions[ticker].shares * positions[ticker].avgCost;
      const newTotalCost = currentTotalCost + (qty * price);
      const newTotalShares = positions[ticker].shares + qty;

      positions[ticker].shares = newTotalShares;
      positions[ticker].avgCost = newTotalCost / newTotalShares;
      positions[ticker].totalInvested = newTotalCost;
    } else if (type === 'SELL') {
      // Verify we have enough shares to sell
      if (positions[ticker].shares < qty) {
        validation.errors.push(
          `${ticker}: Attempting to sell ${qty} shares but only ${positions[ticker].shares} available on ${date}`
        );
      }

      // Reduce shares, keep average cost unchanged
      positions[ticker].shares -= qty;
      
      // Update total invested (reduce proportionally)
      if (positions[ticker].shares >= 0) {
        positions[ticker].totalInvested = positions[ticker].shares * positions[ticker].avgCost;
      }
    }

    positions[ticker].totalTrades += 1;
    positions[ticker].lastTradeDate = date;
  });

  // Remove positions with zero or negative shares
  Object.keys(positions).forEach(ticker => {
    if (positions[ticker].shares <= 0) {
      validation.warnings.push(
        `${ticker}: Position closed or has ${positions[ticker].shares} shares (removing from active positions)`
      );
      delete positions[ticker];
    }
  });

  return { positions, validation };
}

/**
 * Calculate portfolio totals with currency conversion
 */
export function calculatePortfolioTotals(
  positions: { [ticker: string]: Position },
  exchangeRates: { [currency: string]: number } = { GBP: 1.27, EUR: 1.10, USD: 1.0 }
) {
  let totalInvestedUSD = 0;
  let totalCurrentValueUSD = 0;
  let totalUnrealizedPLUSD = 0;

  Object.values(positions).forEach(position => {
    const rate = exchangeRates[position.currency] || 1.0;
    
    const investedUSD = position.totalInvested * rate;
    const currentValueUSD = position.currentValue * rate;
    const plUSD = position.unrealizedPL * rate;

    totalInvestedUSD += investedUSD;
    totalCurrentValueUSD += currentValueUSD;
    totalUnrealizedPLUSD += plUSD;
  });

  const totalUnrealizedPLPercent = totalInvestedUSD > 0 
    ? (totalUnrealizedPLUSD / totalInvestedUSD) * 100 
    : 0;

  return {
    totalInvested: totalInvestedUSD,
    totalCurrentValue: totalCurrentValueUSD,
    totalUnrealizedPL: totalUnrealizedPLUSD,
    totalUnrealizedPLPercent,
    totalPositions: Object.keys(positions).length
  };
}

/**
 * Generate a detailed portfolio report for verification
 */
export function generatePortfolioReport(
  trades: Trade[],
  positions: { [ticker: string]: Position }
): string {
  let report = '=== PORTFOLIO DATA INTEGRITY REPORT ===\n\n';

  // Trade summary
  report += `Total Trades: ${trades.length}\n`;
  report += `- BUY trades: ${trades.filter(t => t.type === 'BUY').length}\n`;
  report += `- SELL trades: ${trades.filter(t => t.type === 'SELL').length}\n`;
  report += `- Mock trades: ${trades.filter(t => t.mock).length}\n\n`;

  // Position summary
  report += `Total Positions: ${Object.keys(positions).length}\n\n`;

  // Per-position breakdown
  report += '=== POSITION DETAILS ===\n';
  Object.values(positions).forEach(pos => {
    report += `\n${pos.ticker}:\n`;
    report += `  Shares: ${pos.shares.toFixed(4)}\n`;
    report += `  Avg Cost: ${pos.currency} ${pos.avgCost.toFixed(2)}\n`;
    report += `  Total Invested: ${pos.currency} ${pos.totalInvested.toFixed(2)}\n`;
    report += `  Current Price: ${pos.currency} ${pos.currentPrice.toFixed(2)}\n`;
    report += `  Current Value: ${pos.currency} ${pos.currentValue.toFixed(2)}\n`;
    report += `  Unrealized P/L: ${pos.currency} ${pos.unrealizedPL.toFixed(2)} (${pos.unrealizedPLPercent.toFixed(2)}%)\n`;
    report += `  Total Trades: ${pos.totalTrades}\n`;
    report += `  Last Trade: ${pos.lastTradeDate}\n`;
  });

  // Validation check
  const validation = validateTrades(trades);
  if (validation.errors.length > 0) {
    report += '\n=== ERRORS ===\n';
    validation.errors.forEach(error => report += `❌ ${error}\n`);
  }

  if (validation.warnings.length > 0) {
    report += '\n=== WARNINGS ===\n';
    validation.warnings.forEach(warning => report += `⚠️  ${warning}\n`);
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    report += '\n✅ All trades validated successfully!\n';
  }

  return report;
}






