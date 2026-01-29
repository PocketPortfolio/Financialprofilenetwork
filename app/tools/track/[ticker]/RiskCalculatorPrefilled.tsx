'use client';

import { useState, useEffect } from 'react';
import { fetchAssetProfiles } from '../../../services/enrichmentService';
import { AssetProfile } from '../../../types/analytics';
import Link from 'next/link';

interface RiskCalculatorPrefilledProps {
  ticker: string;
  tickerName: string;
}

interface QuoteData {
  price: number;
  change: number | null;
  changePct: number | null;
  currency: string;
}

export default function RiskCalculatorPrefilled({ ticker, tickerName }: RiskCalculatorPrefilledProps) {
  const [holdings, setHoldings] = useState<Array<{ symbol: string; shares: number }>>([
    { symbol: ticker, shares: 100 }
  ]);
  const [assetProfiles, setAssetProfiles] = useState<Record<string, AssetProfile>>({});
  const [quoteData, setQuoteData] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      try {
        setLoading(true);
        const symbols = holdings.map(h => h.symbol.toUpperCase()).filter(s => s.length > 0);
        
        // Fetch asset profiles (beta, sector, etc.)
        const profiles = await fetchAssetProfiles(symbols);
        setAssetProfiles(profiles);
        
        // Fetch price data for each symbol
        const quotePromises = symbols.map(async (symbol) => {
          try {
            const response = await fetch(`/api/quote?symbols=${symbol}`);
            if (response.ok) {
              const data = await response.json();
              const quote = Array.isArray(data) ? data[0] : data;
              if (quote && quote.price) {
                return { symbol, quote: {
                  price: quote.price,
                  change: quote.change,
                  changePct: quote.changePct,
                  currency: quote.currency || 'USD'
                }};
              }
            }
          } catch (err) {
            console.warn(`[RiskCalculatorPrefilled] Failed to fetch price for ${symbol}:`, err);
          }
          return null;
        });
        
        const quotes = await Promise.all(quotePromises);
        const quoteMap: Record<string, QuoteData> = {};
        quotes.forEach(result => {
          if (result) {
            quoteMap[result.symbol] = result.quote;
          }
        });
        setQuoteData(quoteMap);
        
        setError(null);
      } catch (err: any) {
        console.error('[RiskCalculatorPrefilled] Error loading profiles:', err);
        setError(err?.message || 'Failed to load asset data');
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, [holdings]);

  const addHolding = () => {
    setHoldings([...holdings, { symbol: '', shares: 0 }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const updateHolding = (index: number, field: 'symbol' | 'shares', value: string | number) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    setHoldings(updated);
  };

  // Calculate portfolio Beta
  const calculateBeta = () => {
    if (holdings.length === 0 || Object.keys(assetProfiles).length === 0) return null;

    let totalValue = 0;
    let weightedBeta = 0;

    holdings.forEach(holding => {
      const symbol = holding.symbol.toUpperCase();
      const profile = assetProfiles[symbol];
      const quote = quoteData[symbol];
      if (profile && profile.beta !== null && profile.beta !== undefined && quote && quote.price) {
        const value = holding.shares * quote.price;
        totalValue += value;
        weightedBeta += value * profile.beta;
      }
    });

    return totalValue > 0 ? weightedBeta / totalValue : null;
  };

  const portfolioBeta = calculateBeta();
  const isHighRisk = portfolioBeta !== null && portfolioBeta > 1.3;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text)' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text)' }}>
          Track {ticker} Risk & Portfolio Beta
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Calculate your portfolio's risk exposure to {tickerName}. Enter your holdings to see your weighted Beta score.
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'var(--danger-muted, rgba(239, 68, 68, 0.1))', 
          border: '1px solid var(--danger, #ef4444)', 
          borderRadius: '8px', 
          marginBottom: '24px',
          color: 'var(--danger, #ef4444)'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: 'var(--card-bg, var(--surface))', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        padding: '32px',
        marginBottom: '32px',
        color: 'var(--text)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text)' }}>Your Portfolio Holdings</h2>
        
        {holdings.map((holding, index) => (
          <div key={index} style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr auto', 
            gap: '16px', 
            marginBottom: '16px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Ticker symbol (e.g., AAPL)"
              value={holding.symbol}
              onChange={(e) => updateHolding(index, 'symbol', e.target.value.toUpperCase())}
              style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'var(--input-bg, var(--surface-elevated))',
                color: 'var(--text-primary, var(--text))'
              }}
            />
            <input
              type="number"
              placeholder="Shares"
              value={holding.shares || ''}
              onChange={(e) => updateHolding(index, 'shares', parseFloat(e.target.value) || 0)}
              style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'var(--input-bg, var(--surface-elevated))',
                color: 'var(--text-primary, var(--text))'
              }}
            />
            {holdings.length > 1 && (
              <button
                onClick={() => removeHolding(index)}
                className="brand-button brand-button-secondary"
                style={{
                  padding: '12px 20px',
                  fontSize: '0.9rem'
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addHolding}
          className="brand-button brand-button-primary"
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            marginTop: '16px',
            background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
          }}
        >
          + Add Holding
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p>Loading asset data...</p>
        </div>
      )}

      {!loading && portfolioBeta !== null && (
        <div style={{ 
          backgroundColor: isHighRisk 
            ? 'var(--warning-muted, rgba(245, 158, 11, 0.1))' 
            : 'var(--info-muted, rgba(59, 130, 246, 0.1))',
          border: `2px solid ${isHighRisk 
            ? 'var(--warning, #f59e0b)' 
            : 'var(--info, #3b82f6)'}`,
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center',
          color: 'var(--text)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text)' }}>
            Portfolio Beta: <strong style={{ color: 'var(--text)' }}>{portfolioBeta.toFixed(2)}</strong>
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '16px', color: 'var(--text)' }}>
            {isHighRisk 
              ? `⚠️ High Risk: Your portfolio is ${((portfolioBeta - 1) * 100).toFixed(0)}% more volatile than the market.`
              : portfolioBeta > 1 
                ? `Your portfolio is ${((portfolioBeta - 1) * 100).toFixed(0)}% more volatile than the market.`
                : portfolioBeta < 1
                  ? `Your portfolio is ${((1 - portfolioBeta) * 100).toFixed(0)}% less volatile than the market.`
                  : 'Your portfolio moves in line with the market.'
            }
          </p>
          {isHighRisk && (
            <p style={{ fontSize: '1rem', color: 'var(--warning, #f59e0b)', marginTop: '16px' }}>
              Consider diversifying to reduce risk exposure.
            </p>
          )}
        </div>
      )}

      {!loading && Object.keys(assetProfiles).length > 0 && (
        <div style={{ 
          backgroundColor: 'var(--card-bg, var(--surface))', 
          border: '1px solid var(--border)', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px',
          color: 'var(--text)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text)' }}>Asset Details</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {holdings.map((holding, index) => {
              const symbol = holding.symbol.toUpperCase();
              const profile = assetProfiles[symbol];
              if (!profile) return null;

              return (
                <div key={index} style={{ 
                  padding: '20px', 
                  backgroundColor: 'var(--bg-secondary, var(--surface-elevated))', 
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text)' }}>{symbol}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', color: 'var(--text)' }}>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Beta:</strong> {profile.beta !== null && profile.beta !== undefined ? profile.beta.toFixed(2) : 'N/A'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Price:</strong> {quoteData[symbol]?.price 
                        ? `$${quoteData[symbol].price.toFixed(2)}` 
                        : 'Loading...'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Shares:</strong> {holding.shares}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Value:</strong> {quoteData[symbol]?.price 
                        ? `$${((quoteData[symbol].price || 0) * holding.shares).toFixed(2)}` 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'var(--card-bg, var(--surface))', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        padding: '32px',
        textAlign: 'center',
        color: 'var(--text)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text)' }}>Want Full Portfolio Tracking?</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Track all your holdings, get real-time updates, and sync with Google Drive for sovereign data ownership.
        </p>
        <Link 
          href="/sponsor"
          className="brand-button brand-button-primary"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
          }}
        >
          Join Founder's Club (£100 Lifetime)
        </Link>
      </div>
    </div>
  );
}

