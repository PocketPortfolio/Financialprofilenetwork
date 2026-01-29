'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllTickers } from '@/app/lib/pseo/data';

export default function RiskPagesBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const allTickers = useMemo(() => getAllTickers(), []);
  
  const filteredTickers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTickers.slice(0, 100); // Show top 100 by default
    }
    const query = searchQuery.toUpperCase().trim();
    return allTickers.filter(ticker => 
      ticker.toUpperCase().includes(query)
    ).slice(0, 200); // Limit results for performance
  }, [searchQuery, allTickers]);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
      color: 'var(--text)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 48px)',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Track Stock Risk Pages
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Browse {allTickers.length.toLocaleString()} risk analysis pages. Search for any stock ticker to calculate its portfolio risk and Beta score.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto 40px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Search ticker (e.g., AAPL, NVDA, TSLA)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            fontSize: '16px',
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        />
      </div>

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {filteredTickers.map((ticker) => (
          <Link
            key={ticker}
            href={`/tools/track-${ticker.toLowerCase().replace(/\./g, '')}-risk`}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              textDecoration: 'none',
              color: 'var(--text)',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {ticker}
          </Link>
        ))}
      </div>

      {/* Info Footer */}
      {filteredTickers.length < allTickers.length && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Showing {filteredTickers.length} of {allTickers.length.toLocaleString()} risk pages. 
            {searchQuery && ' Use search to find specific tickers.'}
            {!searchQuery && ' Search above to find specific tickers.'}
          </p>
        </div>
      )}
    </div>
  );
}





