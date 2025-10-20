'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { TradeService, Trade } from '../services/tradeService';

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
        const userTrades = await TradeService.getTrades(user.uid);
        setTrades(userTrades);
      } else {
        // Load from localStorage for unauthenticated users
        const localTrades = localStorage.getItem('pocket-portfolio-local-trades');
        if (localTrades) {
          const parsedTrades = JSON.parse(localTrades);
          setTrades(parsedTrades);
        } else {
          setTrades([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
      console.error('Error loading trades:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

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
        // Save to localStorage for unauthenticated users
        const newTrade: Trade = {
          ...tradeData,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uid: 'local',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        setTrades(prevTrades => {
          const updatedTrades = [newTrade, ...prevTrades];
          localStorage.setItem('pocket-portfolio-local-trades', JSON.stringify(updatedTrades));
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
    // Check if this is a local trade (starts with 'local-')
    const isLocalTrade = tradeId.startsWith('local-');
    
    try {
      if (isLocalTrade) {
        // For local trades, just remove from local state and localStorage
        setTrades(prevTrades => {
          const updatedTrades = prevTrades.filter(trade => trade.id !== tradeId);
          localStorage.setItem('pocket-portfolio-local-trades', JSON.stringify(updatedTrades));
          return updatedTrades;
        });
      } else if (isAuthenticated && user) {
        // Delete from Firebase for authenticated users with Firebase trade IDs
        await TradeService.deleteTrade(user.uid, tradeId);
        // Update local state immediately to prevent reload from overriding the deletion
        setTrades(prev => prev.filter(trade => trade.id !== tradeId));
      } else {
        // Delete from localStorage for unauthenticated users
        setTrades(prevTrades => {
          const updatedTrades = prevTrades.filter(trade => trade.id !== tradeId);
          localStorage.setItem('pocket-portfolio-local-trades', JSON.stringify(updatedTrades));
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
    try {
      if (isAuthenticated && user) {
        // Save to Firebase for authenticated users
        const tradeIds = await TradeService.importTrades(user.uid, tradesData);
        const newTrades: Trade[] = tradesData.map((trade, index) => ({
          ...trade,
          id: tradeIds[index],
          uid: user.uid,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }));
        
        setTrades(prev => [...newTrades, ...prev]);
        return tradeIds;
      } else {
        // Save to localStorage for unauthenticated users
        console.log('Importing trades locally (no sign-in required)');
        const newTrades: Trade[] = tradesData.map((trade, index) => ({
          ...trade,
          id: `local-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          uid: 'local',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }));
        
        setTrades(prevTrades => {
          const updatedTrades = [...newTrades, ...prevTrades];
          localStorage.setItem('pocket-portfolio-local-trades', JSON.stringify(updatedTrades));
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
      // Check for valid ticker (more flexible pattern to handle various formats)
      const validTickerPattern = /^[A-Z0-9.-]{1,10}$/;
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
      setTrades([]);
      return deletedCount;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete all trades');
      throw error;
    }
  }, [user]);

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
    refreshTrades: loadTrades
  };
}
