'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { useQuotes, useMarketData } from '../hooks/useDataFetching';
import { useAuth } from '../hooks/useAuth';
import { useStickyHeader } from '../hooks/useStickyHeader';

export default function LivePage() {
  const [loading, setLoading] = useState(true);
  
  // Ensure header stays visible when scrolling
  useStickyHeader('header.brand-spine');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user, signInWithGoogle, logout, isAuthenticated, loading: authLoading } = useAuth();

  // Popular symbols for live data
  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'BTC-USD', 'ETH-USD'];
  const { data: quotes, loading: quotesLoading, error: quotesError } = useQuotes(popularSymbols, 30000);
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update timestamp every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convert quotes to display format
  const livePrices = quotes ? Object.values(quotes).map(quote => ({
    ticker: quote.symbol,
    name: quote.name,
    price: quote.price || 0,
    change: quote.change || 0,
    changePct: quote.changePct || 0,
    volume: 'N/A',
    marketCap: 'N/A',
    source: quote.source
  })) : [];

  const isLoading = loading || quotesLoading || marketLoading;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ 
          borderBottom: '1px solid var(--card-border)', 
          background: 'var(--chrome)', 
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo size="medium" showWordmark={true} />
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href="/app" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/live" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Live</Link>
              </div>
              
              <ThemeSwitcher />
              
              {isAuthenticated && user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{user.displayName || user.email}</span>
                  <button 
                    onClick={logout}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card)'}
                  >
                    Sign out from Google
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--brand)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 90%, black)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--brand)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Loading live prices...</h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)' }}>Fetching real-time market data</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Live Market Data - Real-Time Stock & Crypto Prices"
        description="Get real-time stock and cryptocurrency prices with live market data from Yahoo Finance. Track popular stocks like AAPL, GOOGL, MSFT, TSLA, NVDA and crypto like BTC, ETH with live updates."
        keywords={[
          'live stock prices',
          'real-time market data',
          'crypto prices',
          'stock quotes',
          'live trading data',
          'market prices',
          'yahoo finance',
          'live prices',
          'stock market data',
          'cryptocurrency prices'
        ]}
        canonical="https://www.pocketportfolio.app/live"
        ogImage="/brand/preview-live.svg"
        ogType="website"
      />
      
      <StructuredData 
        type="WebApplication" 
        data={{
          name: 'Pocket Portfolio Live Market Data',
          url: 'https://www.pocketportfolio.app/live',
          applicationCategory: 'FinanceApplication',
          featureList: ['Real-time Stock Prices', 'Cryptocurrency Prices', 'Market Data', 'Live Updates']
        }} 
      />

      <div className="brand-surface brand-grid" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Mobile-First Header */}
      <header className="brand-spine" style={{ 
        borderBottom: '1px solid var(--card-border)', 
        background: 'var(--chrome)', 
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo size="small" showWordmark={false} />
          </Link>

          {/* Mobile Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link 
                href="/app" 
                style={{ 
                  padding: '8px 12px', 
                  background: 'transparent',
                  border: '1px solid var(--border-warm)', 
                  color: 'var(--text-warm)', 
                  textDecoration: 'none', 
                  borderRadius: '20px', 
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Dashboard
              </Link>
              <Link 
                href="/live" 
                style={{ 
                  padding: '8px 12px', 
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '20px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid var(--border-warm)',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}
              >
                Live
              </Link>
            </nav>
            
            <ThemeSwitcher />
            
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: 'var(--brand)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={logout}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border-warm)',
                    color: 'var(--text-warm)',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--accent-warm)';
                    e.currentTarget.style.color = 'var(--accent-warm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-warm)';
                    e.currentTarget.style.color = 'var(--text-warm)';
                  }}
                >
                  Sign out from Google
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#3c4043',
                  border: '1px solid #dadce0',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontFamily: 'Roboto, sans-serif',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="brand-surface brand-candlestick" style={{ padding: '16px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            marginBottom: '12px',
            color: 'var(--text)',
            letterSpacing: '-0.5px'
          }}>
            📊 Live Market Data
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-warm)', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Real-time prices updated every 30 seconds
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '14px', 
            color: 'var(--text-warm)',
            fontWeight: '500'
          }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
            }}></div>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Error Display */}
        {(quotesError || marketError) && (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--neg)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: 'var(--neg)'
          }}>
            <strong>Error loading data:</strong> {quotesError || marketError}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <div className="skeleton-loader" style={{
              height: '200px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}></div>
            <p>Loading live market data...</p>
          </div>
        )}

        {/* Live Prices - Mobile Stack */}
        {!isLoading && livePrices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {livePrices.map((item) => (
              <div key={item.ticker} className="brand-card brand-candlestick brand-spine" style={{ 
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
                border: '2px solid var(--border-warm)', 
                borderRadius: '16px', 
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,.1), 0 0 0 1px rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <Link 
                      href={`/s/${item.ticker.toLowerCase().replace(/-/g, '')}`}
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: 'var(--accent-warm)', 
                        marginBottom: '4px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--brand)';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--accent-warm)';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item.ticker}
                    </Link>
                    <div style={{ fontSize: '14px', color: 'var(--text-warm)', fontWeight: '500' }}>{item.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
                      ${item.price > 0 ? item.price.toFixed(2) : 'N/A'}
                    </div>
                    <div style={{ 
                      color: item.change !== null && item.change !== undefined && item.change >= 0 ? '#10b981' : '#ef4444', 
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: item.change !== null && item.change !== undefined && item.change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                    }}>
                      {item.change !== null && item.change !== undefined ? (
                        <>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.change >= 0 ? '+' : ''}{item.changePct !== null && item.changePct !== undefined ? item.changePct.toFixed(2) : 'N/A'}%)
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--card-border)'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {item.source || 'Yahoo Finance'}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      background: 'var(--pos)', 
                      borderRadius: '50%'
                    }}></div>
                    Live
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Overview */}
        {!isLoading && marketData && marketData.length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)', 
            border: '2px solid var(--border-warm)', 
            borderRadius: '16px', 
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(245, 158, 11, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '26px', 
              fontWeight: '700', 
              marginBottom: '28px',
              color: 'var(--text)',
              letterSpacing: '-0.5px'
            }}>
              📈 Most Traded Today (US)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--warm-bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symbol</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Cap</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((item: any) => (
                    <tr key={item.symbol} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{item.rank}</td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
                        <Link
                          href={`/s/${item.symbol.toLowerCase().replace(/-/g, '')}`}
                          style={{ 
                            color: 'var(--accent-warm)', 
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--brand)';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--accent-warm)';
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {item.symbol}
                        </Link>
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                        ${item.price !== null && item.price !== undefined ? item.price.toFixed(2) : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: item.changePct !== null && item.changePct !== undefined && item.changePct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                        {item.changePct !== null && item.changePct !== undefined ? `${item.changePct >= 0 ? '+' : ''}${item.changePct.toFixed(2)}%` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                        {item.volume ? `${(item.volume / 1000000).toFixed(1)}M` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                        {item.marketCap ? `$${(item.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                        <a
                          href="https://finance.yahoo.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--brand)', textDecoration: 'none' }}
                        >
                          {item.source || 'Yahoo Finance'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && livePrices.length === 0 && !quotesError && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p>No live market data available at the moment.</p>
            <p>Please try again later.</p>
          </div>
        )}
      </main>
      </div>
    </>
  );
}