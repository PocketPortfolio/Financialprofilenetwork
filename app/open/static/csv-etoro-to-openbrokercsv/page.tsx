import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../static/csv-etoro-to-openbrokercsv/page';

export const metadata: Metadata = {
  title: 'eToro → OpenBrokerCSV Converter',
  description:
    'Convert eToro CSV exports to OpenBrokerCSV locally in the browser. No upload, no cloud warehouse — sovereign ingestion for regulated environments.',
  alternates: { canonical: OPEN_URLS.etoroToOpenBrokerCsv },
  openGraph: {
    title: 'eToro → OpenBrokerCSV | Open Portfolio',
    description: 'Local-first eToro CSV conversion to the OpenBrokerCSV standard.',
    url: OPEN_URLS.etoroToOpenBrokerCsv,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
