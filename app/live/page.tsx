'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { useQuotes, useMarketData } from '../hooks/useDataFetching';

export default function LivePage() {
  const [loading, setLoading] = useState(true);
  
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
      <>
        <SEOHead
          title="Live Market Data - Real-Time Stock & Crypto Prices"
          description="Get real-time stock and cryptocurrency prices with live market data from Yahoo Finance."
          canonical="https://www.pocketportfolio.app/live"
        />
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Loading live prices...</h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)' }}>Fetching real-time market data</p>
        </div>
      </>
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
        ogImage="https://www.pocketportfolio.app/api/og?title=Live%20Market%20Data&description=Real-Time%20Stock%20%26%20Crypto%20Prices&v=6"
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

      <div className="brand-surface brand-candlestick" style={{ padding: '16px 0' }}>
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
      </div>
    </>
  );
}