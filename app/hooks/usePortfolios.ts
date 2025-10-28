'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { PortfolioService, Portfolio } from '../services/portfolioService';

export function usePortfolios() {
  const { user, isAuthenticated } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolios = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // For unauthenticated users, create a default local portfolio
      const defaultPortfolio: Portfolio = {
        id: 'local-default',
        uid: 'local',
        name: 'Local Portfolio',
        broker: 'Local',
        description: 'Local portfolio for unauthenticated users',
        currency: 'USD',
        isDefault: true,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };
      
      setPortfolios([defaultPortfolio]);
      setSelectedPortfolioId('local-default');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userPortfolios = await PortfolioService.getPortfolios(user.uid);
      setPortfolios(userPortfolios);
      
      // Set default portfolio as selected, or first portfolio if no default
      const defaultPortfolio = userPortfolios.find(p => p.isDefault);
      if (defaultPortfolio) {
        setSelectedPortfolioId(defaultPortfolio.id);
      } else if (userPortfolios.length > 0) {
        setSelectedPortfolioId(userPortfolios[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
      console.error('Error loading portfolios:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Load portfolios when user changes or on mount
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const createPortfolio = useCallback(async (portfolioData: Omit<Portfolio, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isAuthenticated && user) {
        const portfolioId = await PortfolioService.createPortfolio(user.uid, portfolioData);
        const newPortfolio: Portfolio = {
          ...portfolioData,
          id: portfolioId,
          uid: user.uid,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        setPortfolios(prev => [newPortfolio, ...prev]);
        setSelectedPortfolioId(portfolioId);
        return portfolioId;
      } else {
        // For unauthenticated users, create a local portfolio
        const newPortfolio: Portfolio = {
          ...portfolioData,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uid: 'local',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        setPortfolios(prev => [newPortfolio, ...prev]);
        setSelectedPortfolioId(newPortfolio.id);
        return newPortfolio.id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      throw err;
    }
  }, [user, isAuthenticated]);

  const updatePortfolio = useCallback(async (portfolioId: string, updates: Partial<Portfolio>) => {
    try {
      if (isAuthenticated && user) {
        await PortfolioService.updatePortfolio(user.uid, portfolioId, updates);
        setPortfolios(prev => prev.map(p => 
          p.id === portfolioId 
            ? { ...p, ...updates, updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any }
            : p
        ));
      } else {
        // For unauthenticated users, update local state
        setPortfolios(prev => prev.map(p => 
          p.id === portfolioId 
            ? { ...p, ...updates, updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any }
            : p
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio');
      throw err;
    }
  }, [user, isAuthenticated]);

  const deletePortfolio = useCallback(async (portfolioId: string) => {
    try {
      if (isAuthenticated && user) {
        await PortfolioService.deletePortfolio(user.uid, portfolioId);
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        
        // If we deleted the selected portfolio, select another one
        if (selectedPortfolioId === portfolioId) {
          const remainingPortfolios = portfolios.filter(p => p.id !== portfolioId);
          if (remainingPortfolios.length > 0) {
            setSelectedPortfolioId(remainingPortfolios[0].id);
          } else {
            setSelectedPortfolioId(null);
          }
        }
      } else {
        // For unauthenticated users, update local state
        setPortfolios(prev => {
          const updated = prev.filter(p => p.id !== portfolioId);
          if (selectedPortfolioId === portfolioId) {
            if (updated.length > 0) {
              setSelectedPortfolioId(updated[0].id);
            } else {
              setSelectedPortfolioId(null);
            }
          }
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
      throw err;
    }
  }, [user, isAuthenticated, selectedPortfolioId, portfolios]);

  const setDefaultPortfolio = useCallback(async (portfolioId: string) => {
    try {
      if (isAuthenticated && user) {
        await PortfolioService.setDefaultPortfolio(user.uid, portfolioId);
        setPortfolios(prev => prev.map(p => ({
          ...p,
          isDefault: p.id === portfolioId
        })));
      } else {
        // For unauthenticated users, update local state
        setPortfolios(prev => prev.map(p => ({
          ...p,
          isDefault: p.id === portfolioId
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default portfolio');
      throw err;
    }
  }, [user, isAuthenticated]);

  const selectPortfolio = useCallback((portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
  }, []);

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  return {
    portfolios,
    selectedPortfolio,
    selectedPortfolioId,
    loading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    setDefaultPortfolio,
    selectPortfolio,
    refreshPortfolios: loadPortfolios
  };
}
