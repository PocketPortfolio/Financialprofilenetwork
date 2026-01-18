/**
 * Analytics Data Models
 * Defines the shape of enriched portfolio data for advanced analytics
 */

export interface AssetProfile {
  ticker: string;
  name: string;
  sector: string; // e.g., "Technology"
  industry: string; // e.g., "Semiconductors"
  beta: number; // Volatility relative to market (1.0 = market average)
  geo: 'US' | 'UK' | 'EU' | 'EM' | 'OTHER';
}

export interface PortfolioTarget {
  ticker?: string; // Specific stock target (e.g., AAPL: 10%)
  sector?: string; // Sector target (e.g., Tech: 30%)
  percentage: number; // 0-100
}

export interface RebalanceSuggestion {
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  amount: number; // Value in base currency
  reason: string; // "Drifted 5% above target"
}

