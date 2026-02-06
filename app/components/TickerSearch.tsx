'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface TickerSearchProps {
  onTickerSelect?: (ticker: string) => void;
  placeholder?: string;
  linkToTickerPage?: boolean; // New prop to enable linking to /s/[symbol] pages
}

interface TickerResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
  matchScore: number;
}

// Popular tickers for quick access
const popularTickers = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
];

export default function TickerSearch({ onTickerSelect, placeholder = "Search stocks or crypto...", linkToTickerPage = false }: TickerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voteEmail, setVoteEmail] = useState('');
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debouncing
  useEffect(() => {
    // Debug logging removed to reduce console noise
    // console.log('TickerSearch useEffect triggered, query:', query, 'length:', query.length);
    if (query.length < 2) {
      // console.log('TickerSearch: query too short, clearing results');
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Search in popular tickers first
        const popularMatches = popularTickers.filter(
          ticker => 
            ticker.symbol.toLowerCase().includes(query.toLowerCase()) ||
            ticker.name.toLowerCase().includes(query.toLowerCase())
        ).map(ticker => ({
          symbol: ticker.symbol,
          name: ticker.name,
          type: 'Stock',
          region: 'US',
          currency: 'USD',
          matchScore: 1
        }));

        // If we have popular matches, show them
        if (popularMatches.length > 0) {
          setResults(popularMatches.slice(0, 8));
        } else {
          // Use the actual search API
          try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
              const data = await response.json();
              const rawResults = Array.isArray(data.results) ? data.results : [];
              const formattedResults = rawResults.map((result: any) => ({
                symbol: result.symbol,
                name: result.name,
                type: result.type === 'crypto' ? 'Crypto' : 'Stock',
                region: 'US',
                currency: result.currency || 'USD',
                matchScore: 0.9
              }));
              setResults(formattedResults.slice(0, 8));
            } else {
              // Fallback to mock results
              const mockResults = [
                { symbol: query.toUpperCase(), name: `${query.toUpperCase()} Inc.`, type: 'Stock', region: 'US', currency: 'USD', matchScore: 0.8 },
              ];
              setResults(mockResults);
            }
          } catch (error) {
            console.error('API search error:', error);
            // Fallback to mock results
            const mockResults = [
              { symbol: query.toUpperCase(), name: `${query.toUpperCase()} Inc.`, type: 'Stock', region: 'US', currency: 'USD', matchScore: 0.8 },
            ];
            setResults(mockResults);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (ticker: TickerResult) => {
    setQuery(ticker.symbol);
    setIsOpen(false);
    if (onTickerSelect) {
      onTickerSelect(ticker.symbol);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      if (linkToTickerPage) {
        window.location.href = `/s/${query.toUpperCase()}`;
      } else if (onTickerSelect) {
        onTickerSelect(query.toUpperCase());
      }
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', zIndex: 1 }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          setIsOpen(query.length > 0);
          (e.target as HTMLElement).style.borderColor = 'var(--brand)';
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid var(--card-border)',
          borderRadius: '6px',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontSize: '12px',
          fontWeight: '500',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        onBlur={(e) => (e.target as HTMLElement).style.borderColor = 'var(--card-border)'}
      />

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--card)',
          border: '2px solid var(--accent-warm)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          zIndex: 50,
          maxHeight: '200px',
          overflow: 'hidden',
          transform: 'translateZ(0)'
        }}>
          {/* Search results header */}
          {results.length > 0 && (
            <div style={{ 
              padding: '8px 12px', 
              fontSize: '12px', 
              color: 'var(--muted)', 
              background: 'var(--surface)',
              borderBottom: '1px solid var(--card-border)'
            }}>
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ 
                padding: '16px', 
                textAlign: 'center', 
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--muted)',
                  borderTop: '2px solid var(--brand)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => {
                const commonStyle = {
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text)',
                  textAlign: 'left' as const,
                  cursor: 'pointer',
                  borderBottom: index < results.length - 1 ? '1px solid var(--card-border)' : 'none',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '0',
                  textDecoration: 'none'
                };

                const content = (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '16px',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {result.symbol}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--muted)',
                        lineHeight: '1.4'
                      }}>
                        {result.name}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--muted)',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px'
                    }}>
                      {result.type} • {result.region}
                    </div>
                  </>
                );

                if (linkToTickerPage) {
                  return (
                    <Link
                      key={index}
                      href={`/s/${result.symbol.toLowerCase()}`}
                      onClick={() => {
                        setIsOpen(false);
                        if (onTickerSelect) {
                          onTickerSelect(result.symbol);
                        }
                      }}
                      style={commonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--warm-bg)';
                        e.currentTarget.style.color = 'var(--text-warm)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(result)}
                    style={commonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--warm-bg)';
                      e.currentTarget.style.color = 'var(--text-warm)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text)';
                    }}
                  >
                    {content}
                  </button>
                );
              })
            ) : query.length >= 2 ? (
              <div style={{ padding: '16px', fontSize: '14px' }}>
                <div style={{ marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                  We don&apos;t have &quot;{query}&quot; yet.
                </div>
                {voteSubmitted ? (
                  <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    Thanks! We&apos;ll consider adding this ticker.
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '8px', color: 'var(--muted)', fontSize: '13px' }}>
                      Vote for this ticker to be added.
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!voteEmail.trim() || voteSubmitting) return;
                        setVoteSubmitting(true);
                        try {
                          const res = await fetch('/api/vote-ticker', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ searchQuery: query.trim(), email: voteEmail.trim() }),
                          });
                          if (res.ok) setVoteSubmitted(true);
                          else {
                            const err = await res.json().catch(() => ({}));
                            alert(err.error || 'Something went wrong.');
                          }
                        } catch {
                          alert('Something went wrong.');
                        } finally {
                          setVoteSubmitting(false);
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <input
                        type="email"
                        placeholder="Your email"
                        value={voteEmail}
                        onChange={(e) => setVoteEmail(e.target.value)}
                        required
                        style={{
                          padding: '8px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          background: 'var(--surface)',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={voteSubmitting}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--accent-warm)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: voteSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {voteSubmitting ? 'Submitting...' : 'Vote for this ticker'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
