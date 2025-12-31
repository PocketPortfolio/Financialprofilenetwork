'use client';

import { useState, useMemo } from 'react';
import { Trade } from '../services/tradeService';

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

interface ConsolidatedPortfolioTableProps {
  trades: Trade[];
  positions: Position[];
  onDeleteTrade: (tradeId: string) => void;
  onViewTrades: (ticker: string) => void;
  noCard?: boolean; // New prop to remove card styling
}

export default function ConsolidatedPortfolioTable({ 
  trades, 
  positions, 
  onDeleteTrade, 
  onViewTrades,
  noCard = false
}: ConsolidatedPortfolioTableProps) {
  const [viewMode, setViewMode] = useState<'positions' | 'trades'>('positions');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'ticker' | 'value' | 'pl' | 'plPercent'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter trades by selected ticker
  const filteredTrades = useMemo(() => {
    if (!selectedTicker) return trades;
    return trades.filter(trade => trade.ticker === selectedTicker);
  }, [trades, selectedTicker]);

  // Sort positions
  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'ticker':
          return sortOrder === 'asc' 
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        case 'value':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'pl':
          aValue = a.unrealizedPL;
          bValue = b.unrealizedPL;
          break;
        case 'plPercent':
          aValue = a.unrealizedPLPercent;
          bValue = b.unrealizedPLPercent;
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [positions, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (value: number | undefined, currency: string = 'USD') => {
    if (value === undefined || value === null) return 'N/A';
    const currencyCode = currency === 'GBp' ? 'GBP' : currency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className={noCard ? "" : "brand-card brand-grid brand-candlestick"} style={noCard ? {
      // No card styling - full width layout
    } : { 
      background: 'var(--card)', 
      border: '1px solid var(--card-border)', 
      borderRadius: '12px', 
      padding: '24px', 
      marginBottom: '32px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Header with Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Portfolio Overview
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--muted)', 
            margin: '4px 0 0 0' 
          }}>
            {viewMode === 'positions' 
              ? `${positions.length} positions • ${trades.length} total trades`
              : selectedTicker 
                ? `${filteredTrades.length} trades for ${selectedTicker}`
                : `${trades.length} trades`
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--warm-bg)', borderRadius: '12px', padding: '6px', border: '2px solid var(--border-warm)' }}>
            <button
              onClick={() => setViewMode('positions')}
              style={{
                padding: '12px 20px',
                background: viewMode === 'positions' 
                  ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)' 
                  : 'transparent',
                color: viewMode === 'positions' ? 'white' : 'var(--text-warm)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === 'positions' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'positions') {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.color = 'var(--accent-warm)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'positions') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-warm)';
                }
              }}
            >
              📊 Positions
            </button>
            <button
              onClick={() => setViewMode('trades')}
              style={{
                padding: '12px 20px',
                background: viewMode === 'trades' 
                  ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)' 
                  : 'transparent',
                color: viewMode === 'trades' ? 'white' : 'var(--text-warm)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === 'trades' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'trades') {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.color = 'var(--accent-warm)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'trades') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-warm)';
                }
              }}
            >
              📈 Trades
            </button>
          </div>

          {/* Back to Positions Button (when viewing trades) */}
          {viewMode === 'trades' && selectedTicker && (
            <button
              onClick={() => {
                setSelectedTicker(null);
                setViewMode('positions');
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--card-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back to Positions
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      {viewMode === 'positions' ? (
        // Positions View
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg)' }}>
              <tr>
                <th 
                  style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: 'var(--text-warm)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('ticker')}
                >
                  📊 Asset {getSortIcon('ticker')}
                </th>
                <th 
                  style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: 'var(--text-warm)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('value')}
                >
                  💰 Value {getSortIcon('value')}
                </th>
                <th 
                  style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: 'var(--text-warm)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('pl')}
                >
                  📈 P/L {getSortIcon('pl')}
                </th>
                <th 
                  style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: 'var(--text-warm)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('plPercent')}
                >
                  📊 P/L % {getSortIcon('plPercent')}
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚙️ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map(position => (
                <tr 
                  key={position.ticker} 
                  style={{ 
                    borderBottom: '1px solid var(--card-border)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        {position.ticker}
                      </span>
                      {position.isMock && (
                        <span style={{ 
                          fontSize: '10px', 
                          color: 'var(--brand)', 
                          background: 'rgba(139, 92, 246, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          MOCK
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      {position.shares} shares • Avg {position.currency === 'GBP' ? '£' : position.currency === 'GBp' ? '£' : '$'}{position.avgCost?.toFixed(2) || 'N/A'} • {position.totalTrades || 0} trades
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                      {formatCurrency(position.currentValue, position.currency)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      @ {position.currency === 'GBP' ? '£' : position.currency === 'GBp' ? '£' : '$'}{position.currentPrice?.toFixed(2) || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: position.unrealizedPL >= 0 ? 'var(--pos)' : 'var(--neg)' 
                    }}>
                      {position.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPL, position.currency)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: position.unrealizedPL >= 0 ? 'var(--pos)' : 'var(--neg)' 
                    }}>
                      {formatPercent(position.unrealizedPLPercent)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedTicker(position.ticker);
                        setViewMode('trades');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                        color: 'white',
                        border: '2px solid var(--border-warm)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      📈 View Trades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Trades View
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📅 Date
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📊 Ticker
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔄 Type
                </th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📦 Qty
                </th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💰 Price
                </th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💵 Value
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✅ Status
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--text-warm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚙️ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => (
                <tr 
                  key={trade.id} 
                  style={{ 
                    borderBottom: '1px solid var(--card-border)',
                    opacity: trade.mock ? 0.7 : 1,
                    background: trade.mock ? 'var(--bg)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = trade.mock ? 'var(--card-border)' : 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = trade.mock ? 'var(--bg)' : 'transparent'}
                >
                  <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                    {trade.date}
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
                    {trade.ticker}
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: trade.type === 'BUY' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: trade.type === 'BUY' ? 'var(--pos)' : 'var(--neg)'
                    }}>
                      {trade.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                    {trade.qty}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text)' }}>
                    {formatCurrency(trade.price)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(trade.qty * trade.price)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: trade.mock ? 'rgba(139, 92, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: trade.mock ? 'var(--brand)' : 'var(--pos)'
                    }}>
                      {trade.mock ? 'Mock' : 'Real'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                          onDeleteTrade(trade.id);
                        } catch (error) {
                          console.error('Error calling onDeleteTrade:', error);
                          
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: '2px solid #dc2626',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {((viewMode === 'positions' && positions.length === 0) || 
        (viewMode === 'trades' && filteredTrades.length === 0)) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          color: 'var(--muted)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="var(--muted)" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="var(--muted)" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="var(--muted)" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="var(--muted)" strokeWidth="2"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text)' }}>
            {viewMode === 'positions' ? 'No positions yet' : 'No trades found'}
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            {viewMode === 'positions' 
              ? 'Add your first trade to see your portfolio positions'
              : selectedTicker 
                ? `No trades found for ${selectedTicker}`
                : 'No trades available'
            }
          </p>
        </div>
      )}
    </div>
  );
}
