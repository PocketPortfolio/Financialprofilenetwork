/**
 * Portfolio context builder for Pocket Analyst (Ask AI).
 *
 * Deterministic pure function: converts trades + positions into a fixed-schema
 * aggregate string only (totals + top-N holdings). No raw ledger rows, no PII,
 * no account identifiers—sanitization by construction. Output is safe to send
 * as the sole portfolio context to the stateless inference API.
 */

import type { Position, Trade } from '../utils/portfolioCalculations';
import { calculatePositions, calculatePortfolioTotals } from '../utils/portfolioCalculations';

const TOP_HOLDINGS_COUNT = 10;

/**
 * Build a string summary of the user's portfolio for the AI context.
 * Safe to send to the API: no PII, only totals and ticker-level stats.
 *
 * @param trades - Trades from useTrades()
 * @param positions - Optional. If not provided, positions are derived from trades (currentPrice/currentValue may be 0)
 */
export function buildPortfolioContext(
  trades: Trade[],
  positions?: Record<string, Position> | Position[]
): string {
  const positionMap: Record<string, Position> = (() => {
    if (positions !== undefined) {
      if (Array.isArray(positions)) {
        const map: Record<string, Position> = {};
        positions.forEach((p) => {
          map[p.ticker] = p;
        });
        return map;
      }
      return positions;
    }
    const { positions: derived } = calculatePositions(trades);
    return derived;
  })();

  const positionList = Object.values(positionMap).filter((p) => p.shares > 0);
  const totals = calculatePortfolioTotals(positionMap);

  const lines: string[] = [];
  lines.push('Portfolio summary (for personalization only):');
  lines.push(`Total positions: ${totals.totalPositions}`);
  lines.push(`Total trades: ${trades.length}`);
  if (totals.totalInvested > 0 || totals.totalCurrentValue > 0) {
    lines.push(`Total invested (USD equiv): ${totals.totalInvested.toFixed(2)}`);
    lines.push(`Total current value (USD equiv): ${totals.totalCurrentValue.toFixed(2)}`);
    lines.push(`Total unrealized P/L: ${totals.totalUnrealizedPL.toFixed(2)} (${totals.totalUnrealizedPLPercent.toFixed(1)}%)`);
  }

  if (positionList.length > 0) {
    const byValue = [...positionList].sort((a, b) => b.currentValue - a.currentValue);
    const top = byValue.slice(0, TOP_HOLDINGS_COUNT);
    lines.push('');
    lines.push('Top holdings by current value:');
    top.forEach((p) => {
      const pct = totals.totalCurrentValue > 0 ? (p.currentValue / totals.totalCurrentValue) * 100 : 0;
      lines.push(`  ${p.ticker}: ${p.shares.toFixed(2)} shares, ${p.currency} ${p.currentValue.toFixed(2)} (${pct.toFixed(1)}%), P/L ${p.unrealizedPLPercent.toFixed(1)}%`);
    });
  }

  return lines.join('\n');
}
