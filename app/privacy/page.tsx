import { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pocket Portfolio',
  description: 'Privacy Policy for Pocket Portfolio - Local-first portfolio tracking with data sovereignty.',
  robots: 'index,follow',
};

export default function PrivacyPage() {
  return (
    <>
      <ProductionNavbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 'clamp(32px, 6vw, 48px)' }}>
            <h1
              style={{
                fontSize: 'clamp(32px, 6vw, 48px)',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--text)',
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: 'clamp(24px, 4vw, 40px)',
              lineHeight: '1.8',
            }}
          >
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                1. Data Sovereignty
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Pocket Portfolio is built on a <strong>local-first architecture</strong>. Your portfolio data is stored
                locally in your browser by default. We do not have access to your financial data unless you explicitly
                enable <strong>Sovereign Sync</strong> (Google Drive integration).
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                2. What We Collect
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Free Tier:</strong> We collect minimal analytics (page views, feature usage) to improve the
                product. No personal financial data is transmitted to our servers.
              </p>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Sovereign Sync (Premium):</strong> If you enable Google Drive sync, your portfolio data is stored
                in your personal Google Drive account. We access it only for bidirectional synchronization. We do not
                store copies on our servers.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                3. Third-Party Services
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                We use the following third-party services:
              </p>
              <ul style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '24px', marginBottom: '12px' }}>
                <li>
                  <strong>Google Analytics:</strong> Anonymous usage statistics (can be disabled via browser settings)
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing for premium features (payment data handled by Stripe)
                </li>
                <li>
                  <strong>Vercel:</strong> Hosting infrastructure (static site generation, no data storage)
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                4. Your Rights
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Under GDPR and similar regulations, you have the right to:
              </p>
              <ul style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '24px', marginBottom: '12px' }}>
                <li>Access your data (export via JSON download)</li>
                <li>Delete your data (clear browser storage or disconnect Google Drive)</li>
                <li>Data portability (all data is in standard JSON format)</li>
                <li>Opt-out of analytics (disable via browser settings)</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                5. Contact
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                For privacy inquiries, contact:{' '}
                <a
                  href="mailto:privacy@pocketportfolio.app"
                  style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
                >
                  privacy@pocketportfolio.app
                </a>
              </p>
            </section>

            <div
              style={{
                marginTop: '32px',
                padding: '16px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                <strong>⚠️ Disclaimer:</strong> Pocket Portfolio is a developer utility for data normalization. It is not
                a brokerage, financial advisor, or trading platform. Data stays local to your device unless you enable
                Sovereign Sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

