'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface BriefProps {
  netWorthChange: number; // e.g., 2.4
  topMover: { symbol: string; change: number };
}

export function MorningBrief({ netWorthChange, topMover }: BriefProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sentiment = netWorthChange >= 0 ? 'Bullish' : 'Bearish';
  const sentimentColor = netWorthChange >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--danger))';
  const sentimentBg = netWorthChange >= 0 ? 'hsla(var(--accent), 0.1)' : 'hsla(var(--danger), 0.1)';
  const sentimentBorder = netWorthChange >= 0 ? 'hsla(var(--accent), 0.2)' : 'hsla(var(--danger), 0.2)';
  
  const analysisText = `Your portfolio is ${netWorthChange >= 0 ? 'outperforming' : 'lagging'} the market today. Performance is primarily driven by ${topMover.symbol} moving ${topMover.change > 0 ? '+' : ''}${topMover.change.toFixed(2)}% intraday. Sector exposure remains balanced.`;
  const truncatedText = analysisText.length > 120 ? analysisText.substring(0, 120) + '...' : analysisText;

  return (
    <section className="dashboard-card">
      {/* 🧠 PULITZER BRANDING HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '16px' }}>🧠</span>
        <h3 style={{
          fontSize: '12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          color: 'hsl(var(--accent))',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          fontWeight: '600'
        }}>
          Pulitzer AI • Autonomous Brief
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto 1fr auto' : '1fr',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* LEFT: Daily Sentiment Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: sentimentBg,
            border: `1px solid ${sentimentBorder}`
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: sentimentColor
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: sentimentColor,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {sentiment}
            </span>
          </div>
        </div>

        {/* MIDDLE: Analysis Text */}
        <div>
          <p style={{
            fontSize: '14px',
            color: 'hsl(var(--muted-foreground))',
            fontWeight: '300',
            lineHeight: '1.6',
            margin: 0
          }}>
            {isExpanded ? analysisText : truncatedText}
            {analysisText.length > 120 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  marginLeft: '8px',
                  color: 'hsl(var(--accent))',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>

        {/* RIGHT: Key Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Top Mover</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                fontWeight: '700',
                color: 'hsl(var(--foreground))'
              }}>
                {topMover.symbol}
              </span>
              <span style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                fontSize: '14px',
                color: topMover.change >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--danger))'
              }}>
                {topMover.change > 0 ? '+' : ''}{topMover.change.toFixed(2)}%
              </span>
              {topMover.change >= 0 ? (
                <TrendingUp style={{ width: '16px', height: '16px', color: 'hsl(var(--accent))' }} />
              ) : (
                <TrendingDown style={{ width: '16px', height: '16px', color: 'hsl(var(--danger))' }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SOURCE FOOTER */}
      <div style={{
        display: 'flex',
        gap: '8px',
        fontSize: '11px',
        color: 'hsl(var(--muted-foreground))',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: `1px solid hsl(var(--border))`
      }}>
        <span>SOURCE: REAL-TIME MARKET DATA</span>
        <span>•</span>
        <span>VERIFIED BY POCKET PORTFOLIO</span>
      </div>
    </section>
  );
}

