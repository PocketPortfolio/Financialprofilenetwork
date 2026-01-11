'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ToolFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Main Footer */}
      <footer
        className="mobile-container"
        style={{
          marginTop: 'clamp(40px, 8vw, 80px)',
          paddingTop: 'clamp(20px, 4vw, 32px)',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          background: 'var(--bg)',
          padding: 'clamp(20px, 4vw, 32px) clamp(12px, 3vw, 24px)',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Brand & Legal */}
          <div style={{ textAlign: 'center' }}>
            <span className="brand-wordmark brand-wordmark-small">Pocket Portfolio<span className="brand-wordmark-dot">.</span></span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 0 0' }}>© 2025 Open Source. Local-First.</p>
          </div>

          {/* The Money Links (Bolded) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Link
              href="/for/advisors"
              style={{
                color: '#D97706',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#B45309'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#D97706'}
            >
              For Advisors
            </Link>
            <Link
              href="/features/google-drive-sync"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
            >
              Google Drive Sync
            </Link>
            <Link
              href="/tools/google-sheets-formula"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
            >
              Google Sheets
            </Link>
            <Link
              href="/sponsor"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
            >
              Founders Club
            </Link>
          </div>

          {/* Tool Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}
          >
            <Link
              href="/openbrokercsv"
              style={{
                padding: '12px 24px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D97706';
                e.currentTarget.style.color = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              OpenBrokerCSV
            </Link>
            <Link
              href="/static/portfolio-tracker"
              style={{
                padding: '12px 24px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D97706';
                e.currentTarget.style.color = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              Portfolio Tracker
            </Link>
            <Link
              href="/static/csv-etoro-to-openbrokercsv"
              style={{
                padding: '12px 24px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D97706';
                e.currentTarget.style.color = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              eToro → OpenBrokerCSV
            </Link>
          </div>

          {/* The Trust Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}
          >
            <Link
              href="/live"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Browse Stocks
            </Link>
            <a
              href="https://github.com/PocketPortfolio/Financialprofilenetwork"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              GitHub
            </a>
          </div>

          {/* Community Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}
          >
            <Link
              href="/blog"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Blog & News
            </Link>
            <a
              href="https://x.com/P0cketP0rtf0li0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              aria-label="Follow us on X for Daily Research"
            >
              <svg 
                viewBox="0 0 24 24" 
                aria-hidden="true" 
                style={{ width: '16px', height: '16px', fill: 'currentColor' }}
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Daily Research @ 18:00</span>
            </a>
            <a
              href="https://dev.to/pocketportfolioapp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Dev.to
            </a>
            <a
              href="https://coderlegion.com/5738/welcome-to-coderlegion-22s"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              CoderLegion
            </a>
            <a
              href="https://discord.gg/Ch9PpjRzwe"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Discord
            </a>
            <a
              href="https://www.linkedin.com/company/pocket-portfolio-community"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              LinkedIn
            </a>
            <a
              href="https://www.webone.one"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              1EO Certified
            </a>
            <Link
              href="/dashboard"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Launch App
            </Link>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'var(--surface)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '12px',
                margin: 0,
                lineHeight: '1.5'
              }}
            >
              <strong>⚠️ Disclaimer:</strong> Pocket Portfolio is a developer utility for data normalization. It is not a brokerage, financial advisor, or trading platform. Data stays local to your device.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky Upsell Banner (Mobile Only, if not logged in) */}
      {!isAuthenticated && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--signal)',
            color: 'white',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            zIndex: 999,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: '100vw',
            boxSizing: 'border-box'
          }}
          className="md:hidden"
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-medium)',
              flex: 1
            }}
          >
            Liked this tool? Track your entire net worth privately.
          </p>
          <Link
            href="/dashboard"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'white',
              color: 'var(--signal)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-semibold)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Try Pocket Portfolio
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}


