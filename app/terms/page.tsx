import { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';

export const metadata: Metadata = {
  title: 'Terms of Service | Pocket Portfolio',
  description: 'Terms of Service for Pocket Portfolio - Local-first portfolio tracking.',
  robots: 'index,follow',
};

export default function TermsPage() {
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
              Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                By accessing or using Pocket Portfolio, you agree to be bound by these Terms of Service. If you
                disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                2. Service Description
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Pocket Portfolio is a <strong>developer utility</strong> for portfolio data normalization and tracking.
                It is not a brokerage, financial advisor, or trading platform. We provide tools for managing your
                financial data locally.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                3. User Responsibilities
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                You are responsible for:
              </p>
              <ul style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '24px', marginBottom: '12px' }}>
                <li>Maintaining the security of your data and credentials</li>
                <li>Ensuring accuracy of imported financial data</li>
                <li>Compliance with applicable financial regulations in your jurisdiction</li>
                <li>Backing up your data (local-first does not mean "no backups")</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                4. Premium Features
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Sovereign Sync</strong> and other premium features are available via one-time payment (Founder's
                Club) or subscription (Corporate Sponsor). Payments are processed by Stripe. Refunds are handled on a
                case-by-case basis within 30 days of purchase.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                5. Limitation of Liability
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Pocket Portfolio is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '24px', marginBottom: '12px' }}>
                <li>Financial losses resulting from data entry errors</li>
                <li>Data loss due to browser storage limitations or user error</li>
                <li>Third-party service outages (Google Drive, Stripe, etc.)</li>
                <li>Investment decisions made using this tool</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                6. Open Source License
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                The core Pocket Portfolio codebase is open source. See{' '}
                <a
                  href="https://github.com/PocketPortfolio/Financialprofilenetwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
                >
                  GitHub
                </a>{' '}
                for license details.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                7. Changes to Terms
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                We reserve the right to modify these terms at any time. Continued use of the service after changes
                constitutes acceptance.
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

