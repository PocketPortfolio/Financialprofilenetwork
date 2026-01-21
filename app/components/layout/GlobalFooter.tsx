'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TrendingAsset {
  symbol: string;
  price?: number;
  changePct?: number;
}

export default function GlobalFooter() {
  const pathname = usePathname();
  const [trendingAssets, setTrendingAssets] = useState<TrendingAsset[]>([]);

  // Determine footer variant based on pathname
  const isLiteFooter = pathname?.startsWith('/login') || 
                       pathname?.startsWith('/register') || 
                       pathname?.startsWith('/checkout') ||
                       pathname?.startsWith('/join');

  // Fetch trending assets for the dynamic bar
  useEffect(() => {
    if (isLiteFooter) return; // Skip fetch for lite footer
    
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/most-traded?count=5&region=US');
        if (response.ok) {
          const data = await response.json();
          setTrendingAssets(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch trending assets:', error);
      }
    };

    fetchTrending();
  }, [isLiteFooter]);

  // Lite Footer (Login, Sign-up, Checkout)
  if (isLiteFooter) {
    return (
      <footer
        style={{
          marginTop: 'auto',
          padding: '24px 16px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '8px 0' }}>
            © 2025 Pocket Portfolio. Open Source. Local-First.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  // Full Footer (4-Column Structure)
  return (
    <footer
      style={{
        marginTop: 'clamp(40px, 8vw, 80px)',
        paddingTop: 'clamp(20px, 4vw, 32px)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 32px)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* 4-Column Grid (Desktop) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '32px',
          }}
          className="footer-columns"
        >
          {/* Column 1: Product (Sovereign Pitch) */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
              Product
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link
                  href="/features/google-drive-sync"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Sovereign Sync
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsor"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Founders Club
                </Link>
              </li>
              <li>
                <Link
                  href="/for/advisors"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  For Advisors
                </Link>
              </li>
              <li>
                <Link
                  href="/features/google-drive-sync"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Google Sheets Add-on
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Portfolio Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Community (The Pulse & Trust) */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
              Community
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="https://x.com/P0cketP0rtf0li0"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#34d399',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#34d399'}
                >
                  <span>🟢</span>
                  <span>X: Daily Research @ 18:00</span>
                </a>
              </li>
              <li>
                <a
                  href="https://coderlegion.com/5738/welcome-to-coderlegion-22s"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  CoderLegion
                </a>
              </li>
              <li>
                <a
                  href="https://dev.to/pocketportfolioapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Dev.to
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/PocketPortfolio/Financialprofilenetwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/Ch9PpjRzwe"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://www.webone.one"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  1EO Certified
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Market Data (SEO Hubs) */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
              Market Data
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link
                  href="/s/stocks"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Browse Stocks (A-Z)
                </Link>
              </li>
              <li>
                <Link
                  href="/s/crypto"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Browse Crypto
                </Link>
              </li>
              <li>
                <Link
                  href="/s/etf"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Global ETF List
                </Link>
              </li>
              <li>
                <Link
                  href="/live"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Trending Assets
                </Link>
              </li>
              <li>
                <Link
                  href="/s/directory"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  JSON API Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/s/insider-trading"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Insider Trading Data
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Free Tools & Resources */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
              Free Tools
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link
                  href="/tools/risk-calculator"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Risk Calculator
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: '700',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/google-sheets-formula"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Google Sheets Formula
                </Link>
              </li>
              <li>
                <Link
                  href="/for/advisors"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Advisor Report Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Tax Converter
                </Link>
              </li>
            </ul>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text)' }}>
              Resources
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="https://github.com/PocketPortfolio/Financialprofilenetwork#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link
                  href="/status"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  System Status
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic Trending Bar */}
        {trendingAssets.length > 0 && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>🔥 Trending Today:</span>
              {trendingAssets.map((asset, index) => (
                <React.Fragment key={asset.symbol}>
                  <Link
                    href={`/s/${asset.symbol.toLowerCase()}`}
                    style={{
                      color: 'var(--accent-warm)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#B45309'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  >
                    {asset.symbol}
                  </Link>
                  {index < trendingAssets.length - 1 && <span style={{ marginLeft: '8px', marginRight: '8px', color: 'var(--text-secondary)' }}>•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Copyright & Brand */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <span className="brand-wordmark brand-wordmark-small">
            Pocket Portfolio<span className="brand-wordmark-dot">.</span>
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '8px 0 0 0' }}>
            © 2025 Open Source. Local-First.
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-columns {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          /* Mobile stacking order: Product -> Market Data -> Community -> Resources */
          .footer-columns > div:nth-child(1) { order: 1; }
          .footer-columns > div:nth-child(2) { order: 3; }
          .footer-columns > div:nth-child(3) { order: 2; }
          .footer-columns > div:nth-child(4) { order: 4; }
        }
      `}</style>
    </footer>
  );
}

