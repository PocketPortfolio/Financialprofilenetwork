import type { NewsroomCategory } from './types';

/** Local SVG hero art — always available (Google News RSS has no thumbnails). */
export const CATEGORY_ART_URL: Record<NewsroomCategory, string> = {
  'REGULATORY COMPLIANCE': '/newsroom/art/regulatory-compliance.svg',
  'WEALTH-TECH SCALING': '/newsroom/art/wealth-tech-scaling.svg',
  'MARKET INTELLIGENCE': '/newsroom/art/market-intelligence.svg',
};

export function publisherLogoUrl(sourceSiteUrl: string | null | undefined): string | null {
  if (!sourceSiteUrl) return null;
  try {
    const host = new URL(sourceSiteUrl).hostname.replace(/^www\./i, '');
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}
