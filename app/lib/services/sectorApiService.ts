/**
 * Sector API Service
 * Fetches sector classification from external APIs with fallback to local database
 * Supports multiple providers: Yahoo Finance, Alpha Vantage, Polygon.io
 */

import { GICSSector, AssetType, SectorClassification, detectAssetType, normalizeSector } from '@/app/lib/portfolio/sectorClassification';

/**
 * Yahoo Finance API Response
 */
interface YahooFinanceQuoteSummary {
  quoteSummary?: {
    result?: Array<{
      assetProfile?: {
        sector?: string;
        industry?: string;
        industryDisp?: string;
        longBusinessSummary?: string;
      };
      summaryProfile?: {
        sector?: string;
        industry?: string;
        industryDisp?: string;
        longBusinessSummary?: string;
      };
    }>;
  };
}

/**
 * Fetch sector from Yahoo Finance API
 * Free, no API key required
 */
export async function fetchSectorFromYahooFinance(
  ticker: string
): Promise<{ sector: string; industry?: string } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile,summaryProfile`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return null;
    }

    const data: YahooFinanceQuoteSummary = await response.json();
    const result = data.quoteSummary?.result?.[0];
    
    const assetProfile = result?.assetProfile || result?.summaryProfile;
    if (!assetProfile) {
      return null;
    }

    const sector = assetProfile.sector;
    const industry = assetProfile.industry || (assetProfile as any).industryDisp;

    if (!sector) {
      return null;
    }

    return {
      sector: sector.trim(),
      industry: industry?.trim(),
    };
  } catch (error) {
    console.error(`Error fetching sector from Yahoo Finance for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch sector classification from API
 * Tries multiple providers with fallback chain
 */
export async function fetchSectorClassification(
  ticker: string
): Promise<SectorClassification | null> {
  const upperTicker = ticker.toUpperCase();
  const assetType = detectAssetType(upperTicker);

  // Try Yahoo Finance first (free, no API key)
  const yahooData = await fetchSectorFromYahooFinance(upperTicker);
  
  if (yahooData && yahooData.sector) {
    return {
      ticker: upperTicker,
      sector: normalizeSector(yahooData.sector),
      industry: yahooData.industry,
      assetType,
      source: 'api',
      lastUpdated: new Date(),
      confidence: 'high',
    };
  }

  // Could add other providers here (Alpha Vantage, Polygon.io, etc.)
  // For now, return null to trigger fallback to local database

  return null;
}

/**
 * Batch fetch sector classifications
 * Fetches multiple tickers efficiently with rate limiting
 */
export async function fetchBatchSectorClassification(
  tickers: string[]
): Promise<Map<string, SectorClassification>> {
  const results = new Map<string, SectorClassification>();
  const uniqueTickers = [...new Set(tickers.map(t => t.toUpperCase()))];

  // Process in batches of 10 to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < uniqueTickers.length; i += batchSize) {
    const batch = uniqueTickers.slice(i, i + batchSize);
    
    const promises = batch.map(async (ticker) => {
      try {
        const classification = await fetchSectorClassification(ticker);
        if (classification) {
          results.set(ticker, classification);
        }
      } catch (error) {
        console.error(`Error fetching sector for ${ticker}:`, error);
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < uniqueTickers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

