import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Enterprise Design Partnership Program',
  description:
    'Architecture-level design partnership for wealth-tech platforms building sovereign ingestion, inference boundaries, and audit-perimeter controls.',
  alternates: {
    canonical: 'https://www.openportfolio.co.uk/learn/enterprise-design-partnership',
  },
  openGraph: {
    title: 'Enterprise Design Partnership Program | Open Portfolio',
    description:
      'Limited-capacity design partnership for sovereign AI architecture in regulated wealth-tech.',
    url: 'https://www.openportfolio.co.uk/learn/enterprise-design-partnership',
    type: 'article',
  },
};

export default function EnterpriseDesignPartnershipPage() {
  return (
    <SovereignPillarArticle
      articleSlug="enterprise-design-partnership"
      breadcrumbLabel="Enterprise Design Partnership"
      title="Enterprise Design Partnership Program"
      subtitle="Architecture-level collaboration for platforms that cannot warehouse client ledgers."
      body={[
        'The Enterprise Design Partnership is for wealth-tech platforms and operators who need direct engineering collaboration on data perimeters, inference boundaries, and commercial packaging — not surface-level content.',
        'Partnership capacity is intentionally limited so diligence conversations stay with buyers who care about DORA and EU AI Act posture, audit perimeter reduction, and API access models that do not duplicate client ledgers in your cloud.',
        'Evaluate the published architecture briefs first, then start a Tier 1 design conversation with your audit-perimeter requirements. We structure engagement around CTO and CISO diligence — not marketing funnels.',
      ]}
      ctaHref="/#contact"
      ctaLabel="Book a diligence call"
      procurementFaqIndices={[2, 4, 5]}
      aeo={{
        definition:
          'The Enterprise Design Partnership is a limited-capacity diligence engagement to embed Open Portfolio’s BYOC inference boundary into a wealth-tech stack — not a marketing funnel or certification programme.',
        limitation:
          'Capacity-limited; does not guarantee DORA or EU AI Act outcomes; does not publish customer logos or case studies without partner approval.',
        sourceReceipt: '/tier1designpartner · /architecture · /#contact',
        lastReviewed: '2026-09-21',
        siblingLinks: [
          { href: '/learn/ai-in-wealth-management', label: 'AI in wealth management' },
          { href: '/tier1designpartner', label: 'Design partnership' },
          { href: '/architecture', label: 'Architecture' },
        ],
      }}
    />
  );
}
