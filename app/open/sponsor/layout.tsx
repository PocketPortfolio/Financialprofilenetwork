import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';
import { openPageSocial } from '../shared-metadata';

export const metadata: Metadata = {
  title: `Founders Club · ${SURFACE_ORG.open.name}`,
  description: `Institutional design partnership and founders club — ${SURFACE_ORG.open.name}.`,
  alternates: { canonical: OPEN_URLS.sponsor },
  ...openPageSocial({
    title: `Founders Club | ${SURFACE_ORG.open.name}`,
    description: `Institutional design partnership and founders club — ${SURFACE_ORG.open.name}.`,
    url: OPEN_URLS.sponsor,
    type: 'website',
  }),
};

export default function OpenSponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
