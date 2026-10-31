import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';
import { openOgImage } from '../shared-metadata';

export { default } from '../../sovereign-ai-grant/page';

export const metadata: Metadata = {
  title: 'Sovereign AI Grant',
  description:
    'A grant programme for research teams building sovereign AI in regulated environments. Apply via the Open Portfolio gateway.',
  alternates: { canonical: OPEN_URLS.sovereignAiGrant },
  openGraph: {
    ...openOgImage,
    title: 'Sovereign AI Grant | Open Portfolio',
    description: 'A grant programme for research teams building sovereign AI in regulated environments.',
    url: OPEN_URLS.sovereignAiGrant,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
