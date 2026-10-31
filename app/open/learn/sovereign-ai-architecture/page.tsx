import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';
import { openPageSocial } from '../../shared-metadata';

export { default } from '../../../learn/sovereign-ai-architecture/page';

export const metadata: Metadata = {
  title: 'Sovereign AI for Wealth-Tech: Keep the Ledger, Run the Model | Open Portfolio',
  description:
    'Edge ingestion and bounded inference so AI can run without warehousing client ledgers. Book a 30-minute architecture review.',
  alternates: { canonical: OPEN_URLS.sovereignAiArchitecture },
  ...openPageSocial({
    title: 'Sovereign AI for Wealth-Tech: Keep the Ledger, Run the Model | Open Portfolio',
    description: 'Edge ingestion and bounded inference without warehousing client ledgers. Book a 30-minute architecture review.',
    url: OPEN_URLS.sovereignAiArchitecture,
    type: 'article',
  }),
};
