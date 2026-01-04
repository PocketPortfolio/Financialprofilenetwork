import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import ToolFooter from '@/app/components/marketing/ToolFooter';
import SEOPageTracker from '@/app/components/SEOPageTracker';
import HoverableLink from '@/app/components/HoverableLink';

// Competitor configuration
const COMPETITORS = {
  koinly: {
    name: 'Koinly',
    cost: '$99/year',
    description: 'Crypto tax software',
    painPoints: ['Monthly subscription fees', 'Cloud-based (privacy concerns)', 'Limited customization'],
    ourAdvantages: ['Free local-first option', 'One-time £100 lifetime deal', 'Full data privacy'],
  },
  turbotax: {
    name: 'TurboTax',
    cost: '$99/year',
    description: 'Tax preparation software',
    painPoints: ['Expensive annual fees', 'Complex interface', 'Limited CSV import options'],
    ourAdvantages: ['Free CSV converters', 'No login required', 'One-time £100 lifetime deal'],
  },
  ghostfolio: {
    name: 'Ghostfolio',
    cost: 'Self-hosted (complex)',
    description: 'Portfolio tracker',
    painPoints: ['Requires self-hosting', 'Complex setup', 'Limited broker support'],
    ourAdvantages: ['Zero setup required', '50+ broker imports', 'One-time £100 lifetime deal'],
  },
  sharesight: {
    name: 'Sharesight',
    cost: '$19/month',
    description: 'Portfolio tracking',
    painPoints: ['Monthly subscription', 'Limited free tier', 'Cloud-only'],
    ourAdvantages: ['Free local-first', 'Unlimited portfolios', 'One-time £100 lifetime deal'],
  },
};

export async function generateStaticParams() {
  return Object.keys(COMPETITORS).map((competitor) => ({
    competitor,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const competitor = COMPETITORS[resolvedParams.competitor as keyof typeof COMPETITORS];
  
  if (!competitor) {
    return {
      title: 'Competitor Comparison - Pocket Portfolio',
    };
  }

  return {
    title: `${competitor.name} Free Alternative - No Login Required | Pocket Portfolio`,
    description: `${competitor.name} costs ${competitor.cost}. Pocket Portfolio is Free (Local) or £100 (Lifetime Founder). Import your ${competitor.name} CSV now.`,
    keywords: [`${competitor.name} alternative`, `${competitor.name} free`, 'privacy-first portfolio tracker', 'local-first finance'],
    openGraph: {
      title: `${competitor.name} vs Pocket Portfolio: The Privacy-First Alternative`,
      description: `${competitor.name} costs ${competitor.cost}. We're free (local) or £100 (lifetime).`,
      type: 'website',
      url: `https://www.pocketportfolio.app/compare/${resolvedParams.competitor}`,
    },
    alternates: {
      canonical: `https://www.pocketportfolio.app/compare/${resolvedParams.competitor}`,
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ competitor: string }> }) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const competitor = COMPETITORS[resolvedParams.competitor as keyof typeof COMPETITORS];

  if (!competitor) {
    notFound();
  }

  return (
    <>
      <ProductionNavbar />
      <SEOPageTracker />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'var(--space-8) 20px'
      }}>
        {/* Hero Section */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 'var(--space-12)'
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--text)',
            lineHeight: 'var(--line-tight)'
          }}>
            {competitor.name} vs Pocket Portfolio:<br />
            <span style={{ color: 'var(--signal)' }}>The Privacy-First Alternative</span>
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            maxWidth: '700px',
            margin: '0 auto var(--space-8)'
          }}>
            {competitor.name} costs {competitor.cost}. Pocket Portfolio is <strong>Free (Local)</strong> or <strong>£100 (Lifetime Founder)</strong>.
          </p>
        </div>

        {/* Comparison Table */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center'
          }}>
            Cost Comparison
          </h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 'var(--space-6)'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{
                  padding: 'var(--space-4)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)'
                }}>
                  Feature
                </th>
                <th style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)'
                }}>
                  {competitor.name}
                </th>
                <th style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--signal)'
                }}>
                  Pocket Portfolio
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-4)' }}>Price</td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {competitor.cost}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--signal)', fontWeight: 'var(--font-semibold)' }}>
                  Free (Local) or £100 (Lifetime)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-4)' }}>Data Privacy</td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cloud-based
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--signal)', fontWeight: 'var(--font-semibold)' }}>
                  Local-first (100% private)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-4)' }}>Login Required</td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Yes
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--signal)', fontWeight: 'var(--font-semibold)' }}>
                  No (optional)
                </td>
              </tr>
              <tr>
                <td style={{ padding: 'var(--space-4)' }}>CSV Import</td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Limited
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--signal)', fontWeight: 'var(--font-semibold)' }}>
                  50+ Brokers
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pain Points */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          marginBottom: 'var(--space-8)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)'
          }}>
            Why Switch from {competitor.name}?
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {competitor.painPoints.map((point, idx) => (
              <li key={idx} style={{
                padding: 'var(--space-3) 0',
                borderBottom: idx < competitor.painPoints.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ color: '#dc2626', marginRight: 'var(--space-3)', fontSize: '20px' }}>✗</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Advantages */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          marginBottom: 'var(--space-8)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)'
          }}>
            Why Choose Pocket Portfolio?
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {competitor.ourAdvantages.map((advantage, idx) => (
              <li key={idx} style={{
                padding: 'var(--space-3) 0',
                borderBottom: idx < competitor.ourAdvantages.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ color: '#10b981', marginRight: 'var(--space-3)', fontSize: '20px' }}>✓</span>
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '2px solid var(--signal)',
          borderRadius: '12px',
          padding: 'var(--space-8)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)'
          }}>
            Ready to Switch?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-6)'
          }}>
            Import your {competitor.name} CSV now. Or join the <strong>UK Founder's Club</strong> for a one-time £100 fee and get lifetime access.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <HoverableLink
              href="/import"
              style={{
                padding: '12px 24px',
                background: 'var(--signal)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'var(--font-semibold)',
                transition: 'all 0.2s ease'
              }}
            >
              Import Your CSV →
            </HoverableLink>
            <HoverableLink
              href="/sponsor"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'var(--font-semibold)',
                transition: 'all 0.2s ease'
              }}
            >
              Join UK Founder's Club (£100) →
            </HoverableLink>
          </div>
        </div>
      </div>
      <ToolFooter />
    </>
  );
}

