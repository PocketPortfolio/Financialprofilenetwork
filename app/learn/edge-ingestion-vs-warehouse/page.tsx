import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';

export const metadata: Metadata = {
  title: 'Edge Ingestion vs Client-Ledger Warehouse',
  description:
    'Honest comparison: when a BYOC edge-ingestion boundary fits for AI over wealth data — and when a warehouse API still wins.',
  alternates: { canonical: 'https://www.openportfolio.co.uk/learn/edge-ingestion-vs-warehouse' },
  openGraph: {
    title: 'Edge Ingestion vs Client-Ledger Warehouse | Open Portfolio',
    description: 'Architectural trade-offs for AI over wealth data — with concessions.',
    url: 'https://www.openportfolio.co.uk/learn/edge-ingestion-vs-warehouse',
    type: 'article',
  },
};

export default function EdgeVsWarehousePage() {
  return (
    <SovereignPillarArticle
      articleSlug="edge-ingestion-vs-warehouse"
      breadcrumbLabel="Edge vs Warehouse"
      title="Edge Ingestion vs Client-Ledger Warehouse"
      subtitle="Two architectures for AI over wealth data — pick the liability model you can defend."
      body={[
        'A client-ledger warehouse centralizes normalized holdings so every tool (reporting, AI, analytics) reads one store. That is often correct when the warehouse is already your governed system of record and ICT risk is accepted.',
        'Edge ingestion + BYOC inference flips the default: parse where the export already is, keep primary state in buyer-approved stores, and send only bounded aggregates into a stateless inference hop. You trade “one lake for everything” for a smaller third-party blast radius on the AI path.',
        'Open Portfolio competes on the second model. We concede the first: if your procurement already requires a hosted portfolio warehouse and your risk committee has signed that perimeter, a warehouse-first API may be simpler than a boundary retrofit.',
      ]}
      ctaHref="/architecture"
      ctaLabel="Read the architecture"
      procurementFaqIndices={[0, 1, 4]}
      aeo={{
        definition:
          'Edge ingestion normalizes broker exports at the client or operator edge; a client-ledger warehouse mirrors holdings into a central store for all downstream tools including AI.',
        limitation:
          'Neither pattern removes regulatory accountability; Open Portfolio does not claim warehouses are always wrong.',
        sourceReceipt: '/architecture · /learn/stateless-edge-ingestion · @pocket-portfolio/importer',
        lastReviewed: '2026-09-21',
        comparisonRows: [
          {
            approach: 'Edge + BYOC boundary',
            fitsWhen: 'AI is the new liability; ledger custody must stay with the buyer',
            failsWhen: 'You need one vendor-hosted truth for all reporting tools tomorrow',
          },
          {
            approach: 'Client-ledger warehouse',
            fitsWhen: 'Governed lake already exists; AI is another consumer',
            failsWhen: 'Adding AI would create a new PII warehouse you cannot justify',
          },
        ],
        siblingLinks: [
          { href: '/learn/ai-in-wealth-management', label: 'AI in wealth management' },
          { href: '/learn/open-portfolio-vs-portfolio-data-api', label: 'vs portfolio-data API' },
          { href: '/learn/stateless-edge-ingestion', label: 'Stateless edge ingestion' },
        ],
      }}
    />
  );
}
