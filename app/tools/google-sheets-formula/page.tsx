import { Metadata } from 'next';
import GoogleSheetsTool from './GoogleSheetsTool';

export const metadata: Metadata = {
  title: 'Free Google Sheets Stock Price API Formula Generator | Pocket Portfolio',
  description: 'Generate Google Sheets formulas to import live stock prices using IMPORTDATA. Free community API key included. Get unlimited access for £5/mo.',
  keywords: ['IMPORTDATA stock price', 'google sheets finance api', 'live stock price excel', 'google sheets stock formula', 'free stock api'],
  openGraph: {
    title: 'Free Google Sheets Stock Price API Formula Generator',
    description: 'Generate Google Sheets formulas to import live stock prices. Free community API key included.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/tools/google-sheets-formula',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Google Sheets Stock Price API Formula Generator',
    description: 'Generate Google Sheets formulas to import live stock prices.',
  },
  alternates: {
    canonical: 'https://www.pocketportfolio.app/tools/google-sheets-formula',
  },
};

export default function GoogleSheetsFormulaPage() {
  // SoftwareApplication schema for SEO
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Google Sheets Stock Price API Formula Generator',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP'
    },
    description: 'Generate free Google Sheets formulas to import live stock prices. No signup required.',
    url: 'https://www.pocketportfolio.app/tools/google-sheets-formula',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      ratingCount: '120'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 'var(--space-8)'
      }}>
            <h1 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--line-tight)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              Google Sheets Stock Price API Formula Generator
            </h1>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-relaxed)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Generate free Google Sheets formulas to import live stock prices. No signup required.
            </p>
          </div>

          {/* Tool Component */}
          <GoogleSheetsTool />

          {/* How It Works */}
          <div className="brand-card" style={{
            marginTop: 'var(--space-12)',
            padding: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-6)',
              textAlign: 'center'
            }}>
              How It Works
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--surface-elevated)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--signal)'
                  }}>1</span>
                </div>
                <h3 style={{
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--font-size-base)'
                }}>Enter Ticker Symbol</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Type any stock ticker (e.g., AAPL, TSLA, MSFT) and we'll generate the formula instantly.
                </p>
              </div>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--surface-elevated)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--signal)'
                  }}>2</span>
                </div>
                <h3 style={{
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--font-size-base)'
                }}>Copy Formula</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Copy the generated formula and paste it directly into your Google Sheets cell.
                </p>
              </div>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--surface-elevated)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--signal)'
                  }}>3</span>
                </div>
                <h3 style={{
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--font-size-base)'
                }}>Get Live Prices</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Your Google Sheet will automatically update with live stock prices using the IMPORTDATA function.
                </p>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="brand-card" style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-5)'
          }}>
            <h3 style={{
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--font-size-base)'
            }}>
              Example Formula
            </h3>
            <code style={{
              display: 'block',
              background: 'var(--surface-elevated)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text)',
              wordBreak: 'break-all'
            }}>
              =IMPORTDATA("https://api.pocketportfolio.app/price/AAPL?key=demo_key")
            </code>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-3)',
              lineHeight: 'var(--line-relaxed)'
            }}>
              This formula will return the current price of Apple (AAPL) stock. Replace "AAPL" with any ticker symbol.
            </p>
          </div>

    </>
  );
}
