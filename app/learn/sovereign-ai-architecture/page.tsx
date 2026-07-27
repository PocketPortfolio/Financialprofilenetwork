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
      breadcrumbLabel="Sovereign AI Architecture"
      title="Sovereign AI Architecture & Data Perimeters"
      subtitle="Inference without a central warehouse. Ingestion without surrendering the ledger."
      body={[
        'Wealth-tech platforms are punished twice for “AI-ready” data lakes: once on infrastructure cost, and again on regulatory perimeter. Open Portfolio’s doctrine is the opposite — keep the raw broker ledger at the edge (browser, operator device, or customer-controlled Drive), and send only sanitized context into a stateless inference boundary.',
        'Data perimeters are architectural, not policy theatre. Client-side CSV/Excel parsing, IndexedDB-local state, and optional operator-owned sync mean PII does not need to become a permanent cloud liability to unlock portfolio intelligence.',
        'For CTOs and CISOs: treat AI as a bounded processor. The sovereign stack separates ingestion (local), control plane (auth/quotas), and inference (stateless) so enterprise buyers can reason over broker data without subsidizing a scrapable firehose or a GDPR-grade warehouse.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
    />
  );
}
