import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'AI for Financial Advisors Without a Central Client Warehouse',
  description:
    'Bounded advisor AI over controlled portfolio context — design-partner path for IFA and wealth-manager workflows. Not a full advisor SaaS suite claim.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/ai-for-financial-advisors' },
  openGraph: {
    title: 'AI for Financial Advisors | Open Portfolio',
    description:
      'Architecture and design-partner path for advisor AI — Pocket Desk / harness truth only.',
    url: 'https://www.openportfolio.co.uk/learn/ai-for-financial-advisors',
    type: 'article',
  },
};

export default function AiForFinancialAdvisorsPage() {
  return (
    <SovereignPillarArticle
      articleSlug="ai-for-financial-advisors"
      breadcrumbLabel="AI for Financial Advisors"
      title="AI for Financial Advisors Without a Central Client Warehouse"
      subtitle="Bounded portfolio context for advisor workflows — design-partner diligence, not a claimed full advisor SaaS suite."
      body={[
        'Financial advisors and IFA platforms need AI that respects client custody. The product truth Open Portfolio can state publicly: we help assemble bounded portfolio context at the edge, run stateless inference over that context, and keep the buyer as landlord of IdP and approved storage.',
        'What we do not claim on this page: a complete advisor CRM, suitability engine, compliance workflow suite, or replacement for existing practice-management systems. Pocket Desk actions and the Pocket harness demonstrate ingestion and reasoning under real CSV mess — they are proof surfaces, not an enterprise advisor product catalogue.',
        'The commercial path for advisor platforms is design-partner diligence: map identity, storage, ingestion sources, the bounded-context contract, and inference controls; then validate a scoped pilot. Role on the diligence form should be advisor platform / IFA when that is the buyer.',
        'If you need bank-linking rails or payments connectivity, see the honest Plaid comparison. If you need a hosted portfolio-data API as the system of record, that may still be the right tool — Open Portfolio is the BYOC boundary, not a universal replacement.',
      ]}
      ctaHref="/#contact"
      ctaLabel="Book a diligence call"
      procurementFaqIndices={[0, 2, 5]}
      aeo={{
        definition:
          'AI for financial advisors (Open Portfolio scope) means bounded portfolio context and stateless inference under buyer-controlled identity and storage — not a full advisor SaaS suite.',
        limitation:
          'Does not claim CRM, suitability, or practice-management replacement; Pocket harness features are proof, not the enterprise SKU list.',
        sourceReceipt:
          '/learn/enterprise-design-partnership · /architecture · www.pocketportfolio.app',
        lastReviewed: '2026-09-21',
        comparisonRows: [
          {
            approach: 'Open Portfolio design-partner boundary',
            fitsWhen: 'Advisor platform wants AI over controlled holdings context',
            failsWhen: 'Buyer needs turnkey CRM + compliance suite only',
          },
          {
            approach: 'Full advisor SaaS with hosted client vault',
            fitsWhen: 'Practice wants one vendor for CRM + reporting + AI',
            failsWhen: 'Custody rules forbid warehousing client ledgers with the AI vendor',
          },
        ],
        siblingLinks: [
          { href: '/learn/ai-in-wealth-management', label: 'AI in wealth management' },
          { href: '/learn/open-portfolio-vs-plaid', label: 'Open vs Plaid' },
          { href: '/tier1designpartner', label: 'Design partnership' },
        ],
      }}
    />
  );
}
