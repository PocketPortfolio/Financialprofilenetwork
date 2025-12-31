/**
 * React Hooks for Sector Classification
 * Client-side hooks for fetching and using sector classifications
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { GICSSector, SectorClassification } from '@/app/lib/portfolio/sectorClassification';
import { getSectorSync } from '@/app/lib/portfolio/sectorService';

/**
 * Hook for single ticker sector classification
 * Uses sync database lookup for immediate results, with optional API refresh
 */
export function useSectorClassification(
  ticker: string | null | undefined,
  options: {
    useApi?: boolean;
    refreshInterval?: number;
  } = {}
): {
  sector: GICSSector;
  classification: SectorClassification | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { useApi = false, refreshInterval } = options;
  const [classification, setClassification] = useState<SectorClassification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Immediate sync lookup for instant results
  const syncSector = useMemo(() => {
    if (!ticker) return GICSSector.UNCLASSIFIED;
    return getSectorSync(ticker);
  }, [ticker]);

  // Optional API refresh
  useEffect(() => {
    if (!ticker || !useApi) {
      return;
    }

    let cancelled = false;

    const fetchClassification = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/portfolio/sector-classification?ticker=${encodeURIComponent(ticker)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch classification: ${response.statusText}`);
        }

        const data: SectorClassification = await response.json();
        
        if (!cancelled) {
          setClassification(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchClassification();

    // Set up refresh interval if specified
    let intervalId: NodeJS.Timeout | null = null;
    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(fetchClassification, refreshInterval);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ticker, useApi, refreshInterval]);

  return {
    sector: classification?.sector || syncSector,
    classification,
    isLoading,
    error,
  };
}

/**
 * Hook for batch sector classification
 * Efficiently fetches classifications for multiple tickers
 */
export function useBatchSectorClassification(
  tickers: (string | null | undefined)[],
  options: {
    useApi?: boolean;
  } = {}
): {
  classifications: Map<string, SectorClassification>;
  sectors: Map<string, GICSSector>;
  isLoading: boolean;
  error: Error | null;
} {
  const { useApi = false } = options;
  const [classifications, setClassifications] = useState<Map<string, SectorClassification>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedKeyRef = useRef<string>('');

  // Create stable ticker string for dependency comparison
  const tickersKey = useMemo(() => {
    const validTickers = tickers.filter((t): t is string => Boolean(t)).sort();
    return validTickers.join(',');
  }, [tickers]);

  // Immediate sync lookup for instant results
  const syncSectors = useMemo(() => {
    const map = new Map<string, GICSSector>();
    tickers.forEach((ticker) => {
      if (ticker) {
        map.set(ticker, getSectorSync(ticker));
      }
    });
    return map;
  }, [tickersKey]);

  // Optional API refresh - use stable key to prevent excessive calls
  useEffect(() => {
    const validTickers = tickers.filter((t): t is string => Boolean(t));
    
    if (validTickers.length === 0 || !useApi) {
      return;
    }

    // Skip if we already fetched for this exact set of tickers
    if (tickersKey === lastFetchedKeyRef.current) {
      return;
    }

    let cancelled = false;

    const fetchClassifications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/portfolio/sector-classification/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tickers: validTickers }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch classifications: ${response.statusText}`);
        }

        const data: Record<string, SectorClassification> = await response.json();
        
        if (!cancelled) {
          const map = new Map<string, SectorClassification>();
          Object.entries(data).forEach(([ticker, classification]) => {
            map.set(ticker, classification);
          });
          setClassifications(map);
          lastFetchedKeyRef.current = tickersKey; // Mark as fetched
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    // Debounce to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      fetchClassifications();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [tickersKey, useApi]);

  // Combine sync and API results
  const sectors = useMemo(() => {
    const map = new Map<string, GICSSector>();
    
    // Start with sync results
    syncSectors.forEach((sector, ticker) => {
      map.set(ticker, sector);
    });

    // Override with API results if available
    classifications.forEach((classification, ticker) => {
      map.set(ticker, classification.sector);
    });

    return map;
  }, [syncSectors, classifications]);

  return {
    classifications,
    sectors,
    isLoading,
    error,
  };
}

