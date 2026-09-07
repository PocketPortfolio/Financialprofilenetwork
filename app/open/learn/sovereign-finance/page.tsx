import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'Sovereign Finance — The Economics of Stateless Inference',
  description:
    'Economics of BYOC + stateless inference for regulated wealth-tech — reduce data gravity without a vendor-hosted ledger warehouse.',
  alternates: { canonical: OPEN_URLS.sovereignFinance },
  openGraph: {
    title: 'Sovereign Finance | Open Portfolio',
    description: 'BYOC economics of stateless inference for regulated platforms.',
    url: OPEN_URLS.sovereignFinance,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};

export default function OpenSovereignFinancePage() {
  return (
    <SovereignPillarArticle
      articleSlug="sovereign-finance"
      breadcrumbLabel="Sovereign Finance"
      title="Sovereign Finance"
      subtitle="The economics of stateless inference — stop paying warehouse rent for data you should not hold."
      body={[
        'Data gravity is an economics problem: every duplicated client ledger expands storage cost, ICT blast radius, and procurement friction. Open Portfolio’s BYOC boundary keeps approved stores with the buyer and sends only bounded aggregates across the inference hop.',
        'Ownership means portable artifacts and inspectable adapters — not locking institutions into a third-party SaaS vault branded as “local.” Pocket Portfolio demonstrates the harness under retail CSV load; Open packages the enterprise perimeter story.',
        'Pair this brief with DORA / EU AI Act and Tier-1 design partnership when diligence requires board-ready language without zero-cloud theatre.',
      ]}
      ctaHref="/learn/dora-eu-ai-act-wealth"
      ctaLabel="DORA & EU AI Act brief"
      procurementFaqIndices={[1, 3, 5]}
    />
  );
}
