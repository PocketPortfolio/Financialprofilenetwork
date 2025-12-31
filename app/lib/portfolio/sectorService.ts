/**
 * Unified Sector Classification Service
 * Main entry point for sector classification with API + Database fallback chain
 */

import { GICSSector, AssetType, SectorClassification, normalizeSector, detectAssetType } from './sectorClassification';
import { getSectorFromDatabase, TickerDatabaseEntry } from './tickerDatabase';
import { fetchSectorClassification } from '@/app/lib/services/sectorApiService';

/**
 * Get sector classification for a ticker
 * Uses fallback chain: API -> Database -> Unclassified
 */
export async function getSectorClassification(
  ticker: string,
  options: {
    useApi?: boolean;
    useCache?: boolean;
  } = {}
): Promise<SectorClassification> {
  const { useApi = true, useCache = true } = options;
  const upperTicker = ticker.toUpperCase();
  const assetType = detectAssetType(upperTicker);

  // Try API first (if enabled)
  if (useApi) {
    try {
      const apiResult = await fetchSectorClassification(upperTicker);
      if (apiResult) {
        return apiResult;
      }
    } catch (error) {
      console.error(`API classification failed for ${upperTicker}:`, error);
      // Fall through to database
    }
  }

  // Try local database
  const dbEntry = getSectorFromDatabase(upperTicker);
  if (dbEntry) {
    return {
      ticker: upperTicker,
      sector: dbEntry.sector,
      industry: dbEntry.industry,
      assetType: dbEntry.assetType,
      source: 'database',
      lastUpdated: new Date(),
      confidence: 'high',
    };
  }

  // Default to unclassified
  return {
    ticker: upperTicker,
    sector: GICSSector.UNCLASSIFIED,
    assetType,
    source: 'fallback',
    lastUpdated: new Date(),
    confidence: 'low',
  };
}

/**
 * Batch get sector classifications
 * Efficiently processes multiple tickers
 */
export async function getBatchSectorClassification(
  tickers: string[],
  options: {
    useApi?: boolean;
    useCache?: boolean;
  } = {}
): Promise<Map<string, SectorClassification>> {
  const results = new Map<string, SectorClassification>();
  const uniqueTickers = [...new Set(tickers.map(t => t.toUpperCase()))];

  // Process all tickers
  const promises = uniqueTickers.map(async (ticker) => {
    const classification = await getSectorClassification(ticker, options);
    results.set(ticker, classification);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Get sector for a ticker (simplified, backward-compatible)
 * Returns just the sector name as a string
 */
export async function getSector(ticker: string): Promise<GICSSector> {
  const classification = await getSectorClassification(ticker, { useApi: false }); // Skip API for speed
  return classification.sector;
}

/**
 * Get sector for a ticker synchronously (uses database only)
 * For client-side use where async is not possible
 */
export function getSectorSync(ticker: string): GICSSector {
  const upperTicker = ticker.toUpperCase();
  const dbEntry = getSectorFromDatabase(upperTicker);
  
  if (dbEntry) {
    return dbEntry.sector;
  }

  // Try to detect from asset type
  const assetType = detectAssetType(upperTicker);
  if (assetType === AssetType.REIT) {
    return GICSSector.REAL_ESTATE;
  }

  return GICSSector.UNCLASSIFIED;
}











