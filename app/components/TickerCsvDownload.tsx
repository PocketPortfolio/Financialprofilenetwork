'use client';

import React, { useState } from 'react';

interface TickerCsvDownloadProps {
  symbol: string;
  name?: string;
}

export default function TickerCsvDownload({ symbol, name }: TickerCsvDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = `/api/tickers/${symbol}/csv`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text().catch(()=>'');
        let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.retryAfter) {
              const minutes = Math.ceil(errorData.retryAfter / 60);
              errorMessage += ` (Retry in ${minutes} minute${minutes !== 1 ? 's' : ''})`;
            }
          }
        } catch {
          // Use default error message if parsing fails
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${symbol}-historical-data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('CSV download error:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
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
      onMouseEnter={(e) => {
        if (!downloading) {
          e.currentTarget.style.background = 'var(--accent-warm-dark)';
        }
      }}
      onMouseLeave={(e) => {
        if (!downloading) {
          e.currentTarget.style.background = 'var(--accent-warm)';
        }
      }}
    >
      {downloading ? (
        <>
          <span>⏳</span>
          Downloading...
        </>
      ) : (
        <>
          <span>📥</span>
          Download {symbol} Historical Data (CSV)
        </>
      )}
    </button>
  );
}
