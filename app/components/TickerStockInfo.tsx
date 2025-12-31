'use client';

import React, { useState, useEffect } from 'react';

interface TickerStockInfoProps {
  symbol: string;
  initialData?: {
    price: number | null;
    change: number | null;
    changePct: number | null;
    currency: string;
  } | null;
}

interface QuoteData {
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
}

export default function TickerStockInfo({ symbol, initialData }: TickerStockInfoProps) {
  // Initialize with server-side data if available
  const [quoteData, setQuoteData] = useState<QuoteData | null>(
    initialData ? {
      price: initialData.price,
      change: initialData.change,
      changePct: initialData.changePct,
      currency: initialData.currency,
    } : null
  );
  const [loading, setLoading] = useState(!initialData); // Only show loading if no initial data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have initial data, or refresh after 30 seconds
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/quote?symbols=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          const quote = Array.isArray(data) ? data[0] : data;
          if (quote) {
            setQuoteData({
            price: quote.price ?? null,
            change: quote.change ?? null,
            changePct: quote.changePct ?? null,
              currency: quote.currency || 'USD',
            });
          } else {
            setError('No data available');
          }
        } else {
          setError('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    // If we have initial data, wait 30 seconds before first refresh
    // Otherwise, fetch immediately
    const delay = initialData ? 30000 : 0;
    const timeout = setTimeout(fetchQuote, delay);

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchQuote, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [symbol, initialData]);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number | null) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePct = (changePct: number | null) => {
    if (changePct === null || changePct === undefined) return 'N/A';
    const sign = changePct >= 0 ? '+' : '';
    return `${sign}${changePct.toFixed(2)}%`;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null || change === undefined) return 'var(--text)';
    return change >= 0 ? '#16a34a' : '#dc2626'; // green-600 : red-600
  };

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '32px', 
        color: '#dc2626' 
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', margin: '0 -24px', padding: '0 24px' }}>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--surface-elevated)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'var(--card)'
        }}>
          <thead>
            <tr style={{
              background: 'var(--surface-elevated)',
              borderBottom: '2px solid var(--border)'
            }}>
              <th style={{
                textAlign: 'left',
                padding: '16px 24px',
                fontWeight: '600',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-secondary)'
              }}>
                Metric
              </th>
              <th style={{
                textAlign: 'right',
                padding: '16px 24px',
                fontWeight: '600',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-secondary)'
              }}>
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <td style={{
                padding: '20px 24px',
                color: 'var(--text)',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                Current Price
              </td>
              <td style={{
                padding: '20px 24px',
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '20px',
                color: getChangeColor(quoteData?.change ?? null)
              }}>
                {loading ? (
                  <span style={{ color: 'var(--muted)', opacity: 0.6 }}>Loading...</span>
                ) : (
                  formatPrice(quoteData?.price ?? null)
                )}
              </td>
            </tr>
            <tr style={{
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <td style={{
                padding: '20px 24px',
                color: 'var(--text)',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                Change
              </td>
              <td style={{
                padding: '20px 24px',
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '20px',
                color: getChangeColor(quoteData?.change ?? null)
              }}>
                {loading ? (
                  <span style={{ color: 'var(--muted)', opacity: 0.6 }}>Loading...</span>
                ) : (
                  formatChange(quoteData?.change ?? null)
                )}
              </td>
            </tr>
            <tr style={{
              borderBottom: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <td style={{
                padding: '20px 24px',
                color: 'var(--text)',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                Change %
              </td>
              <td style={{
                padding: '20px 24px',
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '20px',
                color: getChangeColor(quoteData?.change ?? null)
              }}>
                {loading ? (
                  <span style={{ color: 'var(--muted)', opacity: 0.6 }}>Loading...</span>
                ) : (
                  formatChangePct(quoteData?.changePct ?? null)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

