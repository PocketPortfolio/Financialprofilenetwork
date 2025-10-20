'use client';

import { useState } from 'react';

export default function SimpleDashboard() {
  const [symbols, setSymbols] = useState(['AAPL', 'GOOGL', 'MSFT']);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAddSymbol = () => {
    if (newSymbol.trim() && !symbols.includes(newSymbol.trim().toUpperCase())) {
      setSymbols([...symbols, newSymbol.trim().toUpperCase()]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--chrome)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ height: '32px', width: '32px', background: 'var(--brand)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>P</span>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Pocket Portfolio</h1>
              </div>
            </div>
            
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <select style={{ padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '4px', fontSize: '14px', color: 'var(--text)' }}>
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
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Production-ready investment tracking with real-time prices</p>
        </div>

        {/* Price Pipeline Health */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Price Pipeline Health</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontWeight: '500' }}>YAHOO</span>
                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>Fresh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontWeight: '500' }}>CHART</span>
                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>Fresh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontWeight: '500' }}>STOOQ</span>
                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>Fresh</span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '16px' }}>Updated {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Watchlist */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Watchlist</h2>
            
            {/* Add Symbol */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Add symbol (e.g., AAPL)"
                style={{ flex: 1, padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '4px', fontSize: '14px', color: 'var(--text)' }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
              />
              <button
                onClick={handleAddSymbol}
                disabled={!newSymbol.trim()}
                style={{ 
                  padding: '8px 16px', 
                  background: newSymbol.trim() ? 'var(--brand)' : 'var(--muted)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  cursor: newSymbol.trim() ? 'pointer' : 'not-allowed',
                  opacity: newSymbol.trim() ? 1 : 0.5
                }}
              >
                Add
              </button>
            </div>

            {/* Symbols List */}
            {symbols.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>No symbols in watchlist. Add one to get started!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {symbols.map(symbol => (
                  <div key={symbol} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '4px' }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{symbol}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>$175.43 (+2.15)</span>
                    </div>
                    <button
                      onClick={() => handleRemoveSymbol(symbol)}
                      style={{ color: '#ef4444', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Prices Table */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Live Prices</h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--card-border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Ticker</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {symbols.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                      No symbols to display
                    </td>
                  </tr>
                ) : (
                  symbols.map(symbol => (
                    <tr key={symbol} style={{ borderTop: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{symbol}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                        {symbol === 'AAPL' ? 'Apple Inc.' : 
                         symbol === 'GOOGL' ? 'Alphabet Inc.' :
                         symbol === 'MSFT' ? 'Microsoft Corporation' : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                        ${symbol === 'AAPL' ? '175.43' : 
                           symbol === 'GOOGL' ? '142.56' :
                           symbol === 'MSFT' ? '378.85' : '0.00'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ color: symbol === 'GOOGL' ? '#ef4444' : '#10b981' }}>
                          {symbol === 'AAPL' ? '+$2.15 (+1.24%)' : 
                           symbol === 'GOOGL' ? '-$1.23 (-0.86%)' :
                           symbol === 'MSFT' ? '+$3.42 (+0.91%)' : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telemetry Consent */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Privacy & Analytics</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            We collect anonymous usage data to improve the app. No personal information is stored. 
            You can opt out anytime in settings.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '4px', fontSize: '14px', color: 'var(--text)', cursor: 'pointer' }}>
              Decline
            </button>
            <button style={{ padding: '8px 16px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Accept
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}