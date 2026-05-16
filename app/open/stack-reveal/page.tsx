import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../stack-reveal/page';

export const metadata: Metadata = {
  title: 'Stack Reveal — Engineering Cadence',
  description:
    'Weekly engineering cadence on the sovereign substrate. Architecture decisions, regression hardening, and substrate evolution from the Open Portfolio team.',
  alternates: { canonical: OPEN_URLS.stackReveal },
  openGraph: {
    title: 'Stack Reveal | Open Portfolio',
    description: 'Weekly engineering cadence on the sovereign substrate.',
    url: OPEN_URLS.stackReveal,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
