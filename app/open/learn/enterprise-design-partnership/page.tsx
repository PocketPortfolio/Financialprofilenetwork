import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/enterprise-design-partnership/page';

export const metadata: Metadata = {
  title: 'Enterprise Design Partnership Program (5-Seat BIP Cap)',
  description:
    'Capped institutional Design Partnership and Board of Investors access for sovereign AI architecture.',
  alternates: { canonical: OPEN_URLS.enterpriseDesignPartnership },
  openGraph: {
    title: 'Enterprise Design Partnership | Open Portfolio',
    description: '5-seat BIP cap — institutional partnership for sovereign wealth-tech stacks.',
    url: OPEN_URLS.enterpriseDesignPartnership,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
