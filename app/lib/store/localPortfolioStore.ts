/**
 * Local Portfolio Store
 * LocalStorage-based portfolio storage for unauthenticated users
 * Handles quota management, export/import, and migration to Firebase
 */

import type { Trade } from '@/app/services/tradeService';

const STORAGE_KEY_TRADES = 'pocket-portfolio-local-trades';
const STORAGE_KEY_PORTFOLIO = 'pocket-portfolio-local-portfolio';
const STORAGE_KEY_METADATA = 'pocket-portfolio-local-metadata';

// localStorage quota is typically 5-10MB, we'll use 80% as warning threshold
const QUOTA_WARNING_THRESHOLD = 0.8;
const QUOTA_ERROR_THRESHOLD = 0.95;

interface LocalPortfolioMetadata {
  createdAt: string;
  lastUpdated: string;
  version: string;
  tradeCount: number;
  dataSize: number; // Approximate size in bytes
}

interface LocalPortfolioData {
  trades: Trade[];
  metadata: LocalPortfolioMetadata;
}

/**
 * Get approximate size of data in bytes
 */
function getDataSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Check localStorage quota usage
 */
function checkQuotaUsage(): { used: number; total: number; percentage: number; status: 'ok' | 'warning' | 'error' } {
  try {
    // Calculate approximate usage
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pocket-portfolio-')) {
        const value = localStorage.getItem(key);
        if (value) {
          used += new Blob([value]).size;
        }
      }
    }

    // Estimate total quota (typically 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = used / total;

    let status: 'ok' | 'warning' | 'error' = 'ok';
    if (percentage >= QUOTA_ERROR_THRESHOLD) {
      status = 'error';
    } else if (percentage >= QUOTA_WARNING_THRESHOLD) {
      status = 'warning';
    }

    return { used, total, percentage, status };
  } catch (error) {
    console.error('Error checking quota:', error);
    return { used: 0, total: 0, percentage: 0, status: 'ok' };
  }
}

/**
 * Save trades to localStorage with quota management
 */
export function saveLocalTrades(trades: Trade[]): { success: boolean; warning?: string; error?: string } {
  try {
    const quota = checkQuotaUsage();
    
    if (quota.status === 'error') {
      return {
        success: false,
        error: 'LocalStorage quota exceeded. Please export your data or sign up to sync to the cloud.',
      };
    }

    const metadata: LocalPortfolioMetadata = {
      createdAt: localStorage.getItem(STORAGE_KEY_METADATA)
        ? JSON.parse(localStorage.getItem(STORAGE_KEY_METADATA)!).createdAt
        : new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      tradeCount: trades.length,
      dataSize: getDataSize(trades),
    };

    const portfolioData: LocalPortfolioData = {
      trades,
      metadata,
    };

    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
    localStorage.setItem(STORAGE_KEY_METADATA, JSON.stringify(metadata));

    let warning: string | undefined;
    if (quota.status === 'warning') {
      warning = `LocalStorage is ${Math.round(quota.percentage * 100)}% full. Consider exporting your data or signing up to sync to the cloud.`;
    }

    return { success: true, warning };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'LocalStorage quota exceeded. Please export your data or sign up to sync to the cloud.',
      };
    }
    console.error('Error saving local trades:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save trades',
    };
  }
}

/**
 * Load trades from localStorage
 */
export function loadLocalTrades(): Trade[] {
  try {
    const tradesJson = localStorage.getItem(STORAGE_KEY_TRADES);
    if (!tradesJson) {
      return [];
    }
    return JSON.parse(tradesJson) as Trade[];
  } catch (error) {
    console.error('Error loading local trades:', error);
    return [];
  }
}

/**
 * Get local portfolio metadata
 */
export function getLocalPortfolioMetadata(): LocalPortfolioMetadata | null {
  try {
    const metadataJson = localStorage.getItem(STORAGE_KEY_METADATA);
    if (!metadataJson) {
      return null;
    }
    return JSON.parse(metadataJson) as LocalPortfolioMetadata;
  } catch (error) {
    console.error('Error loading local metadata:', error);
    return null;
  }
}

/**
 * Export portfolio data as JSON
 * @param providedTrades Optional trades array (from Firebase or state). If not provided, loads from localStorage.
 */
export function exportLocalPortfolio(providedTrades?: Trade[]): { data: LocalPortfolioData; filename: string } {
  // Use provided trades (from Firebase/state) or fall back to localStorage
  const trades = providedTrades || loadLocalTrades();
  
  const metadata = getLocalPortfolioMetadata() || {
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    tradeCount: trades.length,
    dataSize: getDataSize(trades),
  };

  // Update metadata with current trade count if using provided trades
  if (providedTrades) {
    metadata.tradeCount = trades.length;
    metadata.dataSize = getDataSize(trades);
    metadata.lastUpdated = new Date().toISOString();
  }

  const data: LocalPortfolioData = {
    trades,
    metadata,
  };

  const filename = `pocket-portfolio-export-${new Date().toISOString().split('T')[0]}.json`;

  return { data, filename };
}

/**
 * Import portfolio data from JSON
 */
export function importLocalPortfolio(jsonData: string): { success: boolean; error?: string; tradeCount?: number } {
  try {
    const data = JSON.parse(jsonData) as LocalPortfolioData;
    
    if (!data.trades || !Array.isArray(data.trades)) {
      return {
        success: false,
        error: 'Invalid portfolio data format. Expected trades array.',
      };
    }

    // Validate trades structure
    const validTrades = data.trades.filter(trade => {
      return (
        trade.id &&
        trade.ticker &&
        trade.date &&
        trade.type &&
        typeof trade.qty === 'number' &&
        typeof trade.price === 'number'
      );
    });

    if (validTrades.length === 0) {
      return {
        success: false,
        error: 'No valid trades found in imported data.',
      };
    }

    // Save imported trades
    const result = saveLocalTrades(validTrades);
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      tradeCount: validTrades.length,
    };
  } catch (error) {
    console.error('Error importing portfolio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import portfolio data',
    };
  }
}

/**
 * Clear all local portfolio data
 */
export function clearLocalPortfolio(): void {
  localStorage.removeItem(STORAGE_KEY_TRADES);
  localStorage.removeItem(STORAGE_KEY_PORTFOLIO);
  localStorage.removeItem(STORAGE_KEY_METADATA);
}

/**
 * Get quota status for UI display
 */
export function getQuotaStatus(): { percentage: number; status: 'ok' | 'warning' | 'error'; message: string } {
  const quota = checkQuotaUsage();
  let message = '';

  if (quota.status === 'error') {
    message = 'LocalStorage is full. Please export your data or sign up to sync to the cloud.';
  } else if (quota.status === 'warning') {
    message = `LocalStorage is ${Math.round(quota.percentage * 100)}% full. Consider exporting your data.`;
  } else {
    message = 'LocalStorage usage is normal.';
  }

  return {
    percentage: quota.percentage,
    status: quota.status,
    message,
  };
}

/**
 * Migrate local trades to Firebase format
 * Called when user signs up
 */
export function prepareTradesForMigration(): Trade[] {
  const trades = loadLocalTrades();
  // Trades are already in the correct format, just need to remove 'local-' prefix from IDs
  return trades.map(trade => ({
    ...trade,
    id: trade.id.replace(/^local-/, ''), // Remove local- prefix for migration
  }));
}









