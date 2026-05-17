/**
 * B2C marketing IA (Pocket Portfolio):
 * Terminal | For Advisors | Mission | FIN Pillars | Tools | Blog | FAQ | News Room.
 * B2B developer bridge lives in SurfaceSwitcher (Open Portfolio), not primary nav.
 * Used by landing (`/`, `/landing`) and ProductionNavbar (`/s/*`, tools, learn, etc.).
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

function newsRoomHref(pathname: string, utmContext: 'landing' | 'site'): string {
  if (isMarketingLandingPath(pathname)) {
    return landingHash(pathname, 'news-room');
  }
  const q =
    utmContext === 'landing'
      ? 'utm_source=landing&utm_medium=nav&utm_campaign=news_room'
      : 'utm_source=navbar&utm_medium=global&utm_campaign=news_room';
  return `/newsroom?${q}`;
}

function blogHref(utmContext: 'landing' | 'site'): string {
  const q =
    utmContext === 'landing'
      ? 'utm_source=landing&utm_medium=nav&utm_campaign=blog'
      : 'utm_source=navbar&utm_medium=global&utm_campaign=blog';
  return `/blog?${q}`;
}

/** FAQ and News Room render after the Tools dropdown; core items are everything before them. */
export function splitSovereignPrimaryNav(nav: SovereignNavItem[]) {
  const newsRoomItem = nav[nav.length - 1]!;
  const faqItem = nav[nav.length - 2]!;
  const coreNav = nav.slice(0, -2);
  return { coreNav, faqItem, newsRoomItem };
}

// Partners dropdown is handled in ProductionNavbar (portal dropdown) because it is not a single href.

export function sovereignPrimaryNav(
  pathname: string,
  utmContext: 'landing' | 'site' = 'site'
): SovereignNavItem[] {
  const L = (hash: string) => landingHash(pathname, hash);
  return [
    { label: 'Terminal', href: L('#features') },
    { label: 'For Advisors', href: '/for/advisors' },
    { label: 'Mission', href: L('#mission') },
    { label: 'FIN Pillars', href: L('#fin-pillars') },
    { label: 'Blog', href: blogHref(utmContext) },
    { label: 'FAQ', href: L('#faq') },
    { label: 'News Room', href: newsRoomHref(pathname, utmContext) },
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
