'use client';

import Link from 'next/link';

export default function DollarCostAveragingPage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "Dollar-Cost Averaging",
    "description": "An investment strategy where you invest a fixed amount regularly regardless of price, reducing the impact of volatility and eliminating the need to time the market.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/dollar-cost-averaging"
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
          <span style={{ color: 'var(--text)' }}>Dollar-Cost Averaging</span>
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
            What is Dollar-Cost Averaging (DCA)?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Dollar-Cost Averaging</strong> is an investment strategy where you invest a fixed amount regularly regardless of price, reducing the impact of volatility and eliminating the need to time the market.
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
            How It Works
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Fixed Amount:</strong> Invest the same amount each period (e.g., £500/month)
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Automatic:</strong> Buy regardless of whether prices are up or down
            </li>
            <li>
              <strong>Result:</strong> You buy more shares when prices are low, fewer when prices are high
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
            DCA removes emotion from investing and eliminates the pressure to "time the market." Studies show that most investors who try to time the market underperform those who invest consistently.
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
              You invest £500/month in an ETF:
            </p>
            <ul style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li><strong>Month 1:</strong> Price £50 → Buy 10 shares</li>
              <li><strong>Month 2:</strong> Price £40 → Buy 12.5 shares</li>
              <li><strong>Month 3:</strong> Price £60 → Buy 8.3 shares</li>
              <li><strong>Average price:</strong> £48.33 (better than buying all at £50)</li>
            </ul>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              By buying when prices drop, you lower your average cost per share.
            </p>
          </div>
        </section>

        {/* DCA vs Lump Sum */}
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
            DCA vs Lump Sum Investment
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            <strong>DCA Benefits:</strong>
          </p>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px',
            marginBottom: '16px'
          }}>
            <li style={{ marginBottom: '8px' }}>Reduces emotional stress</li>
            <li style={{ marginBottom: '8px' }}>Eliminates need to time the market</li>
            <li style={{ marginBottom: '8px' }}>Builds discipline and consistency</li>
            <li>Lower average cost in volatile markets</li>
          </ul>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginTop: '16px'
          }}>
            <strong>When Lump Sum Works:</strong> If you have a large sum and markets are trending up, investing all at once can outperform DCA. But this requires perfect timing—which most investors don't have.
          </p>
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
              <strong>DCA removes emotion</strong>—you invest automatically regardless of market conditions.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>You buy more when prices are low</strong>—automatically lowering your average cost.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Consistency beats timing</strong>—most investors who try to time the market fail.
            </li>
            <li>
              <strong>Start with what you can afford</strong>—even £50/month is better than waiting for the "perfect" time.
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
            Learn More About DCA
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Read our data-driven analysis comparing DCA vs lump sum investing:
          </p>
          <Link
            href="/blog/dollar-cost-averaging-vs-lump-sum-a-data-driven-analysis"
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
            Read DCA Analysis →
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

