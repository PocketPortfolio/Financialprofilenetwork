import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export const metadata: Metadata = {
  title: `Founders Club · ${SURFACE_ORG.open.name}`,
  description: `Institutional design partnership and founders club — ${SURFACE_ORG.open.name}.`,
  alternates: { canonical: OPEN_URLS.sponsor },
  openGraph: {
    title: `Founders Club | ${SURFACE_ORG.open.name}`,
    url: OPEN_URLS.sponsor,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};

export default function OpenSponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
