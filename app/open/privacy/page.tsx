import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../privacy/page';

export const metadata: Metadata = {
  title: `Privacy Policy · ${SURFACE_ORG.open.name}`,
  description: `Privacy Policy for ${SURFACE_ORG.open.name}.`,
  alternates: { canonical: OPEN_URLS.privacy },
  robots: 'index,follow',
};
