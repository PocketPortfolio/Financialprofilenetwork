import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { WatchlistService, WatchlistItem } from '../services/watchlistService';
import { useQuotes } from './useDataFetching';

interface WatchlistItemWithPrice extends WatchlistItem {
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string;
  lastUpdated?: string;
}

export function useWatchlist() {
  const { isAuthenticated, user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItemWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get tickers for price fetching
  const tickers = watchlist.map(item => item.symbol);
  const { data: quotesData, loading: quotesLoading } = useQuotes(tickers, 30000); // 30 second refresh

  // Load watchlist from Firebase
  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await WatchlistService.getWatchlist(user.uid);
      setWatchlist(items);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Add item to watchlist
  const addToWatchlist = useCallback(async (symbol: string, name: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be signed in to add to watchlist');
    }

    try {
      await WatchlistService.addToWatchlist(user.uid, symbol, name);
      await loadWatchlist(); // Reload to get the new item
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  }, [isAuthenticated, user, loadWatchlist]);

  // Remove item from watchlist
  const removeFromWatchlist = useCallback(async (watchlistItemId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be signed in to remove from watchlist');
    }

    try {
      await WatchlistService.removeFromWatchlist(user.uid, watchlistItemId);
      await loadWatchlist(); // Reload to remove the item
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  }, [isAuthenticated, user, loadWatchlist]);

  // Update watchlist items with live price data
  useEffect(() => {
    if (quotesData && watchlist.length > 0) {
      const updatedWatchlist = watchlist.map(item => {
        const quote = quotesData[item.symbol];
        if (quote && quote.price !== undefined && quote.price !== null) {
          return {
            ...item,
            price: quote.price,
            change: quote.change ?? null,
            changePercent: quote.changePct ?? null,
            currency: quote.currency,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      });
      setWatchlist(updatedWatchlist);
    }
  }, [quotesData]);

  // Load watchlist when authentication state changes
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  return {
    watchlist,
    loading: loading || quotesLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    loadWatchlist
  };
}
