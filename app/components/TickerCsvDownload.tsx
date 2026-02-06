'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackToolDownload } from '@/app/lib/analytics/tools';

interface TickerCsvDownloadProps {
  symbol: string;
  name?: string;
}

const SPONSOR_CSV_UPSELL_URL = '/sponsor?utm_source=csv_upsell&utm_medium=interstitial&utm_campaign=api_upsell';

export default function TickerCsvDownload({ symbol, name }: TickerCsvDownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellPhase, setUpsellPhase] = useState<'preparing' | 'upsell'>('preparing');
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleDownloadClick = () => {
    setShowUpsellModal(true);
    setUpsellPhase('preparing');
    const t = setTimeout(() => setUpsellPhase('upsell'), 1500);
    return () => clearTimeout(t);
  };

  const closeModal = () => {
    setShowUpsellModal(false);
    setUpsellPhase('preparing');
  };

  const doActualDownload = async () => {
    setDownloading(true);
    closeModal();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const url = `/api/tickers/${encodeURIComponent(symbol)}/csv`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
        if (contentType.includes('text/csv')) {
          const lines = errorText.split('\n');
          const errorLine = lines.find(line => line.includes('Error'));
          if (errorLine) {
            const parts = errorLine.split(',');
            errorMessage = parts.length > 1 ? parts[1].trim() : errorMessage;
            errorMessage = errorMessage.replace(/^"|"$/g, '');
          }
        } else {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
              if (errorData.retryAfter) {
                const minutes = Math.ceil(errorData.retryAfter / 60);
                errorMessage += ` (Retry in ${minutes} minute${minutes !== 1 ? 's' : ''})`;
              }
            }
          } catch { /* default */ }
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      trackToolDownload('ticker_csv', 'csv', { ticker: symbol, fileType: 'csv' });

      const link = document.createElement('a');
      link.href = blobUrl;
      const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9.\-]/g, '_');
      link.download = `${sanitizedSymbol}-historical-data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        if (blobUrlRef.current === blobUrl) blobUrlRef.current = null;
      }, 100);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('CSV download error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timeout - please try again. The server may be slow or unavailable.');
      } else {
        alert(error instanceof Error ? error.message : 'Failed to download CSV. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={downloading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: downloading ? 'var(--text-secondary)' : 'var(--accent-warm)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: downloading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          opacity: downloading ? 0.7 : 1
        }}
        onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.background = 'var(--accent-warm-dark)'; }}
        onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.background = 'var(--accent-warm)'; }}
      >
        {downloading ? (<><span>⏳</span> Downloading...</>) : (<><span>📥</span> Download {symbol} Historical Data (CSV)</>)}
      </button>

      {showUpsellModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="csv-upsell-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            padding: '16px'
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {upsellPhase === 'preparing' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '18px', color: 'hsl(var(--card-foreground))', marginBottom: '8px' }}>Preparing your dataset...</div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>One moment</div>
              </div>
            ) : (
              <>
                <h2 id="csv-upsell-title" style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--card-foreground))', marginBottom: '12px' }}>
                  Need this data automatically?
                </h2>
                <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: 1.5 }}>
                  Stop manual downloads. Get {symbol} via JSON API for just $20/mo.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px' }}>
                  <pre style={{ flex: 1, padding: '8px', background: 'hsl(var(--muted))', color: 'hsl(var(--card-foreground))', borderRadius: '6px', overflow: 'auto', margin: 0 }}>
                    {`GET /api/tickers/${symbol}/json`}
                  </pre>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    href={SPONSOR_CSV_UPSELL_URL}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 20px',
                      background: 'var(--accent-warm)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Unlock API Access ($20/mo)
                  </Link>
                  <button
                    type="button"
                    onClick={doActualDownload}
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: 'hsl(var(--muted-foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Continue to CSV Download
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
