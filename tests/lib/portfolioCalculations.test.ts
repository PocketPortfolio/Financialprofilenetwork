import { describe, it, expect } from 'vitest';
import {
  validateTrade,
  validateTrades,
  calculatePositions,
  calculatePortfolioTotals,
  generatePortfolioReport
} from '../../app/lib/utils/portfolioCalculations';

describe('Portfolio Calculations - Data Integrity', () => {
  describe('Trade Validation', () => {
    it('should validate a correct trade', () => {
      const trade = {
        id: '1',
        ticker: 'AAPL',
        qty: 10,
        price: 150.50,
        date: '2024-01-01',
        type: 'BUY' as const,
        currency: 'USD',
        mock: false
      };

      const result = validateTrade(trade);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid quantity', () => {
      const trade = {
        id: '1',
        ticker: 'AAPL',
        qty: -10,
        price: 150.50,
        date: '2024-01-01',
        type: 'BUY' as const,
        currency: 'USD',
        mock: false
      };

      const result = validateTrade(trade);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid price', () => {
      const trade = {
        id: '1',
        ticker: 'AAPL',
        qty: 10,
        price: 0,
        date: '2024-01-01',
        type: 'BUY' as const,
        currency: 'USD',
        mock: false
      };

      const result = validateTrade(trade);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about missing currency', () => {
      const trade = {
        id: '1',
        ticker: 'AAPL',
        qty: 10,
        price: 150.50,
        date: '2024-01-01',
        type: 'BUY' as const,
        currency: '',
        mock: false
      };

      const result = validateTrade(trade);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Position Calculations', () => {
    it('should correctly calculate weighted average cost for multiple BUY trades', () => {
      const trades = [
        {
          id: '1',
          ticker: 'AAPL',
          qty: 10,
          price: 100,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        {
          id: '2',
          ticker: 'AAPL',
          qty: 5,
          price: 110,
          date: '2024-01-02',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        }
      ];

      const { positions } = calculatePositions(trades);
      
      // Expected: (10*100 + 5*110) / 15 = 1550 / 15 = 103.33
      expect(positions['AAPL'].shares).toBe(15);
      expect(positions['AAPL'].avgCost).toBeCloseTo(103.33, 2);
      expect(positions['AAPL'].totalInvested).toBeCloseTo(1550, 2);
    });

    it('should correctly handle SELL trades', () => {
      const trades = [
        {
          id: '1',
          ticker: 'AAPL',
          qty: 10,
          price: 100,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        {
          id: '2',
          ticker: 'AAPL',
          qty: 3,
          price: 120,
          date: '2024-01-02',
          type: 'SELL' as const,
          currency: 'USD',
          mock: false
        }
      ];

      const { positions } = calculatePositions(trades);
      
      // Should have 7 shares remaining at $100 avg cost
      expect(positions['AAPL'].shares).toBe(7);
      expect(positions['AAPL'].avgCost).toBe(100); // Avg cost stays the same
      expect(positions['AAPL'].totalInvested).toBeCloseTo(700, 2); // 7 * 100
    });

    it('should detect overselling (selling more than owned)', () => {
      const trades = [
        {
          id: '1',
          ticker: 'AAPL',
          qty: 10,
          price: 100,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        {
          id: '2',
          ticker: 'AAPL',
          qty: 15,
          price: 120,
          date: '2024-01-02',
          type: 'SELL' as const,
          currency: 'USD',
          mock: false
        }
      ];

      const { validation } = calculatePositions(trades);
      
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('AAPL');
    });

    it('should consolidate trades from multiple brokers correctly', () => {
      const trades = [
        // Trading212: AAPL
        {
          id: 't212-1',
          ticker: 'AAPL',
          qty: 8,
          price: 145,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        // Freetrade: AAPL
        {
          id: 'ft-1',
          ticker: 'AAPL',
          qty: 5,
          price: 150,
          date: '2024-01-02',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        // Fidelity: AAPL
        {
          id: 'fid-1',
          ticker: 'AAPL',
          qty: 2,
          price: 155,
          date: '2024-01-03',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        }
      ];

      const { positions } = calculatePositions(trades);
      
      // Expected: (8*145 + 5*150 + 2*155) / 15 = 2220 / 15 = 148
      expect(positions['AAPL'].shares).toBe(15);
      expect(positions['AAPL'].avgCost).toBeCloseTo(148, 2);
      expect(positions['AAPL'].totalInvested).toBeCloseTo(2220, 2);
      expect(positions['AAPL'].totalTrades).toBe(3);
    });

    it('should handle multiple tickers correctly', () => {
      const trades = [
        {
          id: '1',
          ticker: 'AAPL',
          qty: 10,
          price: 150,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        {
          id: '2',
          ticker: 'TSLA',
          qty: 5,
          price: 200,
          date: '2024-01-02',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        },
        {
          id: '3',
          ticker: 'VOD.L',
          qty: 100,
          price: 0.85,
          date: '2024-01-03',
          type: 'BUY' as const,
          currency: 'GBP',
          mock: false
        }
      ];

      const { positions } = calculatePositions(trades);
      
      expect(Object.keys(positions)).toHaveLength(3);
      expect(positions['AAPL'].totalInvested).toBeCloseTo(1500, 2);
      expect(positions['TSLA'].totalInvested).toBeCloseTo(1000, 2);
      expect(positions['VOD.L'].totalInvested).toBeCloseTo(85, 2);
    });
  });

  describe('Portfolio Totals with Currency Conversion', () => {
    it('should correctly convert GBP to USD', () => {
      const positions = {
        'VOD.L': {
          ticker: 'VOD.L',
          shares: 100,
          avgCost: 0.85,
          currentPrice: 0.90,
          currentValue: 90,
          unrealizedPL: 5,
          unrealizedPLPercent: 5.88,
          totalTrades: 1,
          lastTradeDate: '2024-01-01',
          isMock: false,
          currency: 'GBP',
          totalInvested: 85
        }
      };

      const totals = calculatePortfolioTotals(positions, { GBP: 1.27 });
      
      // 85 GBP * 1.27 = 107.95 USD
      expect(totals.totalInvested).toBeCloseTo(107.95, 2);
    });

    it('should handle mixed currencies', () => {
      const positions = {
        'AAPL': {
          ticker: 'AAPL',
          shares: 10,
          avgCost: 150,
          currentPrice: 160,
          currentValue: 1600,
          unrealizedPL: 100,
          unrealizedPLPercent: 6.67,
          totalTrades: 1,
          lastTradeDate: '2024-01-01',
          isMock: false,
          currency: 'USD',
          totalInvested: 1500
        },
        'VOD.L': {
          ticker: 'VOD.L',
          shares: 100,
          avgCost: 0.85,
          currentPrice: 0.90,
          currentValue: 90,
          unrealizedPL: 5,
          unrealizedPLPercent: 5.88,
          totalTrades: 1,
          lastTradeDate: '2024-01-01',
          isMock: false,
          currency: 'GBP',
          totalInvested: 85
        }
      };

      const totals = calculatePortfolioTotals(positions, { GBP: 1.27, USD: 1.0 });
      
      // 1500 USD + (85 GBP * 1.27) = 1500 + 107.95 = 1607.95 USD
      expect(totals.totalInvested).toBeCloseTo(1607.95, 2);
      expect(totals.totalPositions).toBe(2);
    });
  });

  describe('Report Generation', () => {
    it('should generate a complete report', () => {
      const trades = [
        {
          id: '1',
          ticker: 'AAPL',
          qty: 10,
          price: 150,
          date: '2024-01-01',
          type: 'BUY' as const,
          currency: 'USD',
          mock: false
        }
      ];

      const { positions } = calculatePositions(trades);
      const report = generatePortfolioReport(trades, positions);
      
      expect(report).toContain('PORTFOLIO DATA INTEGRITY REPORT');
      expect(report).toContain('Total Trades: 1');
      expect(report).toContain('AAPL');
    });
  });
});






