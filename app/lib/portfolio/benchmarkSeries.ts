/**
 * Align benchmark price series to portfolio snapshot dates for charts and alpha.
 */

import type { BenchmarkDataPoint, PortfolioSnapshot } from './types';

export type PricePoint = { date: string; close: number };

/**
 * Map benchmark closes to each snapshot date (nearest prior close).
 */
export function alignBenchmarkSeriesToSnapshots(
  snapshots: PortfolioSnapshot[],
  benchmarkSeries: PricePoint[]
): BenchmarkDataPoint[] {
  if (snapshots.length === 0 || benchmarkSeries.length === 0) return [];

  const closeByDate = new Map<string, number>(
    benchmarkSeries.map((p) => [p.date, p.close])
  );

  const resolveClose = (date: string): number => {
    const direct = closeByDate.get(date);
    if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
    for (let i = benchmarkSeries.length - 1; i >= 0; i--) {
      if (benchmarkSeries[i].date <= date) return benchmarkSeries[i].close;
    }
    return NaN;
  };

  return snapshots
    .map((s) => ({ date: s.date, value: resolveClose(s.date) }))
    .filter((p) => Number.isFinite(p.value));
}

/**
 * Period alpha in percentage points: portfolio total return minus benchmark total return.
 */
export function calculatePeriodAlphaPercent(
  snapshots: PortfolioSnapshot[],
  benchmarkData: BenchmarkDataPoint[]
): number | null {
  if (snapshots.length < 3 || benchmarkData.length < 3) return null;

  const p0 = snapshots[0].totalValue;
  const p1 = snapshots[snapshots.length - 1].totalValue;
  const b0 = benchmarkData[0].value;
  const b1 = benchmarkData[benchmarkData.length - 1].value;

  if (p0 <= 0 || b0 <= 0) return null;

  const portfolioReturn = ((p1 - p0) / p0) * 100;
  const benchmarkReturn = ((b1 - b0) / b0) * 100;
  return portfolioReturn - benchmarkReturn;
}

/**
 * Daily returns from snapshot total values.
 */
export function returnsFromSnapshotValues(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev > 0) returns.push((curr - prev) / prev);
    else returns.push(0);
  }
  return returns;
}
