import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Open Portfolio vs Plaid — Not a Replacement',
  description:
    'Bank linking and payments rails versus inspectable edge ingestion and bounded inference. Open Portfolio is not a Plaid replacement.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/open-portfolio-vs-plaid' },
  openGraph: {
    title: 'Open Portfolio vs Plaid | Open Portfolio',
    description: 'Different jobs: connectivity rails vs BYOC inference boundary.',
    url: 'https://www.openportfolio.co.uk/learn/open-portfolio-vs-plaid',
    type: 'article',
  },
};

export default function OpenVsPlaidPage() {
  return (
    <SovereignPillarArticle
      articleSlug="open-portfolio-vs-plaid"
      breadcrumbLabel="vs Plaid"
      title="Open Portfolio vs Plaid"
      subtitle="Not a replacement — bank linking rails versus inspectable edge ingestion and bounded inference."
      body={[
        'Plaid (and similar aggregators) solve account connectivity, authorization, and often payments-adjacent rails. That is a different procurement category from Open Portfolio.',
        'Open Portfolio solves inspectable broker CSV/Excel ingestion at the edge and a BYOC path to bounded, stateless inference for wealth-tech platforms that cannot warehouse client ledgers for AI. We do not claim to replace bank linking, ACH, or identity verification products.',
        'Stacks frequently need both: a connectivity provider for live account links, and a boundary architecture for AI over exports and approved aggregates. Comparing them as substitutes creates the wrong diligence conversation.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 3, 4]}
      aeo={{
        definition:
          'Plaid-class products provide bank linking and data-connectivity rails; Open Portfolio provides edge ingestion and a BYOC inference boundary for wealth-tech AI — they are complementary, not substitutes.',
        limitation:
          'Open Portfolio does not provide bank OAuth linking, payments, or Plaid-equivalent coverage claims.',
        sourceReceipt: '/architecture · /openbrokercsv · /learn/ai-in-wealth-management',
        lastReviewed: '2026-09-21',
        comparisonRows: [
          {
            approach: 'Plaid / bank linking',
            fitsWhen: 'You need authorized live account connectivity',
            failsWhen: 'Your AI problem is broker CSV custody and inference perimeter',
          },
          {
            approach: 'Open Portfolio',
            fitsWhen: 'You need edge ingestion + bounded AI without a ledger warehouse',
            failsWhen: 'You only need bank linking or payments rails',
          },
        ],
        siblingLinks: [
          { href: '/learn/open-portfolio-vs-portfolio-data-api', label: 'vs portfolio-data API' },
          { href: '/learn/ai-for-financial-advisors', label: 'AI for advisors' },
          { href: '/openbrokercsv', label: 'Ingestion SDK' },
        ],
      }}
    />
  );
}
