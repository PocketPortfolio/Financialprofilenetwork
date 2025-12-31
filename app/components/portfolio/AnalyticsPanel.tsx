'use client';

import React from 'react';
import type { PortfolioAnalytics } from '@/app/lib/portfolio/types';

interface AnalyticsPanelProps {
  analytics: PortfolioAnalytics | null;
  loading?: boolean;
}

/**
 * Analytics Panel Component
 * Displays comprehensive portfolio metrics
 */
export default function AnalyticsPanel({
  analytics,
  loading = false,
}: AnalyticsPanelProps) {
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '100px',
              background: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              animation: 'pulse 2s infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        No analytics data available
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Value',
      value: `$${analytics.totalValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      description: 'Current portfolio value',
    },
    {
      label: 'Daily Change',
      value: `${analytics.dailyChange >= 0 ? '+' : ''}$${analytics.dailyChange.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      valuePercent: `${analytics.dailyChangePercent >= 0 ? '+' : ''}${analytics.dailyChangePercent.toFixed(2)}%`,
      color: analytics.dailyChange >= 0 ? 'var(--signal)' : 'var(--danger)',
      description: 'Change in portfolio value today',
    },
    {
      label: 'All-Time Return',
      value: `${analytics.allTimeReturn >= 0 ? '+' : ''}$${analytics.allTimeReturn.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      valuePercent: `${analytics.allTimeReturnPercent >= 0 ? '+' : ''}${analytics.allTimeReturnPercent.toFixed(2)}%`,
      color: analytics.allTimeReturn >= 0 ? 'var(--signal)' : 'var(--danger)',
      description: 'Total return since first investment',
    },
    {
      label: 'Annualized Return',
      value: `${analytics.annualizedReturn >= 0 ? '+' : ''}${analytics.annualizedReturn.toFixed(2)}%`,
      color: analytics.annualizedReturn >= 0 ? 'var(--signal)' : 'var(--danger)',
      description: 'Average annual return',
    },
    {
      label: 'Volatility',
      value: `${analytics.volatility.toFixed(2)}%`,
      description: 'Standard deviation of returns (risk measure)',
    },
    {
      label: 'Sharpe Ratio',
      value: analytics.sharpeRatio.toFixed(2),
      description: 'Risk-adjusted return (higher is better)',
    },
    {
      label: 'Beta',
      value: analytics.beta.toFixed(2),
      description: 'Sensitivity to market movements (1.0 = market average)',
    },
    {
      label: 'Max Drawdown',
      value: `${analytics.maxDrawdown.toFixed(2)}%`,
      color: 'var(--danger)',
      description: 'Largest peak-to-trough decline',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}
    >
      {metrics.map((metric, index) => (
        <div
          key={index}
          style={{
            padding: 'var(--space-4)',
            background: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            position: 'relative',
            transition: 'var(--transition-base)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--signal)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title={metric.description}
          role="region"
          aria-label={`${metric.label} metric`}
          tabIndex={0}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {metric.label}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-semibold)',
              color: metric.color || 'var(--text)',
              marginBottom: metric.valuePercent ? 'var(--space-1)' : 0,
            }}
          >
            {metric.value}
          </div>
          {metric.valuePercent && (
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: metric.color || 'var(--text-secondary)',
                fontWeight: 'var(--font-medium)',
              }}
            >
              {metric.valuePercent}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

