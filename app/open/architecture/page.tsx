import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../architecture/page';

export const metadata: Metadata = {
  title: 'Run AI on Wealth Data Without a Client-Ledger Warehouse | Open Portfolio',
  description:
    'Keep login and client storage. Edge ingestion builds a small approved summary for the model — book a 30-minute architecture review.',
  alternates: { canonical: OPEN_URLS.architecture },
  openGraph: {
    title: 'Run AI on Wealth Data Without a Client-Ledger Warehouse | Open Portfolio',
    description:
      'Keep IdP and ledger storage. Edge ingestion to bounded inference — book a 30-minute architecture review.',
    url: OPEN_URLS.architecture,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
