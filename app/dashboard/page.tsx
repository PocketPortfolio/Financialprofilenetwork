'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import SimplePieChart from '../components/SimplePieChart';
import PortfolioChart from '../components/PortfolioChart';
import PortfolioAllocationChart from '../components/portfolio/PortfolioAllocationChart';
import DrillDownChart from '../components/portfolio/DrillDownChart';
import PortfolioPerformanceChart from '../components/portfolio/PortfolioPerformanceChart';
import BenchmarkOverlay from '../components/portfolio/BenchmarkOverlay';
import AnalyticsPanel from '../components/portfolio/AnalyticsPanel';
import AllocationRecommendations from '../components/portfolio/AllocationRecommendations';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import SectorFilter from '../components/portfolio/SectorFilter';
import ReturnHeatMap from '../components/portfolio/ReturnHeatMap';
import SharePortfolio from '../components/portfolio/SharePortfolio';
import { usePortfolioStore } from '../lib/store/portfolioStore';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import { calculatePortfolioAnalytics } from '../lib/portfolio/analytics';
import type { Benchmark, BenchmarkDataPoint, PortfolioSnapshot } from '@/app/lib/portfolio/types';
import { BENCHMARK_NAMES, BENCHMARK_SYMBOLS } from '@/app/lib/portfolio/benchmarks';
import {
  alignBenchmarkSeriesToSnapshots,
  calculatePeriodAlphaPercent,
} from '@/app/lib/portfolio/benchmarkSeries';
import { useClientBriefing } from '../hooks/useClientBriefing';
import { getSectorSync } from '../lib/portfolio/sectorService';
import { isPaidTier } from '@/app/lib/tier';
import { saveDailySnapshot } from '../lib/portfolio/snapshot';
import { usePortfolioNews } from '../hooks/useDataFetching';
import { GICSSector, GICS_SECTOR_INFO, normalizeSector } from '../lib/portfolio/sectorClassification';
import Logo from '../components/Logo';
import CompanyLogo from '../components/CompanyLogo';
import TickerSearch from '../components/TickerSearch';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CSVImporter from '../components/CSVImporter';
import AccountManagement from '../components/AccountManagement';
import ReferralProgram from '../components/viral/ReferralProgram';
import SyncUpgradeCTA from '../components/SyncUpgradeCTA';
import { PortfolioNotesPanel } from '../components/portfolio/PortfolioNotesPanel';
import PricePipelineHealth from '../components/PricePipelineHealth';
import CloudStatusIcon from '../components/CloudStatusIcon';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import SEOHead from '../components/SEOHead';
import StructuredData, { webAppData } from '../components/StructuredData';
import { useQuotes, useNews, useMarketData } from '../hooks/useDataFetching';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import { usePortfolioNotes } from '../hooks/usePortfolioNotes';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import AlertModal from '../components/modals/AlertModal';
import FeatureAnnouncementModal from '../components/modals/FeatureAnnouncementModal';
// import { usePortfolios } from '../hooks/usePortfolios';
// import PortfolioSelector from '../components/PortfolioSelector';
import { getDeviceInfo } from '../lib/utils/device';
import { initializeMobileAnalytics } from '../lib/analytics/device';
import { trackEvent, trackPaywallCtaClick, trackPaywallImpression } from '../lib/analytics/events';
import OnboardingTour from '../components/OnboardingTour';
import { MorningBrief } from '../components/dashboard/MorningBrief';
import { RiskMatrix } from '../components/dashboard/RiskMatrix';
import { useWeeklySnapshotToast } from '../hooks/useWeeklySnapshotToast';
import { WeeklySnapshotToast } from '../components/WeeklySnapshotToast';
import { AssetTerminal } from '../components/dashboard/AssetTerminal';
import { TerminalSummary } from '../components/dashboard/TerminalSummary';
import { DataInputDeck } from '../components/dashboard/DataInputDeck';
import { 
  calculatePositions, 
  calculatePortfolioTotals, 
  generatePortfolioReport,
  validateTrades 
} from '../lib/utils/portfolioCalculations';
import { Trade } from '../services/tradeService';
import { buildPortfolioContext } from '../lib/ai/contextBuilder';
import { usePocketAnalyst } from '../components/ai/PocketAnalystProvider';

// Extend Window interface for portfolio summary logging
declare global {
  interface Window {
    portfolioSummaryLogged?: boolean;
    validationErrorsLogged?: boolean;
    validationSuccessLogged?: boolean;
  }
}

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  totalTrades: number;
  lastTradeDate: string;
  isMock: boolean;
  currency: string;
  totalInvested: number;
}

const DASHBOARD_DEMO_SEED_DATE = '2025-01-15';

/** Deterministic mock rows for cold-start / “Play with demo” (importTrades shape). */
function buildDashboardDemoSeedTrades(): Omit<
  Trade,
  'id' | 'uid' | 'createdAt' | 'updatedAt'
>[] {
  return [
    { ticker: 'AAPL', qty: 10, price: 175, date: DASHBOARD_DEMO_SEED_DATE, type: 'BUY', currency: 'USD', mock: true },
    { ticker: 'MSFT', qty: 6, price: 380, date: DASHBOARD_DEMO_SEED_DATE, type: 'BUY', currency: 'USD', mock: true },
    { ticker: 'VOO', qty: 4, price: 495, date: DASHBOARD_DEMO_SEED_DATE, type: 'BUY', currency: 'USD', mock: true },
  ];
}

