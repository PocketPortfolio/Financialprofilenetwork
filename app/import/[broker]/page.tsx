import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BROKER_CONFIG, SUPPORTED_BROKERS } from '@/app/lib/brokers/config';
import SovereignSyncCTA from '@/app/components/SovereignSyncCTA';
import BridgeToTerminalCTA from '@/app/components/BridgeToTerminalCTA';

/** US retail CSV-export intent pages — dedicated title/meta/H1 + export copy */
const US_RETAIL_SEO_BROKERS = new Set(['robinhood', 'schwab', 'fidelity', 'vanguard']);
const META_VARIANT = process.env.NEXT_PUBLIC_GSC_META_VARIANT === 'B' ? 'B' : 'A';
const META_TEST_BROKERS = new Set([
  // High-impression import landers seen in GSC exports
  'trade-republic',
  'ghostfolio',
  'degiro',
  'interactive-brokers',
  'etoro',
  'trading212',
  'webull',
  'saxo',
  'moomoo',
]);

function getUsBrokerExportStep1Text(broker: string, displayName: string): string {
  switch (broker) {
    case 'robinhood':
      return `Open Robinhood on the web or in the app. Go to Account → Statements or Documents and download account statements or trade confirmations. Export your full trading activity as CSV wherever Robinhood offers a CSV download.`;
    case 'fidelity':
      return `Sign in to Fidelity. Open Accounts & Trade, then use Positions, Activity & orders, or Reports to download or export your transaction history as CSV.`;
    case 'schwab':
      return `Sign in at Charles Schwab (schwab.com). Open Accounts → History or Statements, then export or download your transaction history or account activity as CSV.`;
    case 'vanguard':
      return `Sign in to Vanguard. Under My Accounts, open transaction history, cost basis, or investment activity, then export or download your transactions as CSV.`;
    default:
      return `Log into your ${displayName} account and export your trading history or account statement as a CSV file.`;
  }
}

// Generate static params for supported brokers (57 — SUPPORTED_BROKERS)
export async function generateStaticParams() {
  return SUPPORTED_BROKERS.map((broker) => ({
    broker: broker.toLowerCase(),
  }));
}

// Broker configuration is now imported from centralized config (57 brokers)

