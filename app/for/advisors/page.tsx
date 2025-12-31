import { Metadata } from 'next';
import AdvisorTool from './AdvisorTool';

export const metadata: Metadata = {
  title: 'White Label Portfolio Report Generator for Financial Advisors | Pocket Portfolio',
  description: 'Generate professional client portfolio reports with your firm logo. Preview free, download high-res PDFs with Corporate License ($100/mo).',
  keywords: ['white label portfolio report', 'financial advisor report generator', 'client portfolio pdf', 'advisor reporting tool'],
  openGraph: {
    title: 'White Label Portfolio Report Generator for Financial Advisors',
    description: 'Generate professional client portfolio reports with your firm logo.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/for/advisors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'White Label Portfolio Report Generator for Financial Advisors',
    description: 'Generate professional client portfolio reports with your firm logo.',
  },
  alternates: {
    canonical: 'https://www.pocketportfolio.app/for/advisors',
  },
};

export default function AdvisorsPage() {
  // SoftwareApplication schema for SEO
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'White Label Portfolio Report Generator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '100',
      priceCurrency: 'GBP'
    },
    description: 'Professional portfolio report generator for financial advisors. White label with your firm logo.',
    url: 'https://www.pocketportfolio.app/for/advisors',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50'
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
              White Label Portfolio Reports for Financial Advisors
            </h1>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-relaxed)',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Generate professional client portfolio reports with your firm branding. Preview free, download high-res PDFs with Corporate License.
            </p>
          </div>

          {/* Tool Component */}
          <AdvisorTool />

          {/* Features */}
          <div style={{
            marginTop: 'var(--space-12)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            <div className="brand-card" style={{ padding: 'var(--space-5)' }}>
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
                <svg style={{ width: '24px', height: '24px', color: 'var(--signal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Custom Branding
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                Upload your firm logo and replace Pocket Portfolio branding instantly. Preview updates in real-time.
              </p>
            </div>
            <div className="brand-card" style={{ padding: 'var(--space-5)' }}>
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
                <svg style={{ width: '24px', height: '24px', color: 'var(--signal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Professional PDFs
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                Generate high-resolution PDF reports perfect for client presentations. No watermarks with Corporate License.
              </p>
            </div>
            <div className="brand-card" style={{ padding: 'var(--space-5)' }}>
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
                <svg style={{ width: '24px', height: '24px', color: 'var(--signal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Privacy-First
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                All processing happens locally in your browser. Client data never leaves your device.
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="brand-card" style={{
            marginTop: 'var(--space-12)',
            padding: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-6)'
            }}>
              Corporate License
            </h2>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)'
              }}>
                $100<span style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--text-secondary)'
                }}>/mo</span>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                Includes unlimited high-res PDF downloads, custom branding, and priority support.
              </p>
              <a
                href="/sponsor?utm_source=advisor_tool&utm_medium=cta&utm_campaign=corporate_license"
                className="brand-button brand-button-primary"
                style={{ display: 'inline-block' }}
              >
                Get Corporate License
              </a>
            </div>
          </div>

    </>
  );
}
