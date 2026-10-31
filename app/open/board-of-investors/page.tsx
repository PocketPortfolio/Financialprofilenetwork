import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG, BOARD_OF_INVESTORS } from '../../../lib/canonical-claims';
import { openPageSocial } from '../shared-metadata';

export { default } from '../../board-of-investors/page';

export const metadata: Metadata = {
  title: BOARD_OF_INVESTORS.headline,
  description: BOARD_OF_INVESTORS.subheadline,
  alternates: { canonical: OPEN_URLS.boardOfInvestors },
  ...openPageSocial({
    title: `${BOARD_OF_INVESTORS.headline} | Open Portfolio`,
    description: BOARD_OF_INVESTORS.subheadline,
    url: OPEN_URLS.boardOfInvestors,
    type: 'website',
  }),
};
