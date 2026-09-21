import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/open-portfolio-vs-portfolio-data-api/page';

export const metadata: Metadata = {
  title: 'Open Portfolio vs a Portfolio-Data API',
  description:
    'When a BYOC inference boundary fits versus when a hosted portfolio-data API is the right tool.',
  alternates: { canonical: OPEN_URLS.openVsPortfolioApi },
  openGraph: {
    title: 'Open Portfolio vs Portfolio-Data API | Open Portfolio',
    description: 'Boundary infrastructure versus hosted holdings API.',
    url: OPEN_URLS.openVsPortfolioApi,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
