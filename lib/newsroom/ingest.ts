import {
  classifyNewsroomCategory,
  isRelevantWealthHeadline,
  tagsForCategory,
  CATEGORY_MEDIA,
} from './categories';
import { MAX_BRIEFING_AGE_HOURS } from './constants';
import { CATEGORY_ART_URL, publisherLogoUrl } from './category-art';
import { parseRssFeed, type ParsedRssItem } from './parse-rss';
import type { NewsroomBriefing, NewsroomCategory, NewsroomPayload } from './types';
import { SEED_NEWSROOM_PAYLOAD } from './seed';

const RSS_QUERIES: { query: string; preferredCategory?: NewsroomCategory }[] = [
  { query: 'FCA consumer duty UK wealth management', preferredCategory: 'REGULATORY COMPLIANCE' },
  { query: 'UK financial advisor compliance regulation', preferredCategory: 'REGULATORY COMPLIANCE' },
  { query: 'wealth tech fintech UK platform', preferredCategory: 'WEALTH-TECH SCALING' },
  { query: 'portfolio software local first', preferredCategory: 'WEALTH-TECH SCALING' },
  { query: 'UK asset allocation wealth managers', preferredCategory: 'MARKET INTELLIGENCE' },
  { query: 'financial markets UK advisers', preferredCategory: 'MARKET INTELLIGENCE' },
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
  return `${base} — reported via ${source}.`;
}

function toBriefing(item: ParsedRssItem, category: NewsroomCategory): NewsroomBriefing {
  return {
    id: slugify(`${category}-${item.title}`),
    category,
    title: item.title,
    snippet: snippetFromTitle(item.title, item.source),
    tags: tagsForCategory(category),
    href: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.image,
    categoryArtUrl: CATEGORY_ART_URL[category],
    publisherLogoUrl: publisherLogoUrl(item.sourceSiteUrl),
    mediaBackground: CATEGORY_MEDIA[category],
  };
}

async function fetchGoogleNewsRss(query: string): Promise<ParsedRssItem[]> {
  const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
  const response = await fetch(newsUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (PocketPortfolio/Newsroom)',
      Accept: 'application/rss+xml,text/xml,*/*',
    },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return parseRssFeed(xml, 'Google News');
}

/** Fetch UK wealth/fintech RSS lanes and balance across three institutional categories. */
export async function ingestNewsroomBriefings(): Promise<NewsroomPayload> {
  const results = await Promise.all(
    RSS_QUERIES.map(async ({ query, preferredCategory }) => {
      const items = await fetchGoogleNewsRss(query);
      return items.map((item) => ({
        item,
        category: preferredCategory ?? classifyNewsroomCategory(item.title, item.source),
      }));
    }),
  );

  const byUrl = new Map<string, { item: ParsedRssItem; category: NewsroomCategory }>();
  for (const entry of results.flat()) {
    const { item } = entry;
    if (!isFreshEnough(item.publishedAt)) continue;
    if (!isRelevantWealthHeadline(item.title, item.source)) continue;
    if (!byUrl.has(item.url)) byUrl.set(item.url, entry);
  }

  const sorted = [...byUrl.values()].sort(
    (a, b) => new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime(),
  );

  const buckets: Record<NewsroomCategory, NewsroomBriefing[]> = {
    'REGULATORY COMPLIANCE': [],
    'WEALTH-TECH SCALING': [],
    'MARKET INTELLIGENCE': [],
  };

  for (const { item } of sorted) {
    const lane = classifyNewsroomCategory(item.title, item.source);
    if (buckets[lane].length >= PER_CATEGORY) continue;
    if (buckets[lane].some((b) => b.href === item.url)) continue;
    buckets[lane].push(toBriefing(item, lane));
  }

  let briefings = Object.values(buckets).flat().slice(0, MAX_BRIEFINGS);

  if (briefings.length < 3) {
    return {
      ...SEED_NEWSROOM_PAYLOAD,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    updatedAt: new Date().toISOString(),
    briefings,
    source: 'google-news-rss',
  };
}
