import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/ai-in-wealth-management/page';

export const metadata: Metadata = {
  title: 'AI in Wealth Management Without a Client Data Warehouse | Open Portfolio',
  description:
    'AI in wealth management without warehousing client ledgers: BYOC inference boundary, edge ingestion, bounded context. Book architecture diligence.',
  alternates: { canonical: OPEN_URLS.aiInWealthManagement },
  openGraph: {
    title: 'AI in Wealth Management Without a Client Data Warehouse | Open Portfolio',
    description:
      'AI in wealth management without a vendor ledger vault — edge ingestion to bounded inference. Book architecture diligence.',
    url: OPEN_URLS.aiInWealthManagement,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
