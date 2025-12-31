/**
 * Portfolio Store
 * Centralized state management for portfolio dashboard using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position } from '../utils/portfolioCalculations';
import type {
  ChartViewType,
  TimeRange,
  PortfolioSnapshot,
  Benchmark,
  PortfolioAnalytics,
  DrillDownPath,
  SectorFilter,
} from '../portfolio/types';

interface PortfolioState {
  // Portfolio data
  positions: Position[];
  historicalData: PortfolioSnapshot[];
  
  // Chart preferences
  chartView: ChartViewType;
  timeRange: TimeRange;
  
  // Filters
  selectedSectors: string[];
  sectorFilter: SectorFilter;
  
  // Benchmarks
  selectedBenchmark: string;
  benchmarks: Benchmark[];
  
  // Drill-down navigation
  drillDownPath: DrillDownPath;
  
  // Analytics (cached)
  analytics: PortfolioAnalytics | null;
  
  // Actions
  setPositions: (positions: Position[]) => void;
  setHistoricalData: (data: PortfolioSnapshot[]) => void;
  setChartView: (view: ChartViewType) => void;
  setTimeRange: (range: TimeRange) => void;
  setSelectedSectors: (sectors: string[]) => void;
  setSectorFilter: (filter: SectorFilter) => void;
  setSelectedBenchmark: (benchmark: string) => void;
  setBenchmarks: (benchmarks: Benchmark[]) => void;
  setDrillDownPath: (path: DrillDownPath) => void;
  pushDrillDown: (segment: string) => void;
  popDrillDown: () => void;
  resetDrillDown: () => void;
  setAnalytics: (analytics: PortfolioAnalytics) => void;
  clearAnalytics: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      // Initial state
      positions: [],
      historicalData: [],
      chartView: 'pie',
      timeRange: '1M',
      selectedSectors: [],
      sectorFilter: {
        sectors: [],
        industries: [],
        customTags: [],
      },
      selectedBenchmark: '',
      benchmarks: [],
      drillDownPath: [],
      analytics: null,

      // Actions
      setPositions: (positions) => set({ positions }),
      setHistoricalData: (data) => set({ historicalData: data }),
      setChartView: (view) => set({ chartView: view }),
      setTimeRange: (range) => set({ timeRange: range }),
      setSelectedSectors: (sectors) => set({ selectedSectors: sectors }),
      setSectorFilter: (filter) => set({ sectorFilter: filter }),
      setSelectedBenchmark: (benchmark) => set({ selectedBenchmark: benchmark }),
      setBenchmarks: (benchmarks) => set({ benchmarks }),
      setDrillDownPath: (path) => set({ drillDownPath: path }),
      pushDrillDown: (segment) =>
        set((state) => ({
          drillDownPath: [...state.drillDownPath, segment],
        })),
      popDrillDown: () =>
        set((state) => ({
          drillDownPath: state.drillDownPath.slice(0, -1),
        })),
      resetDrillDown: () => set({ drillDownPath: [] }),
      setAnalytics: (analytics) => set({ analytics }),
      clearAnalytics: () => set({ analytics: null }),
    }),
    {
      name: 'portfolio-store',
      // Only persist user preferences, not sensitive data
      partialize: (state) => ({
        chartView: state.chartView,
        timeRange: state.timeRange,
        selectedSectors: state.selectedSectors,
        sectorFilter: state.sectorFilter,
        selectedBenchmark: state.selectedBenchmark,
      }),
    }
  )
);











