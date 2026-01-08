'use client';

import React from 'react';
import { OptimizedTooltip } from '../shared/OptimizedTooltip';

interface RevenueMetrics {
  currentRevenue: number;
  projectedRevenue: number;
  pipelineValue: number;
  targetRevenue: number;
  progressPercentage: number;
}

interface RevenueWidgetProps {
  metrics: RevenueMetrics;
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <OptimizedTooltip content={content}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        <span
          style={{
            marginLeft: 'var(--space-1)',
            cursor: 'help',
            color: 'var(--info)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-semibold)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--info-muted)',
            transition: 'all var(--transition-fast)',
            lineHeight: 1,
          }}
        >
          ?
        </span>
      </span>
    </OptimizedTooltip>
  );
}

export function RevenueWidget({ metrics }: RevenueWidgetProps) {
  return (
    <div className="brand-card brand-card-elevated" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
          Revenue Target
        </h2>
        <Tooltip content="Current Revenue: Sum of all CONVERTED leads' deal values (from Stripe webhooks). This is real cash, not projections.">
          <span style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-bold)',
            color: 'var(--signal)',
          }}>
            £{metrics.currentRevenue.toLocaleString()}
          </span>
        </Tooltip>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <Tooltip content="Progress: (Current Revenue / £5,000 Target) × 100%. Shows how close we are to monthly revenue goal.">
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Progress
            </span>
          </Tooltip>
          <span style={{ color: 'var(--text)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-semibold)' }}>
            {metrics.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '24px',
            backgroundColor: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: `${metrics.progressPercentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, var(--signal) 0%, var(--accent-warm) 100%)`,
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 'var(--space-2)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
            £0
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
            £{metrics.targetRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 'var(--space-4)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--border)',
      }}>
        <div>
          <Tooltip content="Current Revenue: Real cash from CONVERTED leads only. Pulled from Stripe webhooks. This is actual revenue, not projected.">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Current
            </div>
          </Tooltip>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text)' }}>
            £{metrics.currentRevenue.toLocaleString()}
          </div>
        </div>
        <div>
          <Tooltip content="Projected Revenue: Weighted sum of all active leads' deal values × stage probability. CONTACTED = 15%, INTERESTED = 40%, NEGOTIATING = 60%. This is an estimate, not guaranteed.">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Projected
            </div>
          </Tooltip>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-bold)', color: 'var(--signal)' }}>
            £{metrics.projectedRevenue.toLocaleString()}
          </div>
        </div>
        <div>
          <Tooltip content="Pipeline Value: Sum of Annual Contract Value (ACV) for all active leads (excluding NOT_INTERESTED, DO_NOT_CONTACT, CONVERTED). This represents total potential revenue if all leads converted.">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Pipeline
            </div>
          </Tooltip>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-bold)', color: 'var(--info)' }}>
            £{metrics.pipelineValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}





