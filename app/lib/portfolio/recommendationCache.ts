/**
 * Recommendation Cache Service
 * Manages caching and update frequency for recommendations
 */

import type { EnhancedRecommendation } from './recommendationEngine';
import type { MarketContext } from './marketContext';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import { hasSignificantMarketChange, hashMarketContext } from './marketContext';

export interface RecommendationCache {
  recommendations: EnhancedRecommendation;
  marketContextHash: string;
  lastUpdate: Date;
  updateTrigger: 'scheduled' | 'market-event' | 'portfolio-change' | 'initial';
  portfolioHash: string; // Hash of positions for change detection
}

/**
 * Hash portfolio for change detection
 */
function hashPortfolio(positions: Position[]): string {
  if (positions.length === 0) return '';
  
  const totalValue = positions.reduce(
    (sum, p) => sum + (p.currentValue || p.avgCost * p.shares),
    0
  );
  
  if (totalValue === 0) return '';
  
  const portfolioData = positions
    .map((pos) => ({
      ticker: pos.ticker,
      allocation: ((pos.currentValue || pos.avgCost * pos.shares) / totalValue) * 100,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
  
  return JSON.stringify(portfolioData);
}

let recommendationCache: RecommendationCache | null = null;

/**
 * Check if recommendations need updating
 */
export function shouldUpdateRecommendations(
  currentMarketContext: MarketContext,
  positions: Position[]
): {
  shouldUpdate: boolean;
  reason: string | null;
} {
  const now = new Date();
  const portfolioHash = hashPortfolio(positions);
  const marketContextHash = hashMarketContext(currentMarketContext);

  // Initial load
  if (!recommendationCache) {
    return {
      shouldUpdate: true,
      reason: 'initial',
    };
  }

  // Rate limit: Never update more than once per hour
  const hoursSinceUpdate = (now.getTime() - recommendationCache.lastUpdate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate < 1) {
    return {
      shouldUpdate: false,
      reason: 'rate-limited',
    };
  }

  // Scheduled update: Daily after market close (4:30 PM ET = 21:30 UTC)
  const marketClose = new Date();
  marketClose.setUTCHours(21, 30, 0, 0); // 4:30 PM ET = 9:30 PM UTC
  
  // Check if it's after market close and we haven't updated today
  const lastUpdateDate = new Date(recommendationCache.lastUpdate);
  lastUpdateDate.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  if (now.getUTCHours() >= 21 && lastUpdateDate.getTime() < today.getTime()) {
    return {
      shouldUpdate: true,
      reason: 'scheduled-daily',
    };
  }

  // Market event: Significant market change
  if (marketContextHash !== recommendationCache.marketContextHash) {
    const oldContext = recommendationCache.recommendations.marketContext;
    if (hasSignificantMarketChange(oldContext, currentMarketContext)) {
      return {
        shouldUpdate: true,
        reason: 'market-event',
      };
    }
  }

  // Portfolio change: New positions or >10% allocation change
  if (portfolioHash !== recommendationCache.portfolioHash && portfolioHash !== '') {
    // Always update if portfolio hash changed (positions or allocations changed)
    return {
      shouldUpdate: true,
      reason: 'portfolio-change',
    };
  }

  return {
    shouldUpdate: false,
    reason: null,
  };
}

/**
 * Update recommendation cache
 */
export function updateRecommendationCache(
  recommendations: EnhancedRecommendation,
  updateTrigger: 'scheduled' | 'market-event' | 'portfolio-change' | 'initial',
  positions?: Position[] // Pass actual positions for accurate hashing
): void {
  const marketContextHash = hashMarketContext(recommendations.marketContext);
  const portfolioHash = positions ? hashPortfolio(positions) : '';

  recommendationCache = {
    recommendations,
    marketContextHash,
    lastUpdate: new Date(),
    updateTrigger,
    portfolioHash,
  };
}

/**
 * Get cached recommendations
 */
export function getCachedRecommendations(): EnhancedRecommendation | null {
  return recommendationCache?.recommendations || null;
}

/**
 * Clear recommendation cache (for testing or forced refresh)
 */
export function clearRecommendationCache(): void {
  recommendationCache = null;
}

