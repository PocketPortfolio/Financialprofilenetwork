import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export { default } from '../../terms/page';

export const metadata: Metadata = {
  title: `Terms of Service · ${SURFACE_ORG.open.name}`,
  description: `Terms of Service for ${SURFACE_ORG.open.name}.`,
  alternates: { canonical: OPEN_URLS.terms },
  robots: 'index,follow',
};
