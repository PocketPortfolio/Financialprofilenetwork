/**
 * Benchmark Data Service
 * Handles fetching and processing benchmark index data
 */

import type { BenchmarkDataPoint, Benchmark } from './types';

// Benchmark symbols
export const BENCHMARK_SYMBOLS = {
  SP500: '^GSPC',
  NASDAQ: '^IXIC',
  DOW: '^DJI',
  FTSE100: '^FTSE',
} as const;

export const BENCHMARK_NAMES: Record<string, string> = {
  [BENCHMARK_SYMBOLS.SP500]: 'S&P 500',
  [BENCHMARK_SYMBOLS.NASDAQ]: 'NASDAQ',
  [BENCHMARK_SYMBOLS.DOW]: 'Dow Jones',
  [BENCHMARK_SYMBOLS.FTSE100]: 'FTSE 100',
};

/**
 * Get available benchmarks
 */
export function getAvailableBenchmarks(): Array<{ symbol: string; name: string }> {
  return Object.entries(BENCHMARK_NAMES).map(([symbol, name]) => ({
    symbol,
    name,
  }));
}

/**
 * Fetch benchmark data from API
 * Uses the existing /api/quote endpoint for current prices
 * For historical data, we'll need to fetch from a historical API or store in Firestore
 */
export async function getBenchmarkData(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<BenchmarkDataPoint[]> {
  try {
    // For now, we'll fetch from the benchmark API route
    // This will be implemented to fetch historical data
    const response = await fetch(
      `/api/portfolio/benchmarks?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch benchmark data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return [];
  }
}

/**
 * Calculate relative performance (alpha) between portfolio and benchmark
 */
export function calculateRelativePerformance(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) {
    return 0;
  }

  // Calculate average returns
  const portfolioAvg =
    portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
  const benchmarkAvg =
    benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;

  // Alpha = Portfolio Return - Benchmark Return
  return portfolioAvg - benchmarkAvg;
}

/**
 * Normalize benchmark data to start at a specific value
 */
export function normalizeBenchmarkData(
  data: BenchmarkDataPoint[],
  startValue: number
): BenchmarkDataPoint[] {
  if (data.length === 0) return [];

  const firstValue = data[0].value;
  if (firstValue === 0) return data;

  return data.map((point) => ({
    ...point,
    value: (point.value / firstValue) * startValue,
  }));
}

/**
 * Create benchmark object with normalized data
 */
export async function createBenchmark(
  symbol: string,
  startDate: string,
  endDate: string,
  normalizeTo?: number
): Promise<Benchmark | null> {
  const data = await getBenchmarkData(symbol, startDate, endDate);

  if (data.length === 0) {
    return null;
  }

  const normalizedData = normalizeTo
    ? normalizeBenchmarkData(data, normalizeTo)
    : data;

  return {
    symbol,
    name: BENCHMARK_NAMES[symbol] || symbol,
    data: normalizedData,
  };
}











