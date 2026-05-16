import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/sovereign-finance/page';

export const metadata: Metadata = {
  title: 'Sovereign Finance — The Economics of Stateless Inference',
  description:
    "Open Portfolio defines the Economics of Stateless Inference. By decoupling data ingestion from long-term storage, we eliminate the 'Data Gravity' trap typical of legacy wealth-tech.",
  alternates: { canonical: OPEN_URLS.sovereignFinance },
  openGraph: {
    title: 'Sovereign Finance | Open Portfolio',
    description: 'The economics of stateless inference for regulated wealth-tech infrastructure.',
    url: OPEN_URLS.sovereignFinance,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
