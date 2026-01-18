'use client';

import { TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  holdings: number;
  value: number;
  tradeId?: string;
  // Trade-specific fields
  date?: string;
  type?: 'BUY' | 'SELL';
  qty?: number;
  mock?: boolean;
}

interface AssetTerminalProps {
  assets: Asset[];
  view?: 'positions' | 'trades';
  onEdit?: (asset: Asset) => void;
  onDelete?: (symbol: string) => void;
  onSort?: (column: 'symbol' | 'price' | 'change' | 'value' | 'date' | 'type' | 'qty') => void;
  sortBy?: 'symbol' | 'price' | 'change' | 'value' | 'date' | 'type' | 'qty';
  sortOrder?: 'asc' | 'desc';
  setShowImportModal?: (show: boolean) => void;
}

const MONO_FONT = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export function AssetTerminal({ 
  assets, 
  view = 'positions',
  onEdit, 
  onDelete, 
  onSort,
  sortBy = 'value',
  sortOrder = 'desc',
  setShowImportModal
}: AssetTerminalProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: 'symbol' | 'price' | 'change' | 'value' | 'date' | 'type' | 'qty') => {
    if (onSort) {
      onSort(column);
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="dashboard-card" style={{
      overflow: 'hidden'
    }}>
      <div style={{ 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--border))'
      }}>
        <style>{`
          div::-webkit-scrollbar {
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: hsl(var(--border));
          }
          div::-webkit-scrollbar-thumb {
            background: hsl(var(--muted-foreground));
            border-radius: 4px;
          }
        `}</style>
        <table style={{ 
          width: '100%', 
          textAlign: 'left', 
          fontSize: '14px',
          minWidth: '600px'
        }}>
          <thead style={{
            background: 'hsl(var(--card))',
            color: 'hsl(var(--muted-foreground))',
            fontFamily: MONO_FONT,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid hsl(var(--border))`
          }}>
            <tr>
              {view === 'trades' ? (
                <>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('date')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Date {getSortIcon('date')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('symbol')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Ticker {getSortIcon('symbol')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('type')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Type {getSortIcon('type')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('qty')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Qty {getSortIcon('qty')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('price')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('value')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Value {getSortIcon('value')}
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    Status
                    </th>
                </>
              ) : (
                <>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('symbol')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Asset {getSortIcon('symbol')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('price')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('change')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    24h % {getSortIcon('change')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: '500', textAlign: 'right' }}>Holdings</th>
                  <th 
                    style={{ 
                      padding: '12px 16px', 
                      fontWeight: '500',
                      textAlign: 'right',
                      cursor: onSort ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('value')}
                    onMouseEnter={(e) => onSort && (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                  >
                    Value {getSortIcon('value')}
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    width: '128px', 
                    fontWeight: '500',
                    display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'table-cell' : 'none'
                  }}>
                    Trend (7d)
                  </th>
                </>
              )}
              <th style={{ padding: '12px 16px', width: '96px', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ borderTop: `1px solid hsl(var(--border) / 0.5)` }}>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={view === 'trades' ? 8 : 7} style={{ padding: 0 }}>
                  <div style={{
                    padding: '64px 32px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>
                      📊
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'hsl(var(--foreground))',
                      marginBottom: '8px'
                    }}>
                      Your Portfolio is Empty
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: 'hsl(var(--muted-foreground))',
                      marginBottom: '24px'
                    }}>
                      Import your CSV file or add your first trade to get started.
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => {
                          if (setShowImportModal) {
                            setShowImportModal(true);
                          } else {
                            const importSection = document.getElementById('import-trigger');
                            if (importSection) {
                              importSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'hsl(var(--primary) / 0.9)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'hsl(var(--primary))';
                        }}
                      >
                        Import CSV
                      </button>
                      <button
                        onClick={() => {
                          const addTradeSection = document.getElementById('add-trade');
                          if (addTradeSection) {
                            addTradeSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'transparent',
                          color: 'hsl(var(--foreground))',
                          border: `1px solid hsl(var(--border))`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'hsl(var(--muted))';
                          e.currentTarget.style.borderColor = 'hsl(var(--muted-foreground))';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        }}
                      >
                        Add First Trade
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset, index) => {
                const isPos = asset.change >= 0;
                const rowKey = view === 'trades' && asset.tradeId ? asset.tradeId : `${asset.symbol}-${index}`;
                const isHovered = hoveredRow === rowKey;
                
                return (
                  <tr 
                    key={rowKey} 
                    style={{
                      transition: 'background 0.2s ease',
                      background: isHovered ? 'hsl(var(--muted) / 0.4)' : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {view === 'trades' ? (
                      <>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {asset.date || '-'}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT,
                          fontWeight: '500',
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {asset.symbol}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left', 
                          fontFamily: MONO_FONT,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: asset.type === 'BUY' ? 'hsla(142, 71%, 45%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)',
                            color: asset.type === 'BUY' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'
                          }}>
                            {asset.type || '-'}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {asset.qty || '-'}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {asset.price ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(asset.price) : '-'}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--foreground))', 
                          fontWeight: '500', 
                          fontFamily: MONO_FONT,
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}>
                          {asset.value ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(asset.value) : '-'}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: asset.mock ? 'hsla(var(--primary), 0.1)' : 'hsla(142, 71%, 45%, 0.1)',
                            color: asset.mock ? 'hsl(var(--primary))' : 'hsl(142, 71%, 45%)'
                          }}>
                            {asset.mock ? 'Mock' : 'Real'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT,
                          fontWeight: '500',
                          fontSize: '14px'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{asset.symbol}</span>
                            {asset.name && asset.name !== asset.symbol && (
                              <span style={{ 
                                fontSize: '11px', 
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: '400'
                              }}>
                                {asset.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--foreground))', 
                          fontFamily: MONO_FONT 
                        }}>
                          ${asset.price.toFixed(2)}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          fontFamily: MONO_FONT,
                          color: isPos ? 'hsl(var(--accent))' : 'hsl(var(--danger))'
                        }}>
                          {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--muted-foreground))', 
                          fontFamily: MONO_FONT 
                        }}>
                          {asset.holdings.toFixed(4)}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          color: 'hsl(var(--foreground))', 
                          fontWeight: '700', 
                          fontFamily: MONO_FONT 
                        }}>
                          ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ 
                          padding: '12px 16px',
                          display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'table-cell' : 'none'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: 'hsl(var(--muted-foreground))',
                            fontFamily: MONO_FONT,
                            textAlign: 'center',
                            padding: '4px 8px',
                            background: 'hsl(var(--muted) / 0.3)',
                            borderRadius: '4px'
                          }}>
                            {isPos ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <TrendingUp style={{ width: '14px', height: '14px', color: 'hsl(var(--accent))' }} />
                                <span style={{ color: 'hsl(var(--accent))' }}>+{asset.change.toFixed(1)}%</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <TrendingDown style={{ width: '14px', height: '14px', color: 'hsl(var(--danger))' }} />
                                <span style={{ color: 'hsl(var(--danger))' }}>{asset.change.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isHovered ? 1 : 0.4,
                        transition: 'opacity 0.2s ease'
                      }}>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(asset)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              background: 'transparent',
                              border: 'none',
                              color: 'hsl(var(--muted-foreground))',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'hsl(var(--muted))';
                              e.currentTarget.style.color = 'hsl(var(--accent))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                            }}
                            title="Edit"
                          >
                            <Edit2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(asset.symbol)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              background: 'transparent',
                              border: 'none',
                              color: 'hsl(var(--muted-foreground))',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'hsl(var(--muted))';
                              e.currentTarget.style.color = 'hsl(var(--danger))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                            }}
                            title="Delete"
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

