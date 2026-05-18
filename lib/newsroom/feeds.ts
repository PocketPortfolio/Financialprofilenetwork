import type { NewsroomCategory } from './types';

export interface CuratedNewsFeed {
  url: string;
  label: string;
  preferredCategory: NewsroomCategory;
}

/** Publisher RSS with direct article URLs (not Google News redirects). */
export const CURATED_NEWS_FEEDS: CuratedNewsFeed[] = [
  {
    url: 'https://www.fca.org.uk/news/rss.xml',
    label: 'FCA',
    preferredCategory: 'REGULATORY COMPLIANCE',
  },
  {
    url: 'https://www.moneymarketing.co.uk/feed/',
    label: 'Money Marketing',
    preferredCategory: 'MARKET INTELLIGENCE',
  },
  {
    url: 'https://thefintechtimes.com/feed/',
    label: 'The Fintech Times',
    preferredCategory: 'WEALTH-TECH SCALING',
  },
];
