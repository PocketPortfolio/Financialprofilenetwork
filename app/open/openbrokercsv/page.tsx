import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG, SDK } from '../../../lib/canonical-claims';

export { default } from '../../openbrokercsv/page';

export const metadata: Metadata = {
  title: 'OpenBrokerCSV — Sovereign Ingestion SDK',
  description: `${SDK.name} v${SDK.version} (${SDK.license}). ${SDK.brokerAdapterCount}+ broker CSV/Excel adapters, local-first parsing, zero PII egress. Try before you commit.`,
  alternates: { canonical: OPEN_URLS.openBrokerCsv },
  openGraph: {
    title: 'OpenBrokerCSV | Open Portfolio',
    description: `${SDK.brokerAdapterCount}+ broker adapters. MIT-licensed sovereign ingestion SDK.`,
    url: OPEN_URLS.openBrokerCsv,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
