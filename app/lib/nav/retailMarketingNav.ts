/**
 * Retail A/B landing nav — B2C only. No For Advisors / dev tools bleed.
 */

import { landingHash, isMarketingLandingPath } from './sovereignMarketingNav';

export type RetailNavItem = { label: string; href: string };

export function retailPrimaryNav(
  pathname: string,
  utmContext: 'landing' | 'site' = 'landing'
): RetailNavItem[] {
  const L = (hash: string) => landingHash(pathname, hash);
  const sponsorQ =
    utmContext === 'landing'
      ? '?utm_source=landing&utm_medium=nav&utm_campaign=founders_club'
      : '?utm_source=navbar&utm_medium=global&utm_campaign=founders_club';
  return [
    { label: 'Features', href: L('#features') },
    { label: 'FAQ', href: L('#faq') },
    { label: "Founder's Club", href: `/sponsor${sponsorQ}` },
  ];
}

export { isMarketingLandingPath };
