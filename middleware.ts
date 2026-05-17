import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isOpenStaticAssetPath,
  isOpenSurfaceRoute,
  isPocketOnlyMarketingPath,
  pocketSurfaceBaseUrl,
} from '@/lib/surface-host';

// Open Portfolio (B2B) host gate — see lib/canonical-claims.ts (OPEN_HOSTS, OPEN_CANONICAL_HOST).
// Inlined here so middleware stays in Edge runtime with zero module-graph overhead.
const OPEN_HOSTS_PRODUCTION = [
  'openportfolio.co.uk',
  'www.openportfolio.co.uk',
  'openportfolio.uk',
  'www.openportfolio.uk',
] as const;
/** Production canonical apex for the O. surface. */
const OPEN_CANONICAL_HOST_PRODUCTION = 'www.openportfolio.co.uk';
/**
 * Local dev only: open.localhost resolves to 127.0.0.1 in Chrome/Edge/Firefox
 * without editing the hosts file. Use http://open.localhost:3001 for O. and
 * http://localhost:3001 for Pocket. Alternatively browse http://localhost:3001/open/*
 */
const OPEN_HOSTS_DEV = ['open.localhost', 'www.open.localhost'] as const;
const OPEN_CANONICAL_HOST_DEV = 'open.localhost';

function isDevOpenLocalHost(host: string): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    (host === 'open.localhost' || host === 'www.open.localhost')
  );
}

function isOpenHost(host: string): boolean {
  if ((OPEN_HOSTS_PRODUCTION as readonly string[]).includes(host)) return true;
  return isDevOpenLocalHost(host);
}

function openCanonicalHost(requestHost: string): string {
  if (isDevOpenLocalHost(requestHost)) return OPEN_CANONICAL_HOST_DEV;
  return OPEN_CANONICAL_HOST_PRODUCTION;
}
const OPEN_SPECIAL_FILES: ReadonlySet<string> = new Set([
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
]);

/** Middleware rewrite target — page calls notFound() → app/open/not-found.tsx. */
const OPEN_NOT_FOUND_REWRITE = '/open/__not-a-b2b-route__';