// Generate metadata for each broker page
export async function generateMetadata({ params }: { params: Promise<{ broker: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const broker = resolvedParams.broker.toLowerCase();
  const config = BROKER_CONFIG[broker as keyof typeof BROKER_CONFIG];
  const inMetaTest = META_VARIANT === 'B' && META_TEST_BROKERS.has(broker);
  
  if (!config) {
    return {
      title: 'Broker Not Found | Pocket Portfolio',
    };
  }

  // CTR-focused SEO template (local-first trust signal)
  if (broker === 'ghostfolio') {
    if (inMetaTest) {
      const title = 'Ghostfolio CSV Import | Local-First, No Uploads';
      const description =
        'Move from Ghostfolio in minutes. Import your CSV in-browser (no uploads), then analyze positions in a local-first terminal. Keep your ledger off our servers.';
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [
            {
              url: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
              secureUrl: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
              width: 1200,
              height: 630,
              alt: 'Ghostfolio CSV Import - Pocket Portfolio',
              type: 'image/png',
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [
            `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
          ],
        },
        alternates: {
          canonical: `https://www.pocketportfolio.app/import/${resolvedParams.broker}`,
        },
      };
    }
    return {
      title: 'Ghostfolio CSV Import | The Local-First Portfolio Alternative',
      description:
        'Migrating from Ghostfolio? Drag and drop your portfolio CSV into our zero-trust, local-first visualization terminal. No servers, no tracking, complete data sovereignty.',
      openGraph: {
        title: 'Ghostfolio CSV Import | The Local-First Portfolio Alternative',
        description:
          'Migrating from Ghostfolio? Drag and drop your portfolio CSV into our zero-trust, local-first visualization terminal. No servers, no tracking, complete data sovereignty.',
        images: [
          {
            url: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First Portfolio Alternative')}&v=6`,
            secureUrl: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First Portfolio Alternative')}&v=6`,
            width: 1200,
            height: 630,
            alt: 'Ghostfolio CSV Import - Pocket Portfolio',
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Ghostfolio CSV Import | The Local-First Portfolio Alternative',
        description:
          'Migrating from Ghostfolio? Drag and drop your portfolio CSV into our zero-trust, local-first visualization terminal. No servers, no tracking, complete data sovereignty.',
        images: [
          `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Ghostfolio CSV Import')}&description=${encodeURIComponent('Local-First Portfolio Alternative')}&v=6`,
        ],
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/import/${resolvedParams.broker}`,
      },
    };
  }

  // High-impression IBKR intent: Flex Queries, activity statements, CSV export
  if (broker === 'interactive-brokers') {
    const title = inMetaTest
      ? 'Interactive Brokers CSV Import (Flex Query) | Step-by-Step Guide'
      : 'Interactive Brokers CSV Export → Portfolio Import | Free Import Guide';
    const description = inMetaTest
      ? 'Parse Interactive Brokers CSV/Flex Query exports in your browser (no uploads). Import trades and track your portfolio — your data stays on your device.'
      : 'Export Interactive Brokers activity (Flex Query / statements) to CSV, then import in your browser. No uploads — your ledger stays on your device.';
    return {
      title,
      description,
      keywords: [
        'Interactive Brokers CSV export',
        'Interactive Brokers Flex Query CSV',
        'IBKR CSV import',
        'Interactive Brokers trade history CSV',
        'Interactive Brokers activity statement CSV',
        'IBKR CSV import guide',
        'Interactive Brokers portfolio import',
      ],
      openGraph: {
        title,
        description,
        images: [
          {
            url: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Interactive Brokers CSV Import')}&description=${encodeURIComponent('Step-by-Step CSV Guide')}&v=6`,
            secureUrl: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Interactive Brokers CSV Import')}&description=${encodeURIComponent('Step-by-Step CSV Guide')}&v=6`,
            width: 1200,
            height: 630,
            alt: 'Interactive Brokers CSV Import - Pocket Portfolio',
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [
          `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent('Interactive Brokers CSV Import')}&description=${encodeURIComponent('Step-by-Step CSV Guide')}&v=6`,
        ],
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/import/${resolvedParams.broker}`,
      },
    };
  }

  if (US_RETAIL_SEO_BROKERS.has(broker)) {
    const title = inMetaTest
      ? `Free ${config.displayName} CSV Import | No Uploads, Local-First`
      : `Free ${config.displayName} CSV Import | Local-First Portfolio — Pocket Portfolio`;
    const description = inMetaTest
      ? `Import ${config.displayName} trades in-browser. No uploads. Your data stays on your device. Then chart performance in the Pocket Portfolio terminal.`
      : `Export your ${config.displayName} transaction history to CSV, then import in seconds. Runs in your browser — data stays on your device. Download historical CSVs instantly.`;
    return {
      title,
      description,
      keywords: [
        `${config.displayName} CSV export`,
        `${config.displayName} CSV import`,
        `export ${config.displayName} to CSV`,
        `import ${config.displayName} trades`,
        `${config.displayName} transaction history`,
        `${config.displayName} account statement`,
      ],
      openGraph: {
        title,
        description,
        images: [
          {
            url: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
            secureUrl: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
            width: 1200,
            height: 630,
            alt: `${config.displayName} CSV Import - Pocket Portfolio`,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [
          `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Local-First, No Uploads')}&v=6`,
        ],
      },
      alternates: {
        canonical: `https://www.pocketportfolio.app/import/${resolvedParams.broker}`,
      },
    };
  }

  const title = inMetaTest
    ? `${config.displayName} CSV Import | Local-First, No Uploads`
    : `${config.displayName} CSV Export & Portfolio Import | Free Local-First Tracker`;
  const description = inMetaTest
    ? `Import your ${config.displayName} CSV in-browser and analyze locally. No uploads. Your financial history stays on your device.`
    : `Looking to track your ${config.displayName} portfolio? Import your ${config.displayName} CSV export in your browser. No uploads — your financial history stays on your device.`;

  return {
    title,
    description,
    keywords: [
      `${config.displayName} CSV export`,
      `${config.displayName} CSV import`,
      `convert ${config.displayName} CSV`,
      `${config.displayName} CSV to JSON`,
      `import ${config.displayName} trades`,
      `${config.displayName} portfolio export`,
      `${config.displayName} CSV format`,
      `${config.displayName} trade history`,
      `${config.displayName} account statement`
    ],
    openGraph: {
      title,
      description: inMetaTest
        ? `Import your ${config.displayName} CSV in-browser. No uploads. Local-first analysis.`
        : `Looking to track your ${config.displayName} portfolio? Import your ${config.displayName} CSV export in your browser. No uploads.`,
      images: [
        {
          url: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Free Local-First Tracker')}&v=6`,
          secureUrl: `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Free Local-First Tracker')}&v=6`,
          width: 1200,
          height: 630,
          alt: `${config.displayName} CSV Import - Pocket Portfolio`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: inMetaTest
        ? `Import your ${config.displayName} CSV in-browser. No uploads. Your data stays on your device.`
        : `Import your ${config.displayName} CSV export in your browser. No uploads.`,
      images: [
        `https://www.pocketportfolio.app/api/og?title=${encodeURIComponent(`${config.displayName} CSV Import`)}&description=${encodeURIComponent('Free Local-First Tracker')}&v=6`,
      ],
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/import/${resolvedParams.broker}`,
    },
  };
}

export default async function BrokerImportPage({ params }: { params: Promise<{ broker: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const broker = resolvedParams.broker.toLowerCase();
  const config = BROKER_CONFIG[broker as keyof typeof BROKER_CONFIG];
  
  if (!config) {
    notFound();
  }

  const isUsRetailSeo = US_RETAIL_SEO_BROKERS.has(broker);
  const exportStep1Text = isUsRetailSeo
    ? getUsBrokerExportStep1Text(broker, config.displayName)
    : `Log into your ${config.displayName} account and export your trading history or account statement as a CSV file.`;
  const isIbkr = broker === 'interactive-brokers';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I export my CSV from ${config.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In ${config.displayName}, look for a section like Statements, Reports, Activity, or History, then choose an Export/Download option and select CSV. If you see multiple report types, export your full trading history or account statement in CSV format.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is my ${config.displayName} data safe with Pocket Portfolio?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Pocket Portfolio is local-first: your ${config.displayName} CSV can be parsed inside your browser. Your raw financial data does not need to be uploaded to our servers to be converted or visualized.`,
        },
      },
    ],
  };

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
        text: exportStep1Text,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
            {isUsRetailSeo
              ? `Import ${config.displayName} CSV into Pocket Portfolio`
              : `${config.displayName} CSV Import Guide`}
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {isIbkr
              ? 'Export an Interactive Brokers Flex Query or activity statement as CSV, then import in your browser. Step-by-step guide — no uploads.'
              : isUsRetailSeo
              ? `Export your ${config.displayName} transaction history to CSV, then import in seconds. Everything runs in your browser — your data stays on your device.`
              : `Learn how to import your ${config.displayName} trading data via CSV into Pocket Portfolio for seamless portfolio tracking.`}
          </p>
        </header>

        {(() => {
          const variant = process.env.NEXT_PUBLIC_BRIDGE_CTA_VARIANT === 'B' ? 'B' : 'A';
          const title =
            variant === 'B'
              ? `Sovereign import — parse your ${config.displayName} CSV in the Terminal.`
              : `Visualize your ${config.displayName} CSV locally — drag & drop into the Terminal.`;
          const subtitle =
            variant === 'B' ? 'On-device parsing. No uploads. Keep your ledger local.' : 'No uploads. Parsed on-device.';
          const primaryLabel = variant === 'B' ? 'Open Sovereign Terminal' : 'Open Terminal';

          return (
            <BridgeToTerminalCTA
              title={title}
              subtitle={subtitle}
              href={`/dashboard?utm_source=import_page&utm_medium=bridge_cta&utm_campaign=activation&utm_content=${encodeURIComponent(broker)}`}
              primaryLabel={primaryLabel}
              secondaryHref="/learn/local-first"
              secondaryLabel="How local-first works"
              analytics={{ source: 'import_page', contextId: broker }}
            />
          );
        })()}

        {/* NEW: Sovereign Sync CTA Section */}
        <SovereignSyncCTA brokerName={config.displayName} />

        {/* Overview */}
        <section
          style={{
            marginBottom: '32px',
            // Mobile CWV: skip rendering deep content until needed.
            contentVisibility: 'auto',
            containIntrinsicSize: '800px',
          }}
        >
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
              {isIbkr
                ? 'Interactive Brokers exports vary by report type. Import your IBKR CSV in your browser, normalize trades, and keep your ledger on your device — no server uploads.'
                : config.description}
            </p>
          </div>
        </section>

        {/* Required Columns */}
        <section
          id="step2"
          style={{
            marginBottom: '32px',
            contentVisibility: 'auto',
            containIntrinsicSize: '1200px',
          }}
        >
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
        <section
          style={{
            marginBottom: '32px',
            contentVisibility: 'auto',
            containIntrinsicSize: '1200px',
          }}
        >
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
            border: '2px solid var(--border-warm)',
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
              border: '2px solid var(--border-warm)',
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
                {isUsRetailSeo
                  ? exportStep1Text
                  : `Log into your ${config.displayName} account and navigate to the export or account statement section. Download your trading history or account statement as a CSV file.`}
              </p>
            </div>

            <div id="step2" style={{
              background: 'var(--surface)',
              border: '2px solid var(--border-warm)',
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
              border: '2px solid var(--border-warm)',
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
              border: '2px solid var(--border-warm)',
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
              border: '2px solid var(--border-warm)',
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
        <section
          style={{
            marginBottom: '32px',
            contentVisibility: 'auto',
            containIntrinsicSize: '1200px',
          }}
        >
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
              href="/static/portfolio-tracker"
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






