'use client';

import React from 'react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import { getSectorSync } from '@/app/lib/portfolio/sectorService';
import { GICS_SECTOR_INFO } from '@/app/lib/portfolio/sectorClassification';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Position & {
      percentage?: number;
      color?: string;
    };
  }>;
  label?: string;
}

/**
 * Enhanced tooltip component for portfolio charts
 * Displays comprehensive position information on hover
 */
export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const position = data as Position & { percentage?: number; color?: string };
  
  // Get sector information
  const sectorEnum = getSectorSync(position.ticker);
  const sector = GICS_SECTOR_INFO[sectorEnum].name;
  const totalValue = position.currentValue;
  const percentage = position.percentage || 0;
  const costBasis = position.avgCost * position.shares;
  const unrealizedPL = position.unrealizedPL;
  const unrealizedPLPercent = position.unrealizedPLPercent;

  return (
    <div
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
          }}
        >
          {position.ticker}
        </div>
        {position.color && (
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: position.color,
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Sector */}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {sector}
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {/* Quantity */}
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
            Quantity
          </div>
          <div style={{ color: 'var(--text)', fontWeight: 'var(--font-medium)' }}>
            {position.shares.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Market Value */}
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
            Market Value
          </div>
          <div style={{ color: 'var(--text)', fontWeight: 'var(--font-medium)' }}>
            ${totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* % of Portfolio */}
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
            % of Portfolio
          </div>
          <div style={{ color: 'var(--text)', fontWeight: 'var(--font-medium)' }}>
            {percentage.toFixed(2)}%
          </div>
        </div>

        {/* Cost Basis */}
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
            Cost Basis
          </div>
          <div style={{ color: 'var(--text)', fontWeight: 'var(--font-medium)' }}>
            ${costBasis.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Unrealized P/L */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-2)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            marginBottom: '4px',
          }}
        >
          Unrealized P/L
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-semibold)',
              color:
                unrealizedPL >= 0 ? 'var(--signal)' : 'var(--danger)',
            }}
          >
            {unrealizedPL >= 0 ? '+' : ''}
            ${unrealizedPL.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color:
                unrealizedPLPercent >= 0 ? 'var(--signal)' : 'var(--danger)',
              fontWeight: 'var(--font-medium)',
            }}
          >
            ({unrealizedPLPercent >= 0 ? '+' : ''}
            {unrealizedPLPercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}

