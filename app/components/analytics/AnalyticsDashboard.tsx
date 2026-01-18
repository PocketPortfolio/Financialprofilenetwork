'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { calculatePortfolioBeta, groupBySector, generateRebalancingPlan } from '../../lib/analytics/portfolioMath';
import { fetchAssetProfiles } from '../../services/enrichmentService';
import { Trade } from '../../services/tradeService';
import { Position } from '../../lib/utils/portfolioCalculations';

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

interface AnalyticsDashboardProps {
  trades: Trade[]; // Your existing trade data
  positions: Position[]; // Calculated positions
  tier: 'codeSupporter' | 'featureVoter' | 'corporateSponsor' | 'foundersClub' | null;
}

export function AnalyticsDashboard({ trades, positions, tier }: AnalyticsDashboardProps) {
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const isPremium = tier === 'foundersClub' || tier === 'corporateSponsor';

  // 1. Aggregation Logic - Convert positions to holdings format
  const holdings = useMemo(() => {
    return positions
      .filter(pos => pos.shares > 0)
      .map(pos => ({
        ticker: pos.ticker,
        value: pos.currentValue || pos.avgCost * pos.shares
      }))
      .filter(h => h.value > 0);
  }, [positions]);

  const totalPortfolioValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.value, 0);
  }, [holdings]);

  // 2. Fetch Metadata
  useEffect(() => {
    if (isPremium && holdings.length > 0) {
      const tickers = holdings.map(h => h.ticker);
      fetchAssetProfiles(tickers).then(profiles => {
        setProfiles(profiles);
      });
    }
  }, [holdings, isPremium]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure chart container width
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth;
        if (width > 0 && width !== chartWidth) {
          setChartWidth(width);
        }
      }
    };
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(updateWidth, 0);
    });
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [chartWidth]);

  // 3. Calculate Metrics
  const sectorData = useMemo(() => {
    return groupBySector(holdings, profiles);
  }, [holdings, profiles]);
  const portfolioBeta = useMemo(() => calculatePortfolioBeta(holdings, profiles), [holdings, profiles]);
  
  // 4. Mock Rebalancing Targets (User would set these in settings)
  // For now, we'll use equal weighting as a default example
  const mockTargets: Array<{ ticker?: string; sector?: string; percentage: number }> = [];

  if (!isPremium) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          🔒 Advanced Analytics
        </h3>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-4)'
        }}>
          Unlock Sector Breakdown, Risk Metrics, and Rebalancing Alerts.
        </p>
        <a
          href="/sponsor"
          style={{
            display: 'inline-block',
            background: 'var(--signal)',
            color: 'var(--bg)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 'var(--font-semibold)',
            transition: 'var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Upgrade to Founders Club
        </a>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        No positions to analyze. Add some trades to see advanced analytics.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Row: Risk & Allocation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-6)'
      }}>
        
        {/* Sector Allocation */}
        <div style={{
          background: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-4)'
          }}>
            Sector Exposure
          </h3>
          <div 
            ref={chartContainerRef}
            style={{ 
              height: isMobile ? '320px' : '288px',
              width: '100%', 
              position: 'relative', 
              minHeight: '288px',
              overflow: 'visible'
            }}
          >
            {sectorData.length > 0 ? (
              <ResponsiveContainer width={chartWidth > 0 ? chartWidth : '100%'} height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="45%"
                    innerRadius="50%"
                    outerRadius="70%"
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={false}
                    fill="#8884d8"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={70}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '20px'
                    }}
                    formatter={(value: string, entry: any) => {
                      const percent = ((entry.payload.value / sectorData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
                      return `${value}: ${percent}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'var(--text-secondary)'
              }}>
                No sector data available
              </div>
            )}
          </div>
        </div>

        {/* Risk Radar */}
        <div style={{
          background: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-2)'
          }}>
            Portfolio Risk (Beta)
          </h3>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'var(--font-bold)',
            color: portfolioBeta > 1.2 ? 'var(--error)' : portfolioBeta < 0.8 ? 'var(--success)' : 'var(--signal)',
            marginBottom: 'var(--space-2)'
          }}>
            {portfolioBeta.toFixed(2)}
          </div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)'
          }}>
            {portfolioBeta > 1.2 ? '🔥 Aggressive / High Volatility' : 
             portfolioBeta < 0.8 ? '🛡️ Defensive / Low Volatility' : 
             '⚖️ Balanced Market Exposure'}
          </p>
          <div style={{
            width: '100%',
            background: 'var(--surface-elevated)',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: 'var(--space-2)'
          }}>
            <div 
              style={{
                height: '100%',
                background: portfolioBeta > 1 ? 'var(--error)' : 'var(--success)',
                width: `${Math.min(portfolioBeta * 50, 100)}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)'
          }}>
            <span>Low (0.5)</span>
            <span>Market (1.0)</span>
            <span>High (2.0)</span>
          </div>
        </div>
      </div>

      {/* Rebalancing Suggestions (if targets are set) */}
      {mockTargets.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-4)'
          }}>
            Rebalancing Suggestions
          </h3>
          {generateRebalancingPlan(holdings, mockTargets, totalPortfolioValue).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {generateRebalancingPlan(holdings, mockTargets, totalPortfolioValue).map((suggestion, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{suggestion.ticker}</strong> - {suggestion.action}
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {suggestion.reason}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'var(--font-semibold)' }}>
                    ${suggestion.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Portfolio is well-balanced. No rebalancing needed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

