import type { Metadata } from 'next';
import SovereignPillarArticle from '@/app/components/learn/SovereignPillarArticle';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = {
  title: 'Vendor Lock-In and the Sovereign Substrate',
  description:
    'Why proprietary custody models expand switching cost — and how BYOC open ingestion boundaries prevent capture. Open Portfolio architecture brief.',
  alternates: { canonical: OPEN_URLS.vendorLockIn },
  openGraph: {
    title: 'Vendor Lock-In | Open Portfolio',
    description:
      'Open adapters and BYOC perimeters vs vendor-hosted ledger warehouses.',
    url: OPEN_URLS.vendorLockIn,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};

export default function OpenVendorLockInPage() {
  return (
    <SovereignPillarArticle
      articleSlug="vendor-lock-in"
      breadcrumbLabel="Vendor Lock-In"
      title="Vendor Lock-In"
      subtitle="Proprietary formats and hosted vaults expand switching cost — open ingestion boundaries prevent capture."
      body={[
        'Legacy wealth-tech often locks value in a vendor-hosted ledger copy. Leaving means renegotiating data extraction, schema mapping, and AI context — after the warehouse is already the system of record.',
        'Open Portfolio’s substrate is the opposite: MIT OSS adapters (@pocket-portfolio/importer), BYOC store placement, and stateless inference over bounded aggregates. Switching cost stays in your perimeter controls, not our vault.',
        'Pocket Portfolio stress-tests the adapter floor as a consumer harness. Enterprise buyers evaluate Open for embeddable boundary infrastructure — not another portfolio tracker SaaS.',
      ]}
      ctaHref="/openbrokercsv"
      ctaLabel="Sovereign ingestion SDK"
      procurementFaqIndices={[2, 3, 5]}
    />
  );
}
