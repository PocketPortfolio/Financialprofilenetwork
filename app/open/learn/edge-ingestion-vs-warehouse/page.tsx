import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';
import { openPageSocial } from '../../shared-metadata';

export { default } from '../../../learn/edge-ingestion-vs-warehouse/page';

export const metadata: Metadata = {
  title: 'Edge Ingestion vs Client-Ledger Warehouse',
  description:
    'Honest comparison of architectural approaches for AI over wealth data — when the boundary fits and when a warehouse wins.',
  alternates: { canonical: OPEN_URLS.edgeVsWarehouse },
  ...openPageSocial({
    title: 'Edge Ingestion vs Warehouse | Open Portfolio',
    description: 'Architectural trade-offs with honest concessions.',
    url: OPEN_URLS.edgeVsWarehouse,
    type: 'article',
  }),
};
