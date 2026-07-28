import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/enterprise-design-partnership/page';

export const metadata: Metadata = {
  title: 'Enterprise Design Partnership Program',
  description:
    'Architecture-level design partnership for sovereign ingestion and inference in regulated wealth-tech.',
  alternates: { canonical: OPEN_URLS.enterpriseDesignPartnership },
  openGraph: {
    title: 'Enterprise Design Partnership Program | Open Portfolio',
    description:
      'Limited-capacity design partnership for sovereign AI architecture in wealth-tech stacks.',
    url: OPEN_URLS.enterpriseDesignPartnership,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
