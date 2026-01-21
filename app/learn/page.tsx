'use client';

import Link from 'next/link';

const concepts = [
  {
    slug: 'portfolio-beta',
    title: 'Portfolio Beta',
    definition: 'A measure of volatility relative to the overall market. Your portfolio\'s Beta tells you how much risk you\'re taking compared to the S&P 500.',
    tool: '/tools/risk-calculator',
    toolName: 'Risk Calculator',
    category: 'Risk Management'
  },
  {
    slug: 'sector-drift',
    title: 'Sector Drift',
    definition: 'The tendency of a portfolio\'s asset allocation to skew heavily towards a single industry over time, exposing investors to concentrated risk.',
    tool: '/dashboard',
    toolName: 'Sector Breakdown',
    category: 'Diversification'
  },
  {
    slug: 'fee-drag',
    title: 'Fee Drag',
    definition: 'The compound reduction of investment returns caused by percentage-based management fees. On a £100k portfolio, a 1% fee costs £27,000 over 20 years.',
    tool: '/sponsor',
    toolName: 'Lifetime Membership',
    category: 'Cost Management'
  },
  {
    slug: 'sovereign-stack',
    title: 'The Sovereign Stack',
    definition: 'A financial software architecture where sensitive banking data is fetched via API but analyzed entirely on the client-side, ensuring the platform provider never sees your Net Worth.',
    tool: '/features/google-drive-sync',
    toolName: 'Sovereign Sync',
    category: 'Architecture'
  },
  {
    slug: 'sovereign-finance',
    title: 'Sovereign Finance',
    definition: 'The philosophy of owning and controlling your financial data completely. No vendor lock-in, no data sales, no cloud dependency for core functionality.',
    tool: '/',
    toolName: 'Learn More',
    category: 'Philosophy'
  }
];

export default function LearnPage() {
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)'
    }}>
      {/* Header */}
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Financial Sovereignty Glossary
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Master the key concepts that define sovereign financial management. Each term links to tools and resources to help you take control of your wealth.
        </p>
      </header>

      {/* Concepts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {concepts.map((concept) => (
          <Link
            key={concept.slug}
            href={`/learn/${concept.slug}`}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              textDecoration: 'none',
              color: 'var(--text)',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              marginBottom: '12px',
              width: 'fit-content',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {concept.category}
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: 'var(--text)',
              lineHeight: '1.3'
            }}>
              {concept.title}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '16px',
              flexGrow: 1
            }}>
              {concept.definition}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--accent-warm)',
              fontWeight: '500'
            }}>
              <span>Learn more →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: 'var(--text)'
        }}>
          Ready to apply these concepts?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Use our free tools to calculate your portfolio risk, analyze sector exposure, and take control of your financial data.
        </p>
        <Link
          href="/tools"
          style={{
            display: 'inline-block',
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Explore Free Tools →
        </Link>
      </div>
    </div>
  );
}

