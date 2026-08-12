/**
 * News Room → WM/IFA conversion wedges (Day-28 growth augmentation).
 * Pairs institutional briefings with advisor tools + import landing pages.
 * Does not replace external publisher links on briefing cards.
 */

import type { NewsroomCategory } from './types';

/** Priority import wedges — aligned with Day-28 GSC force-index list. */
export const NEWSROOM_IMPORT_WEDGES = {
  ghostfolio: '/import/ghostfolio',
  trading212: '/import/trading212',
  ibkr: '/import/interactive-brokers',
  hub: '/import',
} as const;

export type NewsroomWedgeTarget =
  | 'advisors'
  | 'import_ghostfolio'
  | 'import_trading212'
  | 'import_ibkr'
  | 'import_hub';

export interface NewsroomWedgeLink {
  label: string;
  href: string;
  target: NewsroomWedgeTarget;
}

function wedgeHref(path: string, campaign: string): string {
  const params = new URLSearchParams({
    utm_source: 'newsroom',
    utm_medium: 'briefing',
    utm_campaign: campaign,
  });
  return `${path}?${params.toString()}`;
}

/** Category-aware internal next steps shown beneath each briefing card. */
export function wedgeLinksForCategory(category: NewsroomCategory): NewsroomWedgeLink[] {
  switch (category) {
    case 'REGULATORY COMPLIANCE':
      return [
        {
          label: 'Generate client report',
          href: wedgeHref('/for/advisors', 'wm_advisor_report'),
          target: 'advisors',
        },
        {
          label: 'Import client book',
          href: wedgeHref(NEWSROOM_IMPORT_WEDGES.ghostfolio, 'import_ghostfolio'),
          target: 'import_ghostfolio',
        },
      ];
    case 'WEALTH-TECH SCALING':
      return [
        {
          label: 'Import platform data',
          href: wedgeHref(NEWSROOM_IMPORT_WEDGES.ghostfolio, 'import_ghostfolio'),
          target: 'import_ghostfolio',
        },
        {
          label: 'Advisor tools',
          href: wedgeHref('/for/advisors', 'wm_advisor_tools'),
          target: 'advisors',
        },
      ];
    case 'MARKET INTELLIGENCE':
      return [
        {
          label: 'Import IBKR book',
          href: wedgeHref(NEWSROOM_IMPORT_WEDGES.ibkr, 'import_ibkr'),
          target: 'import_ibkr',
        },
        {
          label: 'Import T212 book',
          href: wedgeHref(NEWSROOM_IMPORT_WEDGES.trading212, 'import_trading212'),
          target: 'import_trading212',
        },
      ];
  }
}

/** Footer CTA targets for homepage vs /newsroom index — additive to existing CTAs. */
export const NEWSROOM_STRIP_CTA = {
  advisors: {
    label: 'Advisor tools →',
    href: wedgeHref('/for/advisors', 'wm_advisor_strip'),
    target: 'advisors' as const,
  },
  importGhostfolio: {
    label: 'Import Ghostfolio →',
    href: wedgeHref(NEWSROOM_IMPORT_WEDGES.ghostfolio, 'import_ghostfolio_strip'),
    target: 'import_ghostfolio' as const,
  },
  importHub: {
    label: 'Import portfolio →',
    href: wedgeHref(NEWSROOM_IMPORT_WEDGES.hub, 'import_hub_strip'),
    target: 'import_hub' as const,
  },
} as const;
