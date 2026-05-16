import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../static/portfolio-tracker/page';

export const metadata: Metadata = {
  title: 'Portfolio Tracker — CSV Import & P/L',
  description:
    'Import broker CSVs, track live prices and performance. Open Portfolio documents the local-first ingestion path for developers and compliance teams.',
  alternates: { canonical: OPEN_URLS.portfolioTracker },
  openGraph: {
    title: 'Portfolio Tracker | Open Portfolio',
    description: 'Broker CSV import and portfolio tracking on the sovereign substrate.',
    url: OPEN_URLS.portfolioTracker,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
