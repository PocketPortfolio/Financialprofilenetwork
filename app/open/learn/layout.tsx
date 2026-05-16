import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export const metadata: Metadata = {
  title: `Learn · ${SURFACE_ORG.open.name}`,
  description: `Sovereign finance concepts for builders and institutions — ${SURFACE_ORG.open.name}.`,
  alternates: { canonical: OPEN_URLS.learnHub },
  openGraph: {
    title: `Learn | ${SURFACE_ORG.open.name}`,
    url: OPEN_URLS.learnHub,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};

export default function OpenLearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
