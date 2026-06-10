/**
 * Host detection for the dual-surface architecture (Pocket vs Open).
 * Used by middleware (Edge), server components (headers()), and client chrome
 * (TabBar, GlobalFooter) that sit outside the Open route-group layout.
 */

import { OPEN_ALIAS_ROUTES, OPEN_HOSTS } from './canonical-claims';

const OPEN_HOSTS_DEV = ['open.localhost', 'www.open.localhost'] as const;
const POCKET_HOSTS_DEV = ['localhost', '127.0.0.1'] as const;

/** Local machine hosts — works with `npm run dev` and local `npm start` (NODE_ENV=production). */
export function isLocalOpenDevHost(host: string): boolean {
  const h = host.split(':')[0].toLowerCase();
  return (OPEN_HOSTS_DEV as readonly string[]).includes(h);
}

export function isLocalPocketDevHost(host: string): boolean {
  const h = host.split(':')[0].toLowerCase();
  return (POCKET_HOSTS_DEV as readonly string[]).includes(h);
}

function localDevPort(): string {
  return process.env.PORT ?? '3001';
}

export function isOpenPortfolioHost(host: string): boolean {
  const h = host.split(':')[0].toLowerCase();
  if ((OPEN_HOSTS as readonly string[]).includes(h)) return true;
  if (isLocalOpenDevHost(host)) return true;
  return false;
}

/** Consumer (Pocket) base URL for cross-surface links — dev-aware. */
export function pocketSurfaceBaseUrl(host: string): string {
  if (isLocalOpenDevHost(host) || isLocalPocketDevHost(host)) {
    return `http://localhost:${localDevPort()}`;
  }
  return 'https://www.pocketportfolio.app';
}

/** B2B (Open) base URL for cross-surface links — dev-aware. */
export function openSurfaceBaseUrl(host: string): string {
  if (isLocalOpenDevHost(host) || isLocalPocketDevHost(host)) {
    return `http://open.localhost:${localDevPort()}`;
  }
  return 'https://www.openportfolio.co.uk';
}

/** Paths that belong on the consumer surface only — redirect from O. host to Pocket. */
export const POCKET_ONLY_PATH_PREFIXES = [
  '/features/',
  '/positions',
  '/dashboard',
  '/watchlist',
  '/import',
  '/settings',
  '/sponsor',
  '/checkout',
  '/login',
  '/register',
  '/join',
  '/waitlist',
  '/retrieve-api-key',
  '/tools/',
  '/s/',
  '/live',
  '/for/advisors',
  '/challenge',
  '/admin',
  '/api-keys',
  '/privacy',
  '/terms',
] as const;

export function isPocketOnlyMarketingPath(pathname: string): boolean {
  return POCKET_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix),
  );
}

/** Static public assets must not be rewritten to /open/* on the O. host. */
export const OPEN_STATIC_ASSET_PREFIXES = [
  '/marketing/',
  '/book-assets/',
  '/images/',
  '/brand/',
  '/icon-',
  '/og/',
  '/open/og/',
  /** Landing PNG/SVG lives under public/open/landing — must not hit /open/* → strip-/open redirect in middleware. */
  '/open/landing/',
  '/fonts/',
  '/favicon',
] as const;

/** True for files under public/press/* (not HTML routes like /press/abba-lawal). */
function isPressPublicFolderAsset(pathname: string): boolean {
  if (!pathname.startsWith('/press/')) return false;
  return /\.(?:png|jpe?g|webp|avif|gif|svg|ico|pdf)$/i.test(pathname);
}

export function isOpenStaticAssetPath(pathname: string): boolean {
  if (isPressPublicFolderAsset(pathname)) return true;
  return OPEN_STATIC_ASSET_PREFIXES.some((p) => pathname.startsWith(p));
}

/** Paths that have a real page under app/open/ (or /blog/*). Unknown paths show the O. not-found — no silent Pocket redirect. */
const OPEN_EXACT_PATHS = new Set<string>([
  '/',
  '/blog',
  ...OPEN_ALIAS_ROUTES.map((r) => r.path),
]);

/**
 * True when middleware should rewrite to /open/* on the B2B host.
 * Prevents /open/sponsor-style ghosts when aliased Pocket pages link to consumer routes.
 */
/** Glossary term slugs under /learn/* (hub is an exact OPEN_ALIAS route). */
export const OPEN_LEARN_GLOSSARY_SLUGS = [
  'portfolio-beta',
  'sector-drift',
  'fee-drag',
  'sovereign-stack',
  'sovereign-finance',
  'realised-vs-unrealised',
  'dollar-cost-averaging',
  'local-first',
  'vendor-lock-in',
  'json-finance',
] as const;

export type OpenLearnGlossarySlug = (typeof OPEN_LEARN_GLOSSARY_SLUGS)[number];

export function isOpenLearnGlossaryPath(pathname: string): boolean {
  if (!pathname.startsWith('/learn/')) return false;
  const slug = pathname.slice('/learn/'.length).replace(/\/$/, '');
  if (!slug || slug.includes('/')) return false;
  return (OPEN_LEARN_GLOSSARY_SLUGS as readonly string[]).includes(slug);
}

export function isOpenSurfaceRoute(pathname: string): boolean {
  if (OPEN_EXACT_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/blog/') && pathname.length > '/blog/'.length) return true;
  if (isOpenLearnGlossaryPath(pathname)) return true;
  return false;
}

/** Local O. dev host — cross-surface redirect loops if Next collapses Location to a relative path. */
export function isDevOpenLocalHostname(host: string): boolean {
  return isLocalOpenDevHost(host);
}
