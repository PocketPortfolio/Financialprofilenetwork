'use client';

interface TerminalSummaryProps {
  totalPortfolioValue: number;
  allTimeReturn: number;
  allTimeReturnPercent: number;
  benchmarkAlphaPercent: number | null;
  totalTrades: number;
  totalPositions: number;
  totalInvested?: number;
  loading?: boolean;
  returnLabel?: 'All-Time' | 'Unrealized';
}

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export function TerminalSummary({
  totalPortfolioValue,
  allTimeReturn,
  allTimeReturnPercent,
  benchmarkAlphaPercent,
  totalTrades,
  totalPositions,
  totalInvested,
  loading = false,
  returnLabel = 'All-Time',
}: TerminalSummaryProps) {
  const isPositiveReturn = allTimeReturn >= 0;
  const alpha =
    benchmarkAlphaPercent != null && Number.isFinite(benchmarkAlphaPercent)
      ? benchmarkAlphaPercent
      : null;
  const alphaPositive = alpha != null && alpha >= 0;

  if (loading) {
    return (
      <div
        className="dashboard-card"
        data-tour="terminal-summary"
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <div
          style={{
            height: '12px',
            width: '160px',
            background: 'hsl(var(--muted))',
            borderRadius: '4px',
            marginBottom: '12px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div
          style={{
            height: '48px',
            width: '240px',
            background: 'hsl(var(--muted))',
            borderRadius: '4px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>
    );
  }

  return (
    <section
      className="dashboard-card"
      data-tour="terminal-summary"
      style={{
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid var(--dashboard-chrome-border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: MONO,
              color: 'hsl(var(--muted-foreground))',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            Total Portfolio Value
          </div>
          <div
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            $
            {totalPortfolioValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontFamily: MONO,
                color: isPositiveReturn ? 'var(--accent-warm)' : 'hsl(var(--destructive))',
                fontWeight: 600,
              }}
            >
              {returnLabel} {isPositiveReturn ? '+' : ''}$
              {Math.abs(allTimeReturn).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              ({isPositiveReturn ? '+' : ''}
              {allTimeReturnPercent.toFixed(2)}%)
            </span>

            <span
              style={{
                fontSize: '12px',
                fontFamily: MONO,
                padding: '4px 10px',
                borderRadius: '9999px',
                border: `1px solid ${alpha != null ? (alphaPositive ? 'var(--accent-warm)' : 'hsl(var(--destructive))') : 'var(--dashboard-chrome-border-subtle)'}`,
                color:
                  alpha != null
                    ? alphaPositive
                      ? 'var(--accent-warm)'
                      : 'hsl(var(--destructive))'
                    : 'hsl(var(--muted-foreground))',
                background:
                  alpha != null
                    ? alphaPositive
                      ? 'color-mix(in srgb, var(--accent-warm) 12%, transparent)'
                      : 'color-mix(in srgb, hsl(var(--destructive)) 12%, transparent)'
                    : 'transparent',
              }}
            >
              {alpha != null
                ? `vs S&P 500: ${alphaPositive ? '+' : ''}${alpha.toFixed(2)}% α`
                : 'vs S&P 500: —'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            fontFamily: MONO,
            fontSize: '12px',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          <div>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Positions
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'hsl(var(--foreground))',
              }}
            >
              {totalPositions}
            </div>
          </div>
          <div>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Trades
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'hsl(var(--foreground))',
              }}
            >
              {totalTrades}
            </div>
          </div>
          {typeof totalInvested === 'number' && totalInvested > 0 && (
            <div>
              <div
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
              >
                Invested
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                $
                {totalInvested.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
