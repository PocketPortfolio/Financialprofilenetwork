/**
 * Benchmark Function Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getAvailableBenchmarks,
  calculateRelativePerformance,
  normalizeBenchmarkData,
} from '@/app/lib/portfolio/benchmarks';
import type { BenchmarkDataPoint } from '@/app/lib/portfolio/types';

describe('Benchmark Functions', () => {
  describe('getAvailableBenchmarks', () => {
    it('should return list of available benchmarks', () => {
      const benchmarks = getAvailableBenchmarks();
      expect(Array.isArray(benchmarks)).toBe(true);
      expect(benchmarks.length).toBeGreaterThan(0);
      expect(benchmarks[0]).toHaveProperty('symbol');
      expect(benchmarks[0]).toHaveProperty('name');
    });
  });

  describe('calculateRelativePerformance', () => {
    it('should calculate alpha correctly', () => {
      const portfolioReturns = [0.01, 0.02, 0.03];
      const benchmarkReturns = [0.005, 0.015, 0.025];
      const alpha = calculateRelativePerformance(portfolioReturns, benchmarkReturns);
      expect(typeof alpha).toBe('number');
      expect(alpha).toBeGreaterThan(0); // Portfolio outperformed
    });

    it('should return 0 for mismatched arrays', () => {
      expect(calculateRelativePerformance([0.01], [0.01, 0.02])).toBe(0);
    });

    it('should return 0 for empty arrays', () => {
      expect(calculateRelativePerformance([], [])).toBe(0);
    });
  });

  describe('normalizeBenchmarkData', () => {
    it('should normalize benchmark data to start value', () => {
      const data: BenchmarkDataPoint[] = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 110 },
        { date: '2024-01-03', value: 105 },
      ];

      const normalized = normalizeBenchmarkData(data, 1000);
      expect(normalized[0].value).toBe(1000);
      expect(normalized[1].value).toBe(1100);
      expect(normalized[2].value).toBe(1050);
    });

    it('should return empty array for empty input', () => {
      expect(normalizeBenchmarkData([], 1000)).toEqual([]);
    });

    it('should handle zero start value', () => {
      const data: BenchmarkDataPoint[] = [
        { date: '2024-01-01', value: 0 },
        { date: '2024-01-02', value: 100 },
      ];

      const normalized = normalizeBenchmarkData(data, 1000);
      expect(normalized[0].value).toBe(0);
    });
  });
});











