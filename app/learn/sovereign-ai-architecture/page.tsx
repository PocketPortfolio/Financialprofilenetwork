import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Sovereign AI Architecture & Data Perimeters',
  description:
    'How Open Portfolio designs sovereign AI: local-first ingestion, stateless inference, and hard data perimeters for wealth-tech platforms that cannot warehouse client ledgers.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/sovereign-ai-architecture' },
  openGraph: {
    title: 'Sovereign AI Architecture & Data Perimeters | Open Portfolio',
    description:
      'Local-first ingestion, stateless inference, and data perimeters for regulated wealth-tech.',
    url: 'https://www.openportfolio.co.uk/learn/sovereign-ai-architecture',
    type: 'article',
  },
};

export default function SovereignAiArchitecturePage() {
  return (
    <SovereignPillarArticle
      articleSlug="sovereign-ai-architecture"
      breadcrumbLabel="Sovereign AI Architecture"
      title="Sovereign AI Architecture & Data Perimeters"
      subtitle="Inference without a central warehouse. Ingestion without surrendering the ledger."
      body={[
        'Wealth-tech platforms are punished twice for “AI-ready” data lakes: once on infrastructure cost, and again on regulatory perimeter. Open Portfolio is BYOC boundary infrastructure — keep IdP and approved storage; parse broker exports at the edge; send only sanitized context into a stateless inference hop.',
        'Data perimeters are architectural, not checkbox compliance alone. Client-side CSV/Excel parsing and customer-controlled stores mean PII does not need to become a permanent third-party cloud liability to unlock portfolio intelligence. Pocket Portfolio is the live harness proving adapters under CSV chaos — not Open’s default enterprise store.',
        'For CTOs and CISOs: treat AI as a bounded processor. The sovereign stack separates ingestion (edge), control plane (auth/quotas you scope), and inference (stateless) so enterprise buyers can reason over broker data without exposing unmetered public data endpoints or building a GDPR-grade vendor warehouse.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 4, 5]}
    />
  );
}
