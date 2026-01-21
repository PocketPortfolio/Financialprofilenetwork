'use client';

import Link from 'next/link';

export default function FeeDragPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Fee Drag",
    "description": "The compound reduction of investment returns caused by percentage-based management fees (AUM). On a £100k portfolio, a 1% fee costs £27,000 over 20 years.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/fee-drag"
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
          <span style={{ color: 'var(--text)' }}>Fee Drag</span>
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
            What is Fee Drag?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Fee Drag</strong> is the compound reduction of investment returns caused by percentage-based management fees (AUM). On a £100k portfolio, a 1% fee costs <strong>£27,000 over 20 years</strong>.
          </p>
        </header>

        {/* Definition Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
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
            The £27,000 Subscription
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '12px'
          }}>
            If Netflix charged you 1% of your Net Worth, you'd cancel it. Why do you let your Wealth Manager do it?
          </p>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}>
            A 1% annual fee on a £100,000 portfolio doesn't just cost £1,000 per year. Over 20 years with 7% average returns, it costs <strong>£27,000 in lost compound growth</strong>.
          </p>
        </div>

        {/* The Danger */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Why percentage fees are a scam
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            Percentage-based fees (AUM - Assets Under Management) scale with your wealth. As your portfolio grows, your fees grow—even though the service doesn't improve. You're paying more for the same service.
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
              The Math: £100k Portfolio Over 20 Years
            </h3>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Without 1% fee:</strong> £100,000 × (1.07)^20 = £386,968
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>With 1% fee (6% net return):</strong> £100,000 × (1.06)^20 = £320,714
              </p>
              <p style={{
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                fontWeight: '600',
                color: '#ef4444'
              }}>
                <strong>Fee Drag Cost: £66,254</strong> (17% of your final portfolio value)
              </p>
            </div>
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
            The Sovereign Solution: Lifetime Membership
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            We charge a <strong>flat £100 lifetime fee</strong>. Not 1% per year. Not 0.5% per year. One payment, forever. As your portfolio grows from £100k to £500k, your fee stays the same. That's <strong>Sovereign Ownership</strong> vs. <strong>Renting your wealth stack</strong>.
          </p>
          <Link
            href="/sponsor"
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
            Learn About Lifetime Membership →
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
              <strong>Percentage fees compound against you.</strong> 1% doesn't sound like much, but it's £27k over 20 years.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Fees scale with wealth, not value.</strong> As you get richer, you pay more for the same service.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Flat fees are mathematically superior.</strong> One payment vs. percentage of growing wealth.
            </li>
            <li>
              <strong>Sovereign Ownership beats renting.</strong> Own your tools, don't rent them.
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

