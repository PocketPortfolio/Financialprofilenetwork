import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

/**
 * Shared Open Graph card for www.openportfolio.co.uk.
 *
 * Next.js replaces the entire `openGraph` object when a child segment sets it —
 * parent `images` are NOT inherited. Every Open page that exports `openGraph`
 * must spread `openOgImage` or LinkedIn/Slack/WhatsApp previews render blank.
 *
 * Static PNG (not /api/og) so scrapers cache without hitting the dynamic route.
 */
export const OPEN_OG_IMAGE_URL = `${OPEN_URLS.home}/open/og/open-portfolio-default.png`;

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
