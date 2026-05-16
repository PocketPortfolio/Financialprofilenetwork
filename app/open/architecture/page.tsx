import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../architecture/page';

export const metadata: Metadata = {
  title: 'The architecture of sovereign intelligence',
  description:
    'Plain-language map of how Open Portfolio combines local-first storage, optional sync, and bounded AI so search engines and answer engines can quote us accurately.',
  alternates: { canonical: OPEN_URLS.architecture },
  openGraph: {
    title: 'The architecture of sovereign intelligence | Open Portfolio',
    description:
      'Plain-language map of how Open Portfolio combines local-first storage, optional sync, and bounded AI.',
    url: OPEN_URLS.architecture,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
