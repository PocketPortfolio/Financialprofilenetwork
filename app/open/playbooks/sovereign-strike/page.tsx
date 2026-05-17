import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '../../../../lib/canonical-claims';

export { default } from '../../../playbooks/sovereign-strike/page';

export const metadata: Metadata = {
  title: 'Sovereign Strike Playbook',
  description:
    'The Sovereign Strike playbook: how regulated buyers procure infrastructure that keeps customer data local and reduces audit perimeter.',
  alternates: { canonical: OPEN_URLS.sovereignStrike },
  openGraph: {
    title: 'Sovereign Strike Playbook | Open Portfolio',
    description: 'How regulated buyers procure infrastructure that keeps customer data local.',
    url: OPEN_URLS.sovereignStrike,
    siteName: SURFACE_ORG.open.name,
    type: 'article',
  },
};
