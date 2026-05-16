import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/vendor-lock-in/page';

export const metadata: Metadata = {
  title: 'Vendor Lock-In and the Sovereign Substrate',
  description:
    'Why legacy cloud-storage wealth-tech vendors cannot transition to stateless ingestion without rebuilding their data custody model. The audit moat explained.',
  alternates: { canonical: OPEN_URLS.vendorLockIn },
  openGraph: {
    title: 'Vendor Lock-In | Open Portfolio',
    description: 'The audit moat: why incumbents cannot transition to stateless ingestion without rebuilding their data custody model.',
    url: OPEN_URLS.vendorLockIn,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
