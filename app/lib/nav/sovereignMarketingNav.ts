/**
 * Ratified marketing IA: Terminal | Architecture | Developers | Partners | Mission | FIN Pillars | Tools | FAQ.
 * Used by landing (`/`, `/landing`) and ProductionNavbar (`/s/*`, tools, learn, etc.) so hrefs resolve correctly.
 */

export type SovereignNavItem = {
  label: string;
  href: string;
};

/** True when hash links can target the long-form landing on the same origin. */
export function isMarketingLandingPath(pathname: string): boolean {
  return pathname === '/' || pathname === '/landing';
}

/** In-page hash on landing; absolute `/landing#…` elsewhere so jumps always work. */
export function landingHash(pathname: string, hash: string): string {
  const h = hash.startsWith('#') ? hash : `#${hash}`;
  return isMarketingLandingPath(pathname) ? h : `/landing${h}`;
}

function architectureHref(utmContext: 'landing' | 'site'): string {
  const q =
    utmContext === 'landing'
      ? 'utm_source=landing&utm_medium=nav&utm_campaign=architecture'
      : 'utm_source=navbar&utm_medium=global&utm_campaign=architecture';
  return `/architecture?${q}`;
}

// Partners dropdown is handled in ProductionNavbar (portal dropdown) because it is not a single href.

export function sovereignPrimaryNav(
  pathname: string,
  utmContext: 'landing' | 'site' = 'site'
): SovereignNavItem[] {
  const L = (hash: string) => landingHash(pathname, hash);
  return [
    { label: 'Terminal', href: L('#features') },
    { label: 'Architecture', href: architectureHref(utmContext) },
    { label: 'Developers', href: L('#developer') },
    // Per CEO mandate 2026-05-15: B2C nav stops promoting the design challenge
    // (now an O. surface). Swap to For Advisors so the wealth-manager funnel
    // surfaces the right institutional ramp. The design challenge stays linked
    // from the Partners column of GlobalFooter for legacy users.
    { label: 'For Advisors', href: '/for/advisors' },
    { label: 'Mission', href: L('#mission') },
    { label: 'FIN Pillars', href: L('#fin-pillars') },
    { label: 'FAQ', href: L('#faq') },
  ];
}

export function sovereignToolsDropdown(pathname: string): SovereignNavItem[] {
  const L = (hash: string) => landingHash(pathname, hash);
  return [
    { label: 'Popular stocks', href: L('#popular-stocks') },
    { label: 'Live Market Data', href: '/live' },
    { label: 'Tax Converters', href: '/tools' },
    { label: 'JSON API Directory', href: '/s/directory' },
  ];
}

/** Use `<a>` for same-document hashes, `Link` for routes with query strings. */
export function isHashOnlyHref(href: string): boolean {
  return href.startsWith('#');
}
