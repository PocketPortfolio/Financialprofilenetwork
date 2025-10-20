import { ErrorBoundary } from './components/ErrorBoundary';
import LiveTable from './components/LiveTable';
import PricePipelineHealthCard from './components/PricePipelineHealthCard';
import TelemetryConsent from './components/TelemetryConsent';
import Watchlist from './components/Watchlist';
import { useState } from 'react';

export default function App() {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT']);

  const handleAddSymbol = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setWatchlistSymbols(watchlistSymbols.filter(s => s !== symbol));
  };

  return (
    <ErrorBoundary>
      <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Pocket Portfolio</h1>
          <p style={{ color: '#666', fontSize: 16 }}>Production-ready investment tracking with real-time prices</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
          <PricePipelineHealthCard />
          <Watchlist
            symbols={watchlistSymbols}
            onSymbolAdd={handleAddSymbol}
            onSymbolRemove={handleRemoveSymbol}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Live Prices</h2>
          <LiveTable tickers={watchlistSymbols} showName={true} />
        </div>

        <TelemetryConsent />
      </div>
    </ErrorBoundary>
  );
}
