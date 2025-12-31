/**
 * Professional Sector Classification System
 * Implements GICS (Global Industry Classification Standard) with 11 sectors
 * Replaces the old "General" fallback with proper industry-standard classification
 */

/**
 * GICS Sectors (Global Industry Classification Standard)
 * Industry-standard taxonomy used by S&P and MSCI
 */
export enum GICSSector {
  ENERGY = 'Energy',
  MATERIALS = 'Materials',
  INDUSTRIALS = 'Industrials',
  CONSUMER_DISCRETIONARY = 'Consumer Discretionary',
  CONSUMER_STAPLES = 'Consumer Staples',
  HEALTH_CARE = 'Health Care',
  FINANCIALS = 'Financials',
  INFORMATION_TECHNOLOGY = 'Information Technology',
  COMMUNICATION_SERVICES = 'Communication Services',
  UTILITIES = 'Utilities',
  REAL_ESTATE = 'Real Estate',
  UNCLASSIFIED = 'Unclassified', // Replaces "General" - only for truly unclassifiable assets
}

/**
 * Asset Types
 * Categorizes different investment vehicles
 */
export enum AssetType {
  STOCK = 'Stock',
  ETF = 'ETF',
  BOND = 'Bond',
  CRYPTO = 'Crypto',
  REIT = 'REIT',
  COMMODITY = 'Commodity',
  MUTUAL_FUND = 'Mutual Fund',
  OPTION = 'Option',
  FUTURE = 'Future',
}

/**
 * Sector Classification Result
 * Complete classification information for a ticker
 */
export interface SectorClassification {
  ticker: string;
  sector: GICSSector;
  industry?: string;
  industryGroup?: string;
  assetType: AssetType;
  source: 'api' | 'cache' | 'database' | 'fallback';
  lastUpdated: Date;
  confidence: 'high' | 'medium' | 'low'; // Classification confidence level
}

/**
 * Sector Metadata
 * Additional information about each sector
 */
export interface SectorInfo {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  keywords: string[];
}

/**
 * GICS Sector Information
 * Comprehensive metadata for all 11 GICS sectors
 */
export const GICS_SECTOR_INFO: Record<GICSSector, SectorInfo> = {
  [GICSSector.ENERGY]: {
    name: 'Energy',
    description: 'Companies involved in exploration, production, and distribution of energy resources including oil, gas, and renewable energy.',
    keywords: ['oil', 'gas', 'energy', 'petroleum', 'renewable energy', 'drilling'],
  },
  [GICSSector.MATERIALS]: {
    name: 'Materials',
    description: 'Companies that produce and process raw materials including chemicals, metals, construction materials, and packaging.',
    keywords: ['materials', 'chemicals', 'metals', 'mining', 'construction materials'],
  },
  [GICSSector.INDUSTRIALS]: {
    name: 'Industrials',
    description: 'Companies involved in manufacturing, construction, aerospace, defense, machinery, and transportation.',
    keywords: ['industrial', 'manufacturing', 'aerospace', 'defense', 'machinery', 'transportation'],
  },
  [GICSSector.CONSUMER_DISCRETIONARY]: {
    name: 'Consumer Discretionary',
    description: 'Companies that produce non-essential goods and services including retail, automotive, leisure, and hospitality.',
    keywords: ['consumer discretionary', 'retail', 'automotive', 'leisure', 'hospitality', 'entertainment'],
  },
  [GICSSector.CONSUMER_STAPLES]: {
    name: 'Consumer Staples',
    description: 'Companies that produce essential goods including food, beverages, household products, and personal care items.',
    keywords: ['consumer staples', 'food', 'beverages', 'household products', 'personal care', 'grocery'],
  },
  [GICSSector.HEALTH_CARE]: {
    name: 'Health Care',
    description: 'Companies involved in pharmaceuticals, medical devices, biotechnology, healthcare services, and health insurance.',
    keywords: ['healthcare', 'pharmaceuticals', 'medical devices', 'biotech', 'health services'],
  },
  [GICSSector.FINANCIALS]: {
    name: 'Financials',
    description: 'Companies in banking, insurance, asset management, investment services, and financial technology.',
    keywords: ['financials', 'banking', 'insurance', 'asset management', 'investment services', 'fintech'],
  },
  [GICSSector.INFORMATION_TECHNOLOGY]: {
    name: 'Information Technology',
    description: 'Companies involved in software, hardware, semiconductors, IT services, and technology infrastructure.',
    keywords: ['technology', 'software', 'hardware', 'semiconductors', 'IT services', 'tech'],
  },
  [GICSSector.COMMUNICATION_SERVICES]: {
    name: 'Communication Services',
    description: 'Companies in telecommunications, media, entertainment, and interactive media including social media platforms.',
    keywords: ['communication', 'telecommunications', 'media', 'entertainment', 'social media', 'internet'],
  },
  [GICSSector.UTILITIES]: {
    name: 'Utilities',
    description: 'Companies that provide essential services including electric, gas, water, and renewable energy utilities.',
    keywords: ['utilities', 'electric', 'gas', 'water', 'power', 'energy services'],
  },
  [GICSSector.REAL_ESTATE]: {
    name: 'Real Estate',
    description: 'Companies involved in real estate investment trusts (REITs), real estate development, and property management.',
    keywords: ['real estate', 'REIT', 'property', 'real estate investment', 'property management'],
  },
  [GICSSector.UNCLASSIFIED]: {
    name: 'Unclassified',
    description: 'Assets that cannot be classified into standard sectors. This should be rare and indicates missing classification data.',
    keywords: ['unclassified', 'unknown', 'other'],
  },
};

