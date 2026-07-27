import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'DORA & EU AI Act for Wealth Management',
  description:
    'Practical mapping of DORA operational resilience and the EU AI Act to local-first ingestion and stateless AI inference for wealth managers and platforms.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/dora-eu-ai-act-wealth' },
  openGraph: {
    title: 'DORA & EU AI Act for Wealth Management | Open Portfolio',
    description:
      'Operational resilience and AI Act posture for wealth-tech without warehousing client ledgers.',
    url: 'https://www.openportfolio.co.uk/learn/dora-eu-ai-act-wealth',
    type: 'article',
  },
};

export default function DoraEuAiActWealthPage() {
  return (
    <SovereignPillarArticle
      breadcrumbLabel="DORA & EU AI Act"
      title="DORA & EU AI Act Compliance for Wealth Management"
      subtitle="Resilience and AI governance that follow the data perimeter — not a slide deck."
      body={[
        'DORA pushes ICT risk, third-party concentration, and incident readiness into the board conversation. For portfolio platforms, the quiet killer is unnecessary data gravity: every duplicated ledger copy expands the blast radius of an ICT event.',
        'The EU AI Act raises the bar on transparency, risk classification, and human oversight for AI systems touching financial decisions. Stateless inference with minimized context is a structural control: less retained personal data, clearer processor boundaries, and auditable request/response scopes.',
        'Open Portfolio positions wealth operators to adopt AI assistance without converting every client CSV into a permanent training or warehousing surface. Pair this pillar with Architecture and Tier 1 Design Partnership for diligence-ready narratives.',
      ]}
      ctaHref="/tier1designpartner"
      ctaLabel="Explore Design Partnership"
    />
  );
}
