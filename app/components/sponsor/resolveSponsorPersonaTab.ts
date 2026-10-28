export type SponsorPersonaTab = 'investors' | 'developers' | 'institutions';

/** Map legacy `?tier=` deep links to persona panes (Stripe objects unchanged). */
export function resolveSponsorPersonaTab(tier: string | null): SponsorPersonaTab | null {
  if (!tier) return null;
  switch (tier) {
    case 'founder':
      return 'investors';
    case 'code-supporter':
    case 'developer-utility':
      return 'developers';
    case 'corporate':
      return 'institutions';
    default:
      return null;
  }
}
