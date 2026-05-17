import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../static/why-we-are-fast/page';

export const metadata: Metadata = {
  title: 'Why We Are Fast — Performance Engineering | Open Portfolio',
  description:
    'Latency, API behaviour, and engineering transparency for the sovereign ingestion substrate — oriented to procurement and technical diligence.',
  alternates: { canonical: OPEN_URLS.whyWeAreFast },
  openGraph: {
    title: 'Why We Are Fast | Open Portfolio',
    description:
      'Performance engineering and technical transparency on the Open Portfolio developer surface.',
    url: OPEN_URLS.whyWeAreFast,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
