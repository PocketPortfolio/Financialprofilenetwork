/**
 * Analytics Calculation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSharpeRatio,
  calculateBeta,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateAnnualizedReturn,
  calculatePortfolioAnalytics,
} from '@/app/lib/portfolio/analytics';
import type { PortfolioSnapshot } from '@/app/lib/portfolio/types';

describe('Portfolio Analytics Calculations', () => {
  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio correctly', () => {
      const returns = [0.01, 0.02, -0.01, 0.03, 0.01];
      const sharpe = calculateSharpeRatio(returns, 0.02);
      expect(sharpe).toBeGreaterThan(0);
      expect(typeof sharpe).toBe('number');
    });

    it('should return 0 for empty returns', () => {
      expect(calculateSharpeRatio([], 0.02)).toBe(0);
    });

    it('should return 0 for zero standard deviation', () => {
      const returns = [0.01, 0.01, 0.01, 0.01];
      expect(calculateSharpeRatio(returns, 0.02)).toBe(0);
    });
  });

  describe('calculateBeta', () => {
    it('should calculate beta correctly', () => {
      const portfolioReturns = [0.01, 0.02, -0.01, 0.03];
      const benchmarkReturns = [0.005, 0.015, -0.005, 0.025];
      const beta = calculateBeta(portfolioReturns, benchmarkReturns);
      expect(beta).toBeGreaterThan(0);
      expect(typeof beta).toBe('number');
    });

    it('should return 0 for mismatched arrays', () => {
      expect(calculateBeta([0.01], [0.01, 0.02])).toBe(0);
    });

    it('should return 0 for empty arrays', () => {
      expect(calculateBeta([], [])).toBe(0);
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate volatility correctly', () => {
      const returns = [0.01, 0.02, -0.01, 0.03, 0.01];
      const volatility = calculateVolatility(returns);
      expect(volatility).toBeGreaterThan(0);
      expect(typeof volatility).toBe('number');
    });

    it('should return 0 for empty returns', () => {
      expect(calculateVolatility([])).toBe(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should calculate max drawdown correctly', () => {
      const values = [100, 110, 105, 120, 115, 130];
      const drawdown = calculateMaxDrawdown(values);
      expect(drawdown).toBeGreaterThanOrEqual(0);
      expect(typeof drawdown).toBe('number');
    });

    it('should return 0 for empty values', () => {
      expect(calculateMaxDrawdown([])).toBe(0);
    });

    it('should return 0 for increasing values', () => {
      const values = [100, 110, 120, 130];
      expect(calculateMaxDrawdown(values)).toBe(0);
    });
  });

  describe('calculateAnnualizedReturn', () => {
    it('should calculate annualized return correctly', () => {
      const returns = [0.01, 0.02, -0.01, 0.03];
      const years = 1;
      const annualized = calculateAnnualizedReturn(returns, years);
      expect(typeof annualized).toBe('number');
    });

    it('should return 0 for zero years', () => {
      expect(calculateAnnualizedReturn([0.01], 0)).toBe(0);
    });

    it('should return 0 for empty returns', () => {
      expect(calculateAnnualizedReturn([], 1)).toBe(0);
    });
  });

  describe('calculatePortfolioAnalytics', () => {
    it('should calculate comprehensive analytics', () => {
      const snapshots: PortfolioSnapshot[] = [
        {
          userId: 'test',
          date: '2024-01-01',
          totalValue: 10000,
          totalInvested: 10000,
          positions: [],
          metadata: { timestamp: Date.now(), version: '1.0' },
        },
        {
          userId: 'test',
          date: '2024-01-02',
          totalValue: 10100,
          totalInvested: 10000,
          positions: [],
          metadata: { timestamp: Date.now(), version: '1.0' },
        },
      ];

      const analytics = calculatePortfolioAnalytics(snapshots);
      expect(analytics).toHaveProperty('totalValue');
      expect(analytics).toHaveProperty('dailyChange');
      expect(analytics).toHaveProperty('allTimeReturn');
      expect(analytics.totalValue).toBe(10100);
    });

    it('should return default values for empty snapshots', () => {
      const analytics = calculatePortfolioAnalytics([]);
      expect(analytics.totalValue).toBe(0);
      expect(analytics.dailyChange).toBe(0);
      expect(analytics.allTimeReturn).toBe(0);
    });
  });
});











