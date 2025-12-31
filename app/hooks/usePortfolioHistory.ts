/**
 * Hook for fetching portfolio historical data
 */

import { useState, useEffect } from 'react';
import type { PortfolioSnapshot } from '@/app/lib/portfolio/types';

interface UsePortfolioHistoryOptions {
  userId: string | null;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

interface UsePortfolioHistoryResult {
  data: PortfolioSnapshot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePortfolioHistory({
  userId,
  startDate,
  endDate,
  enabled = true,
}: UsePortfolioHistoryOptions): UsePortfolioHistoryResult {
  const [data, setData] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId || !enabled) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/portfolio/history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const snapshots = await response.json();
      setData(snapshots);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio history';
      setError(errorMessage);
      console.error('Error fetching portfolio history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, startDate, endDate, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}











