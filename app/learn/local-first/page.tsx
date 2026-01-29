'use client';

import Link from 'next/link';

export default function LocalFirstPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Local-First Architecture",
    "description": "A software design pattern where data is stored and processed on the user's device first, with optional cloud sync. This ensures privacy, offline functionality, and user data sovereignty.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/local-first"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)'
      }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '24px', fontSize: '14px' }}>
          <Link href="/learn" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Glossary
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>Local-First Architecture</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 42px)',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            What is Local-First Architecture?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Local-First Architecture</strong> is a software design pattern where data is stored and processed on the user's device first, with optional cloud sync. This ensures privacy, offline functionality, and user data sovereignty.
          </p>
        </header>

        {/* Definition Box */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Core Principles
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Data Lives Locally:</strong> Your data is stored on your device first (browser storage, local files)
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Optional Cloud Sync:</strong> Cloud is optional for backup/sync, not required for core functionality
            </li>
            <li>
              <strong>Privacy by Default:</strong> The service provider never sees your sensitive data
            </li>
          </ul>
        </div>

        {/* Why It Matters */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Why does it matter?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            Traditional cloud-first apps store all your data on their servers. This creates privacy risks, vendor lock-in, and dependency on internet connectivity. Local-first architecture puts you in control.
          </p>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Real-World Example: Pocket Portfolio
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              Pocket Portfolio uses local-first architecture:
            </p>
            <ul style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li><strong>Your portfolio data:</strong> Stored in your browser (localStorage/IndexedDB)</li>
              <li><strong>CSV parsing:</strong> Done entirely client-side (no server uploads)</li>
              <li><strong>Price data:</strong> Fetched via API but analyzed locally</li>
              <li><strong>Optional sync:</strong> Google Drive sync available, but not required</li>
            </ul>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              Result: We never see your Net Worth. You own your data completely.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Benefits of Local-First
          </h2>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}><strong>Privacy:</strong> Your sensitive data never leaves your device</li>
            <li style={{ marginBottom: '8px' }}><strong>Offline:</strong> Works without internet connection</li>
            <li style={{ marginBottom: '8px' }}><strong>Speed:</strong> No network latency for local operations</li>
            <li style={{ marginBottom: '8px' }}><strong>Ownership:</strong> You control your data, not the vendor</li>
            <li style={{ marginBottom: '8px' }}><strong>No Lock-In:</strong> Export your data anytime in standard formats</li>
            <li><strong>Security:</strong> Reduced attack surface (no central database of user data)</li>
          </ul>
        </section>

        {/* Key Takeaways */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Key Takeaways
          </h2>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Local-first = privacy-first</strong>—your data stays on your device.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Cloud is optional</strong>—used for sync/backup, not core functionality.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>You own your data</strong>—export anytime, no vendor lock-in.
            </li>
            <li>
              <strong>Works offline</strong>—no internet required for core features.
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Learn More About Our Architecture
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Read why we built Pocket Portfolio with local-first principles:
          </p>
          <Link
            href="/blog/stop-building-fintech-with-databases-why-i-went-local-first-"
            style={{
              display: 'inline-block',
              background: 'var(--accent-warm)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d97706';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-warm)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Read Architecture Guide →
          </Link>
        </div>

        {/* Back to Glossary */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <Link
            href="/learn"
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            ← Back to Glossary
          </Link>
        </div>
      </div>
    </>
  );
}

