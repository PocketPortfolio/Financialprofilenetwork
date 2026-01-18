'use client';

interface TerminalSummaryProps {
  totalInvested: number;
  totalTrades: number;
  totalPositions: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  loading?: boolean;
}

export function TerminalSummary({
  totalInvested,
  totalTrades,
  totalPositions,
  totalUnrealizedPL,
  totalUnrealizedPLPercent,
  loading = false
}: TerminalSummaryProps) {
  const monoFont = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
  const isPositive = totalUnrealizedPL >= 0;
  
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card" style={{ padding: '20px' }}>
            <div style={{
              height: '12px',
              width: '80px',
              background: 'hsl(var(--muted))',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            <div style={{
              height: '32px',
              width: '120px',
              background: 'hsl(var(--muted))',
              borderRadius: '4px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div 
      data-tour="terminal-summary"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
      {/* Card 1: Total Invested */}
      <div className="dashboard-card" style={{ padding: '20px' }}>
        <div style={{
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          fontFamily: monoFont,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px'
        }}>
          Total Invested
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'hsl(var(--foreground))',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.2'
        }}>
          ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Card 2: Total Trades */}
      <div className="dashboard-card" style={{ padding: '20px' }}>
        <div style={{
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          fontFamily: monoFont,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px'
        }}>
          Trades
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'hsl(var(--foreground))',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.2'
        }}>
          {totalTrades}
        </div>
      </div>

      {/* Card 3: Unrealized P/L */}
      <div className="dashboard-card" style={{ padding: '20px' }}>
        <div style={{
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          fontFamily: monoFont,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px'
        }}>
          Unrealized P/L
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: isPositive ? 'hsl(var(--accent))' : 'hsl(var(--danger))',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.2',
          marginBottom: '4px'
        }}>
          {isPositive ? '+' : ''}${Math.abs(totalUnrealizedPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{
          fontSize: '14px',
          fontFamily: monoFont,
          color: isPositive ? 'hsl(var(--accent))' : 'hsl(var(--danger))',
          padding: '4px 8px',
          background: isPositive ? 'hsla(var(--accent), 0.1)' : 'hsla(var(--danger), 0.1)',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {isPositive ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

