/**
 * Portfolio Analytics Calculations
 * Financial metrics for portfolio analysis
 */

import type { PortfolioAnalytics } from './types';
import type { PortfolioSnapshot } from './types';
import { calculateHistoricalReturns } from './snapshot';

/**
 * Calculate daily returns from portfolio values
 */
function calculateDailyReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    const currentValue = values[i];
    if (prevValue > 0) {
      returns.push((currentValue - prevValue) / prevValue);
    } else {
      returns.push(0);
    }
  }
  return returns;
}

/**
 * Calculate Sharpe Ratio
 * Measures risk-adjusted return
 * Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Standard Deviation
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.02 // Default 2% annual risk-free rate
): number {
  if (returns.length === 0) return 0;

  // Convert risk-free rate to daily (assuming 252 trading days)
  const dailyRiskFreeRate = riskFreeRate / 252;

  // Calculate average return
  const avgReturn =
    returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate standard deviation
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualize (multiply by sqrt of trading days)
  const annualizedReturn = avgReturn * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

/**
 * Calculate Beta
 * Measures portfolio's sensitivity to market movements
 * Beta = Covariance(Portfolio, Benchmark) / Variance(Benchmark)
 */
export function calculateBeta(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  if (
    portfolioReturns.length !== benchmarkReturns.length ||
    portfolioReturns.length === 0
  ) {
    return 0;
  }

  // Calculate means
  const portfolioMean =
    portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
  const benchmarkMean =
    benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;

  // Calculate covariance
  let covariance = 0;
  for (let i = 0; i < portfolioReturns.length; i++) {
    covariance +=
      (portfolioReturns[i] - portfolioMean) *
      (benchmarkReturns[i] - benchmarkMean);
  }
  covariance /= portfolioReturns.length;

  // Calculate benchmark variance
  const benchmarkVariance =
    benchmarkReturns.reduce(
      (sum, r) => sum + Math.pow(r - benchmarkMean, 2),
      0
    ) / benchmarkReturns.length;

  if (benchmarkVariance === 0) return 0;

  return covariance / benchmarkVariance;
}

/**
 * Calculate Volatility (Standard Deviation)
 * Measures price variability
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
    returns.length;
  const stdDev = Math.sqrt(variance);

  // Annualize (multiply by sqrt of trading days)
  return stdDev * Math.sqrt(252) * 100; // Return as percentage
}

/**
 * Calculate Maximum Drawdown
 * Largest peak-to-trough decline
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    }
    const drawdown = (peak - values[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown * 100; // Return as percentage
}

/**
 * Calculate Annualized Return
 */
export function calculateAnnualizedReturn(
  returns: number[],
  years: number
): number {
  if (returns.length === 0 || years === 0) return 0;

  // Calculate total return
  const totalReturn = returns.reduce((product, r) => product * (1 + r), 1) - 1;

  // Annualize
  return Math.pow(1 + totalReturn, 1 / years) - 1;
}

/**
 * Calculate comprehensive portfolio analytics
 */
export function calculatePortfolioAnalytics(
  snapshots: PortfolioSnapshot[],
  benchmarkReturns?: number[]
): PortfolioAnalytics {
  if (snapshots.length === 0) {
    return {
      totalValue: 0,
      dailyChange: 0,
      dailyChangePercent: 0,
      allTimeReturn: 0,
      allTimeReturnPercent: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      beta: 0,
      maxDrawdown: 0,
    };
  }

  const values = snapshots.map((s) => s.totalValue);
  const returns = calculateDailyReturns(values);
  const historicalReturns = calculateHistoricalReturns(snapshots);

  // Current metrics
  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : latest;
  const dailyChange = latest.totalValue - previous.totalValue;
  const dailyChangePercent =
    previous.totalValue > 0 ? (dailyChange / previous.totalValue) * 100 : 0;

  // All-time return
  const firstSnapshot = snapshots[0];
  const allTimeReturn = latest.totalValue - firstSnapshot.totalInvested;
  const allTimeReturnPercent =
    firstSnapshot.totalInvested > 0
      ? (allTimeReturn / firstSnapshot.totalInvested) * 100
      : 0;

  // Time period in years
  const firstDate = new Date(firstSnapshot.date);
  const lastDate = new Date(latest.date);
  const years =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Calculate metrics
  const annualizedReturn = calculateAnnualizedReturn(returns, years);
  const volatility = calculateVolatility(returns);
  const sharpeRatio = calculateSharpeRatio(returns);
  const maxDrawdown = calculateMaxDrawdown(values);

  // Beta calculation (if benchmark provided)
  let beta = 0;
  if (benchmarkReturns && benchmarkReturns.length === returns.length) {
    beta = calculateBeta(returns, benchmarkReturns);
  }

  return {
    totalValue: latest.totalValue,
    dailyChange,
    dailyChangePercent,
    allTimeReturn,
    allTimeReturnPercent,
    annualizedReturn: annualizedReturn * 100, // Convert to percentage
    volatility,
    sharpeRatio,
    beta,
    maxDrawdown,
  };
}











