import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'Local-First — Privacy as an Engineering Choice',
  description:
    'BYOC local-first posture for regulated platforms: edge ingestion and buyer-controlled stores — not a vendor-hosted ledger warehouse. Open Portfolio architecture brief.',
  alternates: { canonical: OPEN_URLS.localFirst },
  openGraph: {
    title: 'Local-First | Open Portfolio',
    description:
      'Limited-Scope Processor posture. Audit-perimeter reduction by architecture — BYOC, not another vault.',
    url: OPEN_URLS.localFirst,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};

export default function OpenLocalFirstPage() {
  return (
    <SovereignPillarArticle
      articleSlug="local-first"
      breadcrumbLabel="Local-First"
      title="Local-First Architecture"
      subtitle="Privacy as an engineering choice — buyer-controlled stores, edge ingestion, limited-scope processing."
      body={[
        'Open Portfolio’s local-first doctrine is BYOC: the enterprise keeps IdP and approved storage. Broker exports are normalized at the edge; raw ledgers are not required to become a vendor-hosted warehouse for AI or analytics value.',
        'Pocket Portfolio is the live consumer harness on the same substrate — browser-first state and optional operator-owned sync used to prove adapters under real CSV chaos. Those Pocket implementation details are not Open’s default enterprise store contract.',
        'Limited-Scope Processor posture shrinks audit perimeter by architecture: minimize what a third party must hold, not by promising “zero cloud” for every signed-in workflow. Diligence map: /architecture.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 3, 4]}
    />
  );
}
