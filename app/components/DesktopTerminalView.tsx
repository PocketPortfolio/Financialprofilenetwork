'use client';

import React, { useState, useEffect } from 'react';
import SocialShare from './viral/SocialShare';
import TickerJsonData from './TickerJsonData';
import TickerStockInfo from './TickerStockInfo';
import TickerThickContent from './TickerThickContent';
import CompanyLogo from './CompanyLogo';
import TickerCsvDownload from './TickerCsvDownload';

interface DesktopTerminalViewProps {
  normalizedSymbol: string;
  metadata: any;
  content: any;
  faqStructuredData: any;
  initialQuoteData: any;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Calculate volatility from price returns
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualize (assuming daily data, 252 trading days)
  return stdDev * Math.sqrt(252) * 100; // Return as percentage
}

// Calculate max drawdown
function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    }
    const drawdown = peak > 0 ? ((peak - prices[i]) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

export default function DesktopTerminalView({
  normalizedSymbol,
  metadata,
  content,
  faqStructuredData,
  initialQuoteData
}: DesktopTerminalViewProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch historical data for table
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/tickers/${normalizedSymbol}/json?range=1y`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const dataPoints = data.data || [];
        // Sort by date (newest first) and take first 10
        const sorted = [...dataPoints].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Newest first
        });
        setHistoricalData(sorted.slice(0, 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [normalizedSymbol]);

  // Quick Copy Handler (TSV format for Excel)
  const handleQuickCopy = async () => {
    if (historicalData.length === 0) return;
    
    try {
      // Convert to TSV (tab-separated, Excel-friendly)
      const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
      const rows = historicalData.map(row => [
        row.date,
        row.open?.toFixed(2) || '',
        row.high?.toFixed(2) || '',
        row.low?.toFixed(2) || '',
        row.close?.toFixed(2) || '',
        row.volume?.toString() || ''
      ]);
      
      const tsv = [
        headers.join('\t'),
        ...rows.map(row => row.join('\t'))
      ].join('\n');

      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy. Please try again.');
    }
  };

  // Calculate risk metrics
  const prices = historicalData.map(d => d.close);
  const volatility = calculateVolatility(prices);
  const maxDrawdown = calculateMaxDrawdown(prices);

  return (
    <div style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Main Content */}
          <div>
            {/* Terminal Header */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              fontFamily: 'monospace',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                $ pocket-portfolio track {normalizedSymbol}
              </div>
              <div style={{ color: 'var(--text)' }}>
                {loading ? '⏳ Fetching data...' : `✓ Data loaded • ${historicalData.length} rows available`}
              </div>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '16px'
              }}>
                <CompanyLogo 
                  key={normalizedSymbol}
                  symbol={normalizedSymbol}
                  metadata={metadata}
                  name={metadata?.name || normalizedSymbol}
                  size={64}
                />
                
                <div style={{ flex: 1 }}>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'var(--text)',
                    marginBottom: '8px',
                    lineHeight: '1.2'
                  }}>
                    {content.h1}
                  </h1>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {content.description}
                  </p>
                </div>
                
                <div style={{ flexShrink: 0 }}>
                  <SocialShare
                    title={content.title}
                    description={content.description}
                    url={`https://www.pocketportfolio.app/s/${normalizedSymbol.toLowerCase()}`}
                    context="ticker_page"
                    platforms={['twitter', 'linkedin', 'facebook', 'copy']}
                    hashtags={[normalizedSymbol, 'StockAnalysis', 'PortfolioTracker']}
                  />
                </div>
              </div>
            </div>

            {/* Stock Info + Export Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              marginBottom: '24px',
              alignItems: 'start'
            }}>
              {/* Stock Info */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: 0
                  }}>
                    {content.h2[0]}
                  </h2>
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    {metadata.exchange} • {metadata.sector || 'General'}
                  </span>
                </div>
                <TickerStockInfo symbol={normalizedSymbol} initialData={initialQuoteData ? {
                  price: initialQuoteData.price ?? null,
                  change: initialQuoteData.change ?? null,
                  changePct: initialQuoteData.changePct ?? null,
                  currency: initialQuoteData.currency || 'USD'
                } : null} />
              </div>
              
              {/* Export Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '280px'
              }}>
                <TickerCsvDownload symbol={normalizedSymbol} name={metadata?.name} />
                {metadata && (
                  <TickerJsonData
                    symbol={normalizedSymbol}
                    name={metadata.name}
                    exchange={metadata.exchange}
                    sector={metadata.sector}
                  />
                )}
              </div>
            </div>

            {/* Pulitzer Brief - Standard content for desktop */}
            <TickerThickContent
              symbol={normalizedSymbol}
              name={metadata?.name || `${normalizedSymbol} Inc.`}
              price={initialQuoteData?.price ?? null}
              changePercent={initialQuoteData?.changePct ?? null}
              peRatio={metadata?.peRatio}
              assetType={
                normalizedSymbol.includes('USD') || 
                normalizedSymbol.includes('BTC') || 
                normalizedSymbol.includes('ETH') ||
                metadata?.exchange?.toLowerCase().includes('crypto') ||
                metadata?.sector?.toLowerCase() === 'cryptocurrency'
                  ? 'CRYPTO' 
                  : 'STOCK'
              }
            />

            {/* Data Table with Quick Copy */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '2px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface)'
              }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {normalizedSymbol} Historical Data (Last 10 Days)
                </h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {/* Quick Copy Button */}
                  <button
                    onClick={handleQuickCopy}
                    disabled={loading || historicalData.length === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: copied ? 'var(--signal)' : 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: (loading || historicalData.length === 0) ? 'not-allowed' : 'pointer',
                      color: 'var(--text)',
                      transition: 'all 0.2s',
                      opacity: (loading || historicalData.length === 0) ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && historicalData.length > 0 && !copied) {
                        e.currentTarget.style.background = 'var(--card)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && historicalData.length > 0 && !copied) {
                        e.currentTarget.style.background = 'var(--surface)';
                      }
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy to Clipboard (TSV)'}
                  </button>
                  <a 
                    href={`/api/tickers/${normalizedSymbol}/csv`}
                    style={{
                      fontSize: '14px',
                      color: 'var(--signal)',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    View All →
                  </a>
                </div>
              </div>
              
              {/* Table Content */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Loading data...
                </div>
              ) : error ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)' }}>
                  {error}
                </div>
              ) : historicalData.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No data available
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Open</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Close</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalData.map((row, idx) => (
                        <tr 
                          key={idx} 
                          style={{ 
                            borderBottom: '1px solid var(--border)',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--surface)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                            {row.date}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px' }}>
                            ${row.open?.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', color: 'var(--signal)' }}>
                            ${row.high?.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', color: 'var(--error)' }}>
                            ${row.low?.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', fontWeight: '600' }}>
                            ${row.close?.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {row.volume?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Risk Sidebar - Fixed 300px right column */}
          {historicalData.length > 0 && (
            <div style={{
              position: 'sticky',
              top: '24px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: 'fit-content',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: 'var(--text)'
              }}>
                Risk Metrics (10D)
              </h3>
              
              {/* Max Drawdown */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Max Drawdown
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: maxDrawdown > 10 ? 'var(--error)' : maxDrawdown > 5 ? 'var(--warning)' : 'var(--signal)',
                  marginBottom: '8px'
                }}>
                  {maxDrawdown.toFixed(2)}%
                </div>
                {/* Visual indicator */}
                <div style={{
                  height: '6px',
                  background: 'var(--surface)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginTop: '8px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(maxDrawdown, 100)}%`,
                    background: maxDrawdown > 10 ? 'var(--error)' : maxDrawdown > 5 ? 'var(--warning)' : 'var(--signal)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
              
              {/* Volatility */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Volatility (Annualized)
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  {volatility.toFixed(2)}%
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic'
                }}>
                  Based on 10-day returns
                </div>
              </div>

              {/* Price Range */}
              {prices.length > 0 && (() => {
                const maxPrice = Math.max(...prices);
                const minPrice = Math.min(...prices);
                const priceRange = ((maxPrice - minPrice) / minPrice) * 100;
                
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-secondary)', 
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Price Range
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                    </div>
                    <div style={{ 
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      {priceRange.toFixed(2)}% spread
                    </div>
                  </div>
                );
              })()}

              {/* Data Points Info */}
              <div style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  📊 {historicalData.length} data points
                </div>
                <div>
                  📅 Last 10 trading days
                </div>
              </div>
            </div>
          )}

          {/* Additional Content Sections - Bottom of Page (Full Width) */}
          <div style={{ 
            gridColumn: '1 / -1',
            marginTop: '24px'
          }}>
          {/* Content Body */}
          <div 
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              color: 'var(--text)',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: content.body }}
          />

          {/* Portfolio Integration */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              {content.h2[1]}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Import {normalizedSymbol} positions from broker CSVs or export {normalizedSymbol} historical data to JSON using Pocket Portfolio's free portfolio integration platform.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <a
                href={content.cta.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--accent-warm)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  alignSelf: 'flex-start'
                }}
              >
                {content.cta.text}
              </a>
              <a
                href="/import"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--surface-elevated)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  alignSelf: 'flex-start'
                }}
              >
                Import Trades
              </a>
            </div>
          </div>

          {/* Internal Links / Related Content */}
          {content.internalLinks.length > 0 && (
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px'
              }}>
                Related Content
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {content.internalLinks.slice(0, 8).map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    style={{
                      color: 'var(--accent-warm)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      transition: 'color 0.2s'
                    }}
                  >
                    → {link.anchor}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Free Portfolio Tracking
              </h3>
              <ul style={{
                listStyleType: 'disc',
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: '1.6'
              }}>
                <li>Track {normalizedSymbol} performance</li>
                <li>Real-time price updates</li>
                <li>Portfolio analytics</li>
                <li>No signup required</li>
              </ul>
            </div>
            
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Open Source
              </h3>
              <ul style={{
                listStyleType: 'disc',
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: '1.6'
              }}>
                <li>Community-driven</li>
                <li>Privacy-first</li>
                <li>Always ad-free</li>
                <li>Transparent code</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
