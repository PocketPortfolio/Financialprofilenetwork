import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export const metadata: Metadata = {
  title: `Institutional Architecture Briefs · ${SURFACE_ORG.open.name}`,
  description:
    'Published architecture briefs for CTOs and CISOs — sovereign AI, DORA/EU AI Act, edge ingestion, and enterprise design partnership.',
  alternates: { canonical: OPEN_URLS.learnHub },
  openGraph: {
    title: `Institutional Architecture Briefs | ${SURFACE_ORG.open.name}`,
    description:
      'Sovereign ingestion and stateless inference doctrine for regulated wealth-tech platforms.',
    url: OPEN_URLS.learnHub,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};

export default function OpenLearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
