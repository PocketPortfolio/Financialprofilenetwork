import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConversionPair } from '@/app/lib/tax-formats/conversion-pairs';
import { type TaxSoftware } from '@/app/lib/tax-formats/mappings';
import TaxConverter from './TaxConverter';
import PageWrapper from './PageWrapper';


export async function generateMetadata({ params }: { params: Promise<{ conversion_pair: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const pair = getConversionPair(resolvedParams.conversion_pair);
  
  if (!pair) {
    return {
      title: 'CSV Converter | Pocket Portfolio',
      description: 'Convert broker CSV files to tax software formats',
    };
  }
  
  const title = `Convert ${pair.sourceBroker} CSV to ${pair.targetSoftware} Format - Free Tool`;
  const description = `${pair.description}. Processed 100% locally in your browser. Your financial data never leaves your device.`;
  
  return {
    title,
    description,
    keywords: pair.keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.pocketportfolio.app/tools/${resolvedParams.conversion_pair}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/tools/${resolvedParams.conversion_pair}`,
    },
  };
}

export default async function ConversionPage({ params }: { params: Promise<{ conversion_pair: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const pair = getConversionPair(resolvedParams.conversion_pair);
  
  if (!pair) {
    notFound();
  }
  
  // SoftwareApplication schema for SEO
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${pair.sourceBroker} to ${pair.targetSoftware} Converter`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP'
    },
    description: pair.description,
    url: `https://www.pocketportfolio.app/tools/${resolvedParams.conversion_pair}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '150'
    }
  };
  
  return (
    <PageWrapper>
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
              Convert {pair.sourceBroker} CSV to {pair.targetSoftware} Format
            </h1>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-relaxed)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Free, privacy-first CSV converter. Processed 100% locally in your browser.
            </p>
          </div>
          
          {/* Privacy Banner */}
          <div className="brand-card" style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-5)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <svg style={{ 
                width: '24px', 
                height: '24px', 
                color: 'var(--signal)', 
                flexShrink: 0, 
                marginTop: '2px' 
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p style={{
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)',
                  marginBottom: 'var(--space-1)',
                  fontSize: 'var(--font-size-base)'
                }}>
                  Your Data Stays Local
                </p>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  This conversion is processed 100% locally in your browser. Your financial data is never uploaded to our servers. We never see your transactions.
                </p>
              </div>
            </div>
          </div>
          
          {/* Converter Component */}
          <TaxConverter 
            sourceBroker={pair.sourceBroker}
            sourceBrokerId={pair.sourceBrokerId}
            targetSoftware={pair.targetSoftware}
            targetSoftwareId={pair.targetSoftwareId as TaxSoftware}
          />
          
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
                }}>Upload Your CSV</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Drag and drop your {pair.sourceBroker} CSV file. We support both CSV and Excel formats.
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
                }}>Automatic Conversion</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Our tool automatically parses your {pair.sourceBroker} format and converts it to {pair.targetSoftware} format.
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
                }}>Download & Import</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-relaxed)'
                }}>
                  Download your converted CSV and import it directly into {pair.targetSoftware}. No manual formatting needed.
                </p>
              </div>
            </div>
          </div>
          
          {/* Legal Disclaimer */}
          <div className="brand-card" style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-4)',
            border: '1px solid var(--warning-muted)',
            background: 'var(--surface-elevated)'
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warning)',
              lineHeight: 'var(--line-relaxed)'
            }}>
              <strong style={{ color: 'var(--text)' }}>Disclaimer:</strong> This tool is for informational purposes only. We are not tax advisors. 
              Please consult with a qualified tax professional for tax advice. Always verify the converted data 
              before filing your taxes.
            </p>
          </div>
          
    </PageWrapper>
  );
}
