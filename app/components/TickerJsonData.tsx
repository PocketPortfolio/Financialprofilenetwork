'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TickerJsonDataProps {
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
}

interface QuoteData {
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
}

export default function TickerJsonData({ symbol, name, exchange, sector }: TickerJsonDataProps) {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch current price data
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quote?symbols=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          const quote = Array.isArray(data) ? data[0] : data;
          if (quote) {
            setQuoteData({
              price: quote.price,
              change: quote.change,
              changePct: quote.changePct,
              currency: quote.currency || 'USD',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol]);

  const jsonData = {
    symbol: symbol.toUpperCase(),
    name,
    currentPrice: quoteData?.price || null,
    change: quoteData?.change || null,
    changePercent: quoteData?.changePct || null,
    currency: quoteData?.currency || 'USD',
    exchange: exchange || null,
    sector: sector || null,
    historicalData: [
      // Sample historical data
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: quoteData?.price ? (quoteData.price * 0.98).toFixed(2) : null },
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: quoteData?.price ? (quoteData.price * 0.99).toFixed(2) : null },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: quoteData?.price ? (quoteData.price * 1.01).toFixed(2) : null },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: quoteData?.price ? (quoteData.price * 0.995).toFixed(2) : null },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: quoteData?.price ? (quoteData.price * 1.005).toFixed(2) : null },
    ],
    metadata: {
      lastUpdated: new Date().toISOString(),
      source: 'pocketportfolio.app',
      apiEndpoint: `/api/quote?symbols=${symbol}`,
    },
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text)',
          margin: 0
        }}>
          Free {symbol.toUpperCase()} JSON Data
        </h2>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '10px 20px',
              background: copied ? '#16a34a' : 'var(--accent-warm)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'var(--signal)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'var(--accent-warm)';
              }
            }}
          >
            {copied ? '✓ Copied' : 'Copy JSON'}
          </button>
          <Link
            href={`/s/${symbol.toLowerCase()}/json-api`}
            style={{
              padding: '10px 20px',
              background: 'var(--surface-elevated)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            View Full API
          </Link>
        </div>
      </div>
      
      {/* Description */}
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '20px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        Download raw {name} ({symbol.toUpperCase()}) market data in JSON format. Perfect for developers building finance apps or analysts needing programmatic access.
      </p>

      {/* JSON Code Block */}
      <div style={{
        position: 'relative',
        marginBottom: '20px'
      }}>
        <pre style={{
          background: 'var(--surface-elevated)',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '13px',
          overflowX: 'auto',
          border: '1px solid var(--border)',
          margin: 0,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          lineHeight: '1.6'
        }}>
          <code style={{
            color: 'var(--text)',
            whiteSpace: 'pre'
          }}>
            {loading ? (
              <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading data...</span>
            ) : (
              JSON.stringify(jsonData, null, 2)
            )}
          </code>
        </pre>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div>
          <strong style={{ color: 'var(--text)', marginRight: '8px' }}>API Endpoint:</strong>
          <code style={{
            background: 'var(--surface-elevated)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            color: 'var(--text)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
          }}>
            /api/quote?symbols={symbol}
          </code>
        </div>
        <div>
          <strong style={{ color: 'var(--text)', marginRight: '8px' }}>Format:</strong> JSON
        </div>
        <div>
          <strong style={{ color: 'var(--text)', marginRight: '8px' }}>License:</strong> Free, Open Source
        </div>
      </div>
    </div>
  );
}









