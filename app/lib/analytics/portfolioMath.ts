/**
 * Portfolio Math Engine
 * Pure functions for calculating risk metrics and rebalancing logic
 * All calculations happen client-side to maintain privacy-first architecture
 */

import { AssetProfile, RebalanceSuggestion, PortfolioTarget } from '../../types/analytics';

/**
 * Calculate Portfolio Beta (Weighted Average)
 * Beta measures portfolio's sensitivity to market movements
 * 1.0 = moves with market, >1.0 = more volatile, <1.0 = less volatile
 */
export function calculatePortfolioBeta(
  holdings: { ticker: string; value: number }[],
  profiles: Record<string, AssetProfile>
): number {
  let totalValue = 0;
  let weightedBetaSum = 0;

  holdings.forEach(h => {
    const profile = profiles[h.ticker];
    const beta = profile ? profile.beta : 1.0; // Default to market correlation
    weightedBetaSum += h.value * beta;
    totalValue += h.value;
  });

  return totalValue === 0 ? 0 : weightedBetaSum / totalValue;
}

/**
 * Generate Rebalancing Suggestions
 * Checks if current allocation deviates from target by > threshold
 */
export function generateRebalancingPlan(
  holdings: { ticker: string; value: number }[],
  targets: PortfolioTarget[],
  totalPortfolioValue: number,
  threshold: number = 0.05 // 5% drift tolerance
): RebalanceSuggestion[] {
  const suggestions: RebalanceSuggestion[] = [];

  // Map current weights
  const currentWeights = new Map<string, number>();
  holdings.forEach(h => currentWeights.set(h.ticker, h.value / totalPortfolioValue));

  targets.forEach(target => {
    if (target.ticker) {
      const currentWeight = currentWeights.get(target.ticker) || 0;
      const targetWeight = target.percentage / 100;
      const drift = currentWeight - targetWeight;

      // Only trigger if drift exceeds threshold (positive or negative)
      if (Math.abs(drift) > threshold) {
        const diffValue = Math.abs(drift * totalPortfolioValue);
        suggestions.push({
          ticker: target.ticker,
          action: drift > 0 ? 'SELL' : 'BUY',
          amount: parseFloat(diffValue.toFixed(2)),
          reason: `Drifted ${(drift * 100).toFixed(1)}% ${drift > 0 ? 'above' : 'below'} target`
        });
      }
    }
  });

  return suggestions;
}

/**
 * Group Holdings by Sector
 * Returns sorted array of sectors with total values
 */
export function groupBySector(
  holdings: { ticker: string; value: number }[],
  profiles: Record<string, AssetProfile>
): Array<{ name: string; value: number }> {
  const sectors: Record<string, number> = {};
  
  holdings.forEach(h => {
    const profile = profiles[h.ticker];
    const sector = profile?.sector || 'Unknown';
    sectors[sector] = (sectors[sector] || 0) + h.value;
  });

  return Object.entries(sectors)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort biggest to smallest
}

