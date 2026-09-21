import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Open Portfolio vs a Portfolio-Data API',
  description:
    'When a BYOC inference boundary fits versus when a hosted portfolio-data API is the right tool for wealth platforms.',
  alternates: {
    canonical: 'https://www.openportfolio.co.uk/learn/open-portfolio-vs-portfolio-data-api',
  },
  openGraph: {
    title: 'Open Portfolio vs Portfolio-Data API | Open Portfolio',
    description: 'Honest evaluation — concede where a hosted API wins.',
    url: 'https://www.openportfolio.co.uk/learn/open-portfolio-vs-portfolio-data-api',
    type: 'article',
  },
};

export default function OpenVsPortfolioApiPage() {
  return (
    <SovereignPillarArticle
      articleSlug="open-portfolio-vs-portfolio-data-api"
      breadcrumbLabel="vs Portfolio-Data API"
      title="Open Portfolio vs a Portfolio-Data API"
      subtitle="Boundary infrastructure versus a hosted holdings API — different jobs."
      body={[
        'A portfolio-data API typically hosts normalized positions and transactions so your apps query a remote source of truth. That is the right tool when you want managed sync, multi-app reads, and accept the vendor as a data processor with retention.',
        'Open Portfolio sells an operated BYOC inference boundary: edge ingestion, buyer IdP/storage, bounded context, and stateless inference. The OSS importer proves parsing; Pocket proves chaos under real CSVs. We do not position as a drop-in replacement for every portfolio-data API.',
        'Choose the API when you need hosted holdings as product infrastructure. Choose the boundary when AI or analytics must not create a new warehouse of client ledgers. Many stacks will use both — API for operational data, boundary for AI diligence.',
      ]}
      ctaHref="/#contact"
      ctaLabel="Book a diligence call"
      procurementFaqIndices={[0, 3, 5]}
      aeo={{
        definition:
          'Open Portfolio is BYOC boundary infrastructure for AI over wealth data; a portfolio-data API is typically a hosted holdings/transactions service of record.',
        limitation:
          'Open Portfolio is not a universal portfolio-data API replacement and does not claim feature parity with hosted sync products.',
        sourceReceipt: '/architecture · /openbrokercsv · /llms.txt',
        lastReviewed: '2026-09-21',
        comparisonRows: [
          {
            approach: 'Open Portfolio (BYOC boundary)',
            fitsWhen: 'AI / inference diligence without a new ledger warehouse',
            failsWhen: 'You only need hosted positions CRUD and sync',
          },
          {
            approach: 'Hosted portfolio-data API',
            fitsWhen: 'Multi-app system of record for holdings is the product',
            failsWhen: 'Procurement blocks warehousing client ledgers with the AI vendor',
          },
        ],
        siblingLinks: [
          { href: '/learn/edge-ingestion-vs-warehouse', label: 'Edge vs warehouse' },
          { href: '/learn/open-portfolio-vs-plaid', label: 'vs Plaid' },
          { href: '/learn/ai-in-wealth-management', label: 'AI in wealth management' },
        ],
      }}
    />
  );
}
