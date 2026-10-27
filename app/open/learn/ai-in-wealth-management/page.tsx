import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/ai-in-wealth-management/page';

export const metadata: Metadata = {
  title: 'AI in Wealth Management Without Copying the Client Ledger | Open Portfolio',
  description:
    'Run AI over portfolio data without a vendor ledger vault. Keep your IdP and storage — book a 30-minute architecture review.',
  alternates: { canonical: OPEN_URLS.aiInWealthManagement },
  openGraph: {
    title: 'AI in Wealth Management Without Copying the Client Ledger | Open Portfolio',
    description:
      'Run AI over portfolio data without a vendor ledger vault. Book a 30-minute architecture review.',
    url: OPEN_URLS.aiInWealthManagement,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
