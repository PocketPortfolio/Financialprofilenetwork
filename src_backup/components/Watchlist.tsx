/**
 * Watchlist Component - Track multiple symbols with live prices
 */
import { useState, useEffect } from 'react';
import { useLivePrices } from '@/hooks/useLivePrices';
import { Skeleton } from './Skeleton';

interface WatchlistProps {
  symbols: string[];
  onSymbolRemove?: (symbol: string) => void;
  onSymbolAdd?: (symbol: string) => void;
}

export default function Watchlist({ symbols, onSymbolRemove, onSymbolAdd }: WatchlistProps) {
  const { quotes, loading } = useLivePrices(symbols);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim() && !symbols.includes(newSymbol.trim().toUpperCase())) {
      onSymbolAdd?.(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  const formatChange = (change: number | null | undefined, changePct: number | null | undefined) => {
    if (change === null || change === undefined) return '—';
    const sign = change >= 0 ? '+' : '';
    const pct = changePct !== null && changePct !== undefined ? ` (${sign}${changePct.toFixed(2)}%)` : '';
    return `${sign}${change.toFixed(2)}${pct}`;
  };

  return (
    <div
      className="watchlist"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
      }}
      role="region"
      aria-label="Watchlist"
    >
      <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Watchlist</h3>

      {/* Add Symbol Form */}
      {onSymbolAdd && (
        <form onSubmit={handleAdd} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            placeholder="Add symbol (e.g., AAPL)"
            maxLength={10}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
            }}
            aria-label="Symbol to add"
          />
          <button
            type="submit"
            disabled={!newSymbol.trim()}
            style={{
              padding: '8px 16px',
              background: newSymbol.trim() ? '#0066cc' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: newSymbol.trim() ? 'pointer' : 'not-allowed',
              fontSize: 14,
            }}
            aria-label="Add symbol to watchlist"
          >
            Add
          </button>
        </form>
      )}

      {/* Symbol List */}
      {loading && quotes.length === 0 ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <Skeleton height={60} />
            </div>
          ))}
        </div>
      ) : symbols.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>
          No symbols in watchlist. Add one to get started!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {quotes.map(quote => {
            const changeColor =
              quote.change === null || quote.change === undefined
                ? '#666'
                : quote.change >= 0
                ? '#16a34a'
                : '#dc2626';

            return (
              <li
                key={quote.symbol}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {quote.symbol}
                  </div>
                  {quote.name && (
                    <div style={{ fontSize: 12, color: '#666' }}>{quote.name}</div>
                  )}
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    marginLeft: 16,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {quote.price !== null ? `$${quote.price.toFixed(2)}` : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: changeColor }}>
                    {formatChange(quote.change, (quote as any).changePct)}
                  </div>
                </div>

                {onSymbolRemove && (
                  <button
                    onClick={() => onSymbolRemove(quote.symbol)}
                    style={{
                      marginLeft: 12,
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '#666',
                    }}
                    aria-label={`Remove ${quote.symbol} from watchlist`}
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {loading && quotes.length > 0 && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#666',
            textAlign: 'center',
          }}
          role="status"
          aria-live="polite"
        >
          Refreshing prices...
        </div>
      )}
    </div>
  );
}