/**
 * Legacy Sector Mapping
 * Maps old sector names to new GICS sectors for backward compatibility
 */
export const LEGACY_SECTOR_MAP: Record<string, GICSSector> = {
  'Technology': GICSSector.INFORMATION_TECHNOLOGY,
  'Finance': GICSSector.FINANCIALS,
  'Financial Services': GICSSector.FINANCIALS,
  'Healthcare': GICSSector.HEALTH_CARE,
  'Health Care': GICSSector.HEALTH_CARE,
  'General': GICSSector.UNCLASSIFIED,
  'Unclassified': GICSSector.UNCLASSIFIED,
};

/**
 * Get all GICS sectors (excluding Unclassified)
 */
export function getAllGICSSectors(): GICSSector[] {
  return Object.values(GICSSector).filter(
    (sector) => sector !== GICSSector.UNCLASSIFIED
  );
}

/**
 * Check if a sector is a valid GICS sector
 */
export function isValidGICSSector(sector: string): boolean {
  return Object.values(GICSSector).includes(sector as GICSSector);
}

/**
 * Get sector info for a given sector
 */
export function getSectorInfo(sector: GICSSector): SectorInfo {
  return GICS_SECTOR_INFO[sector] || GICS_SECTOR_INFO[GICSSector.UNCLASSIFIED];
}

/**
 * Normalize sector name to GICS standard
 * Handles legacy sector names and variations
 */
export function normalizeSector(sector: string | undefined | null): GICSSector {
  if (!sector) {
    return GICSSector.UNCLASSIFIED;
  }

  // Check if it's already a valid GICS sector
  if (isValidGICSSector(sector)) {
    return sector as GICSSector;
  }

  // Check legacy mapping
  const normalized = sector.trim();
  if (LEGACY_SECTOR_MAP[normalized]) {
    return LEGACY_SECTOR_MAP[normalized];
  }

  // Try case-insensitive match
  const upperSector = normalized.toUpperCase();
  for (const [key, value] of Object.entries(LEGACY_SECTOR_MAP)) {
    if (key.toUpperCase() === upperSector) {
      return value;
    }
  }

  // Default to unclassified
  return GICSSector.UNCLASSIFIED;
}

/**
 * Determine asset type from ticker
 * Heuristic-based detection for common patterns
 */
export function detectAssetType(ticker: string): AssetType {
  const upperTicker = ticker.toUpperCase();

  // Crypto patterns
  if (upperTicker.startsWith('BTC') || 
      upperTicker.startsWith('ETH') || 
      upperTicker.includes('USD') ||
      upperTicker.endsWith('USD') ||
      upperTicker.includes('CRYPTO')) {
    return AssetType.CRYPTO;
  }

  // ETF patterns
  if (upperTicker.includes('ETF') ||
      upperTicker.endsWith('ETF') ||
      upperTicker.startsWith('SPY') ||
      upperTicker.startsWith('QQQ') ||
      upperTicker.startsWith('IWM') ||
      upperTicker.startsWith('DIA')) {
    return AssetType.ETF;
  }

  // REIT patterns
  if (upperTicker.includes('REIT') ||
      upperTicker.endsWith('REIT')) {
    return AssetType.REIT;
  }

  // Bond patterns
  if (upperTicker.includes('BOND') ||
      upperTicker.endsWith('BOND') ||
      upperTicker.includes('CORP') ||
      upperTicker.includes('GOVT')) {
    return AssetType.BOND;
  }

  // Default to stock
  return AssetType.STOCK;
}











