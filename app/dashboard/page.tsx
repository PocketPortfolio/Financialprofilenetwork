'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SimplePieChart from '../components/SimplePieChart';
import PortfolioChart from '../components/PortfolioChart';
import Logo from '../components/Logo';
import TickerSearch from '../components/TickerSearch';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CSVImporter from '../components/CSVImporter';
import AccountManagement from '../components/AccountManagement';
import ConsolidatedPortfolioTable from '../components/ConsolidatedPortfolioTable';
import PricePipelineHealth from '../components/PricePipelineHealth';
import SEOHead from '../components/SEOHead';
import StructuredData, { webAppData } from '../components/StructuredData';
import { useQuotes, useNews, useMarketData } from '../hooks/useDataFetching';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
// import { usePortfolios } from '../hooks/usePortfolios';
// import PortfolioSelector from '../components/PortfolioSelector';
import { getDeviceInfo } from '../lib/utils/device';
import { initializeMobileAnalytics } from '../lib/analytics/device';
import MobileHeader from '../components/nav/MobileHeader';
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
  currency?: string;
}

export default function Dashboard() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  // const { selectedPortfolio, selectedPortfolioId } = usePortfolios();
  const { trades, addTrade, deleteTrade, importTrades, migrateTrades, deleteAllTrades, totalInvested: useTradesTotalInvested, totalTrades: useTradesTotalTrades, totalPositions: useTradesTotalPositions } = useTrades();
  
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
  
  // Clean and filter valid tickers (memoized to prevent infinite loops)
  const userTickers = useMemo(() => {
  const rawTickers = trades.map(trade => trade.ticker);
  const invalidPatterns = ['ADR', 'INC.', 'CORPORATION', 'COMPANY', 'CO.', 'LTD', 'LLC', 'INC', 'CORP'];
  
    return Array.from(new Set(
    rawTickers
      .filter(ticker => {
        const normalized = ticker.trim().toUpperCase();
        const isValid = !invalidPatterns.includes(normalized) && 
                       normalized.length >= 2 && 
                       normalized.length <= 10;
        if (!isValid) {
          console.log(`⚠️ Filtering out invalid ticker: "${ticker}"`);
        }
        return isValid;
      })
  ));
  }, [trades]);
  
  // Debug: Log all tickers being processed (reduced logging)
  // if (trades.length > 0) {
  //   console.log('🔍 All trades:', trades.length);
  //   console.log('🔍 Filtered valid tickers:', userTickers);
  // }
  
  const quotesResponse = useQuotes(userTickers);
  const newsResponse = useNews(userTickers.length > 0 ? userTickers : ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'], 5);
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
  }, [userTickers.length]); // Only depend on length to prevent infinite loops
  
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

  const deviceInfo = getDeviceInfo();

  // Initialize analytics
  useEffect(() => {
    initializeMobileAnalytics();
  }, []);

  // Mobile detection for hamburger menu
  useEffect(() => {
    const checkMobile = () => {
      setShowHamburger(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate portfolio metrics (excluding mock trades)
  const realTrades = trades.filter(trade => !trade.mock);
  
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
  
  // DATA INTEGRITY: Validate all trades
  const validationResult = validateTrades(realTrades);
  
  // Log validation results only if there are errors or warnings (and not already logged)
  if (validationResult.errors.length > 0 || validationResult.warnings.length > 0) {
    if (!window.validationErrorsLogged) {
      console.group('📊 PORTFOLIO DATA VALIDATION');
      if (validationResult.errors.length > 0) {
        console.error('❌ Errors found:');
        validationResult.errors.forEach(error => console.error('  ', error));
      }
      if (validationResult.warnings.length > 0) {
        console.warn('⚠️  Warnings:');
        validationResult.warnings.forEach(warning => console.warn('  ', warning));
      }
      console.groupEnd();
      window.validationErrorsLogged = true;
    }
  } else if (realTrades.length > 0 && !window.validationSuccessLogged) {
    console.log('✅ All trades validated successfully:', realTrades.length, 'trades');
    window.validationSuccessLogged = true;
  }
  
  const positions = realTrades.reduce((acc: { [key: string]: Position }, trade) => {
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
        currency: trade.currency || 'USD'
      };
    }
    
    if (type === 'BUY') {
      const totalCost = acc[ticker].shares * acc[ticker].avgCost + qty * price;
      acc[ticker].shares += qty;
      acc[ticker].avgCost = totalCost / acc[ticker].shares;
      
      // Debug: Log position updates (reduced logging)
      // console.log(`🔍 Position update for ${ticker}:`, { tradeQty: qty, tradePrice: price });
    } else {
      // For SELL trades, reduce shares but keep the same average cost
      // The average cost represents the cost basis of the remaining shares
      acc[ticker].shares -= qty;
      // avgCost remains unchanged for remaining shares
    }
    
    acc[ticker].totalTrades += 1;
    acc[ticker].lastTradeDate = date;
    acc[ticker].isMock = false;
    
    return acc;
  }, {});

  // Get current prices and calculate P&L
  Object.values(positions).forEach(position => {
    const quote = quotesData?.[position.ticker];
    if (quote && typeof quote === 'object' && 'price' in quote && quote.price > 0) {
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
      
      // Debug: Log when quotes are missing for positions
      if (position.shares > 0) {
        console.warn(`⚠️ No quote data for ${position.ticker}, shares: ${position.shares}, avgCost: ${position.avgCost}`);
      }
    }
  });

  // Convert all positions to USD for portfolio totals
  // Note: In a real app, you'd use live exchange rates
  const GBP_TO_USD = 1.27; // Approximate exchange rate
  
  // Use values from useTrades hook for consistency
  const totalInvested: number = useTradesTotalInvested;
  const totalTrades: number = useTradesTotalTrades;
  const totalPositions: number = useTradesTotalPositions;
  
  const totalUnrealizedPL = Object.values(positions).reduce((sum, pos) => {
    if (pos.currency === 'GBP') {
      return sum + (pos.unrealizedPL * GBP_TO_USD);
    }
    return sum + pos.unrealizedPL; // USD
  }, 0);
  
  const totalUnrealizedPLPercent = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;
  
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
      
      // Only log if we haven't logged this exact data set yet
      if (!(window as any).lastLoggedPortfolioData || (window as any).lastLoggedPortfolioData !== dataKey) {
        console.group('📈 PORTFOLIO SUMMARY');
        console.log('Total Invested:', `$${totalInvested.toFixed(2)}`);
        console.log('Total Current Value:', `$${(totalInvested + totalUnrealizedPL).toFixed(2)}`);
        console.log('Total Unrealized P/L:', `$${totalUnrealizedPL.toFixed(2)} (${totalUnrealizedPLPercent.toFixed(2)}%)`);
        console.log('Total Positions:', totalPositions);
        console.log('Total Trades:', totalTrades);
        console.log('Tickers:', Object.keys(positions).join(', '));
        console.groupEnd();
        (window as any).lastLoggedPortfolioData = dataKey;
      }
    }
  }, [realTrades.length, totalInvested, totalUnrealizedPL, totalUnrealizedPLPercent, totalPositions, totalTrades, positions, quotesData]);

  const handleAddTrade = async () => {
    if (!newTrade.symbol || !newTrade.quantity || !newTrade.price) {
      alert('Please fill in all required fields');
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
      } catch (error) {
        console.error('Error adding trade:', error);
      alert('Failed to add trade. Please try again.');
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId);
      console.log('✅ Trade deleted successfully:', tradeId);
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      
      // The error is already handled in useTrades.ts, which removes it from local state
      // So we don't need to show an alert here - the deletion is effective from the user's perspective
    }
  };

  const handleCSVImport = async (csvData: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      await importTrades(csvData);
    } catch (error) {
      console.error('Error importing trades:', error);
      alert('Failed to import trades. Please try again.');
    }
  };

  const handleClearAllTrades = async () => {
    if (!isAuthenticated || !user) {
      alert('You must be signed in to clear trades.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete ALL trades from your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const deletedCount = await deleteAllTrades();
      alert(`Successfully deleted ${deletedCount} trade(s) from your account.`);
    } catch (error) {
      console.error('Error clearing all trades:', error);
      alert('Failed to clear trades. Please try again.');
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
        canonical="https://pocketportfolio.app/dashboard"
        ogImage="/brand/preview-dashboard.svg"
        ogType="website"
      />
      
      <StructuredData type="WebApplication" data={webAppData} />

      {/* Mobile Header */}
      <MobileHeader title="Dashboard" />

      {/* Portfolio Selector */}
      {/* <PortfolioSelector /> */}

      <div className="mobile-container main-content" style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        paddingBottom: 'calc(var(--touch-target-large) + var(--safe-area-bottom))'
      }}>
      {/* Main Content - Compact Financial Layout */}
      <main className="mobile-container" style={{ 
          padding: '16px 12px', 
        maxWidth: '100%',
          boxSizing: 'border-box',
          paddingTop: '16px'
      }}>
        {/* Compact Summary Row */}
            <div className="mobile-card brand-card brand-candlestick brand-grid" style={{ 
          marginBottom: '12px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
            boxSizing: 'border-box',
            padding: '16px',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
            borderRadius: '12px',
            border: '2px solid var(--border-warm)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>Total Invested</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                ${trades.length > 0 ? totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>Trades</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                {trades.length > 0 ? totalTrades : '0'}
            </div>
          </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>Positions</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                {trades.length > 0 ? totalPositions : '0'}
            </div>
          </div>
        </div>


          {/* Price Pipeline Health */}
          <div className="mobile-card brand-card brand-grid" style={{ 
            marginBottom: '12px',
            padding: '12px',
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
              Price Pipeline Health
              </div>
            <PricePipelineHealth />
            </div>

          {/* P&L Summary */}
        {trades.length > 0 && (
            <div className="mobile-card brand-card brand-sparkline brand-spine" style={{ 
          marginBottom: '12px',
            padding: '12px',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
          }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Unrealized P&L</div>
            <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: totalUnrealizedPL >= 0 ? 'var(--signal)' : 'var(--danger)'
                }}>
                  ${totalUnrealizedPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ 
                fontSize: '12px', 
                color: totalUnrealizedPL >= 0 ? 'var(--signal)' : 'var(--danger)',
                fontWeight: '500'
              }}>
                {totalUnrealizedPL >= 0 ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}%
              </div>
            </div>
        )}

          {/* Authentication Status */}
          {isAuthenticated && user ? (
            <div style={{ marginBottom: '12px' }}>
          <AccountManagement 
            user={user} 
            trades={trades}
            onAccountDeleted={() => {
              window.location.href = '/';
            }}
          />
            </div>
          ) : (
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>
                Sign in to save your portfolio data
              </p>
            </div>
          )}

          {/* Add Trade Form */}
          <div className="mobile-card brand-card brand-candlestick brand-spine" style={{ 
            marginBottom: '12px',
            padding: '16px',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
            borderRadius: '12px',
            border: '2px solid var(--border-warm)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'visible',
            zIndex: 1
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
              Add Trade
            </div>
            {/* Symbol Search - Aligned with other form fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '8px', position: 'relative', zIndex: 1000 }}>
                  <TickerSearch
                onTickerSelect={(ticker) => setNewTrade({ ...newTrade, symbol: ticker })}
                placeholder="Symbol (e.g., AAPL)"
                  />
                </div>
            
            {/* Trade Type and Quantity Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select
                value={newTrade.type}
                onChange={(e) => setNewTrade({ ...newTrade, type: e.target.value as 'buy' | 'sell' })}
                    style={{
                      padding: '8px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                  </select>
                  <input
                    type="number"
                placeholder="Quantity"
                value={newTrade.quantity}
                onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                    style={{ 
                      padding: '8px', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                  />
                </div>
            {/* Price and Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                step="0.01"
                placeholder="Price"
                value={newTrade.price}
                onChange={(e) => setNewTrade({ ...newTrade, price: e.target.value })}
                    style={{ 
                      padding: '8px', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
              />
              <input
                type="date"
                value={newTrade.date}
                onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })}
                style={{ 
                  padding: '8px', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                  />
                </div>
            {/* Fees Row */}
            <div style={{ marginBottom: '8px' }}>
                    <input
                      type="number"
                step="0.01"
                placeholder="Fees (optional)"
                value={newTrade.fees}
                onChange={(e) => setNewTrade({ ...newTrade, fees: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
              />
                    </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                id="mock-trade"
                    checked={isMockTrade}
                    onChange={(e) => setIsMockTrade(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              <label htmlFor="mock-trade" style={{ fontSize: '12px', color: 'var(--text)' }}>
                Mock trade (for testing)
                  </label>
                </div>
                <button
              onClick={handleAddTrade}
                  style={{ 
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                    color: 'white', 
                border: '2px solid var(--border-warm)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>➕</span>
              Add Trade
                </button>
              </div>

          {/* CSV Import */}
            <div className="mobile-card brand-card brand-grid" style={{ 
              marginBottom: '12px',
              padding: '12px',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
                <CSVImporter onImport={handleCSVImport} />
            </div>

          {/* Portfolio Chart - Simple 3D Pie Chart */}
          {trades.length > 0 && (
            <div className="mobile-card brand-card brand-sparkline brand-spine" style={{ 
              marginBottom: '12px',
              padding: '12px',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                  {chartType === 'pie' ? 'Portfolio Allocation' : 'Portfolio Performance'}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setChartType('pie')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'pie' ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)' : 'transparent',
                      color: chartType === 'pie' ? 'white' : 'var(--text)',
                      border: chartType === 'pie' ? '2px solid var(--border-warm)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: chartType === 'pie' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    Pie
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'line' ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)' : 'transparent',
                      color: chartType === 'line' ? 'white' : 'var(--text)',
                      border: chartType === 'line' ? '2px solid var(--border-warm)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: chartType === 'line' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
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
          <div style={{ 
            marginTop: '32px',
            marginBottom: '32px'
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
                    background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
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
                      color: 'var(--muted)', 
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
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
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
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--muted)';
                      e.currentTarget.style.borderColor = 'var(--border)';
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
            <ConsolidatedPortfolioTable 
              positions={Object.values(positions)}
              onDeleteTrade={handleDeleteTrade}
              onViewTrades={() => {}}
              trades={trades}
              noCard={true}
            />
          </div>
        )}

          {/* News Section */}
          <div className="mobile-card brand-card brand-grid" style={{ 
            marginBottom: '12px',
            padding: '12px',
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
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
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: 'var(--muted)',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
                  </div>
            {newsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading news...</div>
            ) : newsError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--danger)' }}>
                Failed to load news: {newsError}
              </div>
            ) : newsData && newsData.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {newsData.slice(0, showAllNews ? newsData.length : 3).map((article: any, index: number) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      background: 'var(--bg)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-elevated)';
                      e.currentTarget.style.borderColor = 'var(--brand)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
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
                        color: 'var(--text)',
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--muted)',
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
                        color: 'var(--muted)'
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
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No news available</div>
            )}
          </div>

          {/* Live Prices */}
          <div className="mobile-card brand-card brand-sparkline" style={{ 
            marginBottom: '12px',
            padding: '12px',
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
              Live Prices
            </div>
            {quotesLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading prices...</div>
            ) : quotesError ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--danger)' }}>
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
                  color: 'var(--muted)',
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
                      color: 'var(--text)',
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
                      color: 'var(--text)',
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
                  color: 'var(--muted)',
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
          <div className="mobile-card brand-card brand-candlestick" style={{ 
            marginBottom: '12px',
              padding: '12px', 
            background: 'var(--surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
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
                  color: 'var(--muted)',
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
                      color: 'var(--text)',
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
                      color: 'var(--text)',
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
                  color: 'var(--muted)',
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
          {isAuthenticated && user && (
            <div className="mobile-card brand-card brand-grid" style={{ 
              marginBottom: '12px',
              padding: '12px',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                Settings
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Signed in as: {user.displayName || user.email}
            </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Portfolio: {trades.length} trades
          </div>
        </div>
          )}
      </main>


      {/* Footer */}
      <footer className="mobile-container" style={{ 
        marginTop: 'clamp(40px, 8vw, 80px)', 
        paddingTop: 'clamp(20px, 4vw, 32px)', 
        borderTop: '1px solid var(--card-border)', 
          textAlign: 'center',
        background: 'var(--chrome)', 
        padding: 'clamp(20px, 4vw, 32px) clamp(12px, 3vw, 24px)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          maxWidth: '100%', 
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              © 2025 Pocket Portfolio — Built with the community.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            marginBottom: '32px', 
            flexWrap: 'wrap' 
          }}>
            <Link href="/openbrokercsv" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              OpenBrokerCSV
            </Link>
            <Link href="/static/portfolio-tracker" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Portfolio Tracker
            </Link>
            <Link href="/csv/etoro-to-openbrokercsv" style={{ 
              padding: '12px 24px', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              eToro → OpenBrokerCSV
            </Link>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a 
              href="https://github.com/pocketportfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              GitHub
            </a>
            <a 
              href="https://discord.gg/Ch9PpjRzwe" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              Discord
            </a>
            <Link 
              href="/landing" 
              style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              About
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
