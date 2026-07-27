import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/dora-eu-ai-act-wealth/page';

export const metadata: Metadata = {
  title: 'DORA & EU AI Act for Wealth Management',
  description:
    'DORA operational resilience and EU AI Act posture for wealth-tech without warehousing client ledgers.',
  alternates: { canonical: OPEN_URLS.doraEuAiActWealth },
  openGraph: {
    title: 'DORA & EU AI Act | Open Portfolio',
    description: 'Compliance narratives for sovereign ingestion and stateless inference.',
    url: OPEN_URLS.doraEuAiActWealth,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
