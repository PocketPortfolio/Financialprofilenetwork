'use client';

import Link from 'next/link';

export default function SovereignStackPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "The Sovereign Stack",
    "description": "A financial software architecture where sensitive banking data (Transactions, Holdings) is fetched via API but analyzed entirely on the client-side (Browser/Local), ensuring the platform provider never sees the user's Net Worth.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/sovereign-stack"
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
          <span style={{ color: 'var(--text)' }}>The Sovereign Stack</span>
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
            What is the Sovereign Stack?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>The Sovereign Stack</strong> is a financial software architecture where sensitive banking data (Transactions, Holdings) is fetched via API but analyzed entirely on the client-side (Browser/Local), ensuring the platform provider never sees the user's Net Worth.
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
            Privacy isn't a policy; it's code.
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Here is how we calculate your Beta without ever seeing your stocks. The math happens in <strong>your browser</strong>, not on our servers.
          </p>
        </div>

        {/* The Architecture */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            How the Sovereign Stack works
          </h2>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Traditional Stack (Cloud-First)
            </h3>
            <ol style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>User uploads portfolio data → Server</li>
              <li>Server stores data in database</li>
              <li>Server calculates analytics</li>
              <li>Server returns results</li>
            </ol>
            <p style={{
              fontSize: '14px',
              color: '#ef4444',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              ❌ Platform sees your Net Worth. Data is stored on vendor servers.
            </p>
          </div>
          <div style={{
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Sovereign Stack (Client-First)
            </h3>
            <ol style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>User stores data in Google Drive (their own storage)</li>
              <li>Browser fetches data via API (read-only)</li>
              <li>Browser calculates analytics locally</li>
              <li>Results never leave the browser</li>
            </ol>
            <p style={{
              fontSize: '14px',
              color: '#22c55e',
              marginTop: '12px',
              fontStyle: 'italic',
              fontWeight: '600'
            }}>
              ✅ Platform never sees your Net Worth. Data stays in your Google Drive.
            </p>
          </div>
        </section>

        {/* The Solution */}
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
            Experience the Sovereign Stack
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Our <strong>Sovereign Sync</strong> feature turns your Google Drive into your personal database. All calculations happen in your browser. We never see your portfolio value, your holdings, or your trades.
          </p>
          <Link
            href="/features/google-drive-sync"
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
            Learn About Sovereign Sync →
          </Link>
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
              <strong>Client-side analysis = true privacy.</strong> If the math happens in your browser, we can't see it.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Your data, your storage.</strong> Google Drive is your database, not ours.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>No vendor lock-in.</strong> Export your JSON files anytime. Own your data completely.
            </li>
            <li>
              <strong>Privacy by architecture, not policy.</strong> Code enforces privacy, not promises.
            </li>
          </ul>
        </section>

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

