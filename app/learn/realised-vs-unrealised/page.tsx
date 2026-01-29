'use client';

import Link from 'next/link';

export default function RealisedVsUnrealisedPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Realised vs Unrealised P&L",
    "description": "Realised gains/losses are profits or losses from actual sales of assets. Unrealised gains/losses are paper profits/losses on assets you still own. Understanding the difference is crucial for tax planning and portfolio assessment.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/realised-vs-unrealised"
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
          <span style={{ color: 'var(--text)' }}>Realised vs Unrealised P&L</span>
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
            Realised vs Unrealised P&L: What's the Difference?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Realised gains/losses</strong> are profits or losses from actual sales of assets. <strong>Unrealised gains/losses</strong> are paper profits/losses on assets you still own. Understanding the difference is crucial for tax planning and portfolio assessment.
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
            Quick Definitions
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Realised P&L:</strong> Money you've actually made or lost from selling assets. This is what you report on your tax return.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Unrealised P&L:</strong> Paper gains/losses on assets you still hold. Not taxable until you sell.
            </li>
            <li>
              <strong>Key Point:</strong> You only pay tax on realised gains. Unrealised gains are just potential until you sell.
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
            Many investors confuse their portfolio's current value (unrealised) with actual taxable income (realised). This can lead to poor tax planning and unrealistic expectations about available cash.
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
              You bought 100 shares of NVDA at $100/share ($10,000 total):
            </p>
            <ul style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li><strong>Current price:</strong> $150/share = $15,000 value</li>
              <li><strong>Unrealised gain:</strong> $5,000 (paper profit, not taxable yet)</li>
              <li><strong>If you sell:</strong> $5,000 becomes realised gain (taxable)</li>
            </ul>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              You can't spend unrealised gains. They're locked in the asset until you sell.
            </p>
          </div>
        </section>

        {/* Tax Implications */}
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
            Tax Planning Implications
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            Understanding realised vs unrealised helps you:
          </p>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Plan tax payments (only realised gains are taxable)</li>
            <li style={{ marginBottom: '8px' }}>Time your sales to optimize tax brackets</li>
            <li style={{ marginBottom: '8px' }}>Understand your actual cash position</li>
            <li>Make informed decisions about when to realise gains/losses</li>
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
              <strong>Unrealised gains are not income</strong>—they're potential until you sell.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Only realised gains trigger tax liability</strong>—plan your sales accordingly.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Track both separately</strong>—your portfolio dashboard should show both metrics clearly.
            </li>
            <li>
              <strong>Don't confuse portfolio value with available cash</strong>—unrealised gains are locked in assets.
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

