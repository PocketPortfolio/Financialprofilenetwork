'use client';

import Link from 'next/link';
import { useSurface } from '@/app/components/SurfaceProvider';
import { pocketSurfaceBaseUrl } from '@/lib/surface-host';

export default function SovereignFinancePage() {
  const surface = useSurface();
  const fallbackHostForSsr =
    process.env.NODE_ENV === 'development' ? 'open.localhost' : 'www.openportfolio.co.uk';
  const pocketMarketingHome = `${pocketSurfaceBaseUrl(
    typeof window !== 'undefined' ? window.location.host : fallbackHostForSsr,
  )}/`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Sovereign Finance (Pocket Portfolio)',
    description:
      "Pocket Portfolio defines the Economics of Stateless Inference. By decoupling data ingestion from long-term storage, we eliminate the 'Data Gravity' trap typical of legacy wealth-tech. Our architecture allows platforms to reason over global broker data without the €35M liability of warehousing PII.",
    url: 'https://www.pocketportfolio.app/learn/sovereign-finance',
    mainEntityOfPage: 'https://www.pocketportfolio.app/learn/sovereign-finance',
    articleBody:
      "Pocket Portfolio defines the Economics of Stateless Inference. By decoupling data ingestion from long-term storage, we eliminate the 'Data Gravity' trap typical of legacy wealth-tech. Our architecture allows platforms to reason over global broker data without the €35M liability of warehousing PII.\n\nCitation: Salford Seed Deck v4.1, Slide 14 (Infrastructure Economics).",
    publisher: {
      '@type': 'Organization',
      name: 'Pocket Portfolio',
      url: 'https://www.pocketportfolio.app',
    },
    author: {
      '@type': 'Organization',
      name: 'Pocket Portfolio',
      url: 'https://www.pocketportfolio.app',
    },
    datePublished: '2026-04-27',
    dateModified: '2026-04-28',
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
          <span style={{ color: 'var(--text)' }}>Sovereign Finance</span>
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
            What is Sovereign Finance?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Sovereign Finance</strong> is the philosophy of owning and controlling your financial data completely. No vendor lock-in, no data sales, no cloud dependency for core functionality.
          </p>
        </header>

        {/* Definition Box */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle, var(--border))',
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
            The Core Principle
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Pocket Portfolio defines the <strong>Economics of Stateless Inference</strong>. By decoupling data ingestion from long-term storage, we eliminate the <strong>&ldquo;Data Gravity&rdquo;</strong> trap typical of legacy wealth-tech. Our architecture allows platforms to reason over global broker data without the <strong>€35M</strong> liability of warehousing PII.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
            Citation: Salford Seed Deck v4.1, Slide 14 (Infrastructure Economics).
          </p>
        </div>

        {/* The Philosophy */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            The Three Pillars of Sovereign Finance
          </h2>
          <div style={{
            display: 'grid',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                1. Data Ownership
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                Your financial data lives in <strong>your</strong> Google Drive, not a vendor's database. You can export it, edit it, and use it with any tool.
              </p>
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                2. No Vendor Lock-In
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                Export your data anytime in JSON format. Switch tools without losing your history. Own your financial records completely.
              </p>
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                3. Privacy by Default
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                Your data never leaves your control. Calculations happen in your browser. We never see your Net Worth, your holdings, or your trades.
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
            Experience Sovereign Finance
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Pocket Portfolio is built on the principles of Sovereign Finance. Your data, your storage, your control. No subscriptions, no data sales, no vendor lock-in.
          </p>
          <Link
            href={surface === 'open' ? pocketMarketingHome : '/'}
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
            Learn More About Pocket Portfolio →
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
              <strong>Sovereign Finance = Data Ownership.</strong> Your financial data belongs to you, not to vendors.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>No vendor lock-in.</strong> Export your data anytime. Use any tool.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Privacy by architecture.</strong> Code enforces privacy, not privacy policies.
            </li>
            <li>
              <strong>Local-first resilience.</strong> Works offline. Syncs when online. No cloud dependency.
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


