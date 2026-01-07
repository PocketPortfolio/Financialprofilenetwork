'use client';

import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import ProductionNavbar from '../../components/marketing/ProductionNavbar';
import LandingFooter from '../../components/marketing/LandingFooter';

export default function GoogleDriveSyncFeaturePage() {
  return (
    <>
      <SEOHead
        title="Sovereign Sync: Google Drive as Stock Database"
        description="Learn how to use Google Drive as your personal stock database with Pocket Portfolio. Bidirectional sync, JSON data ownership, and zero vendor lock-in. Edit trades in JSON."
        keywords={[
          'google drive portfolio tracker',
          'google drive stock database',
          'sovereign sync',
          'json portfolio manager',
          'bidirectional sync',
          'data ownership',
          'self-hosted portfolio',
          'excel trading journal',
          'google drive sync',
        ]}
        canonical="https://www.pocketportfolio.app/features/google-drive-sync"
        ogType="website"
      />
      
      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Pocket Portfolio - Sovereign Sync',
            applicationCategory: 'FinanceApplication',
            featureList: 'Google Drive Bidirectional Sync, JSON Data Ownership, Zero Knowledge Privacy',
            operatingSystem: 'Web, PWA',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free tier available. Enterprise Sync for Corporate Sponsors.'
            },
            description: 'Use Google Drive as your personal stock database. Bidirectional sync, JSON data ownership, and zero vendor lock-in.',
            url: 'https://www.pocketportfolio.app/features/google-drive-sync',
          }),
        }}
      />

      {/* Navigation Bar */}
      <ProductionNavbar />

      <div 
        className="mobile-container"
        style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 16px)',
          paddingTop: 'clamp(40px, 8vw, 60px)',
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'clamp(32px, 6vw, 48px)', textAlign: 'center', paddingTop: 'clamp(8px, 2vw, 16px)' }}>
          <h1
            style={{
              fontSize: 'clamp(24px, 6vw, 42px)',
              fontWeight: '700',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              color: 'var(--text)',
              lineHeight: '1.3',
              padding: '0 clamp(8px, 2vw, 16px)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            How to Use Google Drive as a Stock Database
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto',
              padding: '0 clamp(8px, 2vw, 16px)',
            }}
          >
            Pocket Portfolio's <strong>Sovereign Sync</strong> turns your Google Drive into a personal database for your portfolio. Own your data, sync bidirectionally, and edit trades in JSON—all with zero vendor lock-in.
          </p>
        </div>

        {/* Main Content */}
        <div style={{ marginBottom: 'clamp(32px, 6vw, 48px)', padding: '0 clamp(4px, 1vw, 0px)' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              color: 'var(--text)',
              lineHeight: '1.3',
            }}
          >
            What is Sovereign Sync?
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 16px)', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            <strong>Sovereign Sync</strong> is Pocket Portfolio's bidirectional Google Drive integration that gives you complete control over your financial data. Instead of storing your portfolio in a proprietary database, your trades live in a JSON file on your Google Drive—making it your database.
          </p>

          <div
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: 'clamp(16px, 4vw, 24px)',
              marginBottom: 'clamp(24px, 5vw, 32px)',
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(18px, 4vw, 20px)',
                fontWeight: '600',
                marginBottom: 'clamp(10px, 2.5vw, 12px)',
                color: 'var(--text)',
              }}
            >
              Key Features
            </h3>
            <ul style={{ margin: 0, paddingLeft: 'clamp(20px, 4vw, 24px)', lineHeight: '1.8' }}>
              <li style={{ marginBottom: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-secondary)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                <strong>Bidirectional Sync:</strong> Changes in Pocket Portfolio sync to Drive, and edits in Drive sync back to the app—in real-time.
              </li>
              <li style={{ marginBottom: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-secondary)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                <strong>JSON Data Ownership:</strong> Your portfolio is stored as <code style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code>—a human-readable, developer-friendly format.
              </li>
              <li style={{ marginBottom: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-secondary)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                <strong>Zero Vendor Lock-in:</strong> Your data lives in your Drive. Export, edit, or migrate anytime—no proprietary formats.
              </li>
              <li style={{ marginBottom: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-secondary)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                <strong>Developer-Friendly:</strong> Edit trades programmatically, use version control, or integrate with other tools.
              </li>
              <li style={{ marginBottom: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-secondary)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                <strong>Privacy-First:</strong> We only access files created by Pocket Portfolio. Your data remains private.
              </li>
            </ul>
          </div>

          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              marginTop: 'clamp(32px, 6vw, 48px)',
              color: 'var(--text)',
              lineHeight: '1.3',
            }}
          >
            How It Works
          </h2>
          <ol style={{ margin: 0, paddingLeft: 'clamp(20px, 4vw, 24px)', lineHeight: '1.8' }}>
            <li style={{ marginBottom: 'clamp(12px, 3vw, 16px)', color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2.5vw, 16px)' }}>
              <strong>Connect Google Drive:</strong> In Settings, click "Connect Google Drive" and authorize Pocket Portfolio to create a folder in your Drive.
            </li>
            <li style={{ marginBottom: 'clamp(12px, 3vw, 16px)', color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2.5vw, 16px)' }}>
              <strong>Automatic Sync:</strong> Your portfolio data is stored in <code style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code>. Changes sync every 5 seconds.
            </li>
            <li style={{ marginBottom: 'clamp(12px, 3vw, 16px)', color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2.5vw, 16px)' }}>
              <strong>Edit Anywhere:</strong> Open the JSON file in VS Code, Notepad++, or any text editor. Make changes, save, and they sync back to Pocket Portfolio.
            </li>
            <li style={{ marginBottom: 'clamp(12px, 3vw, 16px)', color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2.5vw, 16px)' }}>
              <strong>Multi-Device Access:</strong> Open Pocket Portfolio on another device, and it automatically pulls the latest data from Drive.
            </li>
          </ol>

          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: 'clamp(16px, 4vw, 20px)',
              marginTop: 'clamp(24px, 5vw, 32px)',
              marginBottom: 'clamp(24px, 5vw, 32px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(10px, 2.5vw, 12px)', marginBottom: 'clamp(6px, 1.5vw, 8px)' }}>
              <span style={{ fontSize: 'clamp(20px, 4vw, 24px)', flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: '#dc2626', lineHeight: '1.3' }}>
                  Important: JSON File Format
                </h4>
                <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: '#dc2626', margin: 0, wordWrap: 'break-word' }}>
                  Do <strong>not</strong> open <code style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code> with Google Sheets or Excel. These tools will convert the file and break the sync. Always use a text editor (VS Code, Sublime, Notepad++) for editing.
                </p>
              </div>
            </div>
          </div>

          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              marginTop: 'clamp(32px, 6vw, 48px)',
              color: 'var(--text)',
              lineHeight: '1.3',
            }}
          >
            Use Cases
          </h2>
          <div style={{ display: 'grid', gap: 'clamp(16px, 4vw, 20px)', marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: 'clamp(16px, 4vw, 20px)',
              }}
            >
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                🛠️ Developer Workflow
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                Edit trades programmatically, use Git for version control, or integrate with your own tools via the JSON API.
              </p>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: 'clamp(16px, 4vw, 20px)',
              }}
            >
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                📊 Bulk Editing
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                Make bulk changes to trades in a text editor, then sync back to Pocket Portfolio instantly.
              </p>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: 'clamp(16px, 4vw, 20px)',
              }}
            >
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                🔄 Multi-Device Sync
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                Access your portfolio from any device. Changes sync automatically across all your devices.
              </p>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: 'clamp(16px, 4vw, 20px)',
              }}
            >
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                🔐 Data Sovereignty
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                Your data lives in your Google Drive. No vendor lock-in, no proprietary formats—complete ownership.
              </p>
            </div>
          </div>

          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              marginTop: 'clamp(32px, 6vw, 48px)',
              color: 'var(--text)',
              lineHeight: '1.3',
            }}
          >
            Getting Started
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 16px)', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            Sovereign Sync is available for <strong>Corporate Sponsors</strong> and <strong>Founders Club</strong> members. Upgrade to unlock this feature and take control of your financial data.
          </p>
          <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap', marginTop: 'clamp(24px, 5vw, 32px)', justifyContent: 'center' }}>
            <Link
              href="/sponsor"
              style={{
                display: 'inline-block',
                padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 28px)',
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              Upgrade to Unlock →
            </Link>
            <Link
              href="/settings"
              style={{
                display: 'inline-block',
                padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 28px)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontWeight: '600',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
              }}
            >
              Go to Settings
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: 'clamp(48px, 8vw, 64px)', paddingTop: 'clamp(32px, 6vw, 48px)', borderTop: '1px solid var(--border)' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: 'clamp(24px, 5vw, 32px)',
              color: 'var(--text)',
              lineHeight: '1.3',
            }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: 'clamp(20px, 4vw, 24px)' }}>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                Can I edit the JSON file directly?
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, wordWrap: 'break-word' }}>
                Yes! That's the whole point. Open <code style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code> in any text editor, make changes, and they'll sync back to Pocket Portfolio within 5 seconds.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                What happens if I break the JSON syntax?
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, wordWrap: 'break-word' }}>
                Pocket Portfolio will detect invalid JSON and pause syncing to protect your local data. You'll see a warning message, and your local trades remain safe. Fix the JSON syntax in Drive, and sync will resume automatically.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                Can I use Excel instead of JSON?
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, wordWrap: 'break-word' }}>
                The primary sync file is JSON. However, you can optionally enable Excel export (<code style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_view.xlsx</code>) for viewing in Google Sheets—but this is read-only. To edit trades, use the JSON file.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                Is my data secure?
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, wordWrap: 'break-word' }}>
                Yes. Pocket Portfolio only accesses files it creates in your Google Drive. Your data remains private and is stored in your own Drive account. We never see your portfolio data.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', color: 'var(--text)', lineHeight: '1.3' }}>
                How do I get started?
              </h3>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, wordWrap: 'break-word' }}>
                Upgrade to Corporate Sponsor or Founders Club, then go to Settings → Data Sovereignty & Sync → Connect Google Drive. The setup takes less than a minute.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter />
    </>
  );
}

