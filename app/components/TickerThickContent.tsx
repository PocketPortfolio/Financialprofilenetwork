'use client';

import React, { useState } from 'react';

interface TickerThickContentProps {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  peRatio?: number;
  assetType: 'CRYPTO' | 'STOCK' | 'ETF';
}

export default function TickerThickContent({ 
  symbol, 
  name, 
  price, 
  changePercent, 
  peRatio, 
  assetType 
}: TickerThickContentProps) {
  const [copied, setCopied] = useState(false);

  // Skip rendering if no price data
  if (price === null || changePercent === null) {
    return null;
  }

  // 🟢 LAYER 1: PULITZER NARRATIVE (The "SEO Hook")
  const sentiment = changePercent > 0 ? "bullish" : "cautious";
  const movement = changePercent > 0 ? "gaining momentum" : "consolidating";
  
  const pulitzerSummary = `${name} (${symbol}) is currently trading at $${price.toFixed(2)}, signaling a ${sentiment} market structure. With a ${movement} daily trend of ${changePercent.toFixed(2)}%, institutional capital flows are critical to watch. ${peRatio ? `The P/E ratio of ${peRatio} suggests the market is pricing in ${peRatio > 30 ? 'high growth expectations' : 'value accumulation'}.` : ''} Sovereign investors should evaluate custody risks immediately.`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(`npx pocket-portfolio --import ${symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* 🧠 LAYER 1: PULITZER INTELLIGENCE CARD */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(100, 116, 139, 0.5)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>🧠</span>
          <h3 style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#34d399',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            fontWeight: '600'
          }}>
            Pulitzer AI • Autonomous Brief
          </h3>
        </div>
        <p style={{
          color: 'var(--text)',
          lineHeight: '1.7',
          fontSize: '18px',
          margin: 0,
          marginBottom: '16px'
        }}>
          {pulitzerSummary}
        </p>
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontFamily: 'monospace'
        }}>
          <span>SOURCE: REAL-TIME MARKET DATA</span>
          <span>•</span>
          <span>VERIFIED BY POCKET PORTFOLIO</span>
        </div>
      </div>

      {/* 💰 LAYER 2: MONETIZATION ACTION (The "Revenue Hook") */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '96px',
          opacity: 0.1,
          pointerEvents: 'none'
        }}>
          🛡️
        </div>
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              margin: 0,
              marginBottom: '8px'
            }}>
              Don't leave ${price.toFixed(2)} on the table.
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: 0,
              maxWidth: '500px'
            }}>
              {assetType === 'CRYPTO' 
                ? `Exchanges get hacked. Secure your ${symbol} in cold storage.`
                : `Brokerages fail. Insure your ${symbol} position with Sovereign Sync.`}
            </p>
          </div>
          
          <a
            href={assetType === 'CRYPTO' 
              ? 'https://shop.ledger.com/pages/hardware-wallets?r=pocket-portfolio'
              : '/sponsor?utm_source=ticker_page&utm_medium=sovereign_cta'}
            target={assetType === 'CRYPTO' ? '_blank' : undefined}
            rel={assetType === 'CRYPTO' ? 'noopener noreferrer' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              background: '#10b981',
              color: '#000000',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '15px',
              transition: 'all 0.2s',
              alignSelf: 'flex-start',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#34d399';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {assetType === 'CRYPTO' ? 'Buy Ledger Nano ($79)' : 'Activate Sovereign Sync'}
          </a>
        </div>
      </div>

      {/* 🛠️ LAYER 3: DEVELOPER UTILITY (The "NPM Hook") */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%'
        }}>
          <span style={{ fontSize: '20px' }}>💻</span>
          <div style={{ flex: 1 }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '12px',
              margin: 0,
              marginBottom: '8px'
            }}>
              Developer? Import this asset data:
            </p>
            <code style={{
              color: '#34d399',
              background: 'rgba(5, 46, 22, 0.3)',
              padding: '8px 12px',
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '13px'
            }}>
              npx pocket-portfolio --import {symbol}
            </code>
          </div>
        </div>
        <button
          onClick={handleCopySnippet}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
            alignSelf: 'flex-start'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Snippet'}
        </button>
      </div>

    </div>
  );
}

