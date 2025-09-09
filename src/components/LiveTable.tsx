import { useMemo } from 'react';
import { useLivePrices } from '@hooks/useLivePrices';

export default function LiveTable({ tickers }: { tickers: string[] }) {
  const symbols = useMemo(() => [...new Set(tickers)].filter(Boolean), [tickers.join(',')]);
  const { quotes, loading } = useLivePrices(symbols);

  return (
    <table className="table">
      <thead><tr><th>Ticker</th><th>Price</th><th>Change</th></tr></thead>
      <tbody>
        {loading && <tr><td colSpan={3}>Loading…</td></tr>}
        {!loading && quotes.map(q => (
          <tr key={q.symbol}>
            <td>{q.symbol}</td>
            <td>{q.price == null ? '—' : q.price.toFixed(2)}</td>
            <td>{q.change == null ? '—' : q.change.toFixed(2)}</td>
          </tr>
        ))}
        {!loading && quotes.length === 0 && <tr><td colSpan={3}>No symbols</td></tr>}
      </tbody>
    </table>
  );
}
