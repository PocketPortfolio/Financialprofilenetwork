'use client';

import React, { useState, useEffect } from 'react';
import { trackEvent } from '@/app/lib/analytics/events';

interface JsonApiLivePreviewProps {
  symbol: string;
  initialPrice?: number | null;
  initialChangePct?: number | null;
  initialHistorySample?: any[];
}

export default function JsonApiLivePreview({ 
  symbol, 
  initialPrice, 
  initialChangePct, 
  initialHistorySample 
}: JsonApiLivePreviewProps) {
  const [price, setPrice] = useState<number | null>(initialPrice ?? null);
  const [changePct, setChangePct] = useState<number | null>(initialChangePct ?? null);
  const [historySample, setHistorySample] = useState<any[]>(initialHistorySample ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch live data on mount if we don't have it
    if (price === null || changePct === null || historySample.length === 0) {
      const fetchLiveData = async () => {
        setLoading(true);
        try {
          // Fetch quote data
          const quoteResponse = await fetch(`/api/quote?symbols=${symbol}`);
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            const quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
            if (quote) {
              setPrice(quote.price);
              setChangePct(quote.changePct);
            }
          }

          // Fetch historical data sample
          const historyResponse = await fetch(`/api/tickers/${symbol}/json?range=1y`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData?.data && Array.isArray(historyData.data)) {
              setHistorySample(historyData.data.slice(0, 2));
            }
          }
        } catch (error) {
          console.error('Error fetching live data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchLiveData();
    }
  }, [symbol, price, changePct, historySample.length]);

  const previewData = {
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString(),
    price: price,
    change_24h: changePct,
    history_sample: historySample
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '2px solid var(--border-warm)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      <div style={{
        background: 'var(--surface-elevated)',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-warm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <code style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)'
        }}>
          GET /api/tickers/{symbol}/json
        </code>
        <span style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: loading ? 'var(--accent-warm)' : 'var(--signal)'
        }}>
          {loading ? '● Loading...' : '● 200 OK (Live)'}
        </span>
      </div>
      {/* Lead Magnet CTA: native, above data — no gate */}
      <div style={{
        padding: '16px',
        margin: '0 16px 16px',
        background: 'var(--surface-hover, hsl(var(--muted) / 0.4))',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px'
      }}>
        <p style={{
          margin: '0 0 12px',
          fontSize: '14px',
          color: 'var(--text, hsl(var(--foreground)))',
          lineHeight: 1.5
        }}>
          Tired of exporting to Excel? Track {symbol.toUpperCase()} and analyze your portfolio locally with Pocket Portfolio.
        </p>
        <a
          href="/dashboard"
          onClick={() => trackEvent('lead_magnet_clicked', { ticker: symbol })}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: 'var(--accent-warm)',
            color: '#000',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Start Free — Local First
        </a>
      </div>
      <div style={{
        padding: '16px',
        overflowX: 'auto'
      }}>
        <pre style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'var(--text)',
          margin: 0,
          lineHeight: '1.6'
        }}>
          {JSON.stringify(previewData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

