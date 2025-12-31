'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  trackToolPageView, 
  trackToolInteraction, 
  trackToolCopy 
} from '@/app/lib/analytics/tools';

export default function GoogleSheetsTool() {
  const [ticker, setTicker] = useState('AAPL');
  const [apiKey, setApiKey] = useState<'demo_key' | 'YOUR_KEY'>('demo_key');
  const [copied, setCopied] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackToolPageView('google_sheets', {
      apiKeyType: apiKey === 'demo_key' ? 'demo' : 'custom'
    });
  }, []);

  // Track formula generation when ticker or API key changes
  useEffect(() => {
    if (ticker && ticker.trim()) {
      trackToolInteraction('google_sheets', 'formula_generate', {
        ticker: ticker.toUpperCase().trim(),
        apiKeyType: apiKey === 'demo_key' ? 'demo' : 'custom'
      });
    }
  }, [ticker, apiKey]);

  const generateFormula = useCallback((symbol: string, key: string) => {
    if (!symbol) return '';
    const upperSymbol = symbol.toUpperCase().trim();
    // Always use production URL - formulas need to work in Google Sheets regardless of where they were generated
    // This also prevents hydration errors by ensuring server and client render the same URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';
    return `=IMPORTDATA("${baseUrl}/api/price/${upperSymbol}?key=${key}")`;
  }, []);

  const formula = generateFormula(ticker, apiKey);

  const handleCopy = useCallback(() => {
    if (!formula) return;
    
    // Track copy action
    trackToolCopy('google_sheets', 'formula', {
      ticker: ticker.toUpperCase().trim(),
      apiKeyType: apiKey === 'demo_key' ? 'demo' : 'custom'
    });
    
    navigator.clipboard.writeText(formula).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = formula;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formula, ticker, apiKey]);

  return (
    <div className="brand-card" style={{ padding: 'var(--space-6)' }}>
      {/* Input Section */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label htmlFor="ticker" style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          Enter Ticker Symbol
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., AAPL, TSLA, MSFT"
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-elevated)',
              color: 'var(--text)',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--signal)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            autoFocus
          />
        </div>
        <p style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)'
        }}>
          Type any stock ticker symbol to generate the formula
        </p>
      </div>

      {/* API Key Selection */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          API Key
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              name="apiKey"
              value="demo_key"
              checked={apiKey === 'demo_key'}
              onChange={(e) => setApiKey(e.target.value as 'demo_key' | 'YOUR_KEY')}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--signal)',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text)'
            }}>
              Free Community Key (20 calls/hour)
            </span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              name="apiKey"
              value="YOUR_KEY"
              checked={apiKey === 'YOUR_KEY'}
              onChange={(e) => setApiKey(e.target.value as 'demo_key' | 'YOUR_KEY')}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--signal)',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text)'
            }}>
              Personal Key (Unlimited)
            </span>
          </label>
        </div>
        {apiKey === 'YOUR_KEY' && (
          <p style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--signal)'
          }}>
            Need unlimited calls?{' '}
            <Link href="/sponsor" className="brand-link" style={{
              color: 'var(--signal)',
              fontWeight: 'var(--font-semibold)'
            }}>
              Get a personal API key for £5/mo. Become a Patron →
            </Link>
          </p>
        )}
      </div>

      {/* Generated Formula */}
      {formula && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--text)',
            marginBottom: 'var(--space-2)'
          }}>
            Generated Formula
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <code style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text)',
              wordBreak: 'break-all',
              overflow: 'auto'
            }}>
              {formula}
            </code>
            <button
              onClick={handleCopy}
              className="brand-button brand-button-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {copied ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
          <p style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)'
          }}>
            This formula will return the current price of {ticker.toUpperCase() || 'the stock'} stock. Replace "{ticker.toUpperCase() || 'TICKER'}" with any ticker symbol.
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      {formula && (
        <div className="brand-card" style={{
          padding: 'var(--space-4)',
          border: '1px solid var(--border)',
          background: 'var(--surface-elevated)'
        }}>
          <h3 style={{
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--font-size-base)'
          }}>
            How to Use
          </h3>
          <ol style={{
            listStyle: 'decimal',
            listStylePosition: 'inside',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--line-relaxed)'
          }}>
            <li>Copy the formula above</li>
            <li>Open your Google Sheet</li>
            <li>Paste the formula into any cell</li>
            <li>The cell will automatically update with the current stock price</li>
          </ol>
        </div>
      )}

      {/* Upsell Messages */}
      {apiKey === 'demo_key' && (
        <div className="brand-card" style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          border: '1px solid var(--warning-muted)',
          background: 'var(--surface-elevated)'
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--warning)',
            lineHeight: 'var(--line-relaxed)'
          }}>
            <strong style={{ color: 'var(--text)' }}>Need unlimited calls?</strong> Get a personal API key for £5/mo.{' '}
            <Link 
              href="/sponsor?utm_source=sheets_tool&utm_medium=upsell&utm_campaign=api_key"
              className="brand-link"
              style={{
                color: 'var(--signal)',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              Become a Patron →
            </Link>
          </p>
        </div>
      )}

      {apiKey === 'YOUR_KEY' && (
        <div className="brand-card" style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          border: '1px solid var(--signal-muted)',
          background: 'var(--surface-elevated)'
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--signal)',
            lineHeight: 'var(--line-relaxed)'
          }}>
            <strong style={{ color: 'var(--text)' }}>Replace "YOUR_KEY"</strong> with your personal API key from{' '}
            <Link 
              href="/sponsor?utm_source=sheets_tool&utm_medium=upsell&utm_campaign=api_key"
              className="brand-link"
              style={{
                color: 'var(--signal)',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              your sponsor dashboard
            </Link>
            . Unlimited calls included.
          </p>
        </div>
      )}
    </div>
  );
}
