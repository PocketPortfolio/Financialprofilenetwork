import { describe, expect, it } from 'vitest';
import {
  classifyNewsroomCategory,
  isRelevantWealthHeadline,
  tagsForCategory,
} from '../../lib/newsroom/categories';
import { parseRssFeed } from '../../lib/newsroom/parse-rss';
import { resolveBriefingHref } from '../../lib/newsroom/resolve-href';

describe('newsroom categories', () => {
  it('classifies FCA/compliance headlines', () => {
    expect(classifyNewsroomCategory('FCA fines firm over consumer duty data', 'Financial Times')).toBe(
      'REGULATORY COMPLIANCE',
    );
  });

  it('classifies fintech infra headlines', () => {
    expect(classifyNewsroomCategory('Wealth tech platform scales cloud API', 'Fintech Futures')).toBe(
      'WEALTH-TECH SCALING',
    );
  });

  it('filters off-topic crypto headlines', () => {
    expect(isRelevantWealthHeadline('CoinTracking: crypto tax tool launch', 'CryptoTicker')).toBe(
      false,
    );
    expect(
      isRelevantWealthHeadline('FCA consumer duty review for UK advisers', 'Professional Adviser'),
    ).toBe(true);
  });

  it('returns fintech tags per lane', () => {
    expect(tagsForCategory('REGULATORY COMPLIANCE')).toContain('fca');
    expect(tagsForCategory('MARKET INTELLIGENCE')).toContain('allocation');
  });
});

describe('parseRssFeed', () => {
  it('decodes HTML entities in titles (e.g. &#8217; apostrophe)', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>Greece&#8217;s Fintech Renaissance Supporting Economic Development</title>
      <link>https://example.com/greece-fintech</link>
      <pubDate>Mon, 04 Jun 2026 10:00:00 GMT</pubDate>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'Example');
    expect(items[0].title).toBe(
      "Greece's Fintech Renaissance Supporting Economic Development",
    );
  });

  it('extracts title and link from minimal RSS', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Test headline</title>
          <link>https://example.com/article</link>
          <pubDate>Mon, 17 May 2026 10:00:00 GMT</pubDate>
        </item>
      </channel></rss>`;
    const items = parseRssFeed(xml, 'Example');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Test headline');
    expect(items[0].url).toBe('https://example.com/article');
  });

  it('extracts source site url from Google News items', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>Test</title>
      <link>https://example.com/article</link>
      <source url="https://www.professionaladviser.com">Professional Adviser</source>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'Example');
    expect(items[0].sourceSiteUrl).toBe('https://www.professionaladviser.com');
  });

  it('extracts direct FCA article links', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>FCA press release</title>
      <link>https://www.fca.org.uk/news/press-releases/example-story</link>
      <pubDate>Mon, 18 May 2026 10:00:00 GMT</pubDate>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'FCA');
    expect(resolveBriefingHref(items[0])).toBe(
      'https://www.fca.org.uk/news/press-releases/example-story',
    );
  });

  it('extracts hero image from content:encoded img tags', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>Wealth tech headline</title>
      <link>https://example.com/article</link>
      <pubDate>Mon, 25 May 2026 10:00:00 GMT</pubDate>
      <content:encoded><![CDATA[<p><img src="https://cdn.example.com/uploads/hero-photo.jpg" alt="" /></p>]]></content:encoded>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'Example');
    expect(items[0].image).toBe('https://cdn.example.com/uploads/hero-photo.jpg');
  });

  it('prefers media:content image over inline logos in description', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>Market headline</title>
      <link>https://example.com/story</link>
      <pubDate>Mon, 25 May 2026 10:00:00 GMT</pubDate>
      <media:content url="https://cdn.example.com/featured.jpg" medium="image" />
      <description><![CDATA[<img src="https://cdn.example.com/logo-100x100.png" />]]></description>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'Example');
    expect(items[0].image).toBe('https://cdn.example.com/featured.jpg');
  });
});

describe('resolveBriefingHref', () => {
  it('maps Google News article URLs to title search', () => {
    const item = {
      title: 'Revolut wins FCA approval',
      url: 'https://news.google.com/rss/articles/CBMiabc123?oc=5',
      source: 'TheBanker',
      sourceSiteUrl: 'https://www.thebanker.com',
      publishedAt: new Date().toISOString(),
      image: null,
    };
    const href = resolveBriefingHref(item);
    expect(href).toContain('news.google.com/search');
    expect(href).toContain(encodeURIComponent('Revolut wins FCA approval'));
  });
});
