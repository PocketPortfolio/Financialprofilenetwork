'use client';

import Link from 'next/link';
import { CONVERSION_PAIRS } from '../lib/tax-formats/conversion-pairs';

export default function ToolsPage() {
  // Group tax converters by target software
  const convertersBySoftware = CONVERSION_PAIRS.reduce((acc, pair) => {
    if (!acc[pair.targetSoftware]) {
      acc[pair.targetSoftware] = [];
    }
    acc[pair.targetSoftware].push(pair);
    return acc;
  }, {} as Record<string, typeof CONVERSION_PAIRS>);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 48px)',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Free Financial Tools
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          All tools process data 100% locally in your browser. Your financial data never leaves your device.
        </p>
      </div>

      {/* Main Tools Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '64px'
      }}>
        {/* Risk Calculator */}
        <Link
          href="/tools/risk-calculator"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            textDecoration: 'none',
            color: 'var(--text)',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '700',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            New
          </span>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '28px' }}>📊</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Risk Calculator
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontSize: '15px',
            marginBottom: '16px',
            flex: 1
          }}>
            Calculate your portfolio Beta score and volatility exposure instantly. Enter tickers like NVDA, TSLA, AAPL.
          </p>
          <span style={{
            color: 'var(--accent-warm)',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Try Risk Calculator →
          </span>
        </Link>

        {/* Google Sheets Formula */}
        <Link
          href="/tools/google-sheets-formula"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            textDecoration: 'none',
            color: 'var(--text)',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '28px' }}>📈</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Google Sheets Formula
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontSize: '15px',
            marginBottom: '16px',
            flex: 1
          }}>
            Get live stock prices and portfolio data directly in Google Sheets. No API keys required.
          </p>
          <span style={{
            color: 'var(--accent-warm)',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            View Formula →
          </span>
        </Link>

        {/* Advisor Report Generator */}
        <Link
          href="/for/advisors"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            textDecoration: 'none',
            color: 'var(--text)',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '28px' }}>📋</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Advisor Report Generator
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            fontSize: '15px',
            marginBottom: '16px',
            flex: 1
          }}>
            Generate white-label portfolio reports with your firm logo. Preview free, download PDFs with Corporate License.
          </p>
          <span style={{
            color: 'var(--accent-warm)',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Generate Reports →
          </span>
        </Link>
      </div>

      {/* Tax Converters Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginBottom: '12px'
          }}>
            Tax Converters
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Convert broker CSV files to tax software formats. All processing happens locally in your browser.
          </p>
        </div>

        {/* Group by Target Software */}
        {Object.entries(convertersBySoftware).map(([software, pairs]) => (
          <div key={software} style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--text)',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '2px solid var(--border)'
            }}>
              Convert to {software}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {pairs.map((pair) => (
                <Link
                  key={pair.id}
                  href={`/tools/${pair.id}`}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px',
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'var(--accent-warm)'
                    }}>
                      {pair.sourceBroker}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>→</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      {pair.targetSoftware}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {pair.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.05)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          marginBottom: '12px'
        }}>
          🔒
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          Your Data Stays Local
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          margin: 0
        }}>
          All tools process data 100% locally in your browser. Your financial data is never uploaded to our servers. We never see your transactions.
        </p>
      </div>
    </div>
  );
}

