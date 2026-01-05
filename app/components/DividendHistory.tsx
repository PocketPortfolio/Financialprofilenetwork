'use client';

import { useState, useEffect } from 'react';

interface DividendData {
  symbol: string;
  annualDividendYield: number | null;
  quarterlyPayout: number | null;
  nextExDividendDate: string | null;
  trailingAnnualDividendRate: number | null;
  currency: string;
  historicalDividends?: Array<{
    date: string;
    amount: number;
  }>;
}

interface DividendHistoryProps {
  symbol: string;
}

export default function DividendHistory({ symbol }: DividendHistoryProps) {
  const [dividendData, setDividendData] = useState<DividendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false); // Track if data is from cache

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Client-side stale-while-revalidate: Check localStorage first
        const cacheKey = `dividend_${symbol}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            const cacheAge = Date.now() - (parsed.timestamp || 0);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            if (cacheAge < maxAge && parsed.data) {
              // Show cached data immediately while fetching fresh
              setDividendData(parsed.data);
              setIsStale(true); // Mark as stale until fresh data arrives
              console.log(`[DividendHistory] Using cached data (${Math.round(cacheAge / (1000 * 60 * 60))}h old)`);
            }
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
        
        console.warn(`[DividendHistory] Fetching dividend data for ${symbol} from /api/dividend?ticker=${symbol}`);
        const apiUrl = `/api/dividend?ticker=${symbol}`;
        const startTime = Date.now();
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        const responseTime = Date.now() - startTime;
        console.warn(`[DividendHistory] Response received | Status: ${response.status} ${response.statusText} | Time: ${responseTime}ms`);
        
        // Log response headers for diagnostics
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          if (key.startsWith('X-Dividend-')) {
            responseHeaders[key] = value;
          }
        });
        if (Object.keys(responseHeaders).length > 0) {
          console.warn(`[DividendHistory] Response headers:`, responseHeaders);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[DividendHistory] API error | Status: ${response.status} | Response: ${errorText.substring(0, 200)}`);
          throw new Error(`Failed to fetch dividend data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.warn(`[DividendHistory] Data received | HasYield: ${!!data.annualDividendYield} | HasPayout: ${!!data.quarterlyPayout} | HasDiagnostic: ${!!data._diagnostic}`);
        
        // Log diagnostic info if present (critical for debugging)
        if (data._diagnostic) {
          console.warn(`[DividendHistory] ⚠️ DIAGNOSTIC INFO:`, JSON.stringify(data._diagnostic, null, 2));
        }
        
        // Also check response headers for diagnostic info
        const diagnosticHeader = response.headers.get('X-Dividend-Diagnostic');
        if (diagnosticHeader) {
          try {
            const diagnostic = JSON.parse(diagnosticHeader);
            console.warn(`[DividendHistory] ⚠️ HEADER DIAGNOSTIC:`, JSON.stringify(diagnostic, null, 2));
          } catch (e) {
            console.warn(`[DividendHistory] Could not parse diagnostic header:`, diagnosticHeader);
          }
        }
        
        // Save to localStorage for stale-while-revalidate
        if (data && (data.annualDividendYield || data.quarterlyPayout)) {
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
          }));
          setIsStale(false); // Fresh data received, no longer stale
        }
        
        // Production-safe logging only (no localhost fetch calls)
        
        // Check if we got actual data or just nulls
        const hasAnyData = data.annualDividendYield !== null || 
                          data.quarterlyPayout !== null || 
                          data.nextExDividendDate !== null;
        
        if (!hasAnyData) {
          console.warn(`[DividendHistory] All dividend data is null for ${symbol}. The data source may be temporarily unavailable.`);
          // Don't overwrite existing good data with null data
          // Only update if we don't have data yet, or if we're replacing stale data
          if (!dividendData || isStale) {
            setDividendData(data);
            console.warn(`[DividendHistory] Updated with null data (no existing data or replacing stale)`);
          } else {
            console.warn(`[DividendHistory] Keeping existing good data instead of overwriting with null response`);
          }
        } else {
          console.log(`[DividendHistory] ✅ Successfully received dividend data for ${symbol}`);
          // Always update with good data
          setDividendData(data);
          // Save to localStorage for stale-while-revalidate
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
          }));
          setIsStale(false); // Fresh data received, no longer stale
        }
      } catch (err: any) {
        console.error('[DividendHistory] Error fetching dividend data:', err);
        setError(err.message || 'Failed to load dividend data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchDividendData();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Dividend Summary
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#16a34a',
              marginBottom: '8px'
            }}>
              Loading...
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Annual Dividend Yield
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              Loading...
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Quarterly Payout
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              Loading...
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Next Ex-Dividend Date
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Dividend Summary
        </h2>
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)'
        }}>
          Dividend data is currently unavailable. This may be due to rate limiting or temporary service issues. Please try again later.
        </div>
      </div>
    );
  }

  if (!dividendData) {
    return null;
  }

  // Show "N/A" gracefully if all data is null or undefined
  const hasData = (dividendData.annualDividendYield != null) || 
                  (dividendData.quarterlyPayout != null) || 
                  (dividendData.nextExDividendDate != null);

  if (!hasData) {
    return (
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Dividend Summary
        </h2>
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          No dividend data available for {dividendData.symbol} at this time.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Dividend Summary
        {isStale && (
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            background: '#fbbf24',
            color: '#78350f',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            ⚠️ Est.
          </span>
        )}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: dividendData.annualDividendYield ? '#16a34a' : 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            {dividendData.annualDividendYield !== null 
              ? `${dividendData.annualDividendYield}%`
              : 'N/A'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Annual Dividend Yield
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: dividendData.quarterlyPayout ? 'var(--text)' : 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            {dividendData.quarterlyPayout != null && typeof dividendData.quarterlyPayout === 'number'
              ? `$${dividendData.quarterlyPayout.toFixed(2)}`
              : 'N/A'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Quarterly Payout
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: dividendData.nextExDividendDate ? 'var(--text)' : 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            {dividendData.nextExDividendDate || 'N/A'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Next Ex-Dividend Date
          </div>
        </div>
      </div>
    </div>
  );
}

