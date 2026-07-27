import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/sovereign-ai-architecture/page';

export const metadata: Metadata = {
  title: 'Sovereign AI Architecture & Data Perimeters',
  description:
    'How Open Portfolio designs sovereign AI: local-first ingestion, stateless inference, and hard data perimeters for wealth-tech.',
  alternates: { canonical: OPEN_URLS.sovereignAiArchitecture },
  openGraph: {
    title: 'Sovereign AI Architecture | Open Portfolio',
    description: 'Local-first ingestion and data perimeters for regulated wealth-tech.',
    url: OPEN_URLS.sovereignAiArchitecture,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
