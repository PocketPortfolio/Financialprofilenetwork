'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TickerCsvDownloadProps {
  symbol: string;
  name?: string;
}

export default function TickerCsvDownload({ symbol, name }: TickerCsvDownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      // URL encode symbol to handle special characters (e.g., BRK.B, BRK-A)
      const url = `/api/tickers/${encodeURIComponent(symbol)}/csv`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Download failed: ${response.status} ${response.statusText}`;
        
        // Parse error based on content type (CSV or JSON)
        if (contentType.includes('text/csv')) {
          // Parse CSV error response
          const lines = errorText.split('\n');
          const errorLine = lines.find(line => line.includes('Error'));
          if (errorLine) {
            const parts = errorLine.split(',');
            // Get error message from CSV (usually in second column)
            errorMessage = parts.length > 1 ? parts[1].trim() : errorMessage;
            // Remove quotes if present
            errorMessage = errorMessage.replace(/^"|"$/g, '');
          }
        } else {
          // Parse JSON error response
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
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl; // Store for cleanup
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // Sanitize filename to prevent path traversal
      const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9.\-]/g, '_');
      link.download = `${sanitizedSymbol}-historical-data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke URL after a short delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        if (blobUrlRef.current === blobUrl) {
          blobUrlRef.current = null;
        }
      }, 100);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('CSV download error:', error);
      
      // Handle timeout specifically
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timeout - please try again. The server may be slow or unavailable.');
      } else {
        // Show the actual error message instead of generic message
        const errorMessage = error instanceof Error ? error.message : 'Failed to download CSV. Please try again.';
        alert(errorMessage);
      }
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
