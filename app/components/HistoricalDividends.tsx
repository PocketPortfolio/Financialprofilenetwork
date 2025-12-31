'use client';

import { useState, useEffect } from 'react';

interface HistoricalDividend {
  date: string;
  amount: number;
}

interface HistoricalDividendsProps {
  symbol: string;
}

export default function HistoricalDividends({ symbol }: HistoricalDividendsProps) {
  const [historicalDividends, setHistoricalDividends] = useState<HistoricalDividend[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalDividends = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/dividend/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dividend data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.historicalDividends && Array.isArray(data.historicalDividends) && data.historicalDividends.length > 0) {
          setHistoricalDividends(data.historicalDividends);
        } else {
          setHistoricalDividends([]);
        }
      } catch (err: any) {
        console.error('[HistoricalDividends] Error fetching dividend data:', err);
        setError(err.message || 'Failed to load historical dividend data');
        setHistoricalDividends([]);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchHistoricalDividends();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 0',
        color: 'var(--text-secondary)'
      }}>
        Dividend data loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 0',
        color: 'var(--text-secondary)'
      }}>
        {error}
      </div>
    );
  }

  if (!historicalDividends || historicalDividends.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 0',
        color: 'var(--text-secondary)'
      }}>
        Historical dividend payment data is not available from the free tier data source. 
        Summary dividend information (yield, payout, ex-date) is shown above.
      </div>
    );
  }

  // Sort by date (most recent first)
  const sortedDividends = [...historicalDividends].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{
      overflowX: 'auto'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead>
          <tr style={{
            borderBottom: '2px solid var(--border)'
          }}>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              fontWeight: '600',
              color: 'var(--text)',
              fontSize: '14px'
            }}>
              Date
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'right',
              fontWeight: '600',
              color: 'var(--text)',
              fontSize: '14px'
            }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDividends.map((dividend, index) => (
            <tr 
              key={`${dividend.date}-${index}`}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <td style={{
                padding: '12px',
                color: 'var(--text)',
                fontSize: '14px'
              }}>
                {new Date(dividend.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'right',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ${dividend.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

