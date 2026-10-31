import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';
import { openPageSocial } from '../../shared-metadata';

export { default } from '../../../learn/open-portfolio-vs-plaid/page';

export const metadata: Metadata = {
  title: 'Open Portfolio vs Plaid — Not a Replacement',
  description:
    'Bank linking rails versus inspectable edge ingestion and bounded inference. Not a Plaid replacement.',
  alternates: { canonical: OPEN_URLS.openVsPlaid },
  ...openPageSocial({
    title: 'Open Portfolio vs Plaid | Open Portfolio',
    description: 'Complementary categories — connectivity vs BYOC inference boundary.',
    url: OPEN_URLS.openVsPlaid,
    type: 'article',
  }),
};
