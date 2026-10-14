import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../architecture/page';

export const metadata: Metadata = {
  title: 'BYOC Inference Boundary for Wealth-Tech — Not an RIA Open-Architecture Platform | Open Portfolio',
  description:
    'Sovereign AI architecture: edge ingestion, bounded context, stateless hop. Buyer keeps IdP and storage — not a multi-custodian RIA open-architecture product. Book diligence.',
  alternates: { canonical: OPEN_URLS.architecture },
  openGraph: {
    title: 'BYOC Inference Boundary for Wealth-Tech | Open Portfolio',
    description:
      'Edge ingestion to bounded inference — not an RIA open-architecture custody platform. Raw client ledgers stay inside the buyer perimeter.',
    url: OPEN_URLS.architecture,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
