/**
 * pSEO Infrastructure - Type Definitions
 * Core types for programmatic SEO data layer
 */

export interface TickerMetadata {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  description: string;
  keywords: string[];
  relatedTickers: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  contentTemplate: 'default' | 'tech' | 'finance' | 'crypto' | 'etf';
}

export interface ExchangeMetadata {
  code: string;
  name: string;
  region: string;
  country: string;
  description: string;
  popularTickers: string[];
  keywords: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface SectorMetadata {
  name: string;
  description: string;
  tickers: string[];
  keywords: string[];
}

export interface InternalLink {
  url: string;
  anchor: string;
  type: 'ticker' | 'exchange' | 'sector' | 'broker';
  priority: number;
}

export interface PageContent {
  title: string;
  description: string;
  h1: string;
  h2: string[];
  body: string;
  cta: {
    text: string;
    url: string;
  };
  internalLinks: InternalLink[];
  structuredData: Record<string, any>;
}


















