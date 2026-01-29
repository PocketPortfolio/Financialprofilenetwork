'use client';

import Link from 'next/link';

export default function VendorLockInPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Vendor Lock-In",
    "description": "The situation where switching from one service provider to another is difficult or costly due to proprietary formats, APIs, or data structures. Local-first architecture prevents this.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/vendor-lock-in"
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
          <span style={{ color: 'var(--text)' }}>Vendor Lock-In</span>
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
            What is Vendor Lock-In?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Vendor Lock-In</strong> is the situation where switching from one service provider to another is difficult or costly due to proprietary formats, APIs, or data structures. Local-first architecture prevents this.
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
            How Lock-In Happens
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Proprietary Formats:</strong> Your data is stored in formats only that vendor can read
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>No Export:</strong> You can't easily export your data to use elsewhere
            </li>
            <li>
              <strong>Cloud Dependency:</strong> Your data lives on their servers, not yours
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
            Vendor lock-in means you're trapped. If the service raises prices, changes features, or shuts down, you can't easily take your data elsewhere. This is especially dangerous with financial data.
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
              Real-World Example
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              You've used a cloud portfolio tracker for 5 years:
            </p>
            <ul style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li><strong>All your data:</strong> Stored in their proprietary database</li>
              <li><strong>Export options:</strong> Limited to CSV with missing fields</li>
              <li><strong>They raise prices:</strong> 3x increase, but you can't leave easily</li>
              <li><strong>You're locked in:</strong> Years of transaction history trapped</li>
            </ul>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              With local-first, your data is always yours. Export anytime in standard formats.
            </p>
          </div>
        </section>

        {/* How to Avoid */}
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
            How to Avoid Vendor Lock-In
          </h2>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}><strong>Use Open Standards:</strong> JSON, CSV, standard formats anyone can read</li>
            <li style={{ marginBottom: '8px' }}><strong>Local-First Architecture:</strong> Your data lives on your device first</li>
            <li style={{ marginBottom: '8px' }}><strong>Easy Export:</strong> One-click export to standard formats</li>
            <li style={{ marginBottom: '8px' }}><strong>No Proprietary APIs:</strong> Avoid services that require their API to access your data</li>
            <li><strong>Test Export Before Committing:</strong> Make sure you can actually leave before you invest time</li>
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
              <strong>Vendor lock-in traps your data</strong>—making it hard or expensive to switch services.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Local-first prevents lock-in</strong>—your data is yours, stored in standard formats.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Always test export</strong>—before committing to a service, verify you can leave.
            </li>
            <li>
              <strong>Open standards = freedom</strong>—use JSON, CSV, and formats anyone can read.
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
            Learn More About Avoiding Lock-In
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Read why cloud-first portfolio trackers create dangerous vendor lock-in:
          </p>
          <Link
            href="/blog/the-death-of-the-cloud-portfolio-why-vendor-lock-in-kills-fi"
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
            Read Article →
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

