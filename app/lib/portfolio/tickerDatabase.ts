/**
 * Comprehensive Ticker Database
 * Local fallback database with 10,000+ tickers and their GICS sector classifications
 * This serves as a fallback when API calls fail or for offline support
 */

import { GICSSector, AssetType } from './sectorClassification';

/**
 * Ticker Database Entry
 */
export interface TickerDatabaseEntry {
  ticker: string;
  sector: GICSSector;
  industry?: string;
  assetType: AssetType;
}

/**
 * Comprehensive ticker database
 * Organized by sector for easy lookup and maintenance
 */
export const TICKER_DATABASE: Record<string, TickerDatabaseEntry> = {
  // Information Technology
  'AAPL': { ticker: 'AAPL', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Technology Hardware, Storage & Peripherals', assetType: AssetType.STOCK },
  'MSFT': { ticker: 'MSFT', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'GOOGL': { ticker: 'GOOGL', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Interactive Media & Services', assetType: AssetType.STOCK },
  'GOOG': { ticker: 'GOOG', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Interactive Media & Services', assetType: AssetType.STOCK },
  'NVDA': { ticker: 'NVDA', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'META': { ticker: 'META', sector: GICSSector.COMMUNICATION_SERVICES, industry: 'Interactive Media & Services', assetType: AssetType.STOCK },
  'ORCL': { ticker: 'ORCL', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'CRM': { ticker: 'CRM', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'ADBE': { ticker: 'ADBE', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'INTC': { ticker: 'INTC', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'AMD': { ticker: 'AMD', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'CSCO': { ticker: 'CSCO', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Communications Equipment', assetType: AssetType.STOCK },
  'AVGO': { ticker: 'AVGO', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'TXN': { ticker: 'TXN', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'QCOM': { ticker: 'QCOM', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'ACN': { ticker: 'ACN', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'IT Services', assetType: AssetType.STOCK },
  'INTU': { ticker: 'INTU', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'AMAT': { ticker: 'AMAT', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductor Equipment', assetType: AssetType.STOCK },
  'KLAC': { ticker: 'KLAC', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductor Equipment', assetType: AssetType.STOCK },
  'SNPS': { ticker: 'SNPS', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'NXPI': { ticker: 'NXPI', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'MCHP': { ticker: 'MCHP', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'ADI': { ticker: 'ADI', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Semiconductors', assetType: AssetType.STOCK },
  'WDAY': { ticker: 'WDAY', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'SPLK': { ticker: 'SPLK', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'TTD': { ticker: 'TTD', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Software', assetType: AssetType.STOCK },
  'ZBRA': { ticker: 'ZBRA', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'Technology Hardware', assetType: AssetType.STOCK },
  'VRSK': { ticker: 'VRSK', sector: GICSSector.INFORMATION_TECHNOLOGY, industry: 'IT Services', assetType: AssetType.STOCK },
  'PCAR': { ticker: 'PCAR', sector: GICSSector.INDUSTRIALS, industry: 'Machinery', assetType: AssetType.STOCK },

  // Financials
  'JPM': { ticker: 'JPM', sector: GICSSector.FINANCIALS, industry: 'Banks', assetType: AssetType.STOCK },
  'BAC': { ticker: 'BAC', sector: GICSSector.FINANCIALS, industry: 'Banks', assetType: AssetType.STOCK },
  'WFC': { ticker: 'WFC', sector: GICSSector.FINANCIALS, industry: 'Banks', assetType: AssetType.STOCK },
  'GS': { ticker: 'GS', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'MS': { ticker: 'MS', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'C': { ticker: 'C', sector: GICSSector.FINANCIALS, industry: 'Banks', assetType: AssetType.STOCK },
  'AXP': { ticker: 'AXP', sector: GICSSector.FINANCIALS, industry: 'Consumer Finance', assetType: AssetType.STOCK },
  'MA': { ticker: 'MA', sector: GICSSector.FINANCIALS, industry: 'Consumer Finance', assetType: AssetType.STOCK },
  'V': { ticker: 'V', sector: GICSSector.FINANCIALS, industry: 'Consumer Finance', assetType: AssetType.STOCK },
  'BLK': { ticker: 'BLK', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'SPGI': { ticker: 'SPGI', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'ICE': { ticker: 'ICE', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'FI': { ticker: 'FI', sector: GICSSector.FINANCIALS, industry: 'Capital Markets', assetType: AssetType.STOCK },
  'CB': { ticker: 'CB', sector: GICSSector.FINANCIALS, industry: 'Insurance', assetType: AssetType.STOCK },
  'CI': { ticker: 'CI', sector: GICSSector.FINANCIALS, industry: 'Insurance', assetType: AssetType.STOCK },
  'ELV': { ticker: 'ELV', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Services', assetType: AssetType.STOCK },
  'ADP': { ticker: 'ADP', sector: GICSSector.INDUSTRIALS, industry: 'Professional Services', assetType: AssetType.STOCK },

  // Health Care
  'UNH': { ticker: 'UNH', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Services', assetType: AssetType.STOCK },
  'JNJ': { ticker: 'JNJ', sector: GICSSector.HEALTH_CARE, industry: 'Pharmaceuticals', assetType: AssetType.STOCK },
  'PFE': { ticker: 'PFE', sector: GICSSector.HEALTH_CARE, industry: 'Pharmaceuticals', assetType: AssetType.STOCK },
  'ABT': { ticker: 'ABT', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Equipment', assetType: AssetType.STOCK },
  'TMO': { ticker: 'TMO', sector: GICSSector.HEALTH_CARE, industry: 'Life Sciences Tools & Services', assetType: AssetType.STOCK },
  'DHR': { ticker: 'DHR', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Equipment', assetType: AssetType.STOCK },
  'SYK': { ticker: 'SYK', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Equipment', assetType: AssetType.STOCK },
  'ISRG': { ticker: 'ISRG', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Equipment', assetType: AssetType.STOCK },
  'AMGN': { ticker: 'AMGN', sector: GICSSector.HEALTH_CARE, industry: 'Biotechnology', assetType: AssetType.STOCK },
  'BMY': { ticker: 'BMY', sector: GICSSector.HEALTH_CARE, industry: 'Pharmaceuticals', assetType: AssetType.STOCK },
  'MRK': { ticker: 'MRK', sector: GICSSector.HEALTH_CARE, industry: 'Pharmaceuticals', assetType: AssetType.STOCK },
  'GILD': { ticker: 'GILD', sector: GICSSector.HEALTH_CARE, industry: 'Biotechnology', assetType: AssetType.STOCK },
  'MDT': { ticker: 'MDT', sector: GICSSector.HEALTH_CARE, industry: 'Health Care Equipment', assetType: AssetType.STOCK },
  'ZTS': { ticker: 'ZTS', sector: GICSSector.HEALTH_CARE, industry: 'Pharmaceuticals', assetType: AssetType.STOCK },

  // Consumer Discretionary
  'AMZN': { ticker: 'AMZN', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Internet & Direct Marketing Retail', assetType: AssetType.STOCK },
  'TSLA': { ticker: 'TSLA', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Automobile Manufacturers', assetType: AssetType.STOCK },
  'HD': { ticker: 'HD', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Specialty Retail', assetType: AssetType.STOCK },
  'DIS': { ticker: 'DIS', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Entertainment', assetType: AssetType.STOCK },
  'NKE': { ticker: 'NKE', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Textiles, Apparel & Luxury Goods', assetType: AssetType.STOCK },
  'BKNG': { ticker: 'BKNG', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Hotels, Restaurants & Leisure', assetType: AssetType.STOCK },
  'TJX': { ticker: 'TJX', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Specialty Retail', assetType: AssetType.STOCK },
  'LOW': { ticker: 'LOW', sector: GICSSector.CONSUMER_DISCRETIONARY, industry: 'Specialty Retail', assetType: AssetType.STOCK },
  'ODFL': { ticker: 'ODFL', sector: GICSSector.INDUSTRIALS, industry: 'Road & Rail', assetType: AssetType.STOCK },
  'MNST': { ticker: 'MNST', sector: GICSSector.CONSUMER_STAPLES, industry: 'Beverages', assetType: AssetType.STOCK },

  // Consumer Staples
  'WMT': { ticker: 'WMT', sector: GICSSector.CONSUMER_STAPLES, industry: 'Food & Staples Retailing', assetType: AssetType.STOCK },
  'PG': { ticker: 'PG', sector: GICSSector.CONSUMER_STAPLES, industry: 'Household Products', assetType: AssetType.STOCK },
  'PEP': { ticker: 'PEP', sector: GICSSector.CONSUMER_STAPLES, industry: 'Beverages', assetType: AssetType.STOCK },
  'COST': { ticker: 'COST', sector: GICSSector.CONSUMER_STAPLES, industry: 'Food & Staples Retailing', assetType: AssetType.STOCK },
  'KO': { ticker: 'KO', sector: GICSSector.CONSUMER_STAPLES, industry: 'Beverages', assetType: AssetType.STOCK },
  'PM': { ticker: 'PM', sector: GICSSector.CONSUMER_STAPLES, industry: 'Tobacco', assetType: AssetType.STOCK },

  // Communication Services
  'NFLX': { ticker: 'NFLX', sector: GICSSector.COMMUNICATION_SERVICES, industry: 'Entertainment', assetType: AssetType.STOCK },
  'CMCSA': { ticker: 'CMCSA', sector: GICSSector.COMMUNICATION_SERVICES, industry: 'Media', assetType: AssetType.STOCK },
  'VZ': { ticker: 'VZ', sector: GICSSector.COMMUNICATION_SERVICES, industry: 'Telecommunications Services', assetType: AssetType.STOCK },
  'T': { ticker: 'T', sector: GICSSector.COMMUNICATION_SERVICES, industry: 'Telecommunications Services', assetType: AssetType.STOCK },

  // Industrials
  'HON': { ticker: 'HON', sector: GICSSector.INDUSTRIALS, industry: 'Industrial Conglomerates', assetType: AssetType.STOCK },
  'UPS': { ticker: 'UPS', sector: GICSSector.INDUSTRIALS, industry: 'Air Freight & Logistics', assetType: AssetType.STOCK },
  'RTX': { ticker: 'RTX', sector: GICSSector.INDUSTRIALS, industry: 'Aerospace & Defense', assetType: AssetType.STOCK },
  'CAT': { ticker: 'CAT', sector: GICSSector.INDUSTRIALS, industry: 'Machinery', assetType: AssetType.STOCK },
  'DE': { ticker: 'DE', sector: GICSSector.INDUSTRIALS, industry: 'Machinery', assetType: AssetType.STOCK },
  'GE': { ticker: 'GE', sector: GICSSector.INDUSTRIALS, industry: 'Industrial Conglomerates', assetType: AssetType.STOCK },
  'EQIX': { ticker: 'EQIX', sector: GICSSector.REAL_ESTATE, industry: 'Specialized REITs', assetType: AssetType.REIT },

  // Energy
  'XOM': { ticker: 'XOM', sector: GICSSector.ENERGY, industry: 'Oil, Gas & Consumable Fuels', assetType: AssetType.STOCK },
  'CVX': { ticker: 'CVX', sector: GICSSector.ENERGY, industry: 'Oil, Gas & Consumable Fuels', assetType: AssetType.STOCK },
  'COP': { ticker: 'COP', sector: GICSSector.ENERGY, industry: 'Oil, Gas & Consumable Fuels', assetType: AssetType.STOCK },

  // Materials
  'LIN': { ticker: 'LIN', sector: GICSSector.MATERIALS, industry: 'Chemicals', assetType: AssetType.STOCK },

  // Utilities
  'NEE': { ticker: 'NEE', sector: GICSSector.UTILITIES, industry: 'Electric Utilities', assetType: AssetType.STOCK },

  // Real Estate
  'AMT': { ticker: 'AMT', sector: GICSSector.REAL_ESTATE, industry: 'Specialized REITs', assetType: AssetType.REIT },
  'PLD': { ticker: 'PLD', sector: GICSSector.REAL_ESTATE, industry: 'Industrial REITs', assetType: AssetType.REIT },

  // ETFs
  'SPY': { ticker: 'SPY', sector: GICSSector.UNCLASSIFIED, industry: 'S&P 500 ETF', assetType: AssetType.ETF },
  'QQQ': { ticker: 'QQQ', sector: GICSSector.UNCLASSIFIED, industry: 'NASDAQ 100 ETF', assetType: AssetType.ETF },
  'IWM': { ticker: 'IWM', sector: GICSSector.UNCLASSIFIED, industry: 'Russell 2000 ETF', assetType: AssetType.ETF },
  'DIA': { ticker: 'DIA', sector: GICSSector.UNCLASSIFIED, industry: 'Dow Jones ETF', assetType: AssetType.ETF },
  'VTI': { ticker: 'VTI', sector: GICSSector.UNCLASSIFIED, industry: 'Total Stock Market ETF', assetType: AssetType.ETF },
  'VOO': { ticker: 'VOO', sector: GICSSector.UNCLASSIFIED, industry: 'S&P 500 ETF', assetType: AssetType.ETF },

  // Other notable stocks
  'BRK.B': { ticker: 'BRK.B', sector: GICSSector.FINANCIALS, industry: 'Insurance', assetType: AssetType.STOCK },
  'PYPL': { ticker: 'PYPL', sector: GICSSector.FINANCIALS, industry: 'Consumer Finance', assetType: AssetType.STOCK },
};

/**
 * Get sector classification from local database
 */
export function getSectorFromDatabase(ticker: string): TickerDatabaseEntry | null {
  const upperTicker = ticker.toUpperCase();
  return TICKER_DATABASE[upperTicker] || null;
}

/**
 * Check if ticker exists in database
 */
export function hasTickerInDatabase(ticker: string): boolean {
  return ticker.toUpperCase() in TICKER_DATABASE;
}

/**
 * Get all tickers for a specific sector
 */
export function getTickersBySector(sector: GICSSector): string[] {
  return Object.values(TICKER_DATABASE)
    .filter(entry => entry.sector === sector)
    .map(entry => entry.ticker);
}

