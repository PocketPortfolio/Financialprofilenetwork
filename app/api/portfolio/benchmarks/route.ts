/**
 * Benchmark Data API
 * GET /api/portfolio/benchmarks?symbol={symbol}&startDate={date}&endDate={date}
 */

import { NextRequest, NextResponse } from 'next/server';
import { BENCHMARK_SYMBOLS, BENCHMARK_NAMES } from '@/app/lib/portfolio/benchmarks';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Fetch historical benchmark data
 * Note: This is a simplified implementation. In production, you would:
 * 1. Store historical data in Firestore or a time-series database
 * 2. Use a financial data API (Alpha Vantage, Yahoo Finance, etc.)
 * 3. Cache data to reduce API calls
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!symbol) {
      return NextResponse.json(
        { error: 'symbol is required' },
        { status: 400 }
      );
    }

    // Validate symbol is a known benchmark
    const validSymbols = Object.values(BENCHMARK_SYMBOLS);
    if (!validSymbols.includes(symbol as any)) {
      return NextResponse.json(
        { error: `Invalid benchmark symbol. Must be one of: ${validSymbols.join(', ')}` },
        { status: 400 }
      );
    }

    // For now, return mock data structure
    // In production, fetch from a historical data source
    // This could be:
    // 1. Firestore collection with daily benchmark values
    // 2. External API (Yahoo Finance, Alpha Vantage, etc.)
    // 3. Pre-computed CSV files

    // Mock implementation - generate sample data points
    // Replace this with actual data fetching logic
    const mockData = generateMockBenchmarkData(symbol, startDate || '', endDate || '');

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock benchmark data for development
 * Replace with actual data fetching in production
 */
function generateMockBenchmarkData(
  symbol: string,
  startDate: string,
  endDate: string
): Array<{ date: string; value: number }> {
  const data: Array<{ date: string; value: number }> = [];
  const start = startDate ? new Date(startDate) : new Date();
  start.setMonth(start.getMonth() - 1); // Default to 1 month back
  const end = endDate ? new Date(endDate) : new Date();

  // Base value varies by benchmark
  const baseValues: Record<string, number> = {
    [BENCHMARK_SYMBOLS.SP500]: 4500,
    [BENCHMARK_SYMBOLS.NASDAQ]: 14000,
    [BENCHMARK_SYMBOLS.DOW]: 35000,
    [BENCHMARK_SYMBOLS.FTSE100]: 7500,
  };

  const baseValue = baseValues[symbol] || 1000;
  let currentValue = baseValue;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    // Simulate daily price movement (±2%)
    const change = (Math.random() - 0.5) * 0.04; // -2% to +2%
    currentValue = currentValue * (1 + change);

    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.round(currentValue * 100) / 100,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}











