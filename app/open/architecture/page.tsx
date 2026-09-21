import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../architecture/page';

export const metadata: Metadata = {
  title: 'Sovereign AI Architecture for Wealth-Tech | Open Portfolio',
  description:
    'Procurement-grade map of local-first ingestion, bounded aggregate context, and stateless inference for wealth platforms that cannot warehouse client ledgers.',
  alternates: { canonical: OPEN_URLS.architecture },
  openGraph: {
    title: 'Sovereign AI Architecture for Wealth-Tech | Open Portfolio',
    description:
      'Edge ingestion to bounded inference — raw client ledgers stay inside the buyer perimeter.',
    url: OPEN_URLS.architecture,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
