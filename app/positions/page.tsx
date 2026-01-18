'use client';

import React, { useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import ConsolidatedPortfolioTable from '../components/ConsolidatedPortfolioTable';
import { Trade } from '../services/tradeService';
import { useQuotes } from '../hooks/useDataFetching';
import { BrandProvider } from '../lib/brand/theme';
import AlertModal from '../components/modals/AlertModal';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import FoundersClubBanner from '../components/FoundersClubBanner';

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

export default function PositionsPage() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  const { trades, deleteTrade } = useTrades();
  const { syncState } = useGoogleDrive();
  const { tier } = usePremiumTheme();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<{title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Map tier to data-tier attribute for CSS targeting
  const getTierForDataAttribute = (tier: string | null): 'free' | 'founder' | 'corporate' => {
    if (tier === 'foundersClub') return 'founder';
    if (tier === 'corporateSponsor') return 'corporate';
    return 'free';
  };

  // Debug: Log trades state changes (disabled to reduce console noise)
  // React.useEffect(() => {
  //   console.log('🔍 Positions page trades updated:', {
  //     tradesLength: trades.length,
  //     trades: trades.map(t => ({ id: t.id, ticker: t.ticker, type: t.type }))
  //   });
  //   if (trades.length === 0) {
  //     console.warn('⚠️ POSITIONS PAGE: No trades found!');
  //   }
  // }, [trades]);

  // First, calculate basic positions from trades to get tickers
  const basicPositions = React.useMemo(() => {
    const realTrades = trades.filter(trade => !trade.mock);
    
    const positionMap = realTrades.reduce((acc: { [key: string]: Position }, trade) => {
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
      } else {
        acc[ticker].shares -= qty;
      }
      
      acc[ticker].totalTrades += 1;
      acc[ticker].lastTradeDate = date;
      
      return acc;
    }, {});

    return Object.values(positionMap).filter(pos => pos.shares > 0);
  }, [trades]);

  // Extract tickers from basic positions for quotes fetching
  const tickers = basicPositions.map(pos => pos.ticker);
  const { data: quotesData } = useQuotes(tickers);

  // Calculate final positions with live price data
  const positions: Position[] = React.useMemo(() => {
    return basicPositions.map(position => {
      const quote = quotesData?.[position.ticker];
      if (quote && quote.price) {
        // Convert GBp (pence) to GBP (pounds) for UK stocks
        if (quote.currency === 'GBp') {
          position.currentPrice = quote.price / 100; // Convert pence to pounds
          position.currency = 'GBP'; // Update currency to GBP
        } else {
          position.currentPrice = quote.price;
          position.currency = quote.currency;
        }
        
        position.currentValue = position.shares * position.currentPrice;
        position.unrealizedPL = position.currentValue - (position.shares * position.avgCost);
        position.unrealizedPLPercent = position.avgCost > 0 ? (position.unrealizedPL / (position.shares * position.avgCost)) * 100 : 0;
      }
      return position;
    });
  }, [basicPositions, quotesData]);

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId);
    } catch (error) {
      console.error('Error deleting trade:', error);
      // Show user-friendly message
      if (error instanceof Error && (error.message.includes('permissions') || error.message.includes('Missing or insufficient permissions'))) {
        setAlertModalData({
          title: 'Permission Error',
          message: 'Unable to delete this trade. It may have been created before sign-in. Try deleting from localStorage or re-importing your data.',
          type: 'warning'
        });
      } else {
        setAlertModalData({
          title: 'Error',
          message: 'Failed to delete trade. Please try again.',
          type: 'error'
        });
      }
      setShowAlertModal(true);
    }
  };

  const handleViewTrades = (ticker: string) => {
    // Navigate to trades view for specific ticker
    console.log(`View trades for ${ticker}`);
  };

  if (!isAuthenticated) {
    return (
      <div 
        data-tier={getTierForDataAttribute(tier)}
        className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <SEOHead 
          title="Positions - Pocket Portfolio"
          description="View your portfolio positions and holdings"
        />
        <SovereignHeader 
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'} 
          user={user}
        />
        <FoundersClubBanner />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          paddingTop: 'calc(64px + 48px + 4px)' // Header (64px) + Banner (~48px) + gap (4px)
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to view positions</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Access your portfolio positions and holdings
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-tier={getTierForDataAttribute(tier)}
      className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <SEOHead 
        title="Positions - Pocket Portfolio"
        description="View your portfolio positions and holdings"
      />
      <SovereignHeader 
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'} 
        user={user}
      />
      <FoundersClubBanner />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        paddingTop: 'calc(64px + 48px + 4px)', // Header (64px) + Banner (~48px) + gap (4px)
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
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
                Portfolio Positions
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
        </div>

        {positions.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No positions found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Start by adding some trades to see your positions here
            </p>
            <a 
              href="/dashboard"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`,
                color: 'hsl(var(--primary-foreground))',
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <ConsolidatedPortfolioTable
            trades={trades}
            positions={positions}
            onDeleteTrade={handleDeleteTrade}
            onViewTrades={handleViewTrades}
          />
        )}
      </main>
      
      {alertModalData && (
        <AlertModal
          isOpen={showAlertModal}
          title={alertModalData.title}
          message={alertModalData.message}
          type={alertModalData.type}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </div>
  );
}
