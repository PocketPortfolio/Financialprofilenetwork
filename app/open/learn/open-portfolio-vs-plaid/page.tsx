import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/open-portfolio-vs-plaid/page';

export const metadata: Metadata = {
  title: 'Open Portfolio vs Plaid — Not a Replacement',
  description:
    'Bank linking rails versus inspectable edge ingestion and bounded inference. Not a Plaid replacement.',
  alternates: { canonical: OPEN_URLS.openVsPlaid },
  openGraph: {
    title: 'Open Portfolio vs Plaid | Open Portfolio',
    description: 'Complementary categories — connectivity vs BYOC inference boundary.',
    url: OPEN_URLS.openVsPlaid,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
