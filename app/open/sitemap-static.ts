/**
 * Sitemap: Static Pages — Open Portfolio (B2B developer/infrastructure surface)
 *
 * Lists B2B URLs under www.openportfolio.co.uk via OPEN_ALIAS_ROUTES (host-aware
 * middleware rewrite). Wealth-manager routes remain on the Pocket sitemap at
 * app/sitemap-static.ts.
 *
 * Routes mirror OPEN_ALIAS_ROUTES in lib/canonical-claims.ts.
 */

import { MetadataRoute } from 'next';
import { OPEN_ALIAS_ROUTES, OPEN_URLS } from '../../lib/canonical-claims';

export default async function openSitemapStatic(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  return [
    {
      url: OPEN_URLS.home,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...OPEN_ALIAS_ROUTES.map((route) => ({
      url: route.openUrl,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: priorityForRoute(route.path),
    })),
    {
      url: `${OPEN_URLS.home}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.88,
    },
  ];
}

function priorityForRoute(path: string): number {
  // High-intent institutional surfaces get top priority on the O. sitemap.
  switch (path) {
    case '/tier1designpartner':
    case '/board-of-investors':
      return 0.95;
    case '/designchallenge':
      return 0.92;
    case '/architecture':
    case '/openbrokercsv':
    case '/static/csv-etoro-to-openbrokercsv':
    case '/static/portfolio-tracker':
    case '/static/why-we-are-fast':
      return 0.9;
    case '/sovereign-ai-grant':
      return 0.88;
    case '/learn/sovereign-stack':
    case '/learn/sovereign-finance':
    case '/learn/local-first':
      return 0.85;
    case '/learn/vendor-lock-in':
    case '/playbooks/sovereign-strike':
    case '/stack-reveal':
      return 0.8;
    default:
      return 0.7;
  }
}
