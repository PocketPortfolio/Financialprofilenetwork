'use client';

import Link from 'next/link';

export default function JsonFinancePage() {
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "JSON Finance Standard",
    "description": "An open standard for representing financial data in JSON format, enabling interoperability between financial tools and eliminating proprietary data formats.",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Financial Sovereignty Glossary",
      "url": "https://www.pocketportfolio.app/learn"
    },
    "url": "https://www.pocketportfolio.app/learn/json-finance"
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
          <span style={{ color: 'var(--text)' }}>JSON Finance Standard</span>
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
            What is the JSON Finance Standard?
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>JSON Finance</strong> is an open standard for representing financial data in JSON format, enabling interoperability between financial tools and eliminating proprietary data formats.
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
              <strong>Open Standard:</strong> Anyone can read and write JSON Finance format
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Interoperable:</strong> Works across different tools and platforms
            </li>
            <li>
              <strong>Human-Readable:</strong> JSON is easy to inspect and debug
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
            Most financial tools use proprietary formats that lock you in. JSON Finance breaks this by providing a standard, open format that any tool can read. This means you can switch between tools without losing your data.
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
              Example JSON Finance Format
            </h3>
            <pre style={{
              fontSize: '12px',
              background: 'var(--surface)',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              lineHeight: '1.5',
              color: 'var(--text-secondary)'
            }}>
{`{
  "version": "1.0",
  "holdings": [
    {
      "symbol": "AAPL",
      "shares": 10,
      "costBasis": 150.00,
      "currency": "USD"
    }
  ],
  "transactions": [
    {
      "date": "2024-01-15",
      "type": "BUY",
      "symbol": "AAPL",
      "shares": 10,
      "price": 150.00
    }
  ]
}`}
            </pre>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              This format is readable by any tool that supports JSON Finance—no proprietary lock-in.
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
            Benefits of JSON Finance
          </h2>
          <ul style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}><strong>No Vendor Lock-In:</strong> Your data works with any tool</li>
            <li style={{ marginBottom: '8px' }}><strong>Easy Migration:</strong> Switch tools without data loss</li>
            <li style={{ marginBottom: '8px' }}><strong>Human-Readable:</strong> Inspect and edit your data directly</li>
            <li style={{ marginBottom: '8px' }}><strong>Programmatic Access:</strong> Easy to parse with any programming language</li>
            <li style={{ marginBottom: '8px' }}><strong>Version Control:</strong> Track changes with Git</li>
            <li><strong>Interoperability:</strong> Share data between different financial tools</li>
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
              <strong>JSON Finance is an open standard</strong>—anyone can read and write it.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Eliminates vendor lock-in</strong>—your data works with any tool.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Human-readable format</strong>—inspect and edit your data directly.
            </li>
            <li>
              <strong>Future-proof</strong>—standard formats don't become obsolete.
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
            Learn More About JSON Finance
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Read how JSON Finance breaks Wall Street's grip on financial data:
          </p>
          <Link
            href="/blog/json-finance-the-open-standard-that-breaks-wall-street-s-gri"
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
            Read JSON Finance Article →
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

