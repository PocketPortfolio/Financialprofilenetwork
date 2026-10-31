import type { Metadata } from 'next';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

/**
 * Shared social card for www.openportfolio.co.uk.
 *
 * Next.js replaces the entire `openGraph` / `twitter` object when a child
 * segment sets it — parent images/titles are NOT inherited. Every Open page
 * that exports those keys must use `openPageSocial` (or spread these helpers).
 *
 * `?v=` busts X/Twitter's ~7-day card cache when the asset URL must change.
 * Static PNG (not /api/og) so scrapers cache without hitting the dynamic route.
 */
export const OPEN_OG_IMAGE_URL = `${OPEN_URLS.home}/open/og/open-portfolio-default.png?v=2`;

export const openOgImage = {
  images: [
    {
      url: OPEN_OG_IMAGE_URL,
      secureUrl: OPEN_OG_IMAGE_URL,
      width: 1200,
      height: 630,
      alt: `${SURFACE_ORG.open.name} — The Sovereign Ingestion & Inference Layer`,
      type: 'image/png' as const,
    },
  ],
};

export const openTwitterImage = {
  images: [OPEN_OG_IMAGE_URL],
};

const TWITTER_SITE = '@OIntelligenceUK' as const;

/** Page-level Open Graph + X card — keeps LinkedIn and X in sync. */
export function openPageSocial(opts: {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article' | 'profile';
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      ...openOgImage,
      title: opts.title,
      description: opts.description,
      url: opts.url,
      siteName: SURFACE_ORG.open.name,
      type: opts.type ?? 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_SITE,
      creator: TWITTER_SITE,
      title: opts.title,
      description: opts.description,
      ...openTwitterImage,
    },
  };
}
