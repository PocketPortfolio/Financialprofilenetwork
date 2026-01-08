/**
 * Hook for Dynamic Portfolio Recommendations
 * Fetches market context and generates recommendations with caching
 */

import { useState, useEffect, useMemo } from 'react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { PortfolioAnalytics, PortfolioSnapshot } from '@/app/lib/portfolio/types';
import { getCachedMarketContext } from '@/app/lib/portfolio/marketContext';
import { generateDynamicRecommendations } from '@/app/lib/portfolio/recommendationEngine';
import {
  shouldUpdateRecommendations,
  updateRecommendationCache,
  getCachedRecommendations,
} from '@/app/lib/portfolio/recommendationCache';

export function useDynamicRecommendations(
  positions: Position[],
  portfolioAnalytics: PortfolioAnalytics | null,
  historicalSnapshots: PortfolioSnapshot[]
): {
  recommendations: Awaited<ReturnType<typeof generateDynamicRecommendations>> | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
} {
  const [recommendations, setRecommendations] = useState<
    Awaited<ReturnType<typeof generateDynamicRecommendations>> | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = getCachedRecommendations();
        if (cached) {
          // Check if we need to update
          const marketContext = await getCachedMarketContext();
          const { shouldUpdate, reason } = shouldUpdateRecommendations(
            marketContext,
            positions
          );

          if (!shouldUpdate && !cancelled) {
            setRecommendations(cached);
            setLastUpdated(cached.lastUpdated);
            setIsLoading(false);
            return;
          }
        }

        // Fetch fresh market context
        const marketContext = await getCachedMarketContext();

        // Generate recommendations (now async for blog recommendations)
        const newRecommendations = await generateDynamicRecommendations(
          positions,
          marketContext,
          portfolioAnalytics || {
            totalValue: 0,
            dailyChange: 0,
            dailyChangePercent: 0,
            allTimeReturn: 0,
            allTimeReturnPercent: 0,
            annualizedReturn: 0,
            volatility: 0,
            sharpeRatio: 0,
            beta: 0,
            maxDrawdown: 0,
          },
          historicalSnapshots
        );

        if (!cancelled) {
          // Determine update trigger
          const { reason } = shouldUpdateRecommendations(marketContext, positions);
          const trigger = reason === 'scheduled-daily'
            ? 'scheduled'
            : reason === 'market-event'
            ? 'market-event'
            : reason?.includes('portfolio')
            ? 'portfolio-change'
            : 'initial';

          updateRecommendationCache(newRecommendations, trigger, positions);
          setRecommendations(newRecommendations);
          setLastUpdated(newRecommendations.lastUpdated);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          // Fallback to cached recommendations if available
          const cached = getCachedRecommendations();
          if (cached) {
            setRecommendations(cached);
            setLastUpdated(cached.lastUpdated);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRecommendations();

    // Set up periodic refresh (check every 30 minutes)
    const interval = setInterval(() => {
      fetchRecommendations();
    }, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [positions, portfolioAnalytics, historicalSnapshots]);

  return {
    recommendations,
    isLoading,
    error,
    lastUpdated,
  };
}

