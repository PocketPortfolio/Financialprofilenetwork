import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/ai-in-wealth-management/page';

export const metadata: Metadata = {
  title: 'AI in Wealth Management Without Warehousing Client Ledgers',
  description:
    'How wealth platforms add generative AI over portfolio data without duplicating client ledgers into a vendor vault.',
  alternates: { canonical: OPEN_URLS.aiInWealthManagement },
  openGraph: {
    title: 'AI in Wealth Management | Open Portfolio',
    description: 'Generative use cases plus custody — edge ingestion to bounded inference.',
    url: OPEN_URLS.aiInWealthManagement,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
