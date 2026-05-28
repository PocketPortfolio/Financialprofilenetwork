import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG, SDK } from '../../../lib/canonical-claims';

export { default } from '../../openbrokercsv/page';

export const metadata: Metadata = {
  title: 'Sovereign Ingestion — OpenBrokerCSV SDK',
  description: `${SDK.name} v${SDK.version} (${SDK.license}). ${SDK.brokerAdapterCount}+ broker CSV/Excel adapters, local-first parsing, zero PII egress. B2B substrate — Pocket Portfolio is the live test harness.`,
  alternates: { canonical: OPEN_URLS.openBrokerCsv },
  openGraph: {
    title: 'Sovereign Ingestion | Open Portfolio',
    description: `${SDK.brokerAdapterCount}+ verified broker adapters. MIT-licensed ingestion SDK for regulated environments.`,
    url: OPEN_URLS.openBrokerCsv,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};
