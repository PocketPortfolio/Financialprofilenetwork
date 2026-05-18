import {
  classifyNewsroomCategory,
  isRelevantWealthHeadline,
  tagsForCategory,
  CATEGORY_MEDIA,
} from './categories';
import { MAX_BRIEFING_AGE_HOURS } from './constants';
import { CATEGORY_ART_URL, publisherLogoUrl } from './category-art';
import { CURATED_NEWS_FEEDS } from './feeds';
import { parseRssFeed, type ParsedRssItem } from './parse-rss';
import { resolveBriefingHref } from './resolve-href';
import type { NewsroomBriefing, NewsroomCategory, NewsroomPayload } from './types';

/** Supplemental Google News queries when curated feeds are thin. */
const GOOGLE_NEWS_QUERIES: { query: string; preferredCategory?: NewsroomCategory }[] = [
  { query: 'FCA consumer duty UK wealth management', preferredCategory: 'REGULATORY COMPLIANCE' },
  { query: 'UK financial advisor regulation', preferredCategory: 'REGULATORY COMPLIANCE' },
  { query: 'wealth tech fintech UK', preferredCategory: 'WEALTH-TECH SCALING' },
  { query: 'UK asset allocation advisers', preferredCategory: 'MARKET INTELLIGENCE' },
];

const PER_CATEGORY = 2;
const MAX_BRIEFINGS = 6;

function isFreshEnough(publishedAt: string): boolean {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  return ageMs <= MAX_BRIEFING_AGE_HOURS * 60 * 60 * 1000;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function snippetFromTitle(title: string, source: string): string {
  const base = title.trim();
  if (base.length >= 120) return `${base.slice(0, 117)}…`;
  return `${base} — ${source}`;
}

function toBriefing(item: ParsedRssItem, category: NewsroomCategory): NewsroomBriefing {
  const href = resolveBriefingHref(item);
  return {
    id: slugify(`${category}-${item.title}-${href}`),
    category,
    title: item.title,
    snippet: snippetFromTitle(item.title, item.source),
    tags: tagsForCategory(category),
    href,
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.image,
    categoryArtUrl: CATEGORY_ART_URL[category],
    publisherLogoUrl: publisherLogoUrl(item.sourceSiteUrl),
    mediaBackground: CATEGORY_MEDIA[category],
  };
}

async function fetchRss(url: string, label: string): Promise<ParsedRssItem[]> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (PocketPortfolio/Newsroom)',
      Accept: 'application/rss+xml,application/xml,text/xml,*/*',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    console.warn(`[newsroom] RSS ${label} HTTP ${response.status}`);
    return [];
  }
  const xml = await response.text();
  return parseRssFeed(xml, label);
}

async function fetchGoogleNewsRss(query: string): Promise<ParsedRssItem[]> {
  const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
  return fetchRss(newsUrl, 'Google News');
}

function collectCandidates(
  items: ParsedRssItem[],
  preferredCategory: NewsroomCategory | undefined,
  byHref: Map<string, { item: ParsedRssItem; category: NewsroomCategory }>,
): void {
  for (const item of items) {
    if (!isFreshEnough(item.publishedAt)) continue;
    if (!isRelevantWealthHeadline(item.title, item.source)) continue;
    const href = resolveBriefingHref(item);
    if (byHref.has(href)) continue;
    const category = preferredCategory ?? classifyNewsroomCategory(item.title, item.source);
    byHref.set(href, { item, category });
  }
}

/** Fetch curated publisher RSS + supplemental Google News; balance three lanes. */
export async function ingestNewsroomBriefings(): Promise<NewsroomPayload> {
  const byHref = new Map<string, { item: ParsedRssItem; category: NewsroomCategory }>();

  const curatedResults = await Promise.all(
    CURATED_NEWS_FEEDS.map(async (feed) => ({
      feed,
      items: await fetchRss(feed.url, feed.label),
    })),
  );

  for (const { feed, items } of curatedResults) {
    collectCandidates(items, feed.preferredCategory, byHref);
  }

  if (byHref.size < MAX_BRIEFINGS) {
    const googleResults = await Promise.all(
      GOOGLE_NEWS_QUERIES.map(async ({ query, preferredCategory }) => ({
        preferredCategory,
        items: await fetchGoogleNewsRss(query),
      })),
    );
    for (const { items, preferredCategory } of googleResults) {
      collectCandidates(items, preferredCategory, byHref);
    }
  }

  const sorted = [...byHref.values()].sort(
    (a, b) => new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime(),
  );

  const buckets: Record<NewsroomCategory, NewsroomBriefing[]> = {
    'REGULATORY COMPLIANCE': [],
    'WEALTH-TECH SCALING': [],
    'MARKET INTELLIGENCE': [],
  };

  for (const { item, category: preferred } of sorted) {
    const lane = classifyNewsroomCategory(item.title, item.source);
    const target = buckets[lane].length < PER_CATEGORY ? lane : preferred;
    if (buckets[target].length >= PER_CATEGORY) continue;
    if (buckets[target].some((b) => b.href === resolveBriefingHref(item))) continue;
    buckets[target].push(toBriefing(item, target));
  }

  const briefings = Object.values(buckets).flat().slice(0, MAX_BRIEFINGS);

  return {
    updatedAt: new Date().toISOString(),
    briefings,
    source: briefings.length > 0 ? 'google-news-rss' : 'unavailable',
  };
}
