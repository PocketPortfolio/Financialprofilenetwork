'use client';

import React, { useMemo } from 'react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import type { PortfolioSnapshot } from '@/app/lib/portfolio/types';

interface ReturnHeatMapProps {
  positions: Position[];
  snapshots: PortfolioSnapshot[];
}

interface ReturnData {
  ticker: string;
  day: number;
  week: number;
  month: number;
  threeMonth: number;
  sixMonth: number;
  year: number;
}

/**
 * Calculate return for a position over a time period
 */
function calculateReturn(
  currentValue: number,
  historicalValue: number | undefined
): number {
  if (!historicalValue || historicalValue === 0) return 0;
  return ((currentValue - historicalValue) / historicalValue) * 100;
}

/**
 * Get position value from snapshot
 */
function getPositionValueFromSnapshot(
  snapshot: PortfolioSnapshot,
  ticker: string
): number {
  const position = snapshot.positions.find((p) => p.ticker === ticker);
  return position?.value || 0;
}

/**
 * Return Heat-Map Component
 * Shows position returns across different time periods
 */
export default function ReturnHeatMap({
  positions,
  snapshots,
}: ReturnHeatMapProps) {
  const returnData = useMemo(() => {
    if (snapshots.length === 0) return [];

    const now = new Date();
    const data: ReturnData[] = [];

    positions.forEach((position) => {
      const currentValue = position.currentValue;

      // Find historical snapshots at different time points
      const dayAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 1 && diffDays < 2;
      });

      const weekAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 7 && diffDays < 8;
      });

      const monthAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 30 && diffDays < 31;
      });

      const threeMonthsAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 90 && diffDays < 91;
      });

      const sixMonthsAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 180 && diffDays < 181;
      });

      const yearAgo = snapshots.find((s) => {
        const date = new Date(s.date);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 365 && diffDays < 366;
      });

      const dayValue = dayAgo
        ? getPositionValueFromSnapshot(dayAgo, position.ticker)
        : undefined;
      const weekValue = weekAgo
        ? getPositionValueFromSnapshot(weekAgo, position.ticker)
        : undefined;
      const monthValue = monthAgo
        ? getPositionValueFromSnapshot(monthAgo, position.ticker)
        : undefined;
      const threeMonthValue = threeMonthsAgo
        ? getPositionValueFromSnapshot(threeMonthsAgo, position.ticker)
        : undefined;
      const sixMonthValue = sixMonthsAgo
        ? getPositionValueFromSnapshot(sixMonthsAgo, position.ticker)
        : undefined;
      const yearValue = yearAgo
        ? getPositionValueFromSnapshot(yearAgo, position.ticker)
        : undefined;

      data.push({
        ticker: position.ticker,
        day: calculateReturn(currentValue, dayValue),
        week: calculateReturn(currentValue, weekValue),
        month: calculateReturn(currentValue, monthValue),
        threeMonth: calculateReturn(currentValue, threeMonthValue),
        sixMonth: calculateReturn(currentValue, sixMonthValue),
        year: calculateReturn(currentValue, yearValue),
      });
    });

    // Sort by allocation (largest first)
    return data.sort((a, b) => {
      const aPos = positions.find((p) => p.ticker === a.ticker);
      const bPos = positions.find((p) => p.ticker === b.ticker);
      return (bPos?.currentValue || 0) - (aPos?.currentValue || 0);
    });
  }, [positions, snapshots]);

  // Get color for return value (color-blind friendly)
  const getColor = (returnValue: number): string => {
    if (returnValue > 10) return '#10b981'; // Strong green
    if (returnValue > 5) return '#34d399'; // Medium green
    if (returnValue > 0) return '#6ee7b7'; // Light green
    if (returnValue === 0) return 'var(--surface-elevated)'; // Neutral
    if (returnValue > -5) return '#fca5a5'; // Light red
    if (returnValue > -10) return '#f87171'; // Medium red
    return '#ef4444'; // Strong red
  };

  const periods = [
    { key: 'day', label: '1D' },
    { key: 'week', label: '1W' },
    { key: 'month', label: '1M' },
    { key: 'threeMonth', label: '3M' },
    { key: 'sixMonth', label: '6M' },
    { key: 'year', label: '1Y' },
  ] as const;

  if (returnData.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        No return data available. Historical snapshots needed.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        padding: 'var(--space-4)',
        overflowX: 'auto',
      }}
    >
      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Return Heat-Map
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: 'var(--space-2)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                Ticker
              </th>
              {periods.map((period) => (
                <th
                  key={period.key}
                  style={{
                    padding: 'var(--space-2)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {period.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returnData.map((row) => (
              <tr
                key={row.ticker}
                style={{
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td
                  style={{
                    padding: 'var(--space-3)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {row.ticker}
                </td>
                {periods.map((period) => {
                  const value = row[period.key];
                  const color = getColor(value);

                  return (
                    <td
                      key={period.key}
                      style={{
                        padding: 'var(--space-3)',
                        textAlign: 'center',
                        background: color,
                        color: Math.abs(value) > 5 ? 'white' : 'var(--text)',
                        fontWeight: 'var(--font-medium)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer',
                        transition: 'var(--transition-base)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={`${row.ticker} ${period.label}: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                    >
                      {value !== 0 ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          Legend:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#10b981',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {'>'} 10%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#34d399',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            5-10%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#6ee7b7',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            0-5%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#fca5a5',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            -5-0%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#f87171',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            -10 to -5%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#ef4444',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {'<'} -10%
          </span>
        </div>
      </div>
    </div>
  );
}











