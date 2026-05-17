import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/sovereign-stack/page';

export const metadata: Metadata = {
  title: 'The Sovereign Stack',
  description:
    "The Sovereign Stack is built on a 'Local-First' foundation. Deterministic adapter floor standardises messy broker CSVs at the edge — 99.9% ingestion accuracy before data ever touches the cloud.",
  alternates: { canonical: OPEN_URLS.sovereignStack },
  openGraph: {
    title: 'The Sovereign Stack | Open Portfolio',
    description:
      'Local-first foundation. Deterministic adapter floor. 99.9% ingestion accuracy before data ever touches the cloud.',
    url: OPEN_URLS.sovereignStack,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
