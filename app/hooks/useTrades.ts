'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { TradeService, Trade } from '../services/tradeService';
import { 
  saveLocalTrades, 
  loadLocalTrades, 
  getQuotaStatus,
  exportLocalPortfolio,
  importLocalPortfolio 
} from '../lib/store/localPortfolioStore';

export function useTrades() {
  const { user, isAuthenticated } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log trades state changes (disabled)
  // useEffect(() => {
  //   console.log('🔍 useTrades hook: trades state updated:', {
  //     tradesLength: trades.length,
  //     trades: trades.map(t => ({ id: t.id, ticker: t.ticker, type: t.type }))
  //   });
  // }, [trades]);

  const loadTrades = useCallback(async () => {
    
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated && user) {
        // Load from Firebase for authenticated users
        // 🔥 CRITICAL: Force server fetch to prevent stale cache from causing trades to reappear
        // This ensures we always get fresh data, not cached data from previous sessions
        const userTrades = await TradeService.getTrades(user.uid, true); // forceServerFetch = true
        
        // 🛡️ TOMBSTONE FILTER: Exclude locally "healed" (deleted) trades
        // This is a UI-layer safeguard - even if getTrades() filters them,
        // we ensure they never appear in the UI
        let healedTradeIds: string[] = [];
        try {
          if (typeof window !== 'undefined') {
            healedTradeIds = JSON.parse(localStorage.getItem('healedTradeIds') || '[]');
          }
        } catch (e) {
          // Ignore errors (localStorage might not be available in SSR)
        }
        
        const healedSet = new Set(healedTradeIds);
        const validTrades = userTrades.filter(trade => !healedSet.has(trade.id));
        
        if (healedSet.size > 0 && validTrades.length < userTrades.length) {
          console.log(`☢️ [HEALING UI] Filtered out ${userTrades.length - validTrades.length} healed trades from UI display`);
          
          
        }
        
        
        
        setTrades(validTrades); // Use filtered trades instead of raw trades
        
        
      } else {
        // Load from localStorage for unauthenticated users using localPortfolioStore
        const localTrades = loadLocalTrades();
        
        // 🛡️ TOMBSTONE FILTER: Also filter healed trades from local storage trades
        let healedTradeIds: string[] = [];
        try {
          if (typeof window !== 'undefined') {
            healedTradeIds = JSON.parse(localStorage.getItem('healedTradeIds') || '[]');
          }
        } catch (e) {
          // Ignore errors
        }
        
        const healedSet = new Set(healedTradeIds);
        const validLocalTrades = localTrades.filter(trade => !healedSet.has(trade.id));
        
        if (healedSet.size > 0 && validLocalTrades.length < localTrades.length) {
          console.log(`☢️ [HEALING UI] Filtered out ${localTrades.length - validLocalTrades.length} healed trades from local storage UI display`);
        }
        
        
        
        setTrades(validLocalTrades); // Use filtered trades
        
        
        
        // Check quota status and log warning if needed
        const quotaStatus = getQuotaStatus();
        if (quotaStatus.status === 'warning' || quotaStatus.status === 'error') {
          console.warn('LocalStorage quota warning:', quotaStatus.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
      console.error('Error loading trades:', err);
      
    } finally {
      setLoading(false);
      
    }
  }, [user, isAuthenticated]); // REMOVED trades.length - prevents reload after deletion

  // Load trades when user changes or on mount
  useEffect(() => {
    loadTrades();
  }, [user?.uid, isAuthenticated]); // Only reload when user ID or auth status changes

  const addTrade = useCallback(async (tradeData: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isAuthenticated && user) {
        // Save to Firebase for authenticated users
        const tradeId = await TradeService.addTrade(user.uid, tradeData);
        const newTrade: Trade = {
          ...tradeData,
          id: tradeId,
          uid: user.uid,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        setTrades(prev => [newTrade, ...prev]);
        return tradeId;
      } else {
        // Save to localStorage for unauthenticated users using localPortfolioStore
        const newTrade: Trade = {
          ...tradeData,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uid: 'local',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        setTrades(prevTrades => {
          const updatedTrades = [newTrade, ...prevTrades];
          const result = saveLocalTrades(updatedTrades);
          if (!result.success) {
            throw new Error(result.error || 'Failed to save trades');
          }
          if (result.warning) {
            console.warn(result.warning);
          }
          return updatedTrades;
        });
        return newTrade.id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trade');
      throw err;
    }
  }, [user, isAuthenticated]);

  const deleteTrade = useCallback(async (tradeId: string) => {
    
    
    // Check if this is a local trade (starts with 'local-' or 'csv-')
    // CSV-imported trades are also local-only until they're synced to Firebase
    const isLocalTrade = tradeId.startsWith('local-') || tradeId.startsWith('csv-');
    
    
    
    try {
      if (isLocalTrade) {
        // For local trades, just remove from local state and localStorage using localPortfolioStore
        setTrades(prevTrades => {
          const updatedTrades = prevTrades.filter(trade => trade.id !== tradeId);
          const result = saveLocalTrades(updatedTrades);
          if (!result.success) {
            console.error('Failed to save after delete:', result.error);
          }
          
          return updatedTrades;
        });
      } else if (isAuthenticated && user) {
        // Delete from Firebase for authenticated users with Firebase trade IDs
        try {
          const deleted = await TradeService.deleteTrade(user.uid, tradeId);
          if (!deleted) {
            // Trade was skipped (permission denied) - still remove from local state
            console.warn('⚠️ Could not delete trade from Firebase (permission denied), removing from local state only');
            
            // Continue to remove from local state below
          } else {
            
          }
        } catch (firebaseError: any) {
          // If Firebase deletion fails with unexpected error, still remove from local state
          console.warn('⚠️ Could not delete trade from Firebase (unexpected error), removing from local state only:', firebaseError.message);
          
          // Continue to remove from local state below
        }
        // Update local state immediately to prevent reload from overriding the deletion
        setTrades(prev => {
          const updatedTrades = prev.filter(trade => trade.id !== tradeId);
          
          return updatedTrades;
        });
      } else {
        // Delete from localStorage for unauthenticated users using localPortfolioStore
        setTrades(prevTrades => {
          const updatedTrades = prevTrades.filter(trade => trade.id !== tradeId);
          const result = saveLocalTrades(updatedTrades);
          if (!result.success) {
            console.error('Failed to save after delete:', result.error);
          }
          
          return updatedTrades;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trade';
      setError(errorMessage);
      
      throw err;
    }
  }, [user, isAuthenticated, trades]);

  const updateTrade = useCallback(async (tradeId: string, updates: Partial<Trade>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await TradeService.updateTrade(user.uid, tradeId, updates);
      setTrades(prev => prev.map(trade => 
        trade.id === tradeId 
          ? { ...trade, ...updates, updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any }
          : trade
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trade');
      throw err;
    }
  }, [user]);

  const importTrades = useCallback(async (tradesData: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>[]) => {
    
    
    // CRITICAL: Validate and filter trades BEFORE storing to prevent NaN errors
    const validTrades = tradesData.filter(trade => {
      const isValid = 
        Number.isFinite(trade.qty) && 
        Number.isFinite(trade.price) && 
        trade.qty > 0 && 
        trade.price > 0 &&
        typeof trade.ticker === 'string' &&
        trade.ticker.trim().length > 0 &&
        (trade.type === 'BUY' || trade.type === 'SELL') &&
        typeof trade.date === 'string' &&
        trade.date.trim().length > 0;
      
      if (!isValid) {
        console.error(`[useTrades] Rejecting invalid trade before storage:`, {
          ticker: trade.ticker,
          qty: trade.qty,
          price: trade.price,
          type: trade.type,
          date: trade.date,
          reason: !Number.isFinite(trade.qty) ? 'Invalid qty (NaN/Infinity)' :
                  !Number.isFinite(trade.price) ? 'Invalid price (NaN/Infinity)' :
                  trade.qty <= 0 ? 'qty <= 0' :
                  trade.price <= 0 ? 'price <= 0' :
                  !trade.ticker || trade.ticker.trim().length === 0 ? 'Missing/invalid ticker' :
                  trade.type !== 'BUY' && trade.type !== 'SELL' ? 'Invalid type' :
                  !trade.date || trade.date.trim().length === 0 ? 'Missing date' :
                  'Unknown'
        });
      }
      return isValid;
    });

    if (validTrades.length === 0) {
      const errorMsg = 'No valid trades to import. All trades were filtered out due to invalid data (NaN, zero, or missing values).';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (validTrades.length < tradesData.length) {
      console.warn(`[useTrades] Filtered out ${tradesData.length - validTrades.length} invalid trades. Importing ${validTrades.length} valid trades.`);
    }
    
    try {
      if (isAuthenticated && user) {
        // Save to Firebase for authenticated users
        const tradeIds = await TradeService.importTrades(user.uid, validTrades);
        const newTrades: Trade[] = validTrades.map((trade, index) => ({
          ...trade,
          id: tradeIds[index],
          uid: user.uid,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }));
        
        
        
        setTrades(prev => {
          
          const updated = [...newTrades, ...prev];
          
          return updated;
        });
        return tradeIds;
      } else {
        // Save to localStorage for unauthenticated users using localPortfolioStore
        console.log('Importing trades locally (no sign-in required)');
        const newTrades: Trade[] = validTrades.map((trade, index) => ({
          ...trade,
          id: `local-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          uid: 'local',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }));
        
        
        
        setTrades(prevTrades => {
          
          const updatedTrades = [...newTrades, ...prevTrades];
          
          const result = saveLocalTrades(updatedTrades);
          if (!result.success) {
            throw new Error(result.error || 'Failed to save imported trades');
          }
          if (result.warning) {
            console.warn(result.warning);
          }
          console.log('Local trades updated:', updatedTrades.length, 'total trades');
          return updatedTrades;
        });
        return newTrades.map(trade => trade.id);
      }
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to import trades');
      throw err;
    }
  }, [user, isAuthenticated]);

  // Migrate trades that don't have proper uid field
  const migrateTrades = useCallback(async (tradeIds: string[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await TradeService.migrateTrades(user.uid, tradeIds);
      // Refresh the trades list to reflect the migration
      await loadTrades();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to migrate trades';
      setError(errorMessage);
      throw error;
    }
  }, [user, loadTrades]);

  // Memoize calculations to prevent excessive re-computations
  const { realTrades, mockTrades, validTrades, userTickers, positions, totalInvested, totalTrades, totalPositions } = useMemo(() => {
    
    // Filter out mock trades for real portfolio calculations
    const realTrades = trades.filter(trade => !trade.mock);
    const mockTrades = trades.filter(trade => trade.mock);
    
    
    // Filter out invalid trades (invalid tickers, NaN values, etc.)
    const validTrades = realTrades.filter(trade => {
      // Check for valid ticker (allow trading pairs like "BTC/USDT" or "BTC-USDT")
      // Pattern allows: letters, numbers, dots, hyphens, and forward slashes
      const validTickerPattern = /^[A-Z0-9.\-\/]{1,20}$/i;
      if (!validTickerPattern.test(trade.ticker)) {
        console.warn(`Filtering out invalid ticker: ${trade.ticker}`);
        return false;
      }
      
      // Check for valid numeric values
      if (isNaN(trade.qty) || isNaN(trade.price) || trade.qty <= 0 || trade.price <= 0) {
        console.warn(`Filtering out trade with invalid values:`, trade);
        return false;
      }
      
      return true;
    });

    // Get unique tickers from valid trades only
    const userTickers = Array.from(new Set(validTrades.map(trade => trade.ticker)));

    // Calculate portfolio metrics using the same logic as dashboard
    // Use realTrades (same as dashboard) instead of validTrades for consistency
    const positions: Record<string, {
      ticker: string;
      shares: number;
      avgCost: number;
      currency: string;
      totalTrades: number;
      lastTradeDate: string;
      isMock: boolean;
    }> = realTrades.reduce((acc: Record<string, {
      ticker: string;
      shares: number;
      avgCost: number;
      currency: string;
      totalTrades: number;
      lastTradeDate: string;
      isMock: boolean;
    }>, trade) => {
      const { ticker, qty, price, type, date } = trade;
      
      if (!acc[ticker]) {
        acc[ticker] = {
          ticker,
          shares: 0,
          avgCost: 0,
          currency: trade.currency || 'USD',
          totalTrades: 0,
          lastTradeDate: date,
          isMock: false
        };
      }
      
      if (type === 'BUY') {
        const totalCost = acc[ticker].shares * acc[ticker].avgCost + qty * price;
        acc[ticker].shares += qty;
        acc[ticker].avgCost = totalCost / acc[ticker].shares;
      } else {
        // For SELL trades, reduce shares but keep the same average cost
        acc[ticker].shares -= qty;
      }
      
      acc[ticker].totalTrades += 1;
      acc[ticker].lastTradeDate = date;
      
      return acc;
    }, {});

    // Calculate total invested based on current position holdings (average cost basis)
    const totalInvested = Object.values(positions).reduce((sum, pos) => {
      return sum + (pos.avgCost * pos.shares);
    }, 0);

    const totalTrades = realTrades.length;
    const totalPositions = Object.keys(positions).length;

    return { realTrades, mockTrades, validTrades, userTickers, positions, totalInvested, totalTrades, totalPositions };
  }, [trades]);

  // Debug logging to understand data consistency (only log when data changes)
  useEffect(() => {
    if (trades.length > 0) {
      console.log('🔍 useTrades Debug:', {
        totalTrades: trades.length,
        realTrades: realTrades.length,
        mockTrades: mockTrades.length,
        totalInvested: totalInvested.toFixed(2),
        positionsCount: Object.keys(positions).length,
        isAuthenticated,
        userId: user?.uid
      });
    }
  }, [trades.length, totalInvested, realTrades.length, mockTrades.length, positions, isAuthenticated, user?.uid]);

  const deleteAllTrades = useCallback(async () => {
    
    
    if (!user) throw new Error('User not authenticated');
    
    try {
      const deletedCount = await TradeService.deleteAllTrades(user.uid);
      
      
      // IMPORTANT: Also clear localStorage to prevent trades from being restored
      // This ensures complete clearing across all storage locations
      saveLocalTrades([]); // Clear localStorage by saving empty array
      
      
      setTrades([]);
      
      return deletedCount;
    } catch (error) {
      
      setError(error instanceof Error ? error.message : 'Failed to delete all trades');
      throw error;
    }
  }, [user, isAuthenticated, trades.length]);

  const cleanupOrphanedTrades = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const cleanedCount = await TradeService.cleanupOrphanedTrades(user.uid);
      // Refresh trades after cleanup
      await loadTrades();
      return cleanedCount;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cleanup orphaned trades');
      throw error;
    }
  }, [user, loadTrades]);

  // Export/import functions for local storage
  const exportPortfolio = useCallback(() => {
    if (!isAuthenticated) {
      return exportLocalPortfolio();
    }
    // For authenticated users, export would be handled differently
    return null;
  }, [isAuthenticated]);

  const importPortfolioFromJSON = useCallback(async (jsonData: string) => {
    if (!isAuthenticated) {
      const result = importLocalPortfolio(jsonData);
      if (result.success && result.tradeCount) {
        // Reload trades after import
        await loadTrades();
      }
      return result;
    }
    // For authenticated users, import would be handled differently
    return { success: false, error: 'Import from JSON not yet supported for authenticated users' };
  }, [isAuthenticated, loadTrades]);

  const getQuotaWarning = useCallback(() => {
    if (!isAuthenticated) {
      return getQuotaStatus();
    }
    return null;
  }, [isAuthenticated]);

  return {
    trades,
    loading,
    error,
    userTickers,
    totalInvested,
    totalTrades,
    totalPositions,
    addTrade,
    deleteTrade,
    updateTrade,
    importTrades,
    migrateTrades,
    deleteAllTrades,
    cleanupOrphanedTrades,
    refreshTrades: loadTrades,
    exportPortfolio,
    importPortfolioFromJSON,
    getQuotaWarning
  };
}
