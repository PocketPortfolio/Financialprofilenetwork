import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Supported brokers
const SUPPORTED_BROKERS = [
  'etoro', 'trading212', 'coinbase', 'interactive-brokers', 'revolut',
  'freetrade', 'robinhood', 'webull', 'schwab', 'fidelity'
];

interface BrokerPageProps {
  params: { broker: string };
}

// Generate static params for supported brokers
export async function generateStaticParams() {
  return SUPPORTED_BROKERS.map((broker) => ({
    broker: broker.toLowerCase(),
  }));
}

// Broker configuration
const BROKER_CONFIG = {
  'etoro': {
    name: 'eToro',
    displayName: 'eToro',
    description: 'Social trading platform with copy trading features',
    logo: '📈',
    requiredColumns: ['Instrument', 'Type', 'Units', 'Open Rate', 'Close Rate', 'PnL'],
    sampleData: 'Instrument,Type,Units,Open Rate,Close Rate,PnL\nAAPL,BUY,10,150.00,155.00,50.00',
    tips: [
      'Export your account statement from eToro',
      'Make sure to include all closed positions',
      'The "Instrument" column should contain stock symbols'
    ]
  },
  'trading212': {
    name: 'Trading212',
    displayName: 'Trading212',
    description: 'Commission-free trading platform',
    logo: '📊',
    requiredColumns: ['Instrument', 'Action', 'Quantity', 'Price', 'Value'],
    sampleData: 'Instrument,Action,Quantity,Price,Value\nAAPL,BUY,10,150.00,1500.00',
    tips: [
      'Use the "Export" feature in Trading212',
      'Include both buy and sell transactions',
      'Check that instrument symbols are correct'
    ]
  },
  'coinbase': {
    name: 'Coinbase',
    displayName: 'Coinbase',
    description: 'Cryptocurrency exchange and wallet',
    logo: '₿',
    requiredColumns: ['Timestamp', 'Transaction Type', 'Asset', 'Quantity Transacted', 'USD Spot Price at Transaction'],
    sampleData: 'Timestamp,Transaction Type,Asset,Quantity Transacted,USD Spot Price at Transaction\n2024-01-01T12:00:00Z,Buy,BTC,0.01,45000.00',
    tips: [
      'Download transaction history from Coinbase Pro',
      'Include all transaction types (buy, sell, convert)',
      'Ensure timestamps are in UTC format'
    ]
  },
  'interactive-brokers': {
    name: 'Interactive Brokers',
    displayName: 'Interactive Brokers',
    description: 'Professional trading platform',
    logo: '🏦',
    requiredColumns: ['Symbol', 'Quantity', 'T.Price', 'Proceeds', 'Comm/Fee'],
    sampleData: 'Symbol,Quantity,T.Price,Proceeds,Comm/Fee\nAAPL,100,150.00,15000.00,1.00',
    tips: [
      'Use the Flex Query feature for detailed reports',
      'Include all transaction fees',
      'Export in CSV format for best compatibility'
    ]
  },
  'revolut': {
    name: 'Revolut',
    displayName: 'Revolut',
    description: 'Digital banking and trading app',
    logo: '💳',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export trading history from Revolut app',
      'Include transaction fees in calculations',
      'Verify instrument symbols match standard format'
    ]
  },
  'freetrade': {
    name: 'Freetrade',
    displayName: 'Freetrade',
    description: 'Commission-free UK trading platform',
    logo: '🇬🇧',
    requiredColumns: ['Date', 'Stock', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Stock,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Download account statement from Freetrade',
      'Include all trade types (buy, sell, dividend)',
      'Check that dates are in correct format'
    ]
  },
  'robinhood': {
    name: 'Robinhood',
    displayName: 'Robinhood',
    description: 'Commission-free trading app',
    logo: '🟢',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Request account statement from Robinhood',
      'Include all transaction types',
      'Verify symbol format matches standard tickers'
    ]
  },
  'webull': {
    name: 'Webull',
    displayName: 'Webull',
    description: 'Advanced trading platform',
    logo: '📱',
    requiredColumns: ['Date', 'Symbol', 'Side', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Side,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export detailed transaction history',
      'Include all order types and fees',
      'Ensure proper date formatting'
    ]
  },
  'schwab': {
    name: 'Charles Schwab',
    displayName: 'Charles Schwab',
    description: 'Full-service investment firm',
    logo: '🏛️',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Use Schwab account statement export',
      'Include all transaction types',
      'Verify commission calculations'
    ]
  },
  'fidelity': {
    name: 'Fidelity',
    displayName: 'Fidelity',
    description: 'Investment and retirement services',
    logo: '💼',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Fidelity',
      'Include all trade types and dividends',
      'Check for proper symbol formatting'
    ]
  }
};

