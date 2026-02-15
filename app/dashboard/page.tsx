'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import SimplePieChart from '../components/SimplePieChart';
import PortfolioChart from '../components/PortfolioChart';
import PortfolioAllocationChart from '../components/portfolio/PortfolioAllocationChart';
import DrillDownChart from '../components/portfolio/DrillDownChart';
import PortfolioPerformanceChart from '../components/portfolio/PortfolioPerformanceChart';
import AnalyticsPanel from '../components/portfolio/AnalyticsPanel';
import AllocationRecommendations from '../components/portfolio/AllocationRecommendations';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import SectorFilter from '../components/portfolio/SectorFilter';
import ReturnHeatMap from '../components/portfolio/ReturnHeatMap';
import SharePortfolio from '../components/portfolio/SharePortfolio';
import { usePortfolioStore } from '../lib/store/portfolioStore';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import { calculatePortfolioAnalytics } from '../lib/portfolio/analytics';
import { saveDailySnapshot } from '../lib/portfolio/snapshot';
import { usePortfolioNews } from '../hooks/useDataFetching';
import { getSectorSync } from '../lib/portfolio/sectorService';
import { GICSSector, GICS_SECTOR_INFO, normalizeSector } from '../lib/portfolio/sectorClassification';
import Logo from '../components/Logo';
import TickerSearch from '../components/TickerSearch';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CSVImporter from '../components/CSVImporter';
import AccountManagement from '../components/AccountManagement';
import ReferralProgram from '../components/viral/ReferralProgram';
import SyncUpgradeCTA from '../components/SyncUpgradeCTA';
import ConsolidatedPortfolioTable from '../components/ConsolidatedPortfolioTable';
import PricePipelineHealth from '../components/PricePipelineHealth';
import CloudStatusIcon from '../components/CloudStatusIcon';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import SEOHead from '../components/SEOHead';
import StructuredData, { webAppData } from '../components/StructuredData';
import { useQuotes, useNews, useMarketData } from '../hooks/useDataFetching';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import AlertModal from '../components/modals/AlertModal';
import FeatureAnnouncementModal from '../components/modals/FeatureAnnouncementModal';
// import { usePortfolios } from '../hooks/usePortfolios';
// import PortfolioSelector from '../components/PortfolioSelector';
import { getDeviceInfo } from '../lib/utils/device';
import { initializeMobileAnalytics } from '../lib/analytics/device';
import MobileHeader from '../components/nav/MobileHeader';
import OnboardingTour from '../components/OnboardingTour';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import { MorningBrief } from '../components/dashboard/MorningBrief';
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

