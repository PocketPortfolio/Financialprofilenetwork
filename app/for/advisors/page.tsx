import { Metadata } from 'next';
import AdvisorTool from './AdvisorTool';
import {
  AdvisorHeroSection,
  AdvisorMoatSection,
  AdvisorTerminalSectionHeader,
} from './AdvisorLandingSections';

export const metadata: Metadata = {
  title: 'Secure Client Intelligence for Financial Advisors | Pocket Portfolio',
  description:
    'Generate white-labeled portfolio reports with stateless edge processing. Preview free; Corporate License for high-res PDFs. GDPR-aligned architecture for IFAs.',
  keywords: [
    'financial advisor portfolio report',
    'white label portfolio report',
    'GDPR portfolio reporting',
    'IFA client reporting tool',
    'stateless portfolio PDF',
  ],
  openGraph: {
    title: 'Secure Client Intelligence. Zero Data Liability.',
    description:
      'White-labeled portfolio teardowns powered by stateless edge processing — without warehousing client ledgers on third-party servers.',
    type: 'website',
    url: 'https://www.pocketportfolio.app/for/advisors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Client Intelligence for Financial Advisors',
    description:
      'Stateless edge-engine for white-labeled client portfolio reports. Preview free with Corporate License PDF export.',
  },
  alternates: {
    canonical: 'https://www.pocketportfolio.app/for/advisors',
  },
};

export default function AdvisorsPage() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pocket Portfolio Advisor Report Generator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '100',
      priceCurrency: 'USD',
    },
    description:
      'White-labeled portfolio report generator for financial advisors with stateless edge processing and browser-local PDF preview.',
    url: 'https://www.pocketportfolio.app/for/advisors',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />

      <AdvisorHeroSection />
      <AdvisorMoatSection />
      <AdvisorTerminalSectionHeader />
      <AdvisorTool />

      {/* Conversion Zone */}
      <div
        className="brand-card advisor-glass-panel"
        style={{
          marginTop: 'var(--space-12)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Corporate License
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto var(--space-6)',
            lineHeight: 'var(--line-relaxed)',
          }}
        >
          Unlimited high-resolution PDF downloads, custom firm branding, and priority support — built for practices
          that cannot warehouse client books on third-party SaaS.
        </p>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-2)',
            }}
          >
            $100
            <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>/mo</span>
          </div>
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