export function middleware(request: NextRequest) {
  // Canonical host: apex → www so referral sessionStorage + cookies stay on one origin (ref survives signup).
  // Lowercase: Host is case-insensitive; mismatched casing must not skip OPEN_HOSTS matching (would mis-route).
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase() ?? '';
  if (host === 'pocketportfolio.app') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.pocketportfolio.app';
    return NextResponse.redirect(url, 307);
  }

  // Open Portfolio (B2B surface): path-fork before any P.-specific logic runs.
  // Any O. host other than the canonical apex 307-redirects to www.openportfolio.co.uk.
  // The canonical host gets an internal rewrite to /open/<path> so the Next.js
  // route group at app/open/ handles the request with O. chrome + metadata.
  if (isOpenHost(host)) {
    const openCanonical = openCanonicalHost(host);
    if (host !== openCanonical) {
      const url = request.nextUrl.clone();
      url.hostname = openCanonical;
      return NextResponse.redirect(url, 307);
    }

    const pathname = request.nextUrl.pathname;
    const hostHeader = request.headers.get('host') ?? '';

    // Public-folder assets (/book-assets, /images, /brand, …) must not rewrite to
    // /open/* — that 404s figures on aliased pages (e.g. /designchallenge).
    if (isOpenStaticAssetPath(pathname)) {
      return NextResponse.next();
    }

    // On the O. host, the implementation-detail `/open/*` URLs must canonicalize
    // back to the bare path so search engines don't index both /architecture
    // and /open/architecture. 308 preserves method semantics.
    if (pathname === '/open' || pathname.startsWith('/open/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/open' ? '/' : pathname.replace(/^\/open/, '');
      return NextResponse.redirect(url, 308);
    }

    // Static files (robots/llms/sitemap) get rewritten to /open/<file> so the
    // O. surface serves its own indexing artifacts at the root path.
    if (OPEN_SPECIAL_FILES.has(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `/open${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Consumer-only routes (linked from /learn etc.). Production: 307 to Pocket apex.
    // Dev open.localhost: serve the same Next routes without redirect — middleware collapses
    // same-deployment redirects to `Location: /path`, causing ERR_TOO_MANY_REDIRECTS.
    if (!isOpenSurfaceRoute(pathname) && isPocketOnlyMarketingPath(pathname)) {
      if (host === 'open.localhost' || host === 'www.open.localhost') {
        return NextResponse.next();
      }
      const pocketOrigin = pocketSurfaceBaseUrl(hostHeader);
      const absoluteDest = `${pocketOrigin.replace(/\/$/, '')}${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(absoluteDest, 307);
    }

    // Only known B2B routes rewrite into app/open/. Pocket is reached via SurfaceSwitcher only.
    if (!isOpenSurfaceRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = OPEN_NOT_FOUND_REWRITE;
      return NextResponse.rewrite(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = `/open${pathname}`;
    return NextResponse.rewrite(url);
  }

  // On the Pocket Portfolio host, /open/* is the implementation detail of the
  // O. surface — it must not be directly browsable so search engines can't
  // index duplicate content under pocketportfolio.app/open/*. Redirect any
  // such hit to the openportfolio.co.uk canonical equivalent.
  // In development, localhost and 127.0.0.1 may browse /open/* directly
  // (http://localhost:3001/open/architecture) without a cross-domain redirect.
  const isLocalDevPocketHost =
    process.env.NODE_ENV === 'development' &&
    (host === 'localhost' || host === '127.0.0.1');
  if (
    !isLocalDevPocketHost &&
    (host === 'www.pocketportfolio.app' || host === 'pocketportfolio.app') &&
    request.nextUrl.pathname.startsWith('/open/')
  ) {
    const url = request.nextUrl.clone();
    url.hostname = OPEN_CANONICAL_HOST_PRODUCTION;
    url.pathname = request.nextUrl.pathname.replace(/^\/open/, '') || '/';
    return NextResponse.redirect(url, 308);
  }
  // Also handle the bare /open landing prefix on the Pocket host.
  if (
    !isLocalDevPocketHost &&
    (host === 'www.pocketportfolio.app' || host === 'pocketportfolio.app') &&
    request.nextUrl.pathname === '/open'
  ) {
    const url = request.nextUrl.clone();
    url.hostname = OPEN_CANONICAL_HOST_PRODUCTION;
    url.pathname = '/';
    return NextResponse.redirect(url, 308);
  }

  // Rewrite programmatic risk pages: /tools/track-{ticker}-risk -> /tools/track/{ticker}
  // Remove "-risk" suffix so route folder track-[ticker] can match with ticker param
  // Only match the original URL pattern, not the rewritten one (avoid infinite loop)
  const riskPageMatch = request.nextUrl.pathname.match(/^\/tools\/track-([a-z0-9]+)-risk$/i);

  if (riskPageMatch) {
    const ticker = riskPageMatch[1];
    const url = request.nextUrl.clone();
    // Rewrite to /tools/track/{ticker} (without -risk suffix)
    url.pathname = `/tools/track/${ticker}`;

    return NextResponse.rewrite(url);
  }

  // Allow OG image route to be accessed by social media crawlers with CORS
  if (request.nextUrl.pathname === '/api/og') {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }

  // Handle sitemap files: Set proper cache headers (Googlebot-friendly)
  // Skip CSP and security headers, but add Cache-Control for sitemaps
  if (
    request.nextUrl.pathname === '/sitemap.xml' || 
    (request.nextUrl.pathname.startsWith('/sitemap-') && 
     (request.nextUrl.pathname.endsWith('.xml') || request.nextUrl.pathname.endsWith('.xml.gz')))
  ) {
    const response = NextResponse.next();
    // Set proper cache headers for sitemaps (24h cache, no revalidation)
    // This prevents Googlebot timeouts on large files
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    response.headers.set('Content-Type', 'application/xml; charset=utf-8');
    return response;
  }
  
  // Skip middleware for robots.txt and llms.txt (no cache headers needed)
  if (
    request.nextUrl.pathname === '/robots.txt' || 
    request.nextUrl.pathname === '/llms.txt' ||
    request.nextUrl.pathname.startsWith('/api/sitemap/')
  ) {
    return NextResponse.next();
  }
  
  const res = NextResponse.next();
  
  // Skip security headers in development to avoid CSP issues with Next.js dev server
  // Also skip for _next routes which need unsafe-eval for React refresh
  if (process.env.NODE_ENV === 'development' || request.nextUrl.pathname.startsWith('/_next/')) {
    return res;
  }
  
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com https://apis.google.com https://accounts.google.com https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "media-src 'self' https://res.cloudinary.com",
      "connect-src 'self' https://*.googleapis.com https://*.finance.yahoo.com https://stooq.com https://region1.google-analytics.com https://*.google-analytics.com https://www.google-analytics.com https://firebaseinstallations.googleapis.com https://*.firebaseinstallations.googleapis.com https://www.googletagmanager.com https://securetoken.google.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://apis.google.com https://accounts.google.com https://www.gstatic.com https://api.stripe.com https://checkout.stripe.com https://www.google.com",
      "frame-src 'self' https://accounts.google.com https://content.googleapis.com https://pocket-portfolio-67fa6.firebaseapp.com https://checkout.stripe.com https://js.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com"
    ].join('; ')
  );
  
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - brand/public folder
     * - api/ (API routes)
     *
     * sitemap.xml / robots.txt / llms.txt are intentionally NOT excluded:
     * the Open Portfolio host gate above rewrites them to /open/<file> so
     * the O. surface can serve its own indexing artifacts. The existing
     * P.-only handlers (cache headers for sitemaps; pass-through for robots/llms)
     * still run for the Pocket host as before.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|brand|public|api|book-assets|images|fonts|icon-).*)',
  ],
};