export default function Dashboard() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  // const { selectedPortfolio, selectedPortfolioId } = usePortfolios();
  const { trades, addTrade, deleteTrade, importTrades, migrateTrades, deleteAllTrades, totalInvested: useTradesTotalInvested, totalTrades: useTradesTotalTrades, totalPositions: useTradesTotalPositions, refreshTrades } = useTrades();
  const { syncState, syncToDrive, checkForUpdates, recentlySyncedFromDrive, markDriveSyncComplete, markCsvImportStart, clearCsvImportFlag, markDeletionStart } = useGoogleDrive();
  const { tier } = usePremiumTheme();
  
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
  const [activeTab, setActiveTab] = useState<'performance' | 'insights'>('performance');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'value' | 'date' | 'type' | 'qty'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [portfolioView, setPortfolioView] = useState<'positions' | 'trades'>('positions');
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
    
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setShowHamburger(window.innerWidth <= 768);
      }, 150); // Debounce resize events to prevent flickering
    };
    
    checkMobile(); // Initial check
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

  // Calculate analytics
  const analytics = useMemo(() => {
    if (historicalSnapshots.length === 0) return null;
    return calculatePortfolioAnalytics(historicalSnapshots);
  }, [historicalSnapshots]);

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
        ogImage="/brand/preview-dashboard.svg"
        ogType="website"
      />
      
      <StructuredData type="WebApplication" data={webAppData} />

      {/* 🎨 CONTENT - Layout wrapper handles header/banner/tier injection */}
      <div>
          {/* 🎨 INTELLIGENCE LAYER - Above everything */}
          {trades.length > 0 && (
            <MorningBrief 
              netWorthChange={totalUnrealizedPLPercent}
              topMover={{
                symbol: Object.values(positions).length > 0 
                  ? Object.values(positions).reduce((prev, current) => 
                      Math.abs(current.unrealizedPLPercent) > Math.abs(prev.unrealizedPLPercent) 
                        ? current 
                        : prev
                    ).ticker || 'N/A'
                  : 'N/A',
                change: Object.values(positions).length > 0
                  ? Object.values(positions).reduce((prev, current) => 
                      Math.abs(current.unrealizedPLPercent) > Math.abs(prev.unrealizedPLPercent) 
                        ? current 
                        : prev
                    ).unrealizedPLPercent || 0
                  : 0
              }}
            />
          )}

          {/* 🎨 TERMINAL SUMMARY - Metrics Row */}
          <TerminalSummary
            totalInvested={totalInvested}
            totalTrades={totalTrades}
            totalPositions={totalPositions}
            totalUnrealizedPL={totalUnrealizedPL}
            totalUnrealizedPLPercent={totalUnrealizedPLPercent}
            loading={!trades || trades.length === 0}
          />


          {/* Price Pipeline Health */}
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
              Price Pipeline Health
            </div>
            <PricePipelineHealth />
          </div>


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
              onClick={() => setShowImportModal(false)}
            >
              <div 
                className="dashboard-card"
                style={{
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: 'hsl(var(--card))',
                  border: `1px solid hsl(var(--border))`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>Import CSV Data</h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'pointer',
                      fontSize: '24px',
                      padding: '4px 8px',
                      lineHeight: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    ×
                  </button>
                </div>
                <CSVImporter onImport={(trades) => {
                  handleCSVImport(trades);
                  setShowImportModal(false);
                }} />
              </div>
            </div>
          )}

          {/* Portfolio Dashboard - New Enhanced Version */}
          {trades.length > 0 && useNewDashboard && (
            <>
              {/* Analytics Panel */}
              {analytics && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <AnalyticsPanel analytics={analytics} loading={historyLoading} />
                </div>
              )}

              {/* Charts & Insights - Tabbed Interface */}
              <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                {/* Tab Navigation */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '16px', 
                  borderBottom: `1px solid hsl(var(--border))` 
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
                      color: activeTab === 'performance' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
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
                        e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
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
                      color: activeTab === 'insights' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
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
                        e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 768 ? '1fr' : '1fr 300px',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {/* Charts Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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

                  {/* Performance Chart - Hidden for now */}
                  {false && (
                    <PortfolioPerformanceChart
                      snapshots={historicalSnapshots}
                      timeRange={timeRange}
                      onTimeRangeChange={setStoreTimeRange}
                    />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                    />
                    <AllocationRecommendations
                      positions={Object.values(positions)}
                      totalValue={Object.values(positions).reduce(
                        (sum, pos) => sum + pos.currentValue,
                        0
                      )}
                      portfolioAnalytics={analytics}
                      historicalSnapshots={historicalSnapshots}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Portfolio Chart - Legacy Simple Version (fallback) */}
          {trades.length > 0 && !useNewDashboard && (
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
                      border: chartType === 'pie' ? 'none' : `1px solid hsl(var(--border))`,
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
                      border: chartType === 'line' ? `2px solid hsl(var(--accent))` : `1px solid hsl(var(--border))`,
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
                      color: 'hsl(var(--muted-foreground))', 
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
                      color: 'hsl(var(--muted-foreground))',
                      border: `1px solid hsl(var(--border))`,
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
                      e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 className="text-sm font-mono text-muted-foreground uppercase" style={{fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', margin: 0}}>
                  / Portfolio_Assets
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setPortfolioView('positions')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      background: portfolioView === 'positions' ? 'hsl(var(--primary))' : 'transparent',
                      color: portfolioView === 'positions' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                      border: `1px solid ${portfolioView === 'positions' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
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
                      color: portfolioView === 'trades' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                      border: `1px solid ${portfolioView === 'trades' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Trades ({trades.length})
                  </button>
                </div>
              </div>
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
                onSort={(column: 'symbol' | 'price' | 'change' | 'value' | 'date' | 'type' | 'qty') => {
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
            </div>
          </div>
        )}

        {/* Empty State with Demo Data Button */}
        {trades.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            color: 'hsl(var(--muted-foreground))',
            background: 'hsl(var(--card))',
            borderRadius: '12px',
            border: `1px solid hsl(var(--border))`,
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="hsl(var(--muted-foreground))" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="hsl(var(--muted-foreground))" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="hsl(var(--muted-foreground))" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="hsl(var(--muted-foreground))" strokeWidth="2"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: 'hsl(var(--foreground))' }}>
              No trades yet
            </h3>
            <p style={{ fontSize: '14px', margin: '0 0 24px 0', color: 'hsl(var(--muted-foreground))' }}>
              {(() => {
                const isPremium = tier === 'corporateSponsor' || tier === 'foundersClub';
                return isPremium 
                  ? 'Inject via JSON or add manually. Configure Drive Sync in Settings.'
                  : 'Import your CSV file or add trades manually to get started';
              })()}
            </p>
            {(() => {
              const isPremium = tier === 'corporateSponsor' || tier === 'foundersClub';
              if (isPremium) {
                return (
                  <Link
                    href="/settings"
                    style={{
                      display: 'inline-block',
                      marginBottom: '16px',
                      padding: '12px 24px',
                      background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
                      color: 'hsl(var(--primary-foreground))',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: `0 4px 12px hsla(var(--primary), 0.3)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 16px hsla(var(--primary), 0.4)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 12px hsla(var(--primary), 0.3)`;
                    }}
                  >
                    Configure Drive Sync
                  </Link>
                );
              }
              return null;
            })()}
            <button
              onClick={() => {
                // Inject demo trades (Apple, Tesla, NVIDIA)
                // CRITICAL: Set mock: true so demo trades are filtered out from real portfolio calculations
                const demoTrades = [
                  { 
                    ticker: 'AAPL', 
                    qty: 10, 
                    price: 150, 
                    date: new Date().toISOString().split('T')[0], 
                    type: 'BUY' as const,
                    currency: 'USD',
                    mock: true
                  },
                  { 
                    ticker: 'TSLA', 
                    qty: 5, 
                    price: 200, 
                    date: new Date().toISOString().split('T')[0], 
                    type: 'BUY' as const,
                    currency: 'USD',
                    mock: true
                  },
                  { 
                    ticker: 'NVDA', 
                    qty: 8, 
                    price: 400, 
                    date: new Date().toISOString().split('T')[0], 
                    type: 'BUY' as const,
                    currency: 'USD',
                    mock: true
                  },
                ];
                // Use importTrades to add all demo trades at once
                importTrades(demoTrades);
              }}
              style={{
                marginTop: '24px',
                padding: '16px 32px',
                background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)`,
                border: 'none',
                borderRadius: '12px',
                color: 'hsl(var(--primary-foreground))',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: 'hsl(var(--foreground) / 0.15) 0 4px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                maxWidth: '320px',
                margin: '24px auto 0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `hsl(var(--foreground) / 0.2) 0 6px 20px`;
                e.currentTarget.style.opacity = '0.95';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `hsl(var(--foreground) / 0.15) 0 4px 12px`;
                e.currentTarget.style.opacity = '1';
              }}
            >
              🎮 Play with Demo Data
            </button>
            <p style={{ marginTop: '20px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
              <Link
                href="/invite"
                style={{ color: 'hsl(var(--primary))', textDecoration: 'underline', fontWeight: '500' }}
              >
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
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'hsl(var(--muted-foreground))',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
            {newsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--muted-foreground))' }}>Loading news...</div>
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
                      border: `1px solid hsl(var(--border))`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                      e.currentTarget.style.borderColor = 'hsl(var(--accent))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--muted))';
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
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
                        color: 'hsl(var(--muted-foreground))',
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
                        color: 'hsl(var(--muted-foreground))'
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
              <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--muted-foreground))' }}>No news available</div>
            )}
          </div>

          {/* Live Prices */}
          <div className="dashboard-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
              Live Prices
            </div>
            {quotesLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--muted-foreground))' }}>Loading prices...</div>
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
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'hsl(var(--muted-foreground))',
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
                    border: '1px solid var(--border-subtle)',
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
                      gap: '4px'
                    }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                        background: 'var(--signal)',
                        animation: 'pulse 2s infinite'
                      }} />
                      {symbol}
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
                      color: (quote?.change || 0) >= 0 ? 'var(--signal)' : 'var(--danger)',
                      fontWeight: '600',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px'
                    }}>
                      {(quote?.change || 0) >= 0 ? '↗' : '↘'}
                      {(quote?.change || 0) >= 0 ? '+' : ''}{(quote?.change || 0).toFixed(2)}%
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
                  color: 'hsl(var(--muted-foreground))',
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
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'hsl(var(--muted-foreground))',
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
                    border: '1px solid var(--border-subtle)',
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
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--warning)',
                        animation: 'pulse 2s infinite'
                      }} />
                        {stock.symbol}
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
                      color: stock.change >= 0 ? 'var(--signal)' : 'var(--danger)',
                      fontWeight: '600',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px'
                    }}>
                      {stock.change >= 0 ? '↗' : '↘'}
                      {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2) || 'N/A'}%
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
                  color: 'hsl(var(--muted-foreground))',
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
            border: `1px solid hsl(var(--border))`,
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
                border: '1px solid var(--border-subtle)'
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
                  color: 'hsl(var(--muted-foreground))', 
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
              border: '1px solid var(--border)',
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
    </>
  );
}
