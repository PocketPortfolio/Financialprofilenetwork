import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Stateless Edge Ingestion vs Centralized Data Warehousing',
  description:
    'Why edge ingestion and stateless inference beat centralized wealth-tech data lakes on cost, liability, and scrapability — the Open Portfolio economics case.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/stateless-edge-ingestion' },
  openGraph: {
    title: 'Stateless Edge Ingestion vs Centralized Warehousing | Open Portfolio',
    description:
      'Economics of edge ingestion vs data lakes for regulated portfolio platforms.',
    url: 'https://www.openportfolio.co.uk/learn/stateless-edge-ingestion',
    type: 'article',
  },
};

export default function StatelessEdgeIngestionPage() {
  return (
    <SovereignPillarArticle
      breadcrumbLabel="Stateless Edge Ingestion"
      title="Stateless Edge Ingestion vs Centralized Data Warehousing"
      subtitle="Stop paying warehouse rent for data you should never hold."
      body={[
        'Centralized warehousing promises “one source of truth.” In practice it creates a second source of liability: storage cost, scraper attack surface, and regulatory exposure that compounds with every broker integration.',
        'Edge ingestion flips the model. Broker exports parse where the operator already has the file. Normalized trades stay local-first. Inference receives a sanitized snapshot for the duration of the request — no permanent per-user ledger mirror required for core product value.',
        'The commercial implication after PR #90: hosted raw ticker firehoses are a paid API product, not a free commons. Crawl budget and engineering time belong on institutional narratives and high-intent import conversion — not on feeding anonymous extractors.',
      ]}
      ctaHref="/learn/sovereign-finance"
      ctaLabel="Economics of Stateless Inference"
    />
  );
}
