/**
 * Market Context Service
 * Analyzes current market conditions for dynamic recommendation adjustments
 */

import { fetchVIX, fetchSectorPerformance, fetchMarketMomentum, fetchSP500Price } from '@/app/lib/services/marketDataService';
import { GICSSector } from './sectorClassification';

export type VolatilityLevel = 'low' | 'normal' | 'high' | 'extreme';
export type MarketRegime = 'bull' | 'bear' | 'sideways' | 'volatile';

export interface MarketContext {
  volatility: VolatilityLevel;
  regime: MarketRegime;
  vixLevel: number | null;
  sectorPerformance: Record<GICSSector, number>;
  marketMomentum: number | null; // S&P 500 30-day return
  sp500Price: number | null;
  lastUpdated: Date;
}

/**
 * Determine volatility level from VIX
 */
function determineVolatilityLevel(vix: number | null): VolatilityLevel {
  if (!vix) return 'normal';
  
  if (vix >= 30) return 'extreme';
  if (vix >= 20) return 'high';
  if (vix >= 15) return 'normal';
  return 'low';
}

/**
 * Determine market regime from momentum and volatility
 */
function determineMarketRegime(
  momentum: number | null,
  volatility: VolatilityLevel
): MarketRegime {
  if (volatility === 'extreme' || volatility === 'high') {
    return 'volatile';
  }
  
  if (!momentum) return 'sideways';
  
  if (momentum > 5) return 'bull';
  if (momentum < -5) return 'bear';
  return 'sideways';
}

/**
 * Get current market context
 * Fetches VIX, sector performance, and market momentum
 */
export async function getMarketContext(): Promise<MarketContext> {
  // Fetch all market data in parallel
  const [vix, sectorPerf, momentum, sp500Price] = await Promise.all([
    fetchVIX(),
    fetchSectorPerformance(),
    fetchMarketMomentum(),
    fetchSP500Price(),
  ]);

  const volatility = determineVolatilityLevel(vix);
  const regime = determineMarketRegime(momentum, volatility);

  // Map sector performance to GICS sectors
  const sectorPerformanceMap: Record<GICSSector, number> = {} as Record<GICSSector, number>;
  
  // Initialize all sectors to 0
  Object.values(GICSSector).forEach((sector) => {
    sectorPerformanceMap[sector] = 0;
  });

  // Map ETF performance to GICS sectors
  Object.entries(sectorPerf).forEach(([sectorName, return_]) => {
    // Find matching GICS sector
    const gicsSector = Object.values(GICSSector).find(
      (s) => s === sectorName || s.includes(sectorName) || sectorName.includes(s)
    );
    if (gicsSector) {
      sectorPerformanceMap[gicsSector] = return_;
    }
  });

  return {
    volatility,
    regime,
    vixLevel: vix,
    sectorPerformance: sectorPerformanceMap,
    marketMomentum: momentum,
    sp500Price,
    lastUpdated: new Date(),
  };
}

/**
 * Get cached market context or fetch new
 * Caches for 15 minutes
 * On client-side, routes through API to avoid CORS issues
 */
let cachedContext: MarketContext | null = null;
let cacheTimestamp: Date | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const CLIENT_CACHE_KEY = 'market_context_cache';

export async function getCachedMarketContext(): Promise<MarketContext> {
  const now = new Date();
  const isClient = typeof window !== 'undefined';

  // Client-side: Check localStorage cache first, then route through API
  if (isClient) {
    try {
      const cached = localStorage.getItem(CLIENT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cachedDate = new Date(parsed.lastUpdated);
        if (now.getTime() - cachedDate.getTime() < CACHE_TTL) {
          return {
            ...parsed,
            lastUpdated: cachedDate,
          };
        }
      }
    } catch (e) {
      // Cache read failed, continue to fetch
    }

    // Fetch from API route (server-side proxy)
    try {
      const response = await fetch('/api/portfolio/market-context');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const context = await response.json();
      const result: MarketContext = {
        ...context,
        lastUpdated: new Date(context.lastUpdated),
      };
      
      // Cache in localStorage
      localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Failed to fetch market context from API:', error);
      // Fallback: Return default context if API fails
      return {
        volatility: 'normal',
        regime: 'sideways',
        vixLevel: null,
        sectorPerformance: {} as Record<GICSSector, number>,
        marketMomentum: null,
        sp500Price: null,
        lastUpdated: now,
      };
    }
  }

  // Server-side: Use in-memory cache and direct fetch
  if (
    cachedContext &&
    cacheTimestamp &&
    now.getTime() - cacheTimestamp.getTime() < CACHE_TTL
  ) {
    return cachedContext;
  }

  const context = await getMarketContext();
  cachedContext = context;
  cacheTimestamp = now;
  
  return context;
}

/**
 * Check if market context has changed significantly
 * Used to trigger recommendation updates
 */
export function hasSignificantMarketChange(
  oldContext: MarketContext,
  newContext: MarketContext
): boolean {
  // VIX change >20%
  if (oldContext.vixLevel && newContext.vixLevel) {
    const vixChange = Math.abs(
      (newContext.vixLevel - oldContext.vixLevel) / oldContext.vixLevel
    );
    if (vixChange > 0.2) {
      return true;
    }
  }

  // Market momentum change >3%
  if (oldContext.marketMomentum !== null && newContext.marketMomentum !== null) {
    const momentumChange = Math.abs(
      newContext.marketMomentum - oldContext.marketMomentum
    );
    if (momentumChange > 3) {
      return true;
    }
  }

  // Volatility regime change
  if (oldContext.volatility !== newContext.volatility) {
    return true;
  }

  // Market regime change
  if (oldContext.regime !== newContext.regime) {
    return true;
  }

  return false;
}

/**
 * Hash market context for comparison
 */
export function hashMarketContext(context: MarketContext): string {
  return JSON.stringify({
    volatility: context.volatility,
    regime: context.regime,
    vixLevel: context.vixLevel?.toFixed(1),
    marketMomentum: context.marketMomentum?.toFixed(1),
  });
}

