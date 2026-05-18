export interface ParsedRssItem {
  title: string;
  url: string;
  source: string;
  sourceSiteUrl: string | null;
  publishedAt: string;
  image: string | null;
}

export function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

function extractImage(xml: string): string | null {
  const patterns = [
    /<media:content[^>]*\burl="([^"]+)"[^>]*>/i,
    /<media:thumbnail[^>]*\burl="([^"]+)"[^>]*>/i,
    /<enclosure[^>]*\burl="([^"]+)"[^>]*\btype="image[^"]*"[^>]*>/i,
    /<enclosure[^>]*\btype="image[^"]*"[^>]*\burl="([^"]+)"[^>]*>/i,
  ];
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractSourceSiteUrl(xml: string): string | null {
  const match = xml.match(/<source[^>]*\burl="([^"]+)"/i);
  return match?.[1]?.trim() || null;
}

function parsePubDate(raw: string): string {
  if (!raw.trim()) return new Date().toISOString();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function parseRssFeed(xml: string, feedLabel: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const parts = xml.split(/<item>/i).slice(1).map((x) => x.split(/<\/item>/i)[0]);

  for (const item of parts) {
    const title = extractText(item, 'title');
    let link = extractText(item, 'link') || extractText(item, 'guid');
    if (!title || !link) continue;

    if (link.includes('news.google.com/rss/articles/')) {
      try {
        const url = new URL(link);
        const direct = url.searchParams.get('url');
        if (direct) link = direct;
      } catch {
        /* keep redirect */
      }
    }

    const publishedAt = extractText(item, 'pubDate') || extractText(item, 'published');
    const sourceSiteUrl = extractSourceSiteUrl(item);
    items.push({
      title,
      url: link,
      source: extractText(item, 'source') || extractDomain(link) || feedLabel,
      sourceSiteUrl,
      publishedAt: parsePubDate(publishedAt),
      image: extractImage(item),
    });
  }

  return items;
}
