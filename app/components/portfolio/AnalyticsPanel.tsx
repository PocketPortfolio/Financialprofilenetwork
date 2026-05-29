'use client';

import React from 'react';
import type { PortfolioAnalytics } from '@/app/lib/portfolio/types';
import { trackPaywallCtaClick, trackPaywallImpression } from '@/app/lib/analytics/events';

interface AnalyticsPanelProps {
  analytics: PortfolioAnalytics | null;
  loading?: boolean;
  isPremium?: boolean;
}

type MetricConfig = {
  label: string;
  value: string;
  valuePercent?: string;
  color: string;
  description: string;
  premium?: boolean;
};

/**
 * Retail-focused activity metrics. Risk lives in RiskMatrix.
 */
export default function AnalyticsPanel({
  analytics,
  loading = false,
  isPremium = false,
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
          border: '1px solid var(--dashboard-chrome-border)',
        }}
      >
        {[...Array(4)].map((_, i) => (
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
          border: '1px solid var(--dashboard-chrome-border)',
          color: 'var(--dashboard-muted-foreground)',
          textAlign: 'center',
        }}
      >
        No analytics data available
      </div>
    );
  }

  const metrics: MetricConfig[] = [
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
      premium: true,
    },
    {
      label: 'Volatility',
      value: `${analytics.volatility.toFixed(2)}%`,
      color: 'hsl(var(--foreground))',
      description: 'Standard deviation of returns',
      premium: true,
    },
  ];

  const handleUpgradeClick = () => {
    trackPaywallImpression('risk_metric_unlock_attempt', '/dashboard', isPremium ? 'foundersClub' : null);
    trackPaywallCtaClick(
      'risk_metric_unlock_attempt',
      '/sponsor?utm_source=dashboard&utm_medium=analytics_panel_gate&utm_campaign=intent_trigger&utm_content=risk_metric_unlock_attempt',
      '/dashboard',
      isPremium ? 'foundersClub' : null
    );
    window.location.href =
      '/sponsor?utm_source=dashboard&utm_medium=analytics_panel_gate&utm_campaign=intent_trigger&utm_content=risk_metric_unlock_attempt&trigger_source=risk_metric_unlock_attempt';
  };

  const shellStyle = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--dashboard-chrome-border)',
  } as const;

  return (
    <div style={shellStyle}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          alignItems: 'stretch',
        }}
      >
        {metrics.map((metric) => {
          const locked = Boolean(metric.premium && !isPremium);

          return (
            <div
              key={metric.label}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--dashboard-chrome-border)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '108px',
                transition: 'var(--transition-base)',
                cursor: locked ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (locked) handleUpgradeClick();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = locked ? 'var(--accent-warm)' : 'var(--signal)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--dashboard-chrome-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={
                locked ? 'Founders unlock Annualized Return and Volatility' : metric.description
              }
              role="region"
              aria-label={`${metric.label} metric`}
              tabIndex={0}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: 'var(--space-2)',
                  minHeight: '2.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.35,
                  }}
                >
                  {metric.label}
                </span>
                {locked && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-warm)',
                      border: '1px solid var(--border-warm)',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      whiteSpace: 'nowrap',
                      marginTop: '1px',
                    }}
                  >
                    Founders
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: locked ? 'var(--text-secondary)' : metric.color,
                  lineHeight: 1.2,
                  userSelect: locked ? 'none' : 'auto',
                }}
              >
                {locked ? '—' : metric.value}
              </div>

              {/* Reserve second value line so tiles align with Daily / All-Time */}
              <div
                style={{
                  minHeight: '1.35rem',
                  marginTop: 'var(--space-1)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: locked ? 'transparent' : metric.color,
                  lineHeight: 1.35,
                }}
                aria-hidden={locked}
              >
                {locked ? '\u00a0' : metric.valuePercent ?? '\u00a0'}
              </div>
            </div>
          );
        })}
      </div>

      {!isPremium && (
        <p
          style={{
            margin: 0,
            padding: 'var(--space-3) var(--space-4) var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            borderTop: '1px solid var(--dashboard-chrome-border)',
          }}
        >
          Founders unlock Annualized Return and Volatility (shown above when upgraded).
        </p>
      )}
    </div>
  );
}