// Generate metadata for each broker page
export async function generateMetadata({ params }: BrokerPageProps): Promise<Metadata> {
  const broker = params.broker.toLowerCase();
  const config = BROKER_CONFIG[broker as keyof typeof BROKER_CONFIG];
  
  if (!config) {
    return {
      title: 'Broker Not Found | Pocket Portfolio',
    };
  }

  return {
    title: `${config.displayName} CSV Import Guide | Pocket Portfolio`,
    description: `Learn how to import your ${config.displayName} trading data via CSV into Pocket Portfolio. Step-by-step guide with required columns, sample data, and troubleshooting tips.`,
    keywords: [
      `${config.displayName} CSV import`,
      `import ${config.displayName} trades`,
      `${config.displayName} portfolio export`,
      `${config.displayName} CSV format`,
      `${config.displayName} trade history`,
      `${config.displayName} account statement`
    ],
    openGraph: {
      title: `${config.displayName} CSV Import Guide`,
      description: `Learn how to import your ${config.displayName} trading data via CSV into Pocket Portfolio.`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}`,
          width: 1200,
          height: 630,
          alt: `${config.displayName} CSV Import - Pocket Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.displayName} CSV Import Guide`,
      description: `Learn how to import your ${config.displayName} trading data via CSV into Pocket Portfolio.`,
      images: ['/og?title=' + encodeURIComponent(`${config.displayName} CSV Import`)],
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/import/${params.broker}`,
    },
  };
}

