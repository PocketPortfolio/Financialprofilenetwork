import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG, DESIGN_CHALLENGE } from '../../../lib/canonical-claims';

export { default } from '../../designchallenge/page';

export const metadata: Metadata = {
  title: DESIGN_CHALLENGE.headline,
  description: DESIGN_CHALLENGE.subheadline,
  alternates: { canonical: OPEN_URLS.designChallenge },
  openGraph: {
    title: `${DESIGN_CHALLENGE.headline} | Open Portfolio`,
    description: DESIGN_CHALLENGE.subheadline,
    url: OPEN_URLS.designChallenge,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
