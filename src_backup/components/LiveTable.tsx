import { useMemo } from 'react';
import { useLivePrices } from '@/hooks/useLivePrices';
import { SkeletonTable } from './Skeleton';

interface LiveTableProps {
  tickers: string[];
  showName?: boolean;
}

export default function LiveTable({ tickers, showName = false }: LiveTableProps) {
  const symbols = useMemo(() => [...new Set(tickers)].filter(Boolean), [tickers.join(',')]);
  const { quotes, loading } = useLivePrices(symbols);

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined) return '—';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  if (loading && quotes.length === 0) {
    return <SkeletonTable rows={5} columns={showName ? 4 : 3} />;
  }

  return (
    <div style={{ overflowX: 'auto' }} role="region" aria-label="Live prices table">
      <table
        className="table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th
              scope="col"
              style={{
                padding: 12,
                textAlign: 'left',
                borderBottom: '2px solid #ddd',
                fontWeight: 600,
              }}
            >
              Ticker
            </th>
            {showName && (
              <th
                scope="col"
                style={{
                  padding: 12,
                  textAlign: 'left',
                  borderBottom: '2px solid #ddd',
                  fontWeight: 600,
                }}
              >
                Name
              </th>
            )}
            <th
              scope="col"
              style={{
                padding: 12,
                textAlign: 'right',
                borderBottom: '2px solid #ddd',
                fontWeight: 600,
              }}
            >
              Price
            </th>
            <th
              scope="col"
              style={{
                padding: 12,
                textAlign: 'right',
                borderBottom: '2px solid #ddd',
                fontWeight: 600,
              }}
            >
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 ? (
            <tr>
              <td colSpan={showName ? 4 : 3} style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                No symbols to display
              </td>
            </tr>
          ) : (
            quotes.map(q => {
              const changeColor =
                q.change === null || q.change === undefined
                  ? '#666'
                  : q.change >= 0
                  ? '#16a34a'
                  : '#dc2626';

              return (
                <tr key={q.symbol} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{q.symbol}</td>
                  {showName && (
                    <td style={{ padding: 12, color: '#666', fontSize: 13 }}>{q.name || '—'}</td>
                  )}
                  <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                    {q.price == null ? '—' : `$${q.price.toFixed(2)}`}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: 'right',
                      color: changeColor,
                      fontWeight: 500,
                    }}
                  >
                    {formatChange(q.change)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
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
          Refreshing...
        </div>
      )}
    </div>
  );
}
