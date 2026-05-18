import type { ParsedRssItem } from './parse-rss';

const GOOGLE_NEWS_ARTICLE = /news\.google\.com\/rss\/articles\//i;

/** Prefer publisher article URLs; Google News items link to a title-specific search. */
export function resolveBriefingHref(item: ParsedRssItem): string {
  const link = item.url.trim();
  if (!link) {
    return publisherFallback(item);
  }

  if (!GOOGLE_NEWS_ARTICLE.test(link)) {
    return link;
  }

  try {
    const url = new URL(link);
    const direct = url.searchParams.get('url');
    if (direct && direct.startsWith('http')) return direct;
  } catch {
    /* keep resolving */
  }

  const q = encodeURIComponent(item.title.trim());
  return `https://news.google.com/search?q=${q}&hl=en-GB&gl=GB&ceid=GB:en`;
}

function publisherFallback(item: ParsedRssItem): string {
  if (item.sourceSiteUrl?.startsWith('http')) return item.sourceSiteUrl;
  const q = encodeURIComponent(item.title.trim());
  return `https://news.google.com/search?q=${q}&hl=en-GB&gl=GB&ceid=GB:en`;
}
