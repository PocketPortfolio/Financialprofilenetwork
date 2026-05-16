import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../learn/local-first/page';

export const metadata: Metadata = {
  title: 'Local-First — Privacy as an Engineering Choice',
  description:
    "Privacy is an engineering choice, not a legal promise. Limited-Scope Processor posture reduces the SOC 2 audit perimeter and the UK DPA/GDPR burden by architecture.",
  alternates: { canonical: OPEN_URLS.localFirst },
  openGraph: {
    title: 'Local-First | Open Portfolio',
    description: 'Limited-Scope Processor posture. SOC 2 audit perimeter reduction by architecture.',
    url: OPEN_URLS.localFirst,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
