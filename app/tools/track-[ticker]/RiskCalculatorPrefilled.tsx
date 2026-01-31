'use client';

import { useState, useEffect } from 'react';
import { fetchAssetProfiles } from '../../services/enrichmentService';
import { AssetProfile } from '../../types/analytics';
import Link from 'next/link';

interface RiskCalculatorPrefilledProps {
  ticker: string;
  tickerName: string;
  sector?: string;
}

export default function RiskCalculatorPrefilled({ 
  ticker, 
  tickerName,
  sector 
}: RiskCalculatorPrefilledProps) {
  const [input, setInput] = useState(ticker);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; label: string; profiles: AssetProfile[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);

  // Auto-analyze on mount with pre-filled ticker
  useEffect(() => {
    if (!autoAnalyzed && ticker) {
      setAutoAnalyzed(true);
      analyzeRisk();
    }
  }, [ticker]);

  const analyzeRisk = async () => {
    if (!input.trim()) {
      setError('Please enter at least one ticker');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tickers = input.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
      
      if (tickers.length === 0) {
        setError('Please enter valid ticker symbols');
        setLoading(false);
        return;
      }
      
      const profiles = await fetchAssetProfiles(tickers);
      const validProfiles = Object.values(profiles).filter(p => p.beta !== 0 && p.ticker !== 'CASH');
      
      if (validProfiles.length === 0) {
        setError('Could not find data for these tickers. Please try different symbols.');
        setLoading(false);
        return;
      }

      const totalBeta = validProfiles.reduce((sum, p) => sum + (p.beta || 1), 0);
      const avgBeta = totalBeta / validProfiles.length;
      
      let label = 'Market Average';
      if (avgBeta > 1.3) {
        label = '🔥 High Risk / Aggressive';
      } else if (avgBeta < 0.8) {
        label = '🛡️ Low Risk / Defensive';
      } else {
        label = '⚖️ Balanced Growth';
      }

      setResult({ 
        score: avgBeta, 
        label,
        profiles: validProfiles
      });
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      console.error('Risk calculator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      analyzeRisk();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 4vw, 40px)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'var(--surface)',
        padding: 'clamp(24px, 5vw, 40px)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        border: '1px solid var(--border)'
      }}>
        {/* SEO-Optimized Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Free Tool
          </span>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginTop: '16px',
            marginBottom: '8px'
          }}>
            Track {ticker} Risk & Portfolio Beta
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginTop: '8px',
            lineHeight: '1.6'
          }}>
            Calculate {tickerName} portfolio risk instantly. {sector ? `Analyze ${sector} sector exposure. ` : ''}Free Beta calculator with no login required.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            Tickers (comma separated)
          </label>
          <input
            type="text"
            placeholder={`e.g. ${ticker}, TSLA, AAPL`}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px',
              textTransform: 'uppercase',
              background: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Action */}
        <button
          onClick={analyzeRisk}
          disabled={loading || !input.trim()}
          style={{
            width: '100%',
            background: loading || !input.trim() ? 'var(--muted)' : 'var(--accent-warm)',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading || !input.trim() ? 0.6 : 1
          }}
        >
          {loading ? 'Analyzing...' : 'Calculate Risk Score'}
        </button>

        {/* Result Area */}
        {result && (
          <div style={{
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '1px solid var(--border)',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Your Portfolio Beta
              </p>
              <div style={{
                fontSize: 'clamp(48px, 8vw, 64px)',
                fontWeight: '900',
                color: 'var(--text)',
                marginBottom: '12px',
                lineHeight: '1'
              }}>
                {result.score.toFixed(2)}x
              </div>
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: result.score > 1.2 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : result.score < 0.8
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(245, 158, 11, 0.1)',
                color: result.score > 1.2 
                  ? '#ef4444' 
                  : result.score < 0.8
                  ? '#22c55e'
                  : '#f59e0b',
                border: `1px solid ${result.score > 1.2 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : result.score < 0.8
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {result.label}
              </div>
            </div>

            {/* Individual Ticker Breakdown */}
            {result.profiles.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Individual Betas
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.profiles.map((profile) => (
                    <div key={profile.ticker} style={{
                      padding: '6px 12px',
                      background: 'var(--surface)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: '1px solid var(--border)'
                    }}>
                      <strong>{profile.ticker}:</strong> {profile.beta.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The Upsell */}
            <div style={{
              marginTop: '24px',
              background: 'rgba(59, 130, 246, 0.05)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#1e40af',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                <strong>Want the full picture?</strong> This is just the surface. See your Sector Breakdown, Geographic Exposure, and get Rebalancing Alerts inside the app.
              </p>
              <Link 
                href="/sponsor?utm_source=risk_calculator&utm_medium=lead_magnet&utm_campaign=founders_club"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Unlock Full Analytics →
              </Link>
            </div>
          </div>
        )}

        {/* Related Links */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Link 
            href={`/s/${ticker.toLowerCase()}`}
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            View {ticker} Stock Page →
          </Link>
          <Link 
            href="/tools/risk-calculator"
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            General Risk Calculator →
          </Link>
        </div>
      </div>
      
      <p style={{
        marginTop: '32px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Powered by Pocket Portfolio Intelligence Engine •{' '}
        <Link href="/" style={{ color: 'var(--accent-warm)', textDecoration: 'underline' }}>
          Go Home
        </Link>
      </p>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

