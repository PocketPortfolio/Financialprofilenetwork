'use client';

import { Plus, UploadCloud, Link as LinkIcon, ArrowRight } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import TickerSearch from '../TickerSearch';
import { usePremiumTheme } from '../../hooks/usePremiumTheme';
import PlaidLinkButton from './PlaidLinkButton';

interface DataInputDeckProps {
  newTrade: {
    symbol: string;
    quantity: string;
    price: string;
    date: string;
    type: 'buy' | 'sell';
    fees: string;
  };
  isMockTrade: boolean;
  onTradeChange: (updates: Partial<DataInputDeckProps['newTrade']>) => void;
  onMockTradeChange: (isMock: boolean) => void;
  onAddTrade: () => void;
  onImport: () => void;
}

export function DataInputDeck({
  newTrade,
  isMockTrade,
  onTradeChange,
  onMockTradeChange,
  onAddTrade,
  onImport
}: DataInputDeckProps) {
  const { tier } = usePremiumTheme();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = React.useState<string>('1fr');

  // Helper to get CSS variable value (only used in event handlers, not in render)
  const getCSSVar = (varName: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  const module1Ref = useRef<HTMLDivElement>(null);
  const module2Ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !gridContainerRef.current || !outerContainerRef.current) return;
    
    const updateGridColumns = () => {
      const viewportWidth = window.innerWidth;
      const mdBreakpointActive = viewportWidth >= 768;
      // Force 3 columns on desktop using inline style
      const columns = mdBreakpointActive ? 'repeat(3, 1fr)' : '1fr';
      setGridColumns(columns);
      
      // Apply directly to element as well
      if (gridContainerRef.current) {
        gridContainerRef.current.style.gridTemplateColumns = columns;
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  return (
    <div ref={outerContainerRef} data-tour="data-input-deck" style={{ width: '100%', marginBottom: '32px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'hsl(var(--muted-foreground))',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 0,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary))',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          Data Ingestion Engine
        </h2>
      </div>

      {/* ⚡ THE NUCLEAR GRID WRAPPER ⚡ */}
      {/* Using inline style to force grid-template-columns since Tailwind !important with responsive classes may not work */}
      <div 
        ref={gridContainerRef} 
        style={{ 
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '16px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        
        {/* MODULE 1: MANUAL ENTRY (Quick & Precise) */}
        <div 
          ref={module1Ref} 
          data-module="manual"
          className="dashboard-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '220px',
            padding: '20px',
            position: 'relative',
            overflow: 'visible',
            transition: 'all 0.3s ease',
            border: '1px solid hsl(var(--border))',
            borderRadius: '2px',
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
          }}
          onMouseEnter={(e) => {
            const root = getComputedStyle(document.documentElement);
            const primary = root.getPropertyValue('--primary').trim();
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = `hsla(${primary}, 0.5)`;
            // Update accent line
            const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
            if (accentLine) accentLine.style.backgroundColor = `hsl(${primary})`;
          }}
          onMouseLeave={(e) => {
            const root = getComputedStyle(document.documentElement);
            const primary = root.getPropertyValue('--primary').trim();
            const border = root.getPropertyValue('--border').trim();
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = `hsl(${border})`;
            // Reset accent line
            const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
            if (accentLine) accentLine.style.backgroundColor = `hsla(${primary}, 0.2)`;
          }}
        >
          {/* Brand Accent Top */}
          <div 
            data-accent-line
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              backgroundColor: 'hsla(var(--primary), 0.2)',
              transition: 'background-color 0.3s ease',
            }}
          />
          
          <div style={{
            padding: '0',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <div 
                style={{
                  padding: '8px',
                  borderRadius: '2px',
                  backgroundColor: 'hsla(var(--primary), 0.1)',
                  color: 'hsl(var(--primary))',
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
              </div>
              <span style={{
                fontWeight: '700',
                color: 'hsl(var(--card-foreground))',
                letterSpacing: '-0.025em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}>Manual Log</span>
            </div>

          {/* Compact Vertical Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: '1',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Symbol Search */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <label style={{
                fontSize: '10px',
                color: 'hsl(var(--muted-foreground))',
                textTransform: 'uppercase',
                fontWeight: '700',
                marginBottom: '4px',
                display: 'block',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>Asset</label>
              <TickerSearch
                onTickerSelect={(ticker) => onTradeChange({ symbol: ticker })}
                placeholder="Ticker"
              />
            </div>
            
            {/* Type | Price | Qty Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <label style={{
                  fontSize: '10px',
                  color: 'hsl(var(--muted-foreground))',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  marginBottom: '4px',
                  display: 'block',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Type</label>
                <select
                  value={newTrade.type}
                  onChange={(e) => onTradeChange({ type: e.target.value as 'buy' | 'sell' })}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '2px',
                    border: '1px solid hsl(var(--input))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    const primary = getCSSVar('--primary');
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = `0 0 0 2px hsla(${primary}, 0.5)`;
                    e.currentTarget.style.borderColor = `hsl(${primary})`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'hsl(var(--input))';
                  }}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: '10px',
                  color: 'hsl(var(--muted-foreground))',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  marginBottom: '4px',
                  display: 'block',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Price</label>
                <input
                  ref={inputRef}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTrade.price}
                  onChange={(e) => onTradeChange({ price: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '2px',
                    border: '1px solid hsl(var(--input))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    const primary = getCSSVar('--primary');
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = `0 0 0 2px hsla(${primary}, 0.5)`;
                    e.currentTarget.style.borderColor = `hsl(${primary})`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'hsl(var(--input))';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '10px',
                  color: 'hsl(var(--muted-foreground))',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  marginBottom: '4px',
                  display: 'block',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Qty</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newTrade.quantity}
                  onChange={(e) => onTradeChange({ quantity: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '2px',
                    border: '1px solid hsl(var(--input))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    const primary = getCSSVar('--primary');
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = `0 0 0 2px hsla(${primary}, 0.5)`;
                    e.currentTarget.style.borderColor = `hsl(${primary})`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'hsl(var(--input))';
                  }}
                />
              </div>
            </div>
            
            {/* Date Row */}
            <div>
              <label style={{
                fontSize: '10px',
                color: 'hsl(var(--muted-foreground))',
                textTransform: 'uppercase',
                fontWeight: '700',
                marginBottom: '4px',
                display: 'block',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>Date</label>
              <input
                type="date"
                value={newTrade.date}
                onChange={(e) => onTradeChange({ date: e.target.value })}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '2px',
                  border: '1px solid hsl(var(--input))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  const primary = getCSSVar('--primary');
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.boxShadow = `0 0 0 2px hsla(${primary}, 0.5)`;
                  e.currentTarget.style.borderColor = `hsl(${primary})`;
                }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'hsl(var(--input))';
                  }}
              />
            </div>
            
            {/* Fees and Mock Checkbox Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{
                  fontSize: '10px',
                  color: 'hsl(var(--muted-foreground))',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  marginBottom: '4px',
                  display: 'block',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Fees</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTrade.fees}
                  onChange={(e) => onTradeChange({ fees: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '2px',
                    border: '1px solid hsl(var(--input))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    const primary = getCSSVar('--primary');
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = `0 0 0 2px hsla(${primary}, 0.5)`;
                    e.currentTarget.style.borderColor = `hsl(${primary})`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'hsl(var(--input))';
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  color: 'hsl(var(--card-foreground))',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  <input
                    type="checkbox"
                    checked={isMockTrade}
                    onChange={(e) => onMockTradeChange(e.target.checked)}
                    style={{
                      width: '14px',
                      height: '14px',
                      accentColor: 'hsl(var(--primary))',
                    }}
                  />
                  <span>Mock</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={onAddTrade} 
            style={{ 
              marginTop: 'auto',
              width: '100%',
              height: '40px',
              borderRadius: '2px',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px hsla(var(--primary), 0.3)',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Add Record <ArrowRight style={{ width: '12px', height: '12px' }} />
          </button>
          </div>
        </div>

        {/* MODULE 2: CSV UPLOAD (The Drop Zone) */}
        <div 
          ref={module2Ref}
          data-module="csv"
          onClick={onImport}
          className="dashboard-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '220px',
            padding: '0',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid hsl(var(--border))',
            borderRadius: '2px',
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
          }}
          onMouseEnter={(e) => {
            const primary = getCSSVar('--primary');
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = `hsla(${primary}, 0.5)`;
            // Update accent line
            const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
            if (accentLine) accentLine.style.backgroundColor = `hsl(${primary})`;
          }}
          onMouseLeave={(e) => {
            const root = getComputedStyle(document.documentElement);
            const primary = root.getPropertyValue('--primary').trim();
            const border = root.getPropertyValue('--border').trim();
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = `hsl(${border})`;
            // Reset accent line
            const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
            if (accentLine) accentLine.style.backgroundColor = `hsla(${primary}, 0.2)`;
          }}
        >
          {/* Active State Background */}
          <div style={{
            position: 'absolute',
            inset: '0',
            backgroundColor: 'hsla(var(--muted), 0.3)',
            transition: 'background-color 0.3s ease',
          }} />
          
          {/* Brand Accent Top */}
          <div 
            data-accent-line
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              backgroundColor: 'hsla(var(--muted-foreground), 0.2)',
              transition: 'background-color 0.3s ease',
            }}
          />

          <div style={{
            position: 'relative',
            zIndex: 10,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px dashed hsla(var(--muted-foreground), 0.3)',
                backgroundColor: 'hsl(var(--card))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                const primary = getCSSVar('--primary');
                e.currentTarget.style.borderColor = primary ? `hsl(${primary})` : '#10b981';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsla(var(--muted-foreground), 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <UploadCloud style={{
                width: '20px',
                height: '20px',
                color: 'hsl(var(--muted-foreground))',
              }} />
            </div>
            <h3 style={{
              fontWeight: '700',
              color: 'hsl(var(--card-foreground))',
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              margin: 0,
            }}>Import CSV</h3>
            <p style={{
              fontSize: '12px',
              color: 'hsl(var(--muted-foreground))',
              marginTop: '4px',
              padding: '0 16px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              Drag & drop any broker CSV. Auto-detection for 20+ brokers; Smart Mapping for everything else.
            </p>
            <div 
              style={{
                marginTop: '16px',
                padding: '4px 12px',
                fontSize: '10px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                transition: 'all 0.2s ease',
                borderRadius: '2px',
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
              }}
              onMouseEnter={(e) => {
                const primary = getCSSVar('--primary');
                e.currentTarget.style.color = `hsl(${primary})`;
                e.currentTarget.style.borderColor = `hsla(${primary}, 0.3)`;
              }}
              onMouseLeave={(e) => {
                const mutedFg = getCSSVar('--muted-foreground');
                const border = getCSSVar('--border');
                e.currentTarget.style.color = `hsl(${mutedFg})`;
                e.currentTarget.style.borderColor = `hsl(${border})`;
              }}
            >
              .CSV / .XLSX
            </div>
          </div>
        </div>

        {/* MODULE 3: PLAID CONNECTION (Feature Flagged) */}
        {(() => {
          const ENABLE_US_PLAID = process.env.NEXT_PUBLIC_ENABLE_US_INVESTMENTS === 'true';
          
          if (!ENABLE_US_PLAID) {
            return (
              <div 
                className="dashboard-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '220px',
                  border: '2px dashed hsl(var(--muted))',
                  borderRadius: '2px',
                  backgroundColor: 'hsla(var(--muted), 0.1)',
                  color: 'hsl(var(--card-foreground))',
                  padding: '24px',
                  opacity: 0.75,
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'hsl(var(--muted))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  borderRadius: '50%',
                }}>
                  <LinkIcon style={{
                    width: '16px',
                    height: '16px',
                    color: 'hsl(var(--muted-foreground))',
                  }} />
                </div>
                <h3 style={{
                  fontWeight: '700',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '14px',
                  margin: 0,
                }}>Broker Sync</h3>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(var(--muted-foreground))',
                  marginTop: '4px',
                  marginBottom: '12px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  ⚠️ Due to high volume, US connections are currently waitlisted.
                </p>
                <a 
                  href="/waitlist" 
                  style={{
                    fontSize: '12px',
                    color: 'hsl(var(--primary))',
                    textDecoration: 'underline',
                    fontWeight: '600',
                  }}
                >
                  Join Priority Queue
                </a>
              </div>
            );
          }

          // Plaid enabled - show connection button
          return (
            <div 
              className="dashboard-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '220px',
                padding: '20px',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s ease',
                border: '1px solid hsl(var(--border))',
                borderRadius: '2px',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
              }}
              onMouseEnter={(e) => {
                const root = getComputedStyle(document.documentElement);
                const primary = root.getPropertyValue('--primary').trim();
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `hsla(${primary}, 0.5)`;
                const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
                if (accentLine) accentLine.style.backgroundColor = `hsl(${primary})`;
              }}
              onMouseLeave={(e) => {
                const root = getComputedStyle(document.documentElement);
                const primary = root.getPropertyValue('--primary').trim();
                const border = root.getPropertyValue('--border').trim();
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = `hsl(${border})`;
                const accentLine = e.currentTarget.querySelector('[data-accent-line]') as HTMLElement;
                if (accentLine) accentLine.style.backgroundColor = `hsla(${primary}, 0.2)`;
              }}
            >
              {/* Brand Accent Top */}
              <div 
                data-accent-line
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'hsla(var(--primary), 0.2)',
                  transition: 'background-color 0.3s ease',
                }}
              />
              
              <div style={{
                padding: '0',
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'hsla(var(--primary), 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <LinkIcon style={{
                    width: '20px',
                    height: '20px',
                    color: 'hsl(var(--primary))',
                  }} />
                </div>
                <h3 style={{
                  fontWeight: '700',
                  color: 'hsl(var(--card-foreground))',
                  letterSpacing: '-0.025em',
                  fontSize: '14px',
                  margin: 0,
                }}>Connect Brokerage</h3>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(var(--muted-foreground))',
                  marginTop: '4px',
                  marginBottom: '16px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  Connect your US brokerage account securely via Plaid.
                </p>
                <PlaidLinkButton
                  onSuccess={(publicToken, metadata) => {
                    console.log('Plaid connection successful:', metadata);
                    // TODO: Handle successful connection - fetch investments data
                  }}
                  onExit={(err, metadata) => {
                    if (err) {
                      console.error('Plaid connection error:', err);
                    }
                  }}
                />
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

