'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist';
import SEOHead from '../components/SEOHead';
import MobileHeader from '../components/nav/MobileHeader';

interface SearchSuggestion {
  symbol: string;
  name: string;
  exchange: string;
}

export default function WatchlistPage() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  const { watchlist, loading, error, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);


  // Auto-search functionality
  const searchSymbols = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    
    try {
      // Mock search results - in a real app, you'd call an API
      const mockSuggestions: SearchSuggestion[] = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
        { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
        { symbol: 'VOD.L', name: 'Vodafone Group PLC', exchange: 'LSE' },
        { symbol: 'TSCO.L', name: 'Tesco PLC', exchange: 'LSE' },
        { symbol: 'BP.L', name: 'BP PLC', exchange: 'LSE' }
      ].filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchSuggestions(mockSuggestions.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newSymbol.trim()) {
        searchSymbols(newSymbol);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [newSymbol, searchSymbols]);

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      try {
        // Check if symbol already exists
        const exists = watchlist.some(item => item.symbol === newSymbol.toUpperCase());
        if (exists) {
          alert(`${newSymbol.toUpperCase()} is already in your watchlist`);
          return;
        }

        // Get company name from search suggestions or use symbol
        const suggestion = searchSuggestions.find(s => s.symbol === newSymbol.toUpperCase());
        const companyName = suggestion ? suggestion.name : `${newSymbol.toUpperCase()} Corp.`;

        await addToWatchlist(newSymbol.toUpperCase(), companyName);
        setNewSymbol('');
        setShowSuggestions(false);
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        alert(error instanceof Error ? error.message : 'Failed to add to watchlist');
      }
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setNewSymbol(suggestion.symbol);
    setShowSuggestions(false);
  };

  const handleRemoveFromWatchlist = async (watchlistItemId: string) => {
    try {
      await removeFromWatchlist(watchlistItemId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove from watchlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <SEOHead 
          title="Watchlist - Pocket Portfolio"
          description="Track your favorite stocks and investments"
        />
        <MobileHeader title="Watchlist" />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to view watchlist</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Track your favorite stocks and get real-time updates
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <SEOHead 
        title="Watchlist - Pocket Portfolio"
        description="Track your favorite stocks and investments"
      />
      <MobileHeader title="Watchlist" />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>📈</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                color: 'var(--text)'
              }}>
                Watchlist
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '16px',
                margin: 0
              }}>
                Track your favorite stocks and get real-time updates
              </p>
            </div>
          </div>
        </div>

        {/* Add to Watchlist Form */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Add to Watchlist</h3>
          <form onSubmit={handleAddToWatchlist} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                placeholder="Search for stocks (e.g., AAPL, Apple, Tesla)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.symbol}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < searchSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{suggestion.symbol}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{suggestion.name}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{suggestion.exchange}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {searchLoading && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: 'var(--muted)'
                }}>
                  🔍
                </div>
              )}
            </div>
            
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Add
            </button>
          </form>
          
          {/* Click outside to close suggestions */}
          {showSuggestions && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999
              }}
              onClick={() => setShowSuggestions(false)}
            />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'var(--danger)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Watchlist Items */}
        {loading ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <p>Loading watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No items in watchlist</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Add some stocks to track their performance
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
              gap: '16px',
              padding: '16px 20px',
              background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              fontWeight: '600',
              fontSize: '14px',
              color: 'var(--muted)'
            }}>
              <div>Symbol</div>
              <div>Price</div>
              <div>Change</div>
              <div>Change %</div>
              <div>Actions</div>
            </div>
            
            {watchlist.map((item, index) => (
              <div
                key={item.id || item.symbol}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < watchlist.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{item.symbol}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.name}</div>
                </div>
                
                <div style={{ fontWeight: '600' }}>
                  {item.price !== undefined && item.price !== null ? (
                    <>
                      {item.currency === 'GBP' ? '£' : '$'}{item.price.toFixed(2)}
                    </>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>Loading...</span>
                  )}
                </div>
                
                <div style={{ 
                  color: item.change !== undefined && item.change !== null ? (item.change >= 0 ? 'var(--pos)' : 'var(--neg)') : 'var(--muted)',
                  fontWeight: '600'
                }}>
                  {item.change !== undefined && item.change !== null ? (
                    <>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                    </>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>-</span>
                  )}
                </div>
                
                <div style={{ 
                  color: item.changePercent !== undefined && item.changePercent !== null ? (item.changePercent >= 0 ? 'var(--pos)' : 'var(--neg)') : 'var(--muted)',
                  fontWeight: '600'
                }}>
                  {item.changePercent !== undefined && item.changePercent !== null ? (
                    <>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>-</span>
                  )}
                </div>
                
                <button
                  onClick={() => handleRemoveFromWatchlist(item.id!)}
                  style={{
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
