'use client';

import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer style={{ 
      marginTop: 'clamp(40px, 8vw, 80px)', 
      paddingTop: 'clamp(20px, 4vw, 32px)', 
      borderTop: '1px solid var(--border)', 
      textAlign: 'center', 
      background: 'var(--bg)',
      padding: 'clamp(20px, 4vw, 32px) clamp(12px, 3vw, 24px)',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Brand & Legal */}
        <div style={{ textAlign: 'center' }}>
          <span className="brand-wordmark brand-wordmark-small">Pocket Portfolio<span className="brand-wordmark-dot">.</span></span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 0 0' }}>© 2025 Open Source. Local-First.</p>
        </div>

        {/* The Money Links (Bolded) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <Link href="/for/advisors" style={{ 
            color: '#D97706',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#B45309'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#D97706'}
          >
            For Advisors
          </Link>
          <Link href="/features/google-drive-sync" style={{ 
            color: 'var(--text)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
          >
            Google Drive Sync
          </Link>
          <Link href="/tools/google-sheets-formula" style={{ 
            color: 'var(--text)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
          >
            Google Sheets
          </Link>
          <Link href="/sponsor" style={{ 
            color: 'var(--text)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
          >
            Founders Club
          </Link>
          <Link href="/cheapest-portfolio-tracker-no-subscription" style={{ 
            color: 'var(--text)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#D97706'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
          >
            No Subscription
          </Link>
        </div>

        {/* Free Tools Section */}
        <div style={{ 
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Free Tools
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            flexWrap: 'wrap' 
          }}>
            <Link href="/tools/risk-calculator" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
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
            <Link href="/tools/google-sheets-formula" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Google Sheets
            </Link>
            <Link href="/for/advisors" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Advisor Reports
            </Link>
            <Link href="/tools" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Tax Converter
            </Link>
          </div>
        </div>

        {/* The Trust Links */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
            <Link href="/live" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            GitHub
          </a>
        </div>

        {/* Community Links */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          <Link 
            href="/blog" 
            style={{ 
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Launch App
          </Link>
        </div>

        {/* Resources Section */}
        <div style={{ 
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Resources
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            flexWrap: 'wrap' 
          }}>
            <Link href="/blog" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Blog
            </Link>
            <Link href="/learn" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Learn
            </Link>
            <a href="https://github.com/PocketPortfolio/Financialprofilenetwork#readme" target="_blank" rel="noopener noreferrer" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Documentation
            </a>
            <Link href="/status" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              System Status
            </Link>
            <Link href="/privacy" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ 
              padding: '10px 20px', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text)', 
              textDecoration: 'none', 
              fontSize: '13px', 
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.color = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ 
          marginTop: '16px',
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Disclaimer:</strong> Pocket Portfolio is a developer utility for data normalization. It is not a brokerage, financial advisor, or trading platform. Data stays local to your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
