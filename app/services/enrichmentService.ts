/**
 * Asset Enrichment Service
 * Fetches public metadata (Sector, Industry, Beta) for tickers
 * 
 * Uses Financial Modeling Prep (FMP) API for live data with fallback cache
 */

import { AssetProfile } from '../types/analytics';

const FMP_KEY = process.env.NEXT_PUBLIC_FMP_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Fallback Cache (Keep this for reliability or if API fails)
const PROFILE_CACHE: Record<string, AssetProfile> = {
  'CASH': { ticker: 'CASH', name: 'Cash', sector: 'Cash', industry: 'Cash', beta: 0.0, geo: 'UK' },
  'AAPL': { ticker: 'AAPL', name: 'Apple Inc', sector: 'Technology', industry: 'Consumer Electronics', beta: 1.2, geo: 'US' },
  'MSFT': { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology', industry: 'Software', beta: 0.9, geo: 'US' },
  'NVDA': { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology', industry: 'Semiconductors', beta: 1.7, geo: 'US' },
  'TSLA': { ticker: 'TSLA', name: 'Tesla', sector: 'Consumer Cyclical', industry: 'Auto', beta: 2.3, geo: 'US' },
  'GOOGL': { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology', industry: 'Internet Content', beta: 1.1, geo: 'US' },
  'AMZN': { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Cyclical', industry: 'E-commerce', beta: 1.3, geo: 'US' },
  'META': { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', industry: 'Social Media', beta: 1.2, geo: 'US' },
  'VWRL': { ticker: 'VWRL', name: 'Vanguard World', sector: 'ETF', industry: 'Global Equity', beta: 1.0, geo: 'EU' },
  'SPY': { ticker: 'SPY', name: 'SPDR S&P 500', sector: 'ETF', industry: 'US Equity', beta: 1.0, geo: 'US' },
  'QQQ': { ticker: 'QQQ', name: 'Invesco QQQ', sector: 'ETF', industry: 'Tech Equity', beta: 1.1, geo: 'US' },
  'BRK.B': { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financial Services', industry: 'Conglomerate', beta: 0.8, geo: 'US' },
  'JNJ': { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Pharmaceuticals', beta: 0.7, geo: 'US' },
  'V': { ticker: 'V', name: 'Visa', sector: 'Financial Services', industry: 'Payment Processing', beta: 1.0, geo: 'US' },
  'JPM': { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services', industry: 'Banking', beta: 1.2, geo: 'US' },
  'UNH': { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', industry: 'Managed Care', beta: 0.9, geo: 'US' },
  'PG': { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive', industry: 'Consumer Goods', beta: 0.5, geo: 'US' },
  'MA': { ticker: 'MA', name: 'Mastercard', sector: 'Financial Services', industry: 'Payment Processing', beta: 1.1, geo: 'US' },
  'HD': { ticker: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical', industry: 'Retail', beta: 1.0, geo: 'US' },
  'DIS': { ticker: 'DIS', name: 'Walt Disney', sector: 'Communication Services', industry: 'Entertainment', beta: 1.3, geo: 'US' },
  'AMD': { ticker: 'AMD', name: 'AMD', sector: 'Technology', industry: 'Semiconductors', beta: 1.6, geo: 'US' },
  'GME': { ticker: 'GME', name: 'GameStop', sector: 'Consumer Cyclical', industry: 'Retail', beta: 2.0, geo: 'US' },
  'CSPX': { ticker: 'CSPX', name: 'iShares S&P 500', sector: 'ETF', industry: 'US Equity', beta: 1.0, geo: 'EU' },
  'VUSA': { ticker: 'VUSA', name: 'Vanguard S&P 500', sector: 'ETF', industry: 'US Equity', beta: 1.0, geo: 'EU' },
  'PLTR': { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Software', beta: 1.5, geo: 'US' },
  'SGML': { ticker: 'SGML', name: 'Sigma Lithium', sector: 'Basic Materials', industry: 'Metals & Mining', beta: 1.8, geo: 'US' },
};

/**
 * Utility to split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Fetch Asset Profiles for given tickers
 * 
 * Uses FMP API for live data with fallback to cache
 * Handles ticker normalization (e.g., "VUSA.L" -> "VUSA") to match cache lookups
 * 
 * Production considerations:
 * - FMP free tier: 250 requests/day
 * - Batch requests (30 tickers per call) to minimize API usage
 * - 10-second timeout per request
 * - Graceful fallback to cache on errors
 */
export async function fetchAssetProfiles(tickers: string[]): Promise<Record<string, AssetProfile>> {
  // Early return for empty input
  if (!tickers || tickers.length === 0) {
    return {};
  }

  const results: Record<string, AssetProfile> = { ...PROFILE_CACHE };
  
  // Normalize all tickers first
  const normalizedMap = new Map<string, string[]>(); // cleanTicker -> [rawTicker1, rawTicker2, ...]
  tickers.forEach(rawTicker => {
    const cleanTicker = rawTicker.split('.')[0].toUpperCase();
    if (!normalizedMap.has(cleanTicker)) {
      normalizedMap.set(cleanTicker, []);
    }
    normalizedMap.get(cleanTicker)!.push(rawTicker);
  });

  // Filter out tickers we already have in cache to save API calls
  const uncachedTickers = Array.from(normalizedMap.keys())
    .filter(t => !results[t] && t !== 'CASH');

  // If we have FMP key and uncached tickers, fetch from API
  if (uncachedTickers.length > 0 && FMP_KEY) {
    // Batch Request: FMP allows comma-separated tickers (e.g., AAPL,MSFT,NVDA)
    // We chunk them to avoid URL length limits (max ~30 per call safe bet)
    const chunks = chunkArray(uncachedTickers, 30);

    const fetchPromises = chunks.map(async (chunk) => {
      try {
        const url = `${BASE_URL}/profile/${chunk.join(',')}?apikey=${FMP_KEY}`;
        
        // Add timeout to prevent hanging requests (10 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          // Only log in development to avoid console noise in production
          if (process.env.NODE_ENV === 'development') {
            console.warn(`FMP API error: ${res.status} ${res.statusText}`);
          }
          return;
        }
        
        const data = await res.json();

        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (!item || !item.symbol) return;
            
            // Map FMP data to our schema
            const profile: AssetProfile = {
              ticker: item.symbol,
              name: item.companyName || item.symbol,
              sector: item.sector || 'Other',
              industry: item.industry || 'Other',
              beta: item.beta ?? 1.0,
              geo: item.currency === 'USD' ? 'US' : item.currency === 'GBP' ? 'UK' : item.currency === 'EUR' ? 'EU' : 'OTHER'
            };
            
            // Store by clean ticker
            results[item.symbol] = profile;
            
            // Map all original ticker variants (e.g., "VUSA.L" -> same data as "VUSA")
            const originalTickers = normalizedMap.get(item.symbol);
            if (originalTickers) {
              originalTickers.forEach(rawTicker => {
                results[rawTicker] = {
                  ...profile,
                  ticker: rawTicker // Keep original ticker format
                };
              });
            }
          });
        }
      } catch (error: any) {
        // Only log in development - fail silently in production to avoid console noise
        if (process.env.NODE_ENV === 'development') {
          if (error.name === 'AbortError') {
            console.warn('FMP API request timeout');
          } else {
            console.error('FMP Fetch Error:', error);
          }
        }
        // Fail silently and rely on fallback below
      }
    });

    await Promise.all(fetchPromises);
  }

  // Final pass: ensure all requested tickers have results (fallback to "Other" if not found)
  tickers.forEach(rawTicker => {
    if (!results[rawTicker]) {
      const cleanTicker = rawTicker.split('.')[0].toUpperCase();
      // Check if we got data for the clean ticker
      if (results[cleanTicker]) {
        results[rawTicker] = {
          ...results[cleanTicker],
          ticker: rawTicker
        };
      } else {
        // Final fallback: Unknown asset
        results[rawTicker] = { 
          ticker: rawTicker, 
          name: rawTicker, 
          sector: 'Other', 
          industry: 'Other', 
          beta: 1.0, 
          geo: 'US' 
        };
      }
    }
  });
  
  return results;
}

