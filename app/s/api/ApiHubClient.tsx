'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import TickerSearch from '@/app/components/TickerSearch';

function normalizeSymbol(input: string) {
  return input.trim().toUpperCase().replace(/-/g, '');
}

export default function ApiHubClient() {
  const inkBorder = 'rgba(15, 23, 42, 0.16)';
  const inkBorderSoft = 'rgba(15, 23, 42, 0.10)';

  const [symbol, setSymbol] = useState<string>('SPY');

  const normalizedSymbol = useMemo(() => normalizeSymbol(symbol || 'SPY'), [symbol]);
  const symbolLower = normalizedSymbol.toLowerCase();

  const jsonUrl = `/api/tickers/${encodeURIComponent(normalizedSymbol)}/json?range=max`;
  const csvUrl = `/api/tickers/${encodeURIComponent(normalizedSymbol)}/csv?range=max`;
  const jsonApiPage = `/s/${symbolLower}/json-api`;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op: clipboard may be blocked; URLs are still visible
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${inkBorder}`,
        borderRadius: '18px',
        padding: '18px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                color: 'var(--accent-warm)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 900,
                marginBottom: '6px',
              }}
            >
              Endpoint builder
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Choose a symbol and copy the JSON/CSV URLs.
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${inkBorderSoft}`,
              borderRadius: '12px',
              background: 'var(--background)',
              padding: '10px 12px',
              minWidth: 220,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 900,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                color: 'var(--text)',
              }}
            >
              Selected
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}>{normalizedSymbol}</div>
          </div>
        </div>

        <TickerSearch
          placeholder="Search ticker (e.g. SPY, AAPL, QQQ, BTC)..."
          onTickerSelect={(t) => setSymbol(t)}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          marginTop: '14px',
        }}
      >
        <div
          style={{
            background: 'var(--card)',
            border: `1px solid ${inkBorderSoft}`,
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                {normalizedSymbol} JSON endpoint
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  marginTop: '6px',
                  wordBreak: 'break-all',
                }}
              >
                {jsonUrl}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => copy(jsonUrl)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: `1px solid ${inkBorderSoft}`,
                  background: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
              <a
                href={jsonUrl}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-warm)',
                  background: 'rgba(245, 158, 11, 0.10)',
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                Open JSON
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card)',
            border: `1px solid ${inkBorderSoft}`,
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                {normalizedSymbol} CSV export
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  marginTop: '6px',
                  wordBreak: 'break-all',
                }}
              >
                {csvUrl}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => copy(csvUrl)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: `1px solid ${inkBorderSoft}`,
                  background: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
              <a
                href={csvUrl}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-warm)',
                  background: 'rgba(245, 158, 11, 0.10)',
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                Download CSV
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, transparent 55%)',
            border: `1px solid ${inkBorderSoft}`,
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Dataset page (indexable, schema-first)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
            Use the per‑ticker developer page for docs, examples, and internal links that convert search impressions.
          </div>
          <Link
            href={jsonApiPage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 900,
            }}
          >
            View {normalizedSymbol} JSON API page →
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: `1px solid ${inkBorderSoft}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Import wedge: parse broker CSVs in-browser (local-first).
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/import/interactive-brokers"
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}
          >
            Interactive Brokers importer →
          </Link>
          <Link
            href="/import"
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}
          >
            All importers →
          </Link>
        </div>
      </div>
    </div>
  );
}

