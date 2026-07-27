import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/stateless-edge-ingestion/page';

export const metadata: Metadata = {
  title: 'Stateless Edge Ingestion vs Centralized Data Warehousing',
  description:
    'Economics of edge ingestion vs centralized wealth-tech data lakes — Open Portfolio doctrine.',
  alternates: { canonical: OPEN_URLS.statelessEdgeIngestion },
  openGraph: {
    title: 'Stateless Edge Ingestion | Open Portfolio',
    description: 'Why edge ingestion beats scrapable data warehouses.',
    url: OPEN_URLS.statelessEdgeIngestion,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