export default function Dashboard() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  // const { selectedPortfolio, selectedPortfolioId } = usePortfolios();
  const { trades, addTrade, deleteTrade, importTrades, migrateTrades, deleteAllTrades, totalInvested: useTradesTotalInvested, totalTrades: useTradesTotalTrades, totalPositions: useTradesTotalPositions, refreshTrades } = useTrades();
  const portfolioNotes = usePortfolioNotes();
  const { syncState, syncToDrive, checkForUpdates, recentlySyncedFromDrive, markDriveSyncComplete, markCsvImportStart, clearCsvImportFlag, markDeletionStart } = useGoogleDrive();
  const { tier, isLoading: tierLoading } = usePremiumTheme();
  const { setPortfolioContext, setTier } = usePocketAnalyst();

  // Map tier to data-tier attribute for CSS targeting
  const getTierForDataAttribute = (tier: string | null): 'free' | 'founder' | 'corporate' => {
    if (tier === 'foundersClub') return 'founder';
    if (tier === 'corporateSponsor') return 'corporate';
    return 'free';
  };
  
  // Use ref to track latest trades for sync operations (avoids stale closure)
  const tradesRef = React.useRef(trades);
  // Track last synced trades content to prevent auto-sync loop
  const lastSyncedTradesContentRef = React.useRef<string>('');
  // Track if trades were updated from a remote source (Drive) to prevent auto-sync loop
  const isRemoteUpdateRef = React.useRef(false);
  React.useEffect(() => {
    
    tradesRef.current = trades;
  }, [trades]);
  
  // State for adding new trades
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    type: 'buy' as 'buy' | 'sell',
    fees: ''
  });
  const [isMockTrade, setIsMockTrade] = useState(false);
  const [showDemoTerminalBanner, setShowDemoTerminalBanner] = useState(false);
  const autoDemoColdStartRef = React.useRef(false);

  // One-shot cold-start demo: after hydration, if still empty and user has not dismissed demo before.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (autoDemoColdStartRef.current) return;
    if (sessionStorage.getItem('pp_dashboard_demo_dismissed')) return;
    if (sessionStorage.getItem('pp_dashboard_demo_auto_v1')) return;

    const timer = window.setTimeout(async () => {
      if (autoDemoColdStartRef.current) return;
      if (sessionStorage.getItem('pp_dashboard_demo_dismissed')) return;
      if (sessionStorage.getItem('pp_dashboard_demo_auto_v1')) return;
      if (tradesRef.current.length > 0) return;

      autoDemoColdStartRef.current = true;
      try {
        await importTrades(buildDashboardDemoSeedTrades());
        sessionStorage.setItem('pp_dashboard_demo_auto_v1', '1');
        setShowDemoTerminalBanner(true);
        trackEvent('dashboard_demo_shown', { source: 'auto_cold_start' });
      } catch {
        autoDemoColdStartRef.current = false;
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [importTrades]);

  const dismissDemoPortfolio = React.useCallback(async () => {
    const mockIds = trades.filter((t) => t.mock).map((t) => t.id);
    for (const id of mockIds) {
      try {
        await deleteTrade(id);
      } catch {
        /* continue */
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pp_dashboard_demo_dismissed', '1');
    }
    setShowDemoTerminalBanner(false);
    trackEvent('dashboard_demo_dismissed', { source: 'banner' });
  }, [trades, deleteTrade]);

  // Debug authentication state (reduced logging)
  // console.log('🔐 Auth state:', { isAuthenticated, user: user?.email, loading: false });
  
  // Calculate portfolio metrics (excluding mock trades) - MEMOIZED to prevent recalculation
  const realTrades = useMemo(() => trades.filter(trade => !trade.mock), [trades]);
  
  // For display: Show all trades when only mock trades exist (demo mode), otherwise show only real trades
  // This allows users to test with demo data, but hides demo data when real CSV is imported
  const displayTrades = useMemo(() => {
    const hasRealTrades = realTrades.length > 0;
    // If there are real trades, only show real trades. Otherwise, show all trades (including mock for demo)
    return hasRealTrades ? realTrades : trades;
  }, [trades, realTrades]);
  
  // Clean and filter valid tickers (memoized with stable key to prevent infinite loops)
  // Use displayTrades so demo data tickers are included when no real trades exist
  const tradesKey = useMemo(() => {
    return displayTrades.map(t => t.ticker).sort().join(',');
  }, [displayTrades]);
  
  const userTickers = useMemo(() => {
    const rawTickers = displayTrades.map(trade => trade.ticker);
    const invalidPatterns = ['ADR', 'INC.', 'CORPORATION', 'COMPANY', 'CO.', 'LTD', 'LLC', 'INC', 'CORP'];
    
    // Normalize tickers: extract base currency from trading pairs (e.g., "BTC/USDT" -> "BTC")
    // Also add .L suffix for UK stocks for London Stock Exchange
    const normalizeTicker = (ticker: string): string => {
      const trimmed = ticker.trim().toUpperCase();
      let baseTicker = trimmed;
      // Handle exchange suffixes (e.g., "TSLA:US" -> "TSLA")
      if (/^[A-Z0-9]+:[A-Z0-9]+$/i.test(trimmed)) {
        baseTicker = trimmed.split(':')[0];
      } else if (/^[A-Z0-9]+\/[A-Z0-9]+$/i.test(trimmed)) {
        // Handle trading pairs like "BTC/USDT" or "BTC-USDT" -> extract base currency
        baseTicker = trimmed.split('/')[0];
      } else if (/^[A-Z0-9]+\-[A-Z0-9]+$/i.test(trimmed)) {
        baseTicker = trimmed.split('-')[0];
      }
      // For UK stocks, add .L suffix for London Stock Exchange (must match quote API)
      const UK_STOCKS = ['HSBA', 'ULVR', 'VOD', 'BP', 'RDS', 'RDS-A', 'RDS-B', 'GSK', 'AZN', 'BATS', 'BT', 'LLOY', 'BARC', 'RBS', 'TSCO', 'SBRY', 'MKS', 'NXT', 'ASOS', 'JD', 'ITV', 'PSN', 'BA', 'RR', 'BDEV', 'TW', 'PURP', 'III', 'SMT', 'FGT'];
      if (UK_STOCKS.includes(baseTicker)) {
        return `${baseTicker}.L`;
      }
      return baseTicker;
    };
    
    // Normalize FIRST, then filter and validate
    const normalizedTickers = Array.from(new Set(
      rawTickers
        .map(ticker => normalizeTicker(ticker)) // Normalize first
        .filter(normalized => {
          // Then validate the normalized ticker
          const isValid = !invalidPatterns.includes(normalized) && 
                         normalized.length >= 2 && 
                         normalized.length <= 10;
          if (!isValid && normalized) {
            console.warn(`Filtering out invalid ticker: ${normalized}`);
          }
          return isValid;
        })
    ));
    
    return normalizedTickers;
  }, [tradesKey]); // Use stable key instead of trades array
  
  // Debug: Log all tickers being processed (reduced logging)
  // if (trades.length > 0) {
  //   console.log('🔍 All trades:', trades.length);
  //   console.log('🔍 Filtered valid tickers:', userTickers);
  // }
  
  const quotesResponse = useQuotes(userTickers);
  
  // Memoize news tickers to prevent new array reference on every render
  const defaultTickers = useMemo(() => ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'], []);
  const userTickersKey = useMemo(() => userTickers.sort().join(','), [userTickers]);
  const newsTickers = useMemo(() => 
    userTickers.length > 0 ? userTickers : defaultTickers,
    [userTickersKey, defaultTickers] // Use stable key instead of array reference
  );
  const newsResponse = useNews(newsTickers, 5);
  const marketResponse = useMarketData();
  
  const quotesData = quotesResponse.data;
  const quotesLoading = quotesResponse.loading;
  const quotesError = quotesResponse.error;
  const refetchQuotes = quotesResponse.refetch;

  // Auto-refresh quotes when userTickers change
  useEffect(() => {
    if (userTickers.length > 0) {
      refetchQuotes();
    }
  }, [userTickers.length, refetchQuotes]); // Include refetchQuotes to prevent stale closures
  
  const newsData = newsResponse.data;
  const newsLoading = newsResponse.loading;
  const newsError = newsResponse.error;
  
  const marketData = marketResponse.data;
  const marketLoading = marketResponse.loading;
  const marketError = marketResponse.error;

  // newTrade state already declared above
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [setupLinkEmail, setSetupLinkEmail] = useState('');
  const [setupLinkSending, setSetupLinkSending] = useState(false);
  const [setupLinkSent, setSetupLinkSent] = useState(false);
  const [setupLinkError, setSetupLinkError] = useState<string | null>(null);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // isMockTrade state already declared above
  const [showAllNews, setShowAllNews] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'line'>('pie');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [useNewDashboard, setUseNewDashboard] = useState(true); // Toggle for new vs old dashboard
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<{title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(false);
  const modalScheduledRef = useRef(false); // Persist across re-renders
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPostImportUpsell, setShowPostImportUpsell] = useState(false);
  const [importModalFile, setImportModalFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'insights'>('performance');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'value' | 'weight' | 'date' | 'type' | 'qty'>('value');
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([BENCHMARK_SYMBOLS.SP500]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [portfolioView, setPortfolioView] = useState<'positions' | 'trades' | 'notes'>('positions');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    symbol: string;
    count: number;
  }>({ isOpen: false, symbol: '', count: 0 });

  // Prevent dashboard repaints when modals are open
  React.useEffect(() => {
    const hasModalOpen = showDeleteModal || showAlertModal;
    const dashboardContent = document.querySelector('[data-dashboard-content]');
    if (dashboardContent) {
      const el = dashboardContent as HTMLElement;
      if (hasModalOpen) {
        // Prevent repaints and interactions when modal is open
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
        el.style.contentVisibility = 'hidden'; // Skip rendering when hidden
        el.style.contain = 'layout style paint'; // Isolate from parent
        el.style.willChange = 'auto';
      } else {
        // Restore normal behavior when modal is closed
        el.style.pointerEvents = '';
        el.style.userSelect = '';
        el.style.contentVisibility = '';
        el.style.contain = '';
        el.style.willChange = '';
      }
    }
  }, [showDeleteModal, showAlertModal, alertModalData, isDeleting]);

  // Portfolio store integration
  const {
    chartView,
    timeRange,
    selectedSectors,
    drillDownPath,
    setPositions: setStorePositions,
    setChartView: setStoreChartView,
    setTimeRange: setStoreTimeRange,
    setSelectedSectors: setStoreSelectedSectors,
    setDrillDownPath: setStoreDrillDownPath,
    pushDrillDown,
    popDrillDown,
    resetDrillDown,
  } = usePortfolioStore();

  // Historical data
  const { data: historicalSnapshots, loading: historyLoading } = usePortfolioHistory({
    userId: user?.uid || null,
    enabled: useNewDashboard && !!user?.uid,
  });

  const [syntheticSnapshots, setSyntheticSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [syntheticSnapshotsLoading, setSyntheticSnapshotsLoading] = useState(false);
  const [syntheticBenchmarkReturns, setSyntheticBenchmarkReturns] = useState<number[]>([]);
  const [syntheticBenchmarkData, setSyntheticBenchmarkData] = useState<BenchmarkDataPoint[]>([]);
  const [historicalBenchmarkData, setHistoricalBenchmarkData] = useState<BenchmarkDataPoint[]>([]);
  const syntheticBuildKeyRef = useRef<string>('');
  const syntheticSeriesCacheRef = useRef<Map<string, Array<{ date: string; close: number }>>>(new Map());

  // Build a local snapshot series from trades + historical closes when Firestore history is empty.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!useNewDashboard) return;
    if (!displayTrades || displayTrades.length === 0) return;

    const shouldBuild = historicalSnapshots.length === 0;
    if (!shouldBuild) return;

    const toIsoDate = (value: unknown): string | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        const direct = value.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) return direct;
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
        return null;
      }
      if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
        return null;
      }
      if (typeof value === 'object' && value !== null) {
        const maybe = value as {
          toDate?: () => Date;
          seconds?: number;
          _seconds?: number;
        };
        if (typeof maybe.toDate === 'function') {
          const d = maybe.toDate();
          if (d instanceof Date && !Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        }
        const sec =
          typeof maybe.seconds === 'number'
            ? maybe.seconds
            : typeof maybe._seconds === 'number'
              ? maybe._seconds
              : null;
        if (typeof sec === 'number' && Number.isFinite(sec)) {
          const d = new Date(sec * 1000);
          if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        }
      }
      return null;
    };

    const tickersForKey = Array.from(
      new Set(displayTrades.map((t) => String(t.ticker || '').trim().toUpperCase()).filter(Boolean))
    )
      .sort()
      .join(',');
    const tradesFingerprint = displayTrades
      .map((t) => {
        const safeDate = toIsoDate((t as { date?: unknown }).date) || 'unknown-date';
        return `${safeDate}|${String(t.ticker || '').toUpperCase()}|${t.type}|${t.qty}|${t.price}`;
      })
      .sort()
      .join(';');
    const buildKey = `${user?.uid || 'local'}::${tickersForKey}::${tradesFingerprint}`;

    // Avoid expensive repeat rebuilds for identical data/state.
    if (syntheticBuildKeyRef.current === buildKey && syntheticSnapshots.length > 0) return;

    let cancelled = false;
    const run = async () => {
      setSyntheticSnapshotsLoading(true);
      try {
        const tickers = Array.from(
          new Set(displayTrades.map((t) => String(t.ticker || '').trim().toUpperCase()).filter(Boolean))
        ).slice(0, 40);

        // Fetch 1y daily close series per ticker via existing local API.
        const seriesByTicker = new Map<string, Array<{ date: string; close: number }>>();
        await Promise.all(
          tickers.map(async (ticker) => {
            const cached = syntheticSeriesCacheRef.current.get(ticker);
            if (cached) {
              seriesByTicker.set(ticker, cached);
              return;
            }
            try {
              const r = await fetch(
                `/api/tickers/${encodeURIComponent(ticker)}/json?range=1y&desktop=true&source=dashboard-analytics`
              );
              const j = await r.json().catch(() => null);
              const rows = (j?.data || []) as Array<{ date: string; close: number }>;
              const series = rows
                .filter((x) => x && typeof x.date === 'string' && typeof x.close === 'number' && Number.isFinite(x.close))
                .map((x) => ({ date: x.date, close: x.close }));
              seriesByTicker.set(ticker, series);
              syntheticSeriesCacheRef.current.set(ticker, series);
            } catch {
              seriesByTicker.set(ticker, []);
            }
          })
        );

        // Benchmark series (S&P 500) for beta when available.
        let benchmarkSeries: Array<{ date: string; close: number }> = [];
        try {
          const br = await fetch('/api/tickers/%5EGSPC/json?range=1y&desktop=true&source=dashboard-analytics');
          const bj = await br.json().catch(() => null);
          const rows = (bj?.data || []) as Array<{ date: string; close: number }>;
          benchmarkSeries = rows
            .filter((x) => x && typeof x.date === 'string' && typeof x.close === 'number' && Number.isFinite(x.close))
            .map((x) => ({ date: x.date, close: x.close }));
        } catch {
          benchmarkSeries = [];
        }
        // Fallback benchmark if ^GSPC unavailable.
        if (benchmarkSeries.length < 3) {
          try {
            const br = await fetch('/api/tickers/SPY/json?range=1y&desktop=true&source=dashboard-analytics');
            const bj = await br.json().catch(() => null);
            const rows = (bj?.data || []) as Array<{ date: string; close: number }>;
            benchmarkSeries = rows
              .filter((x) => x && typeof x.date === 'string' && typeof x.close === 'number' && Number.isFinite(x.close))
              .map((x) => ({ date: x.date, close: x.close }));
          } catch {
            benchmarkSeries = [];
          }
        }

        // Build a sorted set of all dates present across series (and benchmark, if any).
        const dateSet = new Set<string>();
        for (const series of seriesByTicker.values()) {
          for (const p of series) dateSet.add(p.date);
        }
        for (const p of benchmarkSeries) dateSet.add(p.date);
        const dates = Array.from(dateSet).sort();

        const tradesSorted = [...displayTrades]
          .map((t) => ({
            date:
              toIsoDate((t as { date?: unknown }).date) ||
              toIsoDate((t as { createdAt?: unknown }).createdAt) ||
              '',
            ticker: String(t.ticker || '').trim().toUpperCase(),
            type: t.type,
            qty: Number(t.qty),
            price: Number(t.price),
          }))
          .filter((t) => t.ticker && t.date && Number.isFinite(t.qty) && Number.isFinite(t.price))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Rolling holdings per ticker and invested cashflow.
        const shares = new Map<string, number>();
        let netInvested = 0;
        let tradeIdx = 0;

        const closeLookup = (ticker: string, date: string): number | null => {
          const series = seriesByTicker.get(ticker) || [];
          // Fast path: assume series is ordered; walk from end for nearest <= date.
          for (let i = series.length - 1; i >= 0; i--) {
            const p = series[i];
            if (p.date <= date) return p.close;
          }
          return null;
        };

        const snaps: PortfolioSnapshot[] = [];
        for (const date of dates) {
          while (tradeIdx < tradesSorted.length && tradesSorted[tradeIdx].date <= date) {
            const tr = tradesSorted[tradeIdx];
            const prev = shares.get(tr.ticker) || 0;
            const delta = tr.type === 'SELL' ? -tr.qty : tr.qty;
            shares.set(tr.ticker, prev + delta);
            // Net invested: buys add, sells subtract (cash returned).
            netInvested += (tr.type === 'SELL' ? -1 : 1) * tr.qty * tr.price;
            tradeIdx++;
          }

          let totalValue = 0;
          const positionsData: Array<{ ticker: string; shares: number; value: number; allocation: number }> = [];
          for (const [ticker, sh] of shares.entries()) {
            if (sh <= 0) continue;
            const close = closeLookup(ticker, date);
            if (close == null) continue;
            const value = sh * close;
            totalValue += value;
            positionsData.push({ ticker, shares: sh, value, allocation: 0 });
          }
          if (totalValue > 0) {
            for (const p of positionsData) {
              p.allocation = (p.value / totalValue) * 100;
            }
          }

          // Only store days where we can value at least something.
          if (totalValue > 0 && positionsData.length > 0) {
            snaps.push({
              userId: user?.uid || 'local',
              date,
              totalValue,
              totalInvested: netInvested,
              positions: positionsData,
              metadata: { timestamp: Date.now(), version: 'synthetic-1' },
            });
          }
        }

        // Build benchmark returns aligned to synthetic snapshot dates.
        const benchmarkCloseByDate = new Map<string, number>(benchmarkSeries.map((p) => [p.date, p.close]));
        const alignedBenchmarkCloses: number[] = [];
        for (const s of snaps) {
          let close: number | undefined = benchmarkCloseByDate.get(s.date);
          if (close == null) {
            // nearest <= date
            for (let i = benchmarkSeries.length - 1; i >= 0; i--) {
              if (benchmarkSeries[i].date <= s.date) {
                close = benchmarkSeries[i].close;
                break;
              }
            }
          }
          alignedBenchmarkCloses.push(typeof close === 'number' && Number.isFinite(close) ? close : NaN);
        }
        const benchReturns: number[] = [];
        for (let i = 1; i < alignedBenchmarkCloses.length; i++) {
          const prev = alignedBenchmarkCloses[i - 1];
          const curr = alignedBenchmarkCloses[i];
          if (Number.isFinite(prev) && Number.isFinite(curr) && prev > 0) {
            benchReturns.push((curr - prev) / prev);
          } else {
            benchReturns.push(0);
          }
        }

        const benchDataPoints: BenchmarkDataPoint[] = snaps
          .map((s, i) => ({
            date: s.date,
            value: alignedBenchmarkCloses[i],
          }))
          .filter((p) => Number.isFinite(p.value));

        if (!cancelled) {
          setSyntheticSnapshots(snaps);
          setSyntheticBenchmarkReturns(benchReturns);
          setSyntheticBenchmarkData(benchDataPoints);
          syntheticBuildKeyRef.current = buildKey;
        }
      } catch (e) {
        if (!cancelled) {
          setSyntheticSnapshots([]);
          setSyntheticBenchmarkReturns([]);
          setSyntheticBenchmarkData([]);
        }
      } finally {
        if (!cancelled) setSyntheticSnapshotsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [useNewDashboard, displayTrades, historicalSnapshots.length, user?.uid, syntheticSnapshots.length]);

  // Portfolio news (commented out - positions calculated later)
  // const portfolioNews = usePortfolioNews(Object.values(positions), 5);

  // Memoize device info to prevent re-renders on every render cycle
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Initialize analytics
  useEffect(() => {
    initializeMobileAnalytics();
  }, []);

  // Mobile detection for hamburger menu - debounced to prevent excessive re-renders
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const updateMobile = (mobile: boolean) => {
      setShowHamburger(mobile);
      setIsMobile(mobile);
    };
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
        updateMobile(mobile);
      }, 150); // Debounce resize events to prevent flickering
    };
    // Initial check immediately (no debounce) so mobile sees correct empty state on first paint
    if (typeof window !== 'undefined') {
      updateMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Update time every 5 seconds to reduce re-render frequency
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds instead of 1 to reduce flickering
    return () => clearInterval(timer);
  }, []);

  // Listen for custom event to open import modal (from navigation menu)
  useEffect(() => {
    const handleOpenImportModal = () => {
      setShowImportModal(true);
    };

    // Check sessionStorage for import modal intent (from cross-page navigation)
    const shouldOpenImport = sessionStorage.getItem('openImportModal');
    if (shouldOpenImport === 'true') {
      sessionStorage.removeItem('openImportModal');
      setShowImportModal(true);
    }

    window.addEventListener('openImportModal', handleOpenImportModal);
    return () => {
      window.removeEventListener('openImportModal', handleOpenImportModal);
    };
  }, []);

  // Show feature announcement modal once per user
  // IMPORTANT: Wait for onboarding tour to complete first
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Allow forcing modal via URL parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('showFeatureModal') === 'true';
    
    if (forceShow) {
      console.log('🧪 Force showing feature announcement modal (URL parameter)');
      // Clear the localStorage flag so it shows
      localStorage.removeItem('pocket-portfolio-feature-announcement-seen');
      const timer = setTimeout(() => {
        setShowFeatureAnnouncement(true);
      }, 500); // Shorter delay for testing
      return () => clearTimeout(timer);
    }
    
    // Check if user has seen the announcement
    const hasSeenAnnouncement = localStorage.getItem('pocket-portfolio-feature-announcement-seen');
    
    if (!hasSeenAnnouncement) {
      console.log('📢 User has not seen announcement, waiting for onboarding tour to complete...');
      
      // Reset ref if this is a new effect run (React Strict Mode)
      if (modalScheduledRef.current) {
        modalScheduledRef.current = false;
      }
      
      let checkInterval: ReturnType<typeof setInterval> | null = null;
      let showModalTimer: ReturnType<typeof setTimeout> | null = null;
      let maxTimer: ReturnType<typeof setTimeout> | null = null;
      
      // Function to check if onboarding is complete and show modal
      const checkAndShowModal = () => {
        // Guard: Don't schedule if already scheduled (check ref and localStorage)
        if (modalScheduledRef.current) {
          return;
        }
        
        // Also check localStorage to prevent duplicate calls
        const hasSeenAnnouncementNow = localStorage.getItem('pocket-portfolio-feature-announcement-seen');
        if (hasSeenAnnouncementNow) {
          return;
        }
        
        const hasSeenTour = localStorage.getItem('pocket_onboarding_seen');
        
        if (hasSeenTour === 'true') {
          // Onboarding tour is complete, stop checking and show modal after a short delay
          modalScheduledRef.current = true; // Set guard immediately using ref
          
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
          console.log('✅ Onboarding tour complete, showing feature announcement modal in 1 second');
          showModalTimer = setTimeout(() => {
            console.log('🚀 Showing feature announcement modal');
            setShowFeatureAnnouncement(true);
          }, 1000); // 1 second delay after tour completes
        }
        // If tour not complete, will check again on next interval
      };
      
      // Start checking after initial delay (give tour time to start)
      const initialTimer = setTimeout(() => {
        // Check immediately first time
        checkAndShowModal();
        // Then check every 500ms
        checkInterval = setInterval(checkAndShowModal, 500);
      }, 3000); // Wait 3 seconds before starting to check (tour starts at ~2.5s)
      
      // Also set a maximum timeout (30 seconds) to show modal even if tour never completes
      maxTimer = setTimeout(() => {
        // Check both ref and localStorage before showing
        if (modalScheduledRef.current) {
          return; // Don't show if already scheduled
        }
        
        const hasSeenAnnouncementNow = localStorage.getItem('pocket-portfolio-feature-announcement-seen');
        if (hasSeenAnnouncementNow) {
          return;
        }
        
        modalScheduledRef.current = true; // Set guard using ref
        
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        console.log('⏰ Max timeout reached, showing feature announcement modal');
        setShowFeatureAnnouncement(true);
      }, 30000);
      
      return () => {
        if (initialTimer) clearTimeout(initialTimer);
        if (checkInterval) clearInterval(checkInterval);
        if (showModalTimer) clearTimeout(showModalTimer);
        if (maxTimer) clearTimeout(maxTimer);
      };
    } else {
      console.log('ℹ️ Feature announcement already seen, skipping');
    }
  }, []);

  // Listen for custom event to open import modal (from navigation menu)
  useEffect(() => {
    const handleOpenImportModal = () => {
      setShowImportModal(true);
    };

    window.addEventListener('openImportModal', handleOpenImportModal);
    return () => {
      window.removeEventListener('openImportModal', handleOpenImportModal);
    };
  }, []);

  const handleCloseAnnouncement = () => {
    setShowFeatureAnnouncement(false);
    localStorage.setItem('pocket-portfolio-feature-announcement-seen', 'true');
  };

  // Listen for sync errors and show toast notification
  useEffect(() => {
    const handleSyncError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      
      if (detail?.type === 'invalid_json') {
        setAlertModalData({
          title: 'Sync Paused',
          message: detail.message + ' Your local data is safe and unchanged. Please fix the JSON syntax in Google Drive.',
          type: 'warning'
        });
        setShowAlertModal(true);
      }
    };

    window.addEventListener('sync-error', handleSyncError);
    return () => {
      window.removeEventListener('sync-error', handleSyncError);
    };
  }, []);
  
  // Debug: Log actual trades data to identify inconsistencies (disabled to reduce console noise)
  // if (trades.length > 0) {
  //   console.log('🔍 ACTUAL TRADES DATA:', {
  //     totalTrades: trades.length,
  //     realTrades: realTrades.length,
  //     mockTrades: trades.filter(trade => trade.mock).length,
  //     tickers: [...new Set(trades.map(trade => trade.ticker))],
  //     localStorageEmpty: !localStorage.getItem('pocket-portfolio-local-trades'),
  //     isAuthenticated: isAuthenticated
  //   });
    
  // Warn about data inconsistency (only on client side) - removed direct localStorage check to avoid race conditions
  // The useTrades hook handles localStorage synchronization properly
  
  // DATA INTEGRITY: Validate all trades (use realTrades for validation, but displayTrades for UI)
  const validationResult = validateTrades(realTrades);
  
  // Log validation results only if there are errors or warnings (and not already logged)
  if (validationResult.errors.length > 0 || validationResult.warnings.length > 0) {
    if (!window.validationErrorsLogged) {
      console.group('📊 PORTFOLIO DATA VALIDATION');
      // Validation errors are handled by the validation system
      window.validationErrorsLogged = true;
    }
  }
  
  // Create stable key from quotesData to prevent unnecessary position recalculations
  const quotesDataKey = useMemo(() => {
    if (!quotesData) return '';
    return Object.entries(quotesData)
      .map(([symbol, quote]) => `${symbol}:${quote?.price || 0}`)
      .sort()
      .join('|');
  }, [quotesData]);

  // Memoize positions calculation to prevent recalculation on every render
  const positions = useMemo(() => {
    // Calculate positions from displayTrades (shows demo data when no real trades, otherwise only real trades)
    const calculated = displayTrades.reduce((acc: { [key: string]: Position }, trade) => {
      const { ticker, qty, price, type, date } = trade;
      if (!acc[ticker]) {
        acc[ticker] = { 
          ticker, 
          shares: 0, 
          avgCost: 0, 
          currentPrice: 0,
          currentValue: 0, 
          unrealizedPL: 0, 
          unrealizedPLPercent: 0,
          totalTrades: 0,
          lastTradeDate: date,
          isMock: false,
          currency: trade.currency || 'USD',
          totalInvested: 0
        };
      }
      
      if (type === 'BUY') {
        const totalCost = acc[ticker].shares * acc[ticker].avgCost + qty * price;
        acc[ticker].shares += qty;
        acc[ticker].avgCost = totalCost / acc[ticker].shares;
        acc[ticker].totalInvested = totalCost;
      } else {
        // For SELL trades, reduce shares but keep the same average cost
        acc[ticker].shares -= qty;
        if (acc[ticker].shares >= 0) {
          acc[ticker].totalInvested = acc[ticker].shares * acc[ticker].avgCost;
        }
      }
      
      acc[ticker].totalTrades += 1;
      acc[ticker].lastTradeDate = date;
      acc[ticker].isMock = false;
      
      return acc;
    }, {});

    // Apply current prices and calculate P&L (moved inside useMemo to avoid side effects in render)
    Object.values(calculated).forEach(position => {
      // Commodity ticker mapping (must match quote API mapping)
      const COMMODITY_TICKER_MAP: Record<string, string> = {
        'GOLD': 'GC=F',
        'SILVER': 'SI=F',
        'OIL': 'CL=F',
        'CRUDE OIL': 'CL=F',
        'BRENT': 'BZ=F',
        'NATURAL GAS': 'NG=F',
        'COPPER': 'HG=F',
        'PLATINUM': 'PL=F',
        'PALLADIUM': 'PA=F',
        'CORN': 'ZC=F',
        'WHEAT': 'ZW=F',
        'SOYBEAN': 'ZS=F',
        'SUGAR': 'SB=F',
        'COFFEE': 'KC=F',
        'COTTON': 'CT=F',
        'US TECH 100': '^NDX',
        'NASDAQ 100': '^NDX',
        'S&P 500': '^GSPC',
        'DOW JONES': '^DJI',
        'FTSE 100': '^FTSE',
        'DAX': '^GDAXI',
        'NIKKEI 225': '^N225'
      };
      
      // Normalize ticker for quote lookup (e.g., "BTC/USDT" -> "BTC" -> "BTC-USD" for Yahoo Finance)
      const normalizeTickerForQuote = (ticker: string): string => {
        const trimmed = ticker.trim().toUpperCase();
        
        // Check commodity map FIRST (must match quote API logic)
        if (COMMODITY_TICKER_MAP[trimmed]) {
          const mapped = COMMODITY_TICKER_MAP[trimmed];
          return mapped;
        }
        
        let baseTicker = trimmed;
        // Handle exchange suffixes (e.g., "TSLA:US" -> "TSLA")
        if (/^[A-Z0-9]+:[A-Z0-9]+$/i.test(trimmed)) {
          baseTicker = trimmed.split(':')[0];
        } else if (/^[A-Z0-9]+\/[A-Z0-9]+$/i.test(trimmed)) {
          baseTicker = trimmed.split('/')[0];
        } else if (/^[A-Z0-9]+\-[A-Z0-9]+$/i.test(trimmed)) {
          baseTicker = trimmed.split('-')[0];
        }
        // For UK stocks, add .L suffix for London Stock Exchange (must match quote API)
        const UK_STOCKS = ['HSBA', 'ULVR', 'VOD', 'BP', 'RDS', 'RDS-A', 'RDS-B', 'GSK', 'AZN', 'BATS', 'BT', 'LLOY', 'BARC', 'RBS', 'TSCO', 'SBRY', 'MKS', 'NXT', 'ASOS', 'JD', 'ITV', 'PSN', 'BA', 'RR', 'BDEV', 'TW', 'PURP', 'III', 'SMT', 'FGT'];
        if (UK_STOCKS.includes(baseTicker)) {
          return `${baseTicker}.L`;
        }
        // For crypto, Yahoo Finance uses BTC-USD format
        const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'LINK', 'UNI', 'ATOM', 'ALGO', 'XRP', 'DOGE', 'LTC', 'BCH', 'ETC', 'XLM', 'TRX', 'EOS'];
        if (CRYPTO_SYMBOLS.includes(baseTicker)) {
          return `${baseTicker}-USD`;
        }
        return baseTicker;
      };
      
      const normalizedTicker = normalizeTickerForQuote(position.ticker);
      // For UK stocks, the quote API returns the symbol without .L (e.g., "VOD" not "VOD.L")
      // So we need to look up using the original ticker, not the normalized one with .L
      const lookupTicker = normalizedTicker.endsWith('.L') ? normalizedTicker.replace('.L', '') : normalizedTicker;
      // Handle exchange suffixes like "TSLA:US" - try with and without the suffix
      const tickerWithoutSuffix = position.ticker.includes(':') ? position.ticker.split(':')[0] : position.ticker;
      // Try normalized ticker first (e.g., "GC=F" for "GOLD"), then base ticker, then original, then without suffix
      const quote = quotesData?.[lookupTicker] || quotesData?.[normalizedTicker] || quotesData?.[normalizedTicker.split('-')[0]] || quotesData?.[normalizedTicker.split('=')[0]] || quotesData?.[position.ticker] || quotesData?.[tickerWithoutSuffix];
      
      if (quote && typeof quote === 'object' && 'price' in quote && quote.price !== null && quote.price !== undefined && quote.price > 0) {
        // Convert GBp (pence) to GBP (pounds) for UK stocks
        if (quote.currency === 'GBp') {
          position.currentPrice = quote.price / 100; // Convert pence to pounds
          position.currency = 'GBP'; // Update currency to GBP
        } else {
          position.currentPrice = quote.price;
          position.currency = quote.currency;
        }
        
        position.currentValue = position.currentPrice * position.shares;
        position.unrealizedPL = (position.currentPrice - position.avgCost) * position.shares;
        position.unrealizedPLPercent = position.avgCost > 0 ? (position.unrealizedPL / (position.avgCost * position.shares)) * 100 : 0;
      } else {
        // Set default values when no quote data is available
        position.currentPrice = 0;
        position.currentValue = 0;
        position.unrealizedPL = 0;
        position.unrealizedPLPercent = 0;
      }
    });

    return calculated;
  }, [displayTrades, quotesDataKey]); // Use displayTrades (includes demo when no real trades) and stable key instead of quotesData object

  // Update portfolio store with positions (only when positions actually change)
  // Use a ref to track previous positions and prevent infinite loops
  const prevPositionsKeyRef = React.useRef<string>('');
  
  // Memoize positionsArray to prevent new array reference on every render
  const positionsArray = useMemo(() => Object.values(positions), [positions]);

  const noteTickers = useMemo(
    () => positionsArray.filter((p) => p.shares > 0).map((p) => p.ticker),
    [positionsArray]
  );
  
  // Create stable JSON key from positions for comparison (matches original format)
  const positionsKey = useMemo(() => {
    return JSON.stringify(
      positionsArray
        .map((p) => ({
          ticker: p.ticker,
          shares: p.shares,
          currentValue: p.currentValue,
        }))
        .sort((a, b) => a.ticker.localeCompare(b.ticker))
    );
  }, [positionsArray]);
  
  useEffect(() => {
    if (!useNewDashboard) return;
    
    // Only update if positions actually changed
    if (prevPositionsKeyRef.current !== positionsKey) {
      prevPositionsKeyRef.current = positionsKey;
      setStorePositions(positionsArray);
    }
  }, [positionsKey, positionsArray, useNewDashboard, setStorePositions]);

  // Sync portfolio context and tier for Pocket Analyst (Ask AI)
  useEffect(() => {
    setTier(tier);
  }, [tier, setTier]);
  useEffect(() => {
    setPortfolioContext(buildPortfolioContext(displayTrades, positions));
  }, [displayTrades, positions, setPortfolioContext]);

  // Save daily snapshot (only once per day, using stable key)
  const snapshotKey = useMemo(() => {
    return Object.values(positions)
      .map((p) => `${p.ticker}:${p.shares.toFixed(4)}:${p.currentValue.toFixed(2)}`)
      .sort()
      .join('|');
  }, [
    Object.keys(positions).sort().join(','),
    Object.values(positions)
      .map((p) => `${p.ticker}:${p.shares.toFixed(4)}:${p.currentValue.toFixed(2)}`)
      .sort()
      .join('|'),
  ]);

  const prevSnapshotKeyRef = React.useRef<string>('');
  const lastSnapshotDateRef = React.useRef<string>('');

  useEffect(() => {
    if (!user?.uid || Object.values(positions).length === 0 || !useNewDashboard) return;
    
    // Only save if positions actually changed
    if (prevSnapshotKeyRef.current === snapshotKey) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already saved today
    if (lastSnapshotDateRef.current === today) return;
    
    const totalValue = Object.values(positions).reduce(
      (sum, pos) => sum + (pos.currentValue || pos.avgCost * pos.shares),
      0
    );
    const totalInvested = Object.values(positions).reduce(
      (sum, pos) => sum + pos.avgCost * pos.shares,
      0
    );

    // Save snapshot once per day
    const lastSnapshotDate = localStorage.getItem(`lastSnapshot_${user.uid}`);
    
    if (lastSnapshotDate !== today) {
      prevSnapshotKeyRef.current = snapshotKey;
      lastSnapshotDateRef.current = today;
      
      saveDailySnapshot(user.uid, Object.values(positions), totalValue, totalInvested)
        .then(() => {
          localStorage.setItem(`lastSnapshot_${user.uid}`, today);
        })
        .catch((error) => {
          // Reset refs on error so it can retry
          prevSnapshotKeyRef.current = '';
          lastSnapshotDateRef.current = '';
        });
    }
  }, [snapshotKey, user?.uid, useNewDashboard, positions]);

  // Calculate analytics (prefer real snapshots, else synthetic from trades, else current positions)
  const analytics = useMemo(() => {
    const snapshotsForAnalytics =
      historicalSnapshots.length > 0
        ? historicalSnapshots
        : syntheticSnapshots.length > 0
          ? syntheticSnapshots
          : null;

    if (snapshotsForAnalytics && snapshotsForAnalytics.length > 0) {
      const useSyntheticWithBenchmark =
        historicalSnapshots.length === 0 &&
        snapshotsForAnalytics === syntheticSnapshots &&
        syntheticBenchmarkReturns.length === Math.max(0, syntheticSnapshots.length - 1);
      const computed = calculatePortfolioAnalytics(
        snapshotsForAnalytics,
        useSyntheticWithBenchmark ? syntheticBenchmarkReturns : undefined
      );
      return computed;
    }

    // Fallback: compute truthy daily change from quotes + current value from positions.
    const positionsArray = Object.values(positions);
    const totalValue = positionsArray.reduce(
      (sum, pos) => sum + (pos.currentValue ?? pos.avgCost * pos.shares),
      0
    );
    const totalInvestedFromPositions = positionsArray.reduce(
      (sum, pos) => sum + (pos.totalInvested ?? pos.avgCost * pos.shares),
      0
    );

    // Daily change can be computed from quote change * shares (truthy intraday delta).
    let dailyChange = 0;
    for (const pos of positionsArray) {
      const q = quotesData?.[pos.ticker];
      if (q && typeof q.change === 'number' && Number.isFinite(q.change)) {
        dailyChange += q.change * pos.shares;
      }
    }
    const prevValue = totalValue - dailyChange;
    const dailyChangePercent = prevValue > 0 ? (dailyChange / prevValue) * 100 : 0;

    const computed = {
      totalValue,
      dailyChange,
      dailyChangePercent,
      allTimeReturn: totalValue - totalInvestedFromPositions,
      allTimeReturnPercent:
        totalInvestedFromPositions > 0
          ? ((totalValue - totalInvestedFromPositions) / totalInvestedFromPositions) * 100
          : 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      beta: 0,
      maxDrawdown: 0,
    };

    return computed;
  }, [historicalSnapshots, syntheticSnapshots, syntheticBenchmarkReturns, positions, quotesData]);

  const chartSnapshots = useMemo(
    () => (historicalSnapshots.length > 0 ? historicalSnapshots : syntheticSnapshots),
    [historicalSnapshots, syntheticSnapshots]
  );

  const isSyntheticAnalytics =
    historicalSnapshots.length === 0 && syntheticSnapshots.length > 0;

  // Fetch benchmark series when using Firestore historical snapshots
  useEffect(() => {
    if (historicalSnapshots.length === 0) {
      setHistoricalBenchmarkData((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        let rows: Array<{ date: string; close: number }> = [];
        const tryFetch = async (ticker: string) => {
          const r = await fetch(
            `/api/tickers/${encodeURIComponent(ticker)}/json?range=1y&desktop=true&source=dashboard-benchmark`
          );
          const j = await r.json().catch(() => null);
          return ((j?.data || []) as Array<{ date: string; close: number }>).filter(
            (x) => x?.date && typeof x.close === 'number' && Number.isFinite(x.close)
          );
        };
        rows = await tryFetch('^GSPC');
        if (rows.length < 3) rows = await tryFetch('SPY');
        if (cancelled) return;
        const aligned = alignBenchmarkSeriesToSnapshots(historicalSnapshots, rows);
        setHistoricalBenchmarkData(aligned);
      } catch {
        if (!cancelled) setHistoricalBenchmarkData([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [historicalSnapshots.length, historicalSnapshots[0]?.date, historicalSnapshots[historicalSnapshots.length - 1]?.date]);

  const benchmarkChartData = useMemo(
    () =>
      historicalSnapshots.length > 0 ? historicalBenchmarkData : syntheticBenchmarkData,
    [historicalSnapshots.length, historicalBenchmarkData, syntheticBenchmarkData]
  );

  const benchmarkAlphaPercent = useMemo(() => {
    if (chartSnapshots.length < 3 || benchmarkChartData.length < 3) return null;
    return calculatePeriodAlphaPercent(chartSnapshots, benchmarkChartData);
  }, [chartSnapshots, benchmarkChartData]);

  const totalPortfolioValue = useMemo(() => {
    if (analytics?.totalValue && analytics.totalValue > 0) return analytics.totalValue;
    return Object.values(positions).reduce(
      (sum, pos) => sum + (pos.currentValue || pos.avgCost * pos.shares),
      0
    );
  }, [analytics, positions]);

  const portfolioContextForAi = useMemo(
    () => buildPortfolioContext(displayTrades, positions),
    [displayTrades, positions]
  );

  const analyticsContextForAi = useMemo(() => {
    if (!analytics) return '';
    const lines = [
      'Risk & performance snapshot:',
      `Total value: $${analytics.totalValue.toFixed(2)}`,
      `All-time return: ${analytics.allTimeReturnPercent.toFixed(2)}%`,
      `Beta: ${analytics.beta.toFixed(2)}`,
      `Max drawdown: ${analytics.maxDrawdown.toFixed(2)}%`,
      `Sharpe: ${analytics.sharpeRatio.toFixed(2)}`,
    ];
    if (benchmarkAlphaPercent != null) {
      lines.push(`Alpha vs S&P 500 (period): ${benchmarkAlphaPercent.toFixed(2)}%`);
    }
    return lines.join('\n');
  }, [analytics, benchmarkAlphaPercent]);

  const briefingFallbackBullets = useCallback(() => {
    const top = Object.values(positions).sort(
      (a, b) => Math.abs(b.unrealizedPLPercent) - Math.abs(a.unrealizedPLPercent)
    )[0];
    const alphaLine =
      benchmarkAlphaPercent != null
        ? `Portfolio ${benchmarkAlphaPercent >= 0 ? 'outperformed' : 'underperformed'} the S&P 500 by ${Math.abs(benchmarkAlphaPercent).toFixed(2)}% over the tracked period.`
        : 'Benchmark comparison will appear once enough historical data is available.';
    const driverLine = top
      ? `${top.ticker} is the largest P/L mover (${top.unrealizedPLPercent >= 0 ? '+' : ''}${top.unrealizedPLPercent.toFixed(1)}% unrealized), with ${getSectorSync(top.ticker)} sector exposure.`
      : 'Add positions to surface performance drivers.';
    const riskLine = analytics
      ? `Risk profile: Beta ${analytics.beta.toFixed(2)}, max drawdown ${analytics.maxDrawdown.toFixed(1)}%, Sharpe ${analytics.sharpeRatio.toFixed(2)}.`
      : 'Risk metrics populate as daily snapshots accumulate.';
    return [alphaLine, driverLine, riskLine];
  }, [positions, benchmarkAlphaPercent, analytics]);

  const getAuthTokenForBriefing = useCallback(async () => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  const [debouncedAnalyticsContext, setDebouncedAnalyticsContext] = useState(analyticsContextForAi);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAnalyticsContext(analyticsContextForAi);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [analyticsContextForAi]);

  const clientBriefingFromApi = useClientBriefing({
    enabled: trades.length > 0 && !!user,
    portfolioContext: portfolioContextForAi,
    analyticsContext: debouncedAnalyticsContext,
    getAuthToken: getAuthTokenForBriefing,
    buildFallbackBullets: briefingFallbackBullets,
  });

  const clientBriefing = useMemo(() => {
    if (trades.length === 0) return { status: 'idle' as const };
    if (!user) {
      return {
        status: 'fallback' as const,
        bullets: briefingFallbackBullets(),
        source: 'offline' as const,
      };
    }
    return clientBriefingFromApi;
  }, [trades.length, user, clientBriefingFromApi, briefingFallbackBullets]);

  const benchmarkConfigs: Benchmark[] = useMemo(() => {
    if (benchmarkChartData.length === 0) return [];
    return [
      {
        symbol: BENCHMARK_SYMBOLS.SP500,
        name: BENCHMARK_NAMES[BENCHMARK_SYMBOLS.SP500] || 'S&P 500',
        data: benchmarkChartData,
      },
    ];
  }, [benchmarkChartData]);

  const showBenchmarkOnChart = selectedBenchmarks.includes(BENCHMARK_SYMBOLS.SP500);

  // Filter positions by selected sectors
  const filteredPositions = useMemo(() => {
    if (selectedSectors.length === 0) return Object.values(positions);
    
    return Object.values(positions).filter((pos) => {
      const positionSector = getSectorSync(pos.ticker);
      const positionSectorStr = positionSector as string;
      
      // Check if selectedSectors contains this position's sector
      // selectedSectors contains enum values as strings (e.g., "Information Technology")
      return selectedSectors.includes(positionSectorStr);
    });
  }, [positions, selectedSectors]);

  // Convert all positions to USD for portfolio totals
  // Note: In a real app, you'd use live exchange rates
  const GBP_TO_USD = 1.27; // Approximate exchange rate
  
  // Use values from useTrades hook for consistency
  // Calculate metrics from displayTrades (includes mock when no real trades, otherwise only real)
  // This ensures demo data shows metrics, but real data overrides when imported
  const totalInvested: number = useMemo(() => {
    return Object.values(positions).reduce((sum, pos) => sum + (pos.totalInvested || pos.avgCost * pos.shares), 0);
  }, [positions]);
  
  const totalTrades: number = displayTrades.length;
  const totalPositions: number = Object.keys(positions).length;
  
  const totalUnrealizedPL = Object.values(positions).reduce((sum, pos) => {
    if (pos.currency === 'GBP') {
      return sum + (pos.unrealizedPL * GBP_TO_USD);
    }
    return sum + pos.unrealizedPL; // USD
  }, 0);
  
  const totalUnrealizedPLPercent = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

  const heroAllTimeReturn = analytics?.allTimeReturn ?? totalUnrealizedPL;
  const heroAllTimeReturnPercent =
    analytics?.allTimeReturnPercent ?? totalUnrealizedPLPercent;
  const heroReturnLabel: 'All-Time' | 'Unrealized' =
    chartSnapshots.length > 0 ? 'All-Time' : 'Unrealized';

  const { showToast: showWeeklySnapshotToast, dismiss: dismissWeeklySnapshotToast } =
    useWeeklySnapshotToast(isAuthenticated ?? false, {
      totalInvested,
      unrealizedPL: totalUnrealizedPL,
    });
  
  // Track dashboard re-renders and modal state
  const hasModalOpen = showDeleteModal || showAlertModal;
  
  // DATA INTEGRITY: Verify calculations
  // Calculate expected total invested from positions for comparison
  const calculatedTotalInvested = Object.values(positions).reduce((sum, pos) => {
    const value = pos.avgCost * pos.shares;
    const rate = pos.currency === 'GBP' ? GBP_TO_USD : 1.0;
    return sum + (value * rate);
  }, 0);
  
  // Calculations should now be consistent between dashboard and useTrades
  // Removed discrepancy check since both use the same logic
  
  // Log summary for verification (only when trades exist and not already logged)
  // Wait for quotes data to be available before logging to ensure accurate P&L calculations
  React.useEffect(() => {
    if (realTrades.length > 0 && quotesData && Object.keys(quotesData).length > 0) {
      // Create a unique key for this data set
      const dataKey = `${realTrades.length}-${totalInvested.toFixed(2)}-${totalUnrealizedPL.toFixed(2)}`;
      
      // Portfolio data is calculated and displayed in the UI
    }
  }, [realTrades.length, totalInvested, totalUnrealizedPL, totalUnrealizedPLPercent, totalPositions, totalTrades, positions, quotesData]);

  // Check for Drive updates on mount
  useEffect(() => {
    if (syncState.isConnected) {
      checkForUpdates();
    }
  }, [syncState.isConnected, checkForUpdates]);

  // Listen for Drive sync events and reload trades
  useEffect(() => {
    const handleDriveSync = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      
      // CRITICAL: If we skipped due to empty Drive, trigger syncToDrive to upload Firebase trades
      // This fixes the root cause of the sync loop by populating Drive with Firebase trades
      if (detail?.skippedDueToEmptyDrive && isAuthenticated && user && syncState.isConnected) {
        console.log('📤 Drive is empty - uploading Firebase trades to Drive to fix sync loop...');
        try {
          // Get current trades from Firebase
          const currentTrades = tradesRef.current;
          if (currentTrades.length > 0) {
            await syncToDrive(undefined, currentTrades, true); // skipPreUploadCheck = true
            console.log('✅ Successfully uploaded Firebase trades to Drive - sync loop should be resolved');
          } else {
            console.log('⚠️ No Firebase trades to upload - Drive will remain empty');
          }
        } catch (error) {
          console.error('❌ Failed to upload Firebase trades to Drive:', error);
        }
        return; // Don't refresh trades - we just uploaded to Drive, let it sync naturally
      }
        
      // For authenticated users, wait a bit for Firebase to update
      if (isAuthenticated && user) {
        // Give Firebase time to update (deleteAllTrades + importTrades)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Reload trades from localStorage/Firebase to reflect Drive changes
      console.log('🔄 Drive sync complete, reloading trades...');
      
      
      // CRITICAL: Set flag to prevent auto-sync from triggering when refreshTrades() updates state
      // This prevents the "write-back loop" where Drive edits trigger immediate auto-save
      isRemoteUpdateRef.current = true;
      
      
      await refreshTrades();
      
      // CRITICAL: Mark Drive sync complete AFTER refreshTrades() completes
      // This extends the auto-sync block to prevent overwriting Drive changes
      // The block was set in syncFromDrive, but we extend it here after state updates
      markDriveSyncComplete();
      
      
      
      // Wait a bit more to ensure state has fully updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // CRITICAL: Update lastSyncedTradesContentRef to prevent auto-sync loop
      // After pulling from Drive, we need to mark the new trades as "synced" so we don't immediately sync them back
      // Use tradesRef.current which is updated by the useEffect, so it has the latest value
      lastSyncedTradesContentRef.current = JSON.stringify(tradesRef.current);
      
      
      
    };

    window.addEventListener('drive-sync-complete', handleDriveSync);
    return () => {
      window.removeEventListener('drive-sync-complete', handleDriveSync);
    };
  }, [refreshTrades, isAuthenticated, user]);

  // Auto-sync to Drive when trades change (but not when syncing FROM Drive)
  useEffect(() => {
    if (isAuthenticated && user && syncState.isConnected && syncState.fileId) {
      // CRITICAL: Skip auto-sync if trades were updated from a remote source (Drive)
      // This prevents the "write-back loop" where Drive edits trigger immediate auto-save
      if (isRemoteUpdateRef.current) {
        
        // Reset flag after skipping
        isRemoteUpdateRef.current = false;
        // Update lastSyncedTradesContentRef to match current state
        lastSyncedTradesContentRef.current = JSON.stringify(trades);
        
        return;
      }
      
      // Remove trades.length > 0 condition to allow syncing deletions (empty state)
      // But skip if we just synced from Drive to prevent overwriting Drive edits
      
      // Skip auto-sync if we're currently syncing
      if (syncState.isSyncing) {
        return;
      }
      
      // CRITICAL: Skip auto-sync if we're in the middle of deleting all trades
      // This prevents auto-sync from interfering with intentional deletion
      if (isDeleting) {
        
        return;
      }
      
      // Check if we recently synced from Drive (within last 5 seconds)
      // This prevents immediate overwrite of Drive edits, but allows syncing after a short delay
      // This makes the sync collaborative - we respect Drive edits but can still sync our changes
      if (recentlySyncedFromDrive()) {
        console.log('⏸️ Skipping auto-sync - recently synced from Drive (respecting Drive edits, will retry shortly)');
        return;
      }
      
      // CRITICAL: Prevent auto-sync loop - check if trades content actually changed since last sync
      // Compare current trades with what we last synced (not just ref, which updates on every render)
      const currentTradesContent = JSON.stringify(trades);
      const tradesChanged = currentTradesContent !== lastSyncedTradesContentRef.current;
      
      
      
      if (!tradesChanged) {
        // Trades content didn't change - this is likely a re-render from syncState update
        
        return;
      }
      
      // Debounce changes to trades before pushing to Drive
      const handler = setTimeout(() => {
        
        // Double-check we're not syncing and didn't just sync from Drive
        // CRITICAL: Also check if we're deleting - don't auto-sync during deletion
        if (!syncState.isSyncing && !recentlySyncedFromDrive() && !isDeleting) {
          console.log('🔄 Trades changed, syncing to Drive...', trades.length, 'trades');
          
          syncToDrive(undefined, trades).then(() => {
            // Mark this content as synced to prevent loop
            lastSyncedTradesContentRef.current = JSON.stringify(trades);
            
          }).catch((error) => {
            console.error('Auto-sync failed:', error);
          }); // Pass current trades (can be empty array)
        }
      }, 1000); // 1-second debounce

      return () => clearTimeout(handler);
    }
  }, [trades, isAuthenticated, user, syncState.isConnected, syncState.fileId, syncState.isSyncing, syncToDrive, recentlySyncedFromDrive]);

  const handleAddTrade = async () => {
    if (!newTrade.symbol || !newTrade.quantity || !newTrade.price) {
      setAlertModalData({
        title: 'Missing Information',
        message: 'Please fill in all required fields (Symbol, Quantity, and Price).',
        type: 'warning'
      });
      setShowAlertModal(true);
      return;
    }

    const trade: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'> = {
      ticker: newTrade.symbol.toUpperCase(),
      qty: parseFloat(newTrade.quantity),
      price: parseFloat(newTrade.price),
      date: newTrade.date,
      type: newTrade.type === 'buy' ? 'BUY' : 'SELL',
      currency: 'USD',
      mock: isMockTrade
    };

    try {
      
      await addTrade(trade);
      
      setNewTrade({
        symbol: '',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        type: 'buy',
        fees: ''
      });
      // Wait for state to update, then sync with updated trades
      // Use ref to get the latest trades after state update
      if (syncState.isConnected && !syncState.isSyncing && !recentlySyncedFromDrive()) {
        
        setTimeout(() => {
          
          // At this point, tradesRef.current should have the updated trades
          if (syncState.isConnected && !syncState.isSyncing && !recentlySyncedFromDrive()) {
            
            syncToDrive(undefined, tradesRef.current); // Use ref to get latest trades
          }
        }, 300); // Wait for React to update state
      }
    } catch (error) {
      setAlertModalData({
        title: 'Error',
        message: 'Failed to add trade. Please try again.',
        type: 'error'
      });
      setShowAlertModal(true);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      
      
      // Mark deletion start to prevent Drive polling from pulling during deletion
      if (syncState.isConnected) {
        markDeletionStart();
      }
      
      await deleteTrade(tradeId);
      
      
      
      console.log('✅ Trade deleted successfully:', tradeId);
      
      // CRITICAL: Sync deletion to Drive immediately to prevent Drive from pulling back the deleted trade
      // Explicitly filter out the deleted trade to ensure we sync the correct state
      // This handles the case where tradesRef.current might be stale
      if (syncState.isConnected) {
        // Get current trades and explicitly remove the deleted one
        const currentTrades = tradesRef.current.filter(t => t.id !== tradeId);
        
        
        
        // Update tradesRef to reflect the deletion immediately
        tradesRef.current = currentTrades;
        
        // Sync the filtered trades array (without the deleted trade)
        await syncToDrive(undefined, currentTrades);
        console.log('✅ Deletion synced to Drive');
      }
      
      // Don't manually sync here - the auto-sync useEffect will handle it
      // when trades state updates (it watches trades changes)
      // The auto-sync will trigger when trades array changes
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      
      
      
      // Check if this is a permission error that was handled gracefully
      const isPermissionError = error instanceof Error && (
        error.message.includes('Permission denied') || 
        error.message.includes('permission-denied')
      );
      
      // Only show error if it's not a permission error (permission errors are handled gracefully in useTrades)
      if (!isPermissionError) {
        setAlertModalData({
          title: 'Delete Failed',
          message: error instanceof Error ? error.message : 'Failed to delete trade. Please try again.',
          type: 'error'
        });
        setShowAlertModal(true);
      } else {
        // Permission error was handled - trade was removed from local state
        // Just log it, don't show error to user since the trade is gone from their view
        console.log('ℹ️ Trade removed from local state (Firebase deletion had permission issue)');
      }
    }
  };

  const handleCSVImport = async (csvData: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>[]) => {
    
    // CRITICAL: Mark CSV import as in progress to prevent Drive from pulling and overwriting
    markCsvImportStart();
    try {
      await importTrades(csvData);
      
      // Wait for state to update, then sync with updated trades
      // Use ref to get the latest trades after state update
      if (syncState.isConnected && !syncState.isSyncing && !recentlySyncedFromDrive()) {
        setTimeout(async () => {
          // At this point, tradesRef.current should have the updated trades
          
          if (syncState.isConnected && !syncState.isSyncing && !recentlySyncedFromDrive()) {
            await syncToDrive(undefined, tradesRef.current); // Use ref to get latest trades, wait for completion
            
            // Clear CSV import flag after sync completes (Drive now has the updated data)
            clearCsvImportFlag();
          } else {
            // If we didn't sync, still clear the flag after a delay (safety net)
            setTimeout(() => clearCsvImportFlag(), 20000);
          }
        }, 500); // Wait longer for CSV import (more trades to process)
      }
    } catch (error) {
      console.error('Error importing trades:', error);
      
      setAlertModalData({
        title: 'Import Error',
        message: 'Failed to import trades. Please try again.',
        type: 'error'
      });
      setShowAlertModal(true);
    }
  };

  const handleClearAllTrades = async () => {
    if (!isAuthenticated || !user) {
      setAlertModalData({
        title: 'Sign In Required',
        message: 'You must be signed in to clear trades.',
        type: 'warning'
      });
      setShowAlertModal(true);
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDeleteAllTrades = async () => {
    
    // CRITICAL: Mark deletion in progress BEFORE deleting to prevent polling from pulling stale trades
    markDeletionStart();
    setIsDeleting(true);
    // CRITICAL: Update lastSyncedTradesContentRef immediately to prevent auto-sync from triggering
    // This prevents the auto-sync useEffect from seeing empty trades as a "change" and syncing again
    const emptyTradesContent = JSON.stringify([]);
    lastSyncedTradesContentRef.current = emptyTradesContent;
    
    try {
      const deletedCount = await deleteAllTrades();
      
      
      // IMPORTANT: Sync empty state to Drive IMMEDIATELY to prevent syncFromDrive from recreating trades
      // CRITICAL: Call syncToDrive synchronously (await it) to ensure empty state is synced before polling can trigger syncFromDrive
      // Pass empty array directly (don't rely on tradesRef which may be stale)
      if (syncState.isConnected && !syncState.isSyncing && !recentlySyncedFromDrive()) {
        // CRITICAL: Update lastSyncedTradesContentRef BEFORE syncing to prevent auto-sync from triggering
        // This prevents the auto-sync useEffect from seeing empty trades as a "change" and syncing again
        const emptyTrades: Trade[] = [];
        lastSyncedTradesContentRef.current = JSON.stringify(emptyTrades);
        
        
        
        // CRITICAL: Await syncToDrive to ensure empty state is synced before allowing syncFromDrive to run
        try {
          await syncToDrive(undefined, emptyTrades, true); // skipPreUploadCheck = true
          // Update again after sync completes to ensure it's in sync
          lastSyncedTradesContentRef.current = JSON.stringify(emptyTrades);
          // CRITICAL: Clear localStorage flag after successful sync
          localStorage.removeItem('pp_deletion_in_progress');
          
        } catch (error) {
          console.error('Failed to sync empty state to Drive:', error);
          // Keep localStorage flag if sync failed - will retry on next syncFromDrive
          
        } finally {
          // Clear deletion flag after sync completes (or fails)
          setIsDeleting(false);
        }
      }
      
      setShowDeleteModal(false);
      setAlertModalData({
        title: 'Success',
        message: `Successfully deleted ${deletedCount} trade${deletedCount === 1 ? '' : 's'} from your account.`,
        type: 'success'
      });
      setShowAlertModal(true);
    } catch (error) {
      
      setShowDeleteModal(false);
      setAlertModalData({
        title: 'Error',
        message: 'Failed to clear trades. Please try again.',
        type: 'error'
      });
      setShowAlertModal(true);
      // Note: setIsDeleting(false) is called after sync completes, not here
      // This ensures auto-sync is blocked during the entire deletion + sync process
    }
  };


  // Debug: Log dashboard rendering (disabled to reduce console noise)
  // console.log('🔍 Dashboard rendering:', {
  //   tradesLength: trades.length,
  //   isAuthenticated,
  //   user: user?.email,
  //   totalInvested,
  //   totalTrades,
  //   totalPositions
  // });

  return (
    <>
      <OnboardingTour />
      <SEOHead
        title="Portfolio Dashboard - Track Your Investments"
        description="Manage your investment portfolio with live P/L tracking, real-time prices, mock trading, and CSV import. Free portfolio management dashboard with advanced analytics and insights."
        keywords={[
          'portfolio dashboard',
          'investment tracking',
          'stock portfolio',
          'crypto portfolio',
          'portfolio management',
          'investment analytics',
          'trading dashboard',
          'financial dashboard',
          'portfolio tracker',
          'investment tools'
        ]}
        canonical="https://www.pocketportfolio.app/dashboard"
        ogImage="https://www.pocketportfolio.app/api/og?title=Dashboard&description=Your%20Portfolio%2C%20Local-First&v=6"
        ogType="website"
      />
      
      <StructuredData type="WebApplication" data={webAppData} />

      {/* 🎨 CONTENT - Layout wrapper handles header/banner/tier injection */}
      <div>
          {isAuthenticated && !tierLoading && !isPaidTier(tier) && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 25,
                padding: '10px 16px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--dashboard-chrome-border-subtle)',
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--text)',
              }}
            >
              <span style={{ marginRight: '8px' }}>
                7-day Founders Club unlock: refer one friend who joins—
              </span>
              <Link
                href="/invite?utm_source=dashboard&utm_medium=sticky_banner&utm_campaign=viral_moment_v1"
                style={{ color: 'var(--accent-warm)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Copy your invite link
              </Link>
            </div>
          )}
          {showDemoTerminalBanner &&
            realTrades.length === 0 &&
            trades.length > 0 &&
            trades.every((t) => t.mock) && (
              <div
                style={{
                  margin: '0 16px 12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-warm)',
                  background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, transparent 100%)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>
                  Projected Sovereign Terminal — demo portfolio (local only until you import CSV).
                </div>
                <button
                  type="button"
                  onClick={() => void dismissDemoPortfolio()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dashboard-chrome-border-subtle)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Use my real portfolio
                </button>
              </div>
            )}
          {/* Directive B — direct-entry affordance: search + import before deep terminal chrome */}
          <div
            id="dashboard-quick-search"
            className="dashboard-card"
            style={{
              margin: '0 16px 16px',
              padding: '14px 16px',
              border: '1px solid var(--dashboard-chrome-border-subtle)',
              borderRadius: '12px',
              background: 'var(--surface)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              Next action
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Search a symbol for context, or import trades — everything stays local-first until you opt into sync.
            </p>
            <div
              style={{
                maxWidth: '520px',
                borderRadius: '10px',
                border: '1px solid var(--dashboard-chrome-border-subtle)',
                padding: '4px',
                background: 'var(--surface-elevated)',
              }}
            >
              <TickerSearch placeholder="> Ticker lookup (e.g. AAPL, BTC)…" linkToTickerPage />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
              <a
                href="#add-trade"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--accent-warm)',
                }}
              >
                Add trade / Import CSV ↓
              </a>
              <Link
                href="/s/api?utm_source=dashboard&utm_medium=quick_strip&utm_campaign=developer_hub"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                JSON API hub →
              </Link>
            </div>
          </div>
          {/* 🎨 INTELLIGENCE LAYER - Above everything */}
          {/* Hero HUD — mark-to-market value + benchmark alpha */}
          <TerminalSummary
            totalPortfolioValue={totalPortfolioValue}
            allTimeReturn={heroAllTimeReturn}
            allTimeReturnPercent={heroAllTimeReturnPercent}
            benchmarkAlphaPercent={benchmarkAlphaPercent}
            totalTrades={totalTrades}
            totalPositions={totalPositions}
            totalInvested={totalInvested}
            returnLabel={heroReturnLabel}
            loading={!trades || trades.length === 0}
          />

          {trades.length > 0 && analytics && (
            <RiskMatrix
              analytics={analytics}
              loading={historyLoading || syntheticSnapshotsLoading || tierLoading}
              isSynthetic={isSyntheticAnalytics}
              isPremium={isPaidTier(tier)}
            />
          )}

          {trades.length > 0 && (
            <MorningBrief
              briefing={
                clientBriefing.status === 'idle'
                  ? { status: 'fallback', bullets: briefingFallbackBullets(), source: 'offline' }
                  : clientBriefing
              }
            />
          )}

          {/* Sync Upgrade CTA - Show for unauthenticated users with local trades */}
          <SyncUpgradeCTA />

          {/* Account Management moved to UserAvatarDropdown */}

          {/* Data Input Deck - Unified Input Portal */}
          <div id="add-trade">
            <DataInputDeck
              newTrade={newTrade}
              isMockTrade={isMockTrade}
              onTradeChange={(updates) => setNewTrade({ ...newTrade, ...updates })}
              onMockTradeChange={setIsMockTrade}
              onAddTrade={handleAddTrade}
              onImport={() => setShowImportModal(true)}
            />
          </div>

          {/* Import Modal */}
          {showImportModal && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'hsl(var(--foreground) / 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
              onClick={() => { setShowImportModal(false); setImportModalFile(null); }}
            >
              <div 
                className="dashboard-card"
                style={{
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: 'hsl(var(--card))',
                  border: `1px solid var(--dashboard-chrome-border)`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>Import CSV Data</h2>
                  <button
                    onClick={() => { setShowImportModal(false); setImportModalFile(null); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--dashboard-muted-foreground)',
                      cursor: 'pointer',
                      fontSize: '24px',
                      padding: '4px 8px',
                      lineHeight: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dashboard-muted-foreground)'}
                  >
                    ×
                  </button>
                </div>
                <CSVImporter
                  initialFile={importModalFile}
                  onImport={(trades) => {
                    handleCSVImport(trades);
                    setShowImportModal(false);
                    setImportModalFile(null);
                    trackPaywallImpression('csv_import_success', '/dashboard', tier);
                    setShowPostImportUpsell(true);
                  }}
                />
              </div>
            </div>
          )}

          {showPostImportUpsell && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
                padding: '16px',
              }}
              onClick={() => setShowPostImportUpsell(false)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  background: 'var(--surface)',
                  border: '1px solid var(--dashboard-chrome-border-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '18px' }}>
                  Import complete. Unlock institutional analytics.
                </h3>
                <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                  Your portfolio data is live. Upgrade to unlock Time-Weighted Return (TWR), Brinson
                  attribution, and premium AI analysis.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="/sponsor?utm_source=dashboard&utm_medium=post_import_upsell&utm_campaign=intent_trigger&utm_content=csv_import_success&trigger_source=csv_import_success"
                    onClick={() => {
                      trackPaywallCtaClick(
                        'csv_import_success',
                        '/sponsor?utm_source=dashboard&utm_medium=post_import_upsell&utm_campaign=intent_trigger&utm_content=csv_import_success&trigger_source=csv_import_success',
                        '/dashboard',
                        tier
                      );
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--accent-warm)',
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    Unlock Founders Features
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowPostImportUpsell(false)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--dashboard-chrome-border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Continue free
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Dashboard - New Enhanced Version */}
          {trades.length > 0 && useNewDashboard && (
            <>
              {/* Analytics Panel */}
              {analytics && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <AnalyticsPanel
                    analytics={analytics}
                    loading={historyLoading || syntheticSnapshotsLoading || tierLoading}
                    isPremium={isPaidTier(tier)}
                  />
                </div>
              )}

              {/* Charts & Insights - Tabbed Interface */}
              <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                {/* Tab Navigation */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '16px', 
                  borderBottom: `1px solid var(--dashboard-chrome-border)` 
                }}>
                  <button
                    onClick={() => setActiveTab('performance')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'performance' ? '2px solid hsl(var(--accent))' : '2px solid transparent',
                      color: activeTab === 'performance' ? 'hsl(var(--accent))' : 'var(--dashboard-muted-foreground)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'performance') {
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'performance') {
                        e.currentTarget.style.color = 'var(--dashboard-muted-foreground)';
                      }
                    }}
                  >
                    Performance
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'insights' ? '2px solid hsl(var(--accent))' : '2px solid transparent',
                      color: activeTab === 'insights' ? 'hsl(var(--accent))' : 'var(--dashboard-muted-foreground)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'insights') {
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'insights') {
                        e.currentTarget.style.color = 'var(--dashboard-muted-foreground)';
                      }
                    }}
                  >
                    Insights
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'performance' ? (
                  <div>
                    {/* Main Dashboard Grid */}
              <div className="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:gap-6">
                {/* Charts Section */}
                <div className="flex min-w-0 flex-col gap-4 md:gap-6">
                  {/* Allocation Chart with Drill-Down */}
                  <DrillDownChart
                    positions={filteredPositions}
                    chartView={chartView}
                    onChartViewChange={setStoreChartView}
                    drillDownPath={drillDownPath}
                    onDrillDown={pushDrillDown}
                    onDrillUp={popDrillDown}
                    onReset={resetDrillDown}
                  />

                  {chartSnapshots.length > 0 && (
                    <div
                      className="grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6"
                      style={{ alignItems: 'start' }}
                    >
                      <div className="min-w-0 w-full">
                      <PortfolioPerformanceChart
                        snapshots={chartSnapshots}
                        timeRange={timeRange}
                        onTimeRangeChange={setStoreTimeRange}
                        showBenchmark={showBenchmarkOnChart && benchmarkChartData.length > 0}
                        benchmarkData={benchmarkChartData}
                      />
                      </div>
                      {benchmarkConfigs.length > 0 && (
                        <BenchmarkOverlay
                          benchmarks={benchmarkConfigs}
                          selectedBenchmarks={selectedBenchmarks}
                          onToggleBenchmark={(symbol) => {
                            setSelectedBenchmarks((prev) =>
                              prev.includes(symbol)
                                ? prev.filter((s) => s !== symbol)
                                : [...prev, symbol]
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Heat Map */}
                  {historicalSnapshots.length > 0 && chartView === 'heatmap' && (
                    <ReturnHeatMap
                      positions={filteredPositions}
                      snapshots={historicalSnapshots}
                    />
                  )}
                </div>

                {/* Sidebar */}
                <div className="flex min-w-0 flex-col gap-4 md:gap-6">
                  {/* Sector Filter */}
                  <SectorFilter
                    positions={Object.values(positions)}
                    selectedSectors={selectedSectors}
                    onSectorChange={setStoreSelectedSectors}
                  />

                  {/* Share/Export */}
                  <SharePortfolio
                    positions={Object.values(positions)}
                    excludeSensitiveData={true}
                  />
                </div>
              </div>
                  </div>
                ) : (
                  <div>
                    {/* Advanced Analytics & Rebalancing Engine - Premium Feature */}
                    <AnalyticsDashboard
                      trades={trades}
                      positions={Object.values(positions)}
                      tier={tier}
                      betaOverride={analytics?.beta ?? null}
                    />
                    {isPaidTier(tier) && (
                      <AllocationRecommendations
                        positions={Object.values(positions)}
                        totalValue={Object.values(positions).reduce(
                          (sum, pos) => sum + pos.currentValue,
                          0
                        )}
                        portfolioAnalytics={analytics}
                        historicalSnapshots={historicalSnapshots}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Portfolio Chart - Legacy Simple Version (fallback) */}
          {trades.length > 0 && !useNewDashboard && (
            <>
            <div className="dashboard-card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                  {chartType === 'pie' ? 'Portfolio Allocation' : 'Portfolio Performance'}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setChartType('pie')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'pie' ? 'hsl(var(--accent))' : 'transparent',
                      color: chartType === 'pie' ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                      border: chartType === 'pie' ? 'none' : `1px solid var(--dashboard-chrome-border)`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: chartType === 'pie' ? `0 2px 8px hsla(var(--primary), 0.3)` : 'none'
                    }}
                  >
                    Pie
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'line' ? `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)` : 'transparent',
                      color: chartType === 'line' ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                      border: chartType === 'line' ? `2px solid hsl(var(--accent))` : `1px solid var(--dashboard-chrome-border)`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: chartType === 'line' ? `0 2px 8px hsla(var(--primary), 0.3)` : 'none'
                    }}
                  >
                    Line
                  </button>
            </div>
            </div>
              {chartType === 'pie' ? (
                <SimplePieChart positions={Object.values(positions)} />
              ) : (
                <PortfolioChart 
                  positions={Object.values(positions)} 
                  type="line"
                />
              )}
          </div>
            </>
        )}

        {/* Portfolio Holdings - Full Width Layout */}
        {trades.length > 0 && (
          <div id="positions" style={{ 
            marginTop: '32px',
            marginBottom: '32px',
            scrollMarginTop: '80px'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📊</span>
                  </div>
                  <div>
                    <h1 style={{ 
                      fontSize: '32px', 
                      fontWeight: '700', 
                      margin: '0 0 4px 0',
                      color: 'var(--text)'
                    }}>
                      Portfolio Holdings
                    </h1>
                    <p style={{ 
                      color: 'var(--dashboard-muted-foreground)', 
                      fontSize: '16px',
                      margin: 0
                    }}>
                      Track your investment performance and holdings
                    </p>
                  </div>
                </div>
                
                {/* Clear All Trades - Subtle button when authenticated and has trades */}
                {isAuthenticated && trades.length > 0 && (
                  <button
                    onClick={handleClearAllTrades}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      color: 'var(--dashboard-muted-foreground)',
                      border: `1px solid var(--dashboard-chrome-border)`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--danger)';
                      e.currentTarget.style.borderColor = 'var(--danger)';
                      e.currentTarget.style.background = 'hsla(var(--danger), 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--dashboard-muted-foreground)';
                      e.currentTarget.style.borderColor = 'var(--dashboard-chrome-border)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Permanently delete all trades from Firebase"
                  >
                    <span>🗑️</span>
                    Clear All
                  </button>
                )}
              </div>
            </div>
            {/* 🎨 ASSET TERMINAL - Replace ConsolidatedPortfolioTable */}
            <div className="mb-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setPortfolioView('positions')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      background: portfolioView === 'positions' ? 'hsl(var(--primary))' : 'transparent',
                      color: portfolioView === 'positions' ? 'hsl(var(--primary-foreground))' : 'var(--dashboard-muted-foreground)',
                      border: `1px solid ${portfolioView === 'positions' ? 'hsl(var(--primary))' : 'var(--dashboard-chrome-border)'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Positions
                  </button>
                  <button
                    onClick={() => setPortfolioView('trades')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      background: portfolioView === 'trades' ? 'hsl(var(--primary))' : 'transparent',
                      color: portfolioView === 'trades' ? 'hsl(var(--primary-foreground))' : 'var(--dashboard-muted-foreground)',
                      border: `1px solid ${portfolioView === 'trades' ? 'hsl(var(--primary))' : 'var(--dashboard-chrome-border)'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Trades ({trades.length})
                  </button>
                  <button
                    onClick={() => setPortfolioView('notes')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      background: portfolioView === 'notes' ? 'hsl(var(--primary))' : 'transparent',
                      color: portfolioView === 'notes' ? 'hsl(var(--primary-foreground))' : 'var(--dashboard-muted-foreground)',
                      border: `1px solid ${portfolioView === 'notes' ? 'hsl(var(--primary))' : 'var(--dashboard-chrome-border)'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Notes
                  </button>
                </div>
              </div>
              {portfolioView === 'notes' ? (
                <div
                  className="dashboard-card"
                  style={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <PortfolioNotesPanel
                    tickers={noteTickers}
                    trades={displayTrades}
                    notes={portfolioNotes.notes}
                    onHoldingNoteChange={portfolioNotes.setHoldingNote}
                    onTradeNoteChange={portfolioNotes.setTradeNote}
                    onRemoveOrphan={portfolioNotes.removeOrphan}
                    variant="terminal"
                  />
                </div>
              ) : (
              <AssetTerminal
                view={portfolioView}
                assets={(() => {
                  if (portfolioView === 'trades') {
                    // Transform trades to Asset format - use all trades (not displayTrades) to match positions page
                    const tradeAssets = trades.map(trade => ({
                      symbol: trade.ticker,
                      name: quotesData?.[trade.ticker]?.name || trade.ticker,
                      price: trade.price,
                      change: 0, // Not applicable for individual trades
                      holdings: trade.qty,
                      value: trade.qty * trade.price,
                      tradeId: trade.id,
                      date: trade.date,
                      type: trade.type,
                      qty: trade.qty,
                      mock: trade.mock
                    }));
                    
                    // Sort trades
                    return tradeAssets.sort((a, b) => {
                      let aValue: any, bValue: any;
                      switch (sortBy) {
                        case 'symbol':
                          return sortOrder === 'asc' 
                            ? a.symbol.localeCompare(b.symbol)
                            : b.symbol.localeCompare(a.symbol);
                        case 'date':
                          aValue = a.date ? new Date(a.date).getTime() : 0;
                          bValue = b.date ? new Date(b.date).getTime() : 0;
                          break;
                        case 'type':
                          return sortOrder === 'asc' 
                            ? (a.type || '').localeCompare(b.type || '')
                            : (b.type || '').localeCompare(a.type || '');
                        case 'qty':
                          aValue = a.qty || 0;
                          bValue = b.qty || 0;
                          break;
                        case 'price':
                          aValue = a.price;
                          bValue = b.price;
                          break;
                        case 'value':
                        default:
                          aValue = a.value;
                          bValue = b.value;
                          break;
                      }
                      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                    });
                  } else {
                    // Positions view (existing logic)
                    const assets = Object.values(positions).map(pos => ({
                      symbol: pos.ticker,
                      name: quotesData?.[pos.ticker]?.name || pos.ticker,
                      price: pos.currentPrice,
                      change: quotesData?.[pos.ticker]?.changePct || pos.unrealizedPLPercent || 0,
                      holdings: pos.shares,
                      value: pos.currentValue
                    }));
                    
                    // Sort based on sortBy and sortOrder
                    return assets.sort((a, b) => {
                      let aValue: number, bValue: number;
                      switch (sortBy) {
                        case 'symbol':
                          return sortOrder === 'asc' 
                            ? a.symbol.localeCompare(b.symbol)
                            : b.symbol.localeCompare(a.symbol);
                        case 'price':
                          aValue = a.price;
                          bValue = b.price;
                          break;
                        case 'change':
                          aValue = a.change;
                          bValue = b.change;
                          break;
                        case 'weight':
                          aValue =
                            totalPortfolioValue > 0 ? (a.value / totalPortfolioValue) * 100 : 0;
                          bValue =
                            totalPortfolioValue > 0 ? (b.value / totalPortfolioValue) * 100 : 0;
                          break;
                        case 'value':
                        default:
                          aValue = a.value;
                          bValue = b.value;
                          break;
                      }
                      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                    });
                  }
                })()}
                totalPortfolioValue={totalPortfolioValue}
                onEdit={(asset) => {
                  // Scroll to add trade form
                  const addTradeSection = document.getElementById('add-trade');
                  if (addTradeSection) {
                    addTradeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                onDelete={(symbol) => {
                  const tradesToDelete = trades.filter(t => t.ticker === symbol);
                  setDeleteConfirm({
                    isOpen: true,
                    symbol,
                    count: tradesToDelete.length
                  });
                }}
                setShowImportModal={setShowImportModal}
                onSort={(column: 'symbol' | 'price' | 'change' | 'value' | 'weight' | 'date' | 'type' | 'qty') => {
                  if (sortBy === column) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(column);
                    setSortOrder('desc');
                  }
                }}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
              )}
            </div>
          </div>
        )}

        {/* Operations footer — live data pipeline status (below holdings narrative) */}
        {trades.length > 0 && (
          <div
            className="dashboard-card"
            style={{ marginTop: '8px', marginBottom: '32px' }}
            data-tour="price-pipeline-health"
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'hsl(var(--muted-foreground))',
                marginBottom: '12px',
              }}
            >
              Operations · Price Pipeline Health
            </div>
            <PricePipelineHealth />
          </div>
        )}

        {/* Empty State: Mobile handoff (Mandate 3) vs Desktop 3-step CSV onboarding */}
        {trades.length === 0 && isMobile && (
          <div
            style={{
              padding: '32px 24px',
              background: 'var(--surface-hover, hsl(var(--muted) / 0.3))',
              border: '1px solid var(--dashboard-chrome-border-subtle)',
              borderRadius: '12px',
              marginBottom: '12px',
            }}
          >
            <p style={{ margin: '0 0 20px', fontSize: '16px', lineHeight: 1.5, color: 'hsl(var(--foreground))' }}>
              Pocket Portfolio is a desktop-grade pro tool. Enter your email to send a secure setup link to your computer.
            </p>
            {setupLinkSent ? (
              <p style={{ margin: 0, fontSize: '14px', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                Check your email — we sent you a link to get started on desktop.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  value={setupLinkEmail}
                  onChange={(e) => { setSetupLinkEmail(e.target.value); setSetupLinkError(null); }}
                  placeholder="you@example.com"
                  disabled={setupLinkSending}
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontSize: '16px',
                    border: '1px solid var(--dashboard-chrome-border-subtle)',
                    borderRadius: '8px',
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    boxSizing: 'border-box',
                  }}
                  aria-label="Email for setup link"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const email = setupLinkEmail.trim();
                    if (!email) {
                      setSetupLinkError('Please enter your email.');
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      setSetupLinkError('Please enter a valid email address.');
                      return;
                    }
                    setSetupLinkSending(true);
                    setSetupLinkError(null);
                    try {
                      const res = await fetch('/api/setup-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        throw new Error(data.error || data.message || `Request failed (${res.status})`);
                      }
                      setSetupLinkSent(true);
                      trackEvent('mobile_setup_requested');
                    } catch (err) {
                      setSetupLinkError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
                    } finally {
                      setSetupLinkSending(false);
                    }
                  }}
                  disabled={setupLinkSending}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--accent-warm)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: setupLinkSending ? 'wait' : 'pointer',
                    opacity: setupLinkSending ? 0.85 : 1,
                  }}
                >
                  {setupLinkSending ? 'Sending…' : 'Send Link'}
                </button>
                {setupLinkError && (
                  <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--danger, #ef4444)' }}>{setupLinkError}</p>
                )}
              </>
            )}
          </div>
        )}
        {trades.length === 0 && !isMobile && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            color: 'var(--dashboard-muted-foreground)',
            background: 'hsl(var(--card))',
            borderRadius: '12px',
            border: '1px solid var(--dashboard-chrome-border)',
            marginBottom: '12px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 24px 0', color: 'hsl(var(--foreground))' }}>
              Get started in 3 steps
            </h3>

            {/* Step 1: Export */}
            <div style={{ marginBottom: '20px', textAlign: 'left', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              <span style={{ display: 'inline-block', width: '28px', height: '28px', borderRadius: '50%', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: '700', lineHeight: '28px', marginRight: '12px', fontSize: '14px' }}>1</span>
              <strong style={{ color: 'hsl(var(--foreground))' }}>Export.</strong>{' '}
              Download your transaction history (.csv) from your broker.
              <span style={{ fontSize: '12px', color: 'var(--dashboard-muted-foreground)', marginLeft: '40px', display: 'block' }}>e.g. IBKR, Fidelity, Robinhood, Degiro</span>
            </div>

            {/* Step 2: Drop zone */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'inline-block', width: '28px', height: '28px', borderRadius: '50%', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: '700', lineHeight: '28px', marginRight: '12px', fontSize: '14px', verticalAlign: 'middle' }}>2</span>
              <strong style={{ color: 'hsl(var(--foreground))' }}>Drop.</strong>{' '}
              Drag and drop the file below. Your data never leaves your browser.
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setImportModalFile(null); setShowImportModal(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setImportModalFile(null); setShowImportModal(true); } }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.background = 'hsl(var(--muted) / 0.6)'; e.currentTarget.style.borderColor = 'hsl(var(--primary))'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.background = '';
                e.currentTarget.style.borderColor = '';
                const file = e.dataTransfer?.files?.[0];
                if (file && (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')) {
                  setImportModalFile(file);
                  setShowImportModal(true);
                }
              }}
              style={{
                border: '2px dashed var(--dashboard-chrome-border)',
                borderRadius: '12px',
                padding: '48px 24px',
                margin: '0 auto 24px',
                maxWidth: '560px',
                background: 'hsl(var(--muted) / 0.2)',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s'
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--dashboard-muted-foreground)' }}>Drop your CSV here or click to browse</span>
            </div>

            {/* Step 3: Analyze */}
            <div style={{ marginBottom: '28px', textAlign: 'left', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              <span style={{ display: 'inline-block', width: '28px', height: '28px', borderRadius: '50%', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: '700', lineHeight: '28px', marginRight: '12px', fontSize: '14px' }}>3</span>
              <strong style={{ color: 'hsl(var(--foreground))' }}>Analyze.</strong>{' '}
              Our local engine normalizes the data instantly.
            </div>

            {isPaidTier(tier) ? (
              <Link
                href="/settings"
                style={{
                  display: 'inline-block',
                  marginBottom: '16px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                  color: 'hsl(var(--primary-foreground))',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Configure Drive Sync
              </Link>
            ) : null}

            <button
              onClick={() => {
                void importTrades(buildDashboardDemoSeedTrades()).then(() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pp_dashboard_demo_auto_v1', 'manual');
                  }
                  setShowDemoTerminalBanner(true);
                  trackEvent('dashboard_demo_shown', { source: 'manual_button' });
                });
              }}
              style={{
                marginTop: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'hsl(var(--primary-foreground))',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              🎮 Play with Demo Data
            </button>
            <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--dashboard-muted-foreground)' }}>
              <Link href="/invite" style={{ color: 'hsl(var(--primary))', textDecoration: 'underline', fontWeight: '500' }}>
                Invite a friend to try Pocket Portfolio
              </Link>
            </p>
          </div>
        )}

          {/* News Section */}
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                Market News
              </div>
              <button 
                onClick={() => {
                  // Clear news cache
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('news_')) {
                      localStorage.removeItem(key);
                    }
                  });
                  // Force refresh
                  window.location.reload();
                }}
                  style={{ 
                  padding: '4px 8px',
                  background: 'hsl(var(--muted))',
                  border: `1px solid var(--dashboard-chrome-border)`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'var(--dashboard-muted-foreground)',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
            {newsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--dashboard-muted-foreground)' }}>Loading news...</div>
            ) : newsError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--danger))' }}>
                Failed to load news: {newsError}
              </div>
            ) : newsData && newsData.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {newsData.slice(0, showAllNews ? newsData.length : 3).map((article: any, index: number) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      background: 'hsl(var(--card))', 
                      borderRadius: '6px', 
                      border: `1px solid var(--dashboard-chrome-border)`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                      e.currentTarget.style.borderColor = 'hsl(var(--accent))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                      e.currentTarget.style.borderColor = 'var(--dashboard-chrome-border)';
                    }}
                    onClick={() => {
                      if (article.url) {
                        window.open(article.url, '_blank', 'noopener,noreferrer');
                      }
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '6px', 
                        color: 'hsl(var(--foreground))',
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--dashboard-muted-foreground)',
                        marginBottom: '6px',
                        lineHeight: '1.3'
                      }}>
                        {article.summary}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '10px',
                        color: 'var(--dashboard-muted-foreground)'
                      }}>
                        <span>
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'No date available'}
                        </span>
                        <span style={{ 
                          color: 'var(--brand)',
                          fontWeight: '500'
                        }}>
                          {article.source || 'Unknown source'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {newsData.length > 3 && (
                  <button
                    onClick={() => setShowAllNews(!showAllNews)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'transparent',
                      color: 'var(--brand)',
                      border: '1px solid var(--brand)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {showAllNews ? 'Show Less' : `Show All ${newsData.length} Articles`}
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--dashboard-muted-foreground)' }}>No news available</div>
            )}
          </div>

          {/* Live Prices */}
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
              Live Prices
            </div>
            {quotesLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--dashboard-muted-foreground)' }}>Loading prices...</div>
            ) : quotesError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--danger))' }}>
                Failed to load prices: {quotesError}
              </div>
            ) : quotesData && Object.keys(quotesData).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Table Header */}
              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '8px',
                  padding: '8px',
                  background: 'var(--surface-elevated)',
                borderRadius: '4px', 
                  border: '1px solid var(--dashboard-chrome-border-subtle)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--dashboard-muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Symbol</div>
                  <div style={{ textAlign: 'right' }}>Price</div>
                  <div style={{ textAlign: 'right' }}>Change</div>
              </div>
                
                {/* Table Rows */}
                {Object.entries(quotesData).slice(0, 5).map(([symbol, quote]: [string, any], index: number) => (
                  <div key={index} style={{ 
                  display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '8px',
                  padding: '8px',
                  background: 'var(--bg)',
                    borderRadius: '4px',
                    border: '1px solid var(--dashboard-chrome-border-subtle)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  >
                  <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: 'hsl(var(--foreground))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <CompanyLogo symbol={symbol} size={26} />
                      <span>{symbol}</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'hsl(var(--foreground))',
                      textAlign: 'right',
                      fontWeight: '500'
                    }}>
                      {quote?.currency === 'GBP' ? '£' : quote?.currency === 'GBp' ? '£' : '$'}{quote?.price?.toFixed(2) || 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: (quote?.changePct ?? 0) >= 0 ? 'var(--signal)' : 'var(--danger)',
                      fontWeight: '600',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px'
                    }}>
                      {(quote?.changePct ?? 0) >= 0 ? '↗' : '↘'}
                      {quote?.changePct != null ? (quote.changePct >= 0 ? '+' : '') + Number(quote.changePct).toFixed(2) + '%' : 'N/A%'}
                    </div>
                </div>
              ))}
                
                {/* Real-time indicator */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  fontSize: '10px',
                  color: 'var(--dashboard-muted-foreground)',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--signal)',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  Live data • Updates every 30s
            </div>
          </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No price data available</div>
            )}
          </div>

          {/* Most Traded */}
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
              Most Traded Stocks
            </div>
            {marketLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading market data...</div>
            ) : marketError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--danger)' }}>
                Failed to load market data: {marketError}
              </div>
            ) : marketData && marketData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '8px',
                  padding: '8px',
                  background: 'var(--surface-elevated)',
                  borderRadius: '4px',
                  border: '1px solid var(--dashboard-chrome-border-subtle)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--dashboard-muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Symbol</div>
                  <div style={{ textAlign: 'right' }}>Price</div>
                  <div style={{ textAlign: 'right' }}>Change</div>
                </div>
                
                {/* Table Rows */}
                {marketData.slice(0, 5).map((stock: any, index: number) => (
                  <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '8px',
                    padding: '8px',
                    background: 'var(--bg)',
                    borderRadius: '4px',
                    border: '1px solid var(--dashboard-chrome-border-subtle)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: 'hsl(var(--foreground))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <CompanyLogo symbol={stock.symbol} size={26} />
                      <span>{stock.symbol}</span>
          </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'hsl(var(--foreground))',
                      textAlign: 'right',
                      fontWeight: '500'
                    }}>
                      {stock.currency === 'GBP' ? '£' : stock.currency === 'GBp' ? '£' : '$'}{stock.price?.toFixed(2) || 'N/A'}
          </div>
          <div style={{ 
                      fontSize: '11px', 
                      color: (stock.changePct ?? 0) >= 0 ? 'var(--signal)' : 'var(--danger)',
                      fontWeight: '600',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px'
                    }}>
                      {(stock.changePct ?? 0) >= 0 ? '↗' : '↘'}
                      {stock.changePct != null ? (stock.changePct >= 0 ? '+' : '') + Number(stock.changePct).toFixed(2) + '%' : 'N/A%'}
              </div>
            </div>
                ))}
                
                {/* Real-time indicator */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  fontSize: '10px',
                  color: 'var(--dashboard-muted-foreground)',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--warning)',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  Market data • Updates every 30s
              </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No market data available</div>
              )}
            </div>
            
          {/* Settings */}
          <div id="settings" className="mobile-card brand-card brand-grid" style={{ 
            marginBottom: '12px',
            padding: '12px',
            background: 'hsl(var(--card))',
            borderRadius: '8px',
            border: `1px solid var(--dashboard-chrome-border)`,
            scrollMarginTop: '80px'
          }}>
            {isAuthenticated && user ? (
              <>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                Settings
              </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Signed in as: {user.displayName || user.email}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Portfolio: {trades.length} trades
                </div>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                background: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--dashboard-chrome-border-subtle)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'var(--text)', 
                  margin: '0 0 8px 0' 
                }}>
                  Sign In Required
                </h3>
                <p style={{ 
                  color: 'var(--dashboard-muted-foreground)', 
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Sign in to access your account settings
                </p>
              </div>
            )}
          </div>

          {/* Referral Program */}
          {isAuthenticated && user && (
            <div className="mobile-card brand-card" style={{ 
              marginBottom: '12px',
              padding: '0',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--dashboard-chrome-border)',
              overflow: 'hidden'
            }}>
              <ReferralProgram userId={user.uid} />
            </div>
          )}

      </div>

      {/* Delete All Trades Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete All Trades"
        message="Are you sure you want to delete ALL trades from your account? This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        type="delete"
        onConfirm={confirmDeleteAllTrades}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />

      {/* Delete Individual Trades Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Trades"
        message={`Delete all ${deleteConfirm.count} trades for ${deleteConfirm.symbol}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        onConfirm={() => {
          const tradesToDelete = trades.filter(t => t.ticker === deleteConfirm.symbol);
          tradesToDelete.forEach(t => handleDeleteTrade(t.id));
          setDeleteConfirm({ isOpen: false, symbol: '', count: 0 });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, symbol: '', count: 0 })}
      />

      {/* Alert Modal */}
      {alertModalData && (
        <AlertModal
          isOpen={showAlertModal}
          title={alertModalData.title}
          message={alertModalData.message}
          type={alertModalData.type}
          onClose={() => setShowAlertModal(false)}
        />
      )}

      {/* Feature Announcement Modal */}
      <FeatureAnnouncementModal
        isOpen={showFeatureAnnouncement}
        onClose={handleCloseAnnouncement}
      />

      {/* Weekly Portfolio Snapshot toast (7-day return, local-only P&L) */}
      <WeeklySnapshotToast
        show={showWeeklySnapshotToast}
        onDismiss={dismissWeeklySnapshotToast}
        summary={{ totalInvested, unrealizedPL: totalUnrealizedPL }}
      />
    </>
  );
}
