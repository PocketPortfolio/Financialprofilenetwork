'use client';

import { useMemo } from 'react';
import type { PortfolioNotesState } from '@/app/lib/portfolio/schema';
import type { Trade } from '@/app/services/tradeService';

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export interface PortfolioNotesPanelProps {
  tickers: string[];
  trades: Trade[];
  notes: PortfolioNotesState;
  onHoldingNoteChange: (ticker: string, body: string) => void;
  onTradeNoteChange: (tradeId: string, body: string) => void;
  onRemoveOrphan: (tradeId: string) => void;
  /** Dashboard vs warm card styling */
  variant?: 'terminal' | 'warm';
}

export function PortfolioNotesPanel({
  tickers,
  trades,
  notes,
  onHoldingNoteChange,
  onTradeNoteChange,
  onRemoveOrphan,
  variant = 'terminal',
}: PortfolioNotesPanelProps) {
  /** Open positions plus any ticker that already has a saved thesis (e.g. closed lots — notes still on Drive). */
  const sortedTickers = useMemo(() => {
    const fromPositions = tickers.map((t) => t.trim().toUpperCase()).filter(Boolean);
    const fromNotes = Object.keys(notes.byTicker).map((t) => t.trim().toUpperCase()).filter(Boolean);
    return [...new Set([...fromPositions, ...fromNotes])].sort();
  }, [tickers, notes.byTicker]);
  const orphanIds = Object.keys(notes.orphanedByTradeId).sort();

  const border =
    variant === 'terminal'
      ? '1px solid hsl(var(--border))'
      : '1px solid var(--card-border)';
  const labelColor =
    variant === 'terminal' ? 'hsl(var(--muted-foreground))' : 'var(--text-warm)';
  const fg = variant === 'terminal' ? 'hsl(var(--foreground))' : 'var(--text)';
  const muted = variant === 'terminal' ? 'hsl(var(--muted-foreground))' : 'var(--muted)';
  const surface = variant === 'terminal' ? 'hsl(var(--card))' : 'var(--bg)';

  return (
    <div
      style={{
        padding: variant === 'terminal' ? '16px' : '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          fontFamily: MONO,
          color: muted,
          lineHeight: 1.5,
        }}
      >
        Stored on this device and in your Drive JSON. Not sent to Firestore. Optional AI context
        injection can come later as an explicit opt-in.
      </p>

      <section>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: MONO,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: labelColor,
          }}
        >
          Holding thesis (by ticker)
        </h3>
        {sortedTickers.length === 0 ? (
          <p style={{ margin: 0, color: muted, fontSize: '13px' }}>
            No ticker-level thesis yet. Open a position to add one, or pull notes from Drive if you wrote them on another device.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedTickers.map((ticker) => (
              <div
                key={ticker}
                style={{
                  border,
                  borderRadius: '6px',
                  padding: '12px',
                  background: surface,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-warm, #f59e0b)',
                    marginBottom: '8px',
                  }}
                >
                  {ticker}
                </div>
                <textarea
                  value={notes.byTicker[ticker]?.body ?? ''}
                  onChange={(e) => onHoldingNoteChange(ticker, e.target.value)}
                  placeholder="Why you own this name, risks, exit criteria…"
                  rows={3}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: MONO,
                    fontSize: '13px',
                    color: fg,
                    background: variant === 'terminal' ? 'hsl(var(--background))' : 'var(--surface)',
                    border: border,
                    borderRadius: '4px',
                    padding: '8px',
                    resize: 'vertical',
                    minHeight: '72px',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: MONO,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: labelColor,
          }}
        >
          Trade notes (by trade id)
        </h3>
        {trades.length === 0 ? (
          <p style={{ margin: 0, color: muted, fontSize: '13px' }}>No trades yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trades.map((trade) => (
              <div
                key={trade.id}
                style={{
                  border,
                  borderRadius: '6px',
                  padding: '12px',
                  background: surface,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: '11px',
                    color: muted,
                    marginBottom: '8px',
                  }}
                >
                  {trade.ticker} · {trade.type} · {trade.date} · id {trade.id.slice(0, 8)}…
                </div>
                <textarea
                  value={notes.byTradeId[trade.id]?.body ?? ''}
                  onChange={(e) => onTradeNoteChange(trade.id, e.target.value)}
                  placeholder="Note for this specific fill…"
                  rows={2}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: MONO,
                    fontSize: '13px',
                    color: fg,
                    background: variant === 'terminal' ? 'hsl(var(--background))' : 'var(--surface)',
                    border: border,
                    borderRadius: '4px',
                    padding: '8px',
                    resize: 'vertical',
                    minHeight: '56px',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: MONO,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: labelColor,
          }}
        >
          Orphaned notes (deleted trades)
        </h3>
        {orphanIds.length === 0 ? (
          <p style={{ margin: 0, color: muted, fontSize: '13px' }}>None. Notes move here when a trade is deleted.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orphanIds.map((id) => {
              const o = notes.orphanedByTradeId[id];
              return (
                <div
                  key={id}
                  style={{
                    border,
                    borderRadius: '6px',
                    padding: '12px',
                    background: surface,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: '11px',
                      color: muted,
                      marginBottom: '8px',
                    }}
                  >
                    {o.tickerHint ? `${o.tickerHint} · ` : ''}trade {id.slice(0, 8)}… · archived {o.updatedAt}
                  </div>
                  <pre
                    style={{
                      margin: '0 0 10px 0',
                      whiteSpace: 'pre-wrap',
                      fontFamily: MONO,
                      fontSize: '13px',
                      color: fg,
                    }}
                  >
                    {o.body}
                  </pre>
                  <button
                    type="button"
                    onClick={() => onRemoveOrphan(id)}
                    style={{
                      fontFamily: MONO,
                      fontSize: '11px',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: border,
                      background: 'transparent',
                      color: muted,
                      cursor: 'pointer',
                    }}
                  >
                    Remove from archive
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
