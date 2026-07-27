import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Enterprise Design Partnership Program (5-Seat BIP Cap)',
  description:
    'Open Portfolio Enterprise Design Partnership and Board of Investors (BIP) — capped seats for platforms building sovereign ingestion and inference into wealth-tech stacks.',
  alternates: {
    canonical: 'https://www.openportfolio.co.uk/learn/enterprise-design-partnership',
  },
  openGraph: {
    title: 'Enterprise Design Partnership (5-Seat BIP Cap) | Open Portfolio',
    description:
      'Capped institutional partnership for sovereign AI architecture in wealth-tech.',
    url: 'https://www.openportfolio.co.uk/learn/enterprise-design-partnership',
    type: 'article',
  },
};

export default function EnterpriseDesignPartnershipPage() {
  return (
    <SovereignPillarArticle
      breadcrumbLabel="Enterprise Design Partnership"
      title="Enterprise Design Partnership Program (5-Seat BIP Cap)"
      subtitle="Institutional access is scarce by design — not another open blog farm."
      body={[
        'The Enterprise Design Partnership and Board of Investors (BIP) tracks exist for platforms and operators who need architecture-level collaboration on sovereign ingestion, inference boundaries, and commercial packaging — not generic “how to speed up CI” content.',
        'Seat scarcity (including the five-seat BIP posture) protects signal quality: diligence conversations stay with buyers who care about data perimeters, DORA/AI Act posture, and API monetization that does not leak the ledger.',
        'Wave 1 of the commercial offense retires thin engineering SEO farm posts in favor of these pillars. Wave 2 (CCO outbound and AI citation) starts only after this doctrine is indexable and measurable.',
      ]}
      ctaHref="/board-of-investors"
      ctaLabel="Board of Investors (BIP)"
    />
  );
}
