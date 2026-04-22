'use client';

import { useQuotes } from './useDataFetching';

export interface LivePrice {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
  source: string;
}

export interface UseLivePricesResult {
  prices: Record<string, LivePrice>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching live prices for a set of ticker symbols.
 * Wraps useQuotes and exposes a consistent loading state that is
 * true during both the initial fetch and any subsequent refetch.
 */
export function useLivePrices(symbols: string[]): UseLivePricesResult {
  const { data, loading, error, refetch } = useQuotes(symbols);

  return {
    prices: (data as Record<string, LivePrice>) ?? {},
    loading,
    error,
    refetch,
  };
}
