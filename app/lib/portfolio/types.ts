/**
 * Portfolio Types
 * Type definitions for portfolio dashboard features
 */

import { Position } from '../utils/portfolioCalculations';

/**
 * Portfolio snapshot for historical tracking
 */
export interface PortfolioSnapshot {
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)
  totalValue: number;
  totalInvested: number;
  positions: {
    ticker: string;
    shares: number;
    value: number;
    allocation: number;
  }[];
  metadata: {
    timestamp: number;
    version: string;
  };
}

/**
 * Chart view types
 */
export type ChartViewType = 'pie' | 'donut' | 'bar' | 'treemap' | 'heatmap';

/**
 * Time range options
 */
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'YTD' | 'ALL';

/**
 * Benchmark data point
 */
export interface BenchmarkDataPoint {
  date: string;
  value: number;
}

/**
 * Benchmark configuration
 */
export interface Benchmark {
  symbol: string;
  name: string;
  data: BenchmarkDataPoint[];
}

/**
 * Analytics metrics
 */
export interface PortfolioAnalytics {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  allTimeReturn: number;
  allTimeReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
  maxDrawdown: number;
  winRate?: number;
}

/**
 * Drill-down path for navigation
 */
export type DrillDownPath = string[];

/**
 * Sector filter configuration
 */
export interface SectorFilter {
  sectors: string[];
  industries: string[];
  customTags: string[];
}











