'use client';

import type { PortfolioAnalytics } from '@/app/lib/portfolio/types';

interface RiskMatrixProps {
  analytics: PortfolioAnalytics | null;
  loading?: boolean;
  isSynthetic?: boolean;
  isPremium?: boolean;
}

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export function RiskMatrix({
  analytics,
  loading = false,
  isSynthetic = false,
  isPremium = false,
}: RiskMatrixProps) {
  if (loading) {
    return (
      <div
        className="dashboard-card"
        data-tour="risk-matrix"
        style={{ padding: '20px', marginBottom: '24px' }}
      >
        <div
          style={{
            height: '12px',
            width: '120px',
            background: 'hsl(var(--muted))',
            borderRadius: '4px',
            marginBottom: '16px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '72px',
                background: 'hsl(var(--muted))',
                borderRadius: '8px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const hasRiskData =
    analytics.beta !== 0 ||
    analytics.maxDrawdown !== 0 ||
    analytics.sharpeRatio !== 0 ||
    isSynthetic;

  if (!hasRiskData) return null;

  const sharpeLabel = isSynthetic && !isPremium ? 'Sharpe (Est.)' : 'Sharpe Ratio';
  const sharpeDisplay =
    analytics.sharpeRatio !== 0 ? analytics.sharpeRatio.toFixed(2) : '—';

  const cells = [
    {
      label: 'Beta',
      value: analytics.beta !== 0 ? analytics.beta.toFixed(2) : '—',
      hint: 'vs market (1.0 = average)',
      color: 'hsl(var(--foreground))',
    },
    {
      label: 'Max Drawdown',
      value: analytics.maxDrawdown !== 0 ? `${analytics.maxDrawdown.toFixed(2)}%` : '—',
      hint: 'Peak-to-trough decline',
      color: 'hsl(var(--destructive))',
    },
    {
      label: sharpeLabel,
      value: sharpeDisplay,
      hint: 'Risk-adjusted return',
      color: 'hsl(var(--foreground))',
    },
  ];

  return (
    <section
      className="dashboard-card"
      data-tour="risk-matrix"
      style={{
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid var(--dashboard-chrome-border-subtle)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent) 0%, var(--surface) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h3
          style={{
            fontSize: '11px',
            fontFamily: MONO,
            color: 'var(--accent-warm)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
            fontWeight: 700,
          }}
        >
          Risk Matrix
        </h3>
        {isSynthetic && (
          <span
            style={{
              fontSize: '10px',
              fontFamily: MONO,
              color: 'hsl(var(--muted-foreground))',
              border: '1px solid var(--dashboard-chrome-border-subtle)',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            Estimated from trade history
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.label}
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid var(--dashboard-chrome-border-subtle)',
              background: 'var(--surface-elevated)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontFamily: MONO,
                color: 'hsl(var(--muted-foreground))',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              {cell.label}
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: cell.color,
                lineHeight: 1.1,
                fontFamily: MONO,
              }}
            >
              {cell.value}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'hsl(var(--muted-foreground))',
                marginTop: '6px',
              }}
            >
              {cell.hint}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
