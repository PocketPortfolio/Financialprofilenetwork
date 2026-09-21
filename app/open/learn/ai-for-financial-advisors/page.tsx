import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/ai-for-financial-advisors/page';

export const metadata: Metadata = {
  title: 'AI for Financial Advisors Without a Central Client Warehouse',
  description:
    'Bounded advisor AI over controlled portfolio context — design-partner path, not a full advisor SaaS suite claim.',
  alternates: { canonical: OPEN_URLS.aiForFinancialAdvisors },
  openGraph: {
    title: 'AI for Financial Advisors | Open Portfolio',
    description: 'Architecture and design-partner path for advisor AI workflows.',
    url: OPEN_URLS.aiForFinancialAdvisors,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
