import type { Metadata } from 'next';
import { OPEN_URLS, PERSON_ABBA, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../press/page';

export const metadata: Metadata = {
  title: `Press Kit · ${SURFACE_ORG.open.name}`,
  description: `Canonical, machine-readable facts about ${SURFACE_ORG.open.name}: positioning, founder (${PERSON_ABBA.name}), SDK, packages, and live distribution signal.`,
  alternates: { canonical: OPEN_URLS.press },
  openGraph: {
    title: `Press Kit | ${SURFACE_ORG.open.name}`,
    description: SURFACE_ORG.open.description,
    url: OPEN_URLS.press,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
