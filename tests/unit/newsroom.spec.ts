import { describe, expect, it } from 'vitest';
import {
  classifyNewsroomCategory,
  isRelevantWealthHeadline,
  tagsForCategory,
} from '../../lib/newsroom/categories';
import { parseRssFeed } from '../../lib/newsroom/parse-rss';

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
});