export default async function BrokerImportPage({ params }: BrokerPageProps) {
  const broker = params.broker.toLowerCase();
  const config = BROKER_CONFIG[broker as keyof typeof BROKER_CONFIG];
  
  if (!config) {
    notFound();
  }

  // JSON-LD structured data for HowTo
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Import ${config.displayName} CSV Data to Pocket Portfolio`,
    description: `Step-by-step guide to import your ${config.displayName} trading data via CSV into Pocket Portfolio for portfolio tracking.`,
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    tool: {
      '@type': 'SoftwareApplication',
      name: 'Pocket Portfolio',
      url: 'https://www.pocketportfolio.app'
    },
    step: [
      {
        '@type': 'HowToStep',
        name: 'Export Your Data',
        text: `Log into your ${config.displayName} account and export your trading history or account statement as a CSV file.`,
        url: `https://www.pocketportfolio.app/import/${broker}#step1`
      },
      {
        '@type': 'HowToStep',
        name: 'Verify Required Columns',
        text: `Ensure your CSV contains the required columns: ${config.requiredColumns.join(', ')}.`,
        url: `https://www.pocketportfolio.app/import/${broker}#step2`
      },
      {
        '@type': 'HowToStep',
        name: 'Sign In to Pocket Portfolio',
        text: 'Sign in to Pocket Portfolio using your Google account to access the CSV import feature.',
        url: `https://www.pocketportfolio.app/import/${broker}#step3`
      },
      {
        '@type': 'HowToStep',
        name: 'Upload Your CSV',
        text: 'Navigate to the dashboard and use the CSV import feature to upload your exported data.',
        url: `https://www.pocketportfolio.app/import/${broker}#step4`
      },
      {
        '@type': 'HowToStep',
        name: 'Verify Import',
        text: 'Review your imported trades and positions to ensure everything looks correct.',
        url: `https://www.pocketportfolio.app/import/${broker}#step5`
      }
    ]
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div className="broker-import-page-container" style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'clamp(16px, 4vw, 32px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            {config.logo}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--text)',
            letterSpacing: '-0.5px'
          }}>
            {config.displayName} CSV Import Guide
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Learn how to import your {config.displayName} trading data via CSV into Pocket Portfolio for seamless portfolio tracking.
          </p>
        </header>

        {/* Overview */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
            border: '2px solid var(--border-warm)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              About {config.displayName}
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              margin: '0'
            }}>
              {config.description}
            </p>
          </div>
        </section>

        {/* Required Columns */}
        <section id="step2" style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Required CSV Columns
          </h2>
          <div style={{
            background: 'var(--warm-bg)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'var(--text)',
              margin: '0 0 16px 0'
            }}>
              Your {config.displayName} CSV export must include these columns:
            </p>
            <ul style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              margin: '0',
              paddingLeft: '20px'
            }}>
              {config.requiredColumns.map((column, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <code style={{
                    background: 'var(--surface)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: 'var(--accent-warm)'
                  }}>
                    {column}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sample Data */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Sample CSV Format
          </h2>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            overflow: 'auto'
          }}>
            <pre style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: 'var(--text)',
              margin: '0',
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }}>
              {config.sampleData}
            </pre>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          }}>
            Step-by-Step Import Guide
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div id="step1" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Step 1: Export Your Data
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: '0'
              }}>
                Log into your {config.displayName} account and navigate to the export or account statement section. 
                Download your trading history or account statement as a CSV file.
              </p>
            </div>

            <div id="step2" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Step 2: Verify Required Columns
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: '0'
              }}>
                Ensure your CSV contains the required columns listed above. If any columns are missing or named differently, 
                you may need to rename them or export a different report from {config.displayName}.
              </p>
            </div>

            <div id="step3" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Step 3: Sign In to Pocket Portfolio
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: '0'
              }}>
                Sign in to Pocket Portfolio using your Google account to access the CSV import feature. 
                No registration required - just click "Sign in with Google".
              </p>
            </div>

            <div id="step4" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Step 4: Upload Your CSV
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: '0'
              }}>
                Navigate to the dashboard and use the "Import CSV" feature to upload your exported data. 
                Pocket Portfolio will automatically detect the {config.displayName} format and map the columns.
              </p>
            </div>

            <div id="step5" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Step 5: Verify Import
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: '0'
              }}>
                Review your imported trades and positions to ensure everything looks correct. 
                You can edit or delete individual trades if needed.
              </p>
            </div>
          </div>
        </section>

        {/* Tips and Troubleshooting */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Tips & Troubleshooting
          </h2>
          <div style={{
            background: 'var(--warm-bg)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <ul style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              margin: '0',
              paddingLeft: '20px'
            }}>
              {config.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section style={{
          background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
          border: '2px solid var(--border-warm)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'white'
          }}>
            Ready to Import Your {config.displayName} Data?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'white',
            marginBottom: '24px',
            opacity: 0.9
          }}>
            Sign in to Pocket Portfolio and import your {config.displayName} trading data in minutes.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="/dashboard?utm_source=seo&utm_medium=broker_import&utm_campaign=signup&utm_content=broker_guide"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'white',
                color: 'var(--accent-warm)',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid white',
                transition: 'all 0.2s ease',
                minWidth: '160px'
              }}
              className="hover:transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              Sign in with Google
            </a>
            <a
              href="/dashboard?utm_source=seo&utm_medium=broker_import&utm_campaign=csv_import&utm_content=broker_guide"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid white',
                transition: 'all 0.2s ease',
                minWidth: '160px'
              }}
              className="hover:bg-white hover:bg-opacity-10 hover:transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Import CSV Now
            </a>
          </div>
        </section>

        {/* Related Content */}
        <section style={{
          background: 'var(--warm-bg)',
          border: '1px solid var(--border-warm)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Related Import Guides
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {SUPPORTED_BROKERS.filter(b => b !== broker).slice(0, 4).map((relatedBroker) => {
              const relatedConfig = BROKER_CONFIG[relatedBroker as keyof typeof BROKER_CONFIG];
              return (
                <a
                  key={relatedBroker}
                  href={`/import/${relatedBroker}`}
                  style={{
                    color: 'var(--text-warm)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  → Import {relatedConfig?.displayName} CSV
                </a>
              );
            })}
            <a
              href="/csv-portfolio-tracker"
              style={{
                color: 'var(--text-warm)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              → CSV Portfolio Guide
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

// ISR configuration
export const revalidate = 86400; // 24 hours






