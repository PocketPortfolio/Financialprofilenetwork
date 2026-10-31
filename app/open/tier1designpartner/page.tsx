import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG, TIER1_DESIGN_PARTNER } from '../../../lib/canonical-claims';
import { openPageSocial } from '../shared-metadata';

export { default } from '../../tier1designpartner/page';

export const metadata: Metadata = {
  title: TIER1_DESIGN_PARTNER.headline,
  description: TIER1_DESIGN_PARTNER.subheadline,
  alternates: { canonical: OPEN_URLS.tier1DesignPartner },
  ...openPageSocial({
    title: `${TIER1_DESIGN_PARTNER.headline} | Open Portfolio`,
    description: TIER1_DESIGN_PARTNER.subheadline,
    url: OPEN_URLS.tier1DesignPartner,
    type: 'website',
  }),
};
