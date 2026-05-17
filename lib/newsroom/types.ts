/** Institutional briefing card — homepage News Room & /newsroom index. */
export type NewsroomCategory =
  | 'REGULATORY COMPLIANCE'
  | 'WEALTH-TECH SCALING'
  | 'MARKET INTELLIGENCE';

export interface NewsroomBriefing {
  id: string;
  category: NewsroomCategory;
  title: string;
  snippet: string;
  tags: string[];
  href: string;
  source: string;
  publishedAt: string;
  imageUrl?: string | null;
  /** Local SVG hero (always rendered when RSS has no thumbnail). */
  categoryArtUrl: string;
  /** Publisher favicon from RSS &lt;source url&gt; when available. */
  publisherLogoUrl?: string | null;
  /** CSS gradient fallback behind art. */
  mediaBackground: string;
}

export interface NewsroomPayload {
  updatedAt: string;
  briefings: NewsroomBriefing[];
  source: 'google-news-rss' | 'seed' | 'kv-cache';
}
