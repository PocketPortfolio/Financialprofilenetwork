'use client';

import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import LiveTable from './LiveTable';
import PricePipelineHealthCard from './PricePipelineHealthCard';
import TelemetryConsent from './TelemetryConsent';
import Watchlist from './Watchlist';
import CsvRulesPlayground from './CsvRulesPlayground';

export default function Dashboard() {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT']);
  const [showCsvPlayground, setShowCsvPlayground] = useState(false);

  const handleAddSymbol = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setWatchlistSymbols(watchlistSymbols.filter(s => s !== symbol));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--chrome)] px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-[var(--brand)] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h1 className="text-xl font-bold">Pocket Portfolio</h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setShowCsvPlayground(!showCsvPlayground)}
                className="px-4 py-2 text-sm bg-[var(--card)] border border-[var(--card-border)] rounded hover:bg-[var(--card-border)] transition-colors"
              >
                {showCsvPlayground ? 'Hide' : 'Show'} CSV Playground
              </button>
              
              <select className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded text-sm">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="contrast">High contrast</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-[var(--muted)]">Production-ready investment tracking with real-time prices</p>
        </div>

        {/* CSV Playground */}
        {showCsvPlayground && (
          <div className="mb-8">
            <ErrorBoundary>
              <CsvRulesPlayground userId="demo-user" portfolioId="demo-portfolio" />
            </ErrorBoundary>
          </div>
        )}

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ErrorBoundary>
            <PricePipelineHealthCard />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <Watchlist
              symbols={watchlistSymbols}
              onSymbolAdd={handleAddSymbol}
              onSymbolRemove={handleRemoveSymbol}
            />
          </ErrorBoundary>
        </div>

        {/* Live Prices Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Live Prices</h2>
          <ErrorBoundary>
            <LiveTable tickers={watchlistSymbols} showName={true} />
          </ErrorBoundary>
        </div>

        {/* Telemetry Consent */}
        <ErrorBoundary>
          <TelemetryConsent />
        </ErrorBoundary>
      </main>
    </div>
  );
}
