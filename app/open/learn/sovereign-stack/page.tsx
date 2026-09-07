import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'The Sovereign Stack',
  description:
    'BYOC sovereign stack for regulated wealth-tech: edge adapter floor, buyer-controlled stores, stateless inference — not Google Drive-as-default SaaS.',
  alternates: { canonical: OPEN_URLS.sovereignStack },
  openGraph: {
    title: 'The Sovereign Stack | Open Portfolio',
    description:
      'Edge ingestion + BYOC perimeter. Deterministic adapter floor before any inference hop.',
    url: OPEN_URLS.sovereignStack,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};

export default function OpenSovereignStackPage() {
  return (
    <SovereignPillarArticle
      articleSlug="sovereign-stack"
      breadcrumbLabel="Sovereign Stack"
      title="The Sovereign Stack"
      subtitle="Client-edge normalization and BYOC perimeters — sensitive banking data need not become a platform-hosted net-worth warehouse."
      body={[
        'The Sovereign Stack separates ingestion (edge adapters), control plane (auth/quotas you scope), and inference (stateless bounded aggregates). Open Portfolio sells the boundary layer that embeds inside your perimeter.',
        'Do not confuse this with Pocket Portfolio’s optional Sovereign Sync (operator-owned Drive file on the consumer harness). Enterprise BYOC pilots scope your approved stores — Drive is one possible customer choice, not Open’s product default.',
        'Deterministic @pocket-portfolio/importer adapters standardize messy broker CSVs at the edge before any model hop. Architecture and Tier-1 design partnership are the diligence path.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 2, 3]}
    />
  );
}
