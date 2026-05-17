import type { NewsroomCategory } from './types';

export const CATEGORY_MEDIA: Record<NewsroomCategory, string> = {
  'REGULATORY COMPLIANCE':
    'linear-gradient(145deg, color-mix(in srgb, var(--surface-elevated) 88%, #1a1510) 0%, color-mix(in srgb, var(--accent-warm) 22%, var(--surface)) 100%)',
  'WEALTH-TECH SCALING':
    'linear-gradient(145deg, color-mix(in srgb, var(--surface-elevated) 90%, #141810) 0%, color-mix(in srgb, var(--accent-warm) 16%, var(--surface)) 100%)',
  'MARKET INTELLIGENCE':
    'linear-gradient(145deg, color-mix(in srgb, var(--surface-elevated) 88%, #121418) 0%, color-mix(in srgb, var(--accent-warm) 18%, var(--surface)) 100%)',
};

const CATEGORY_KEYWORDS: Record<NewsroomCategory, string[]> = {
  'REGULATORY COMPLIANCE': [
    'fca',
    'regulator',
    'compliance',
    'consumer duty',
    'audit',
    'gdpr',
    'mifid',
    'regulation',
    'supervisory',
  ],
  'WEALTH-TECH SCALING': [
    'fintech',
    'wealthtech',
    'platform',
    'infrastructure',
    'cloud',
    'soc',
    'inference',
    'api',
    'scale',
    'digital',
  ],
  'MARKET INTELLIGENCE': [
    'market',
    'allocation',
    'portfolio',
    'rates',
    'bond',
    'equity',
    'etf',
    'aum',
    'adviser',
    'advisor',
    'hnwi',
    'difc',
  ],
};

/** Classify RSS headline + source into one of three institutional lanes. */
export function classifyNewsroomCategory(title: string, source = ''): NewsroomCategory {
  const hay = `${title} ${source}`.toLowerCase();
  const scores: Record<NewsroomCategory, number> = {
    'REGULATORY COMPLIANCE': 0,
    'WEALTH-TECH SCALING': 0,
    'MARKET INTELLIGENCE': 0,
  };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    NewsroomCategory,
    string[],
  ][]) {
    for (const kw of keywords) {
      if (hay.includes(kw)) scores[category] += 1;
    }
  }

  const ranked = (Object.keys(scores) as NewsroomCategory[]).sort((a, b) => scores[b] - scores[a]);
  if (scores[ranked[0]] > 0) return ranked[0];
  return 'MARKET INTELLIGENCE';
}

const OFF_TOPIC_TITLE = /\b(crypto\s*ticker|meme\s*coin|airdrop|nft\s*drop|shiba|dogecoin)\b/i;

const UK_WEALTH_CONTEXT = [
  'wealth',
  'advis',
  'portfolio',
  'fintech',
  'fca',
  'pension',
  'invest',
  'asset',
  'bank',
  'platform',
  'duty',
  'compliance',
  'regulat',
  'uk ',
  'british',
  'hmrc',
  'ifa',
  'hnwi',
];

/** Drop headlines that are unlikely to serve IFA/HNWI readers. */
export function isRelevantWealthHeadline(title: string, source = ''): boolean {
  const hay = `${title} ${source}`.toLowerCase();
  if (OFF_TOPIC_TITLE.test(hay)) return false;

  const allKeywords = Object.values(CATEGORY_KEYWORDS).flat();
  if (allKeywords.some((kw) => hay.includes(kw))) return true;
  return UK_WEALTH_CONTEXT.some((token) => hay.includes(token));
}

export function tagsForCategory(category: NewsroomCategory): string[] {
  switch (category) {
    case 'REGULATORY COMPLIANCE':
      return ['fca', 'compliance', 'data'];
    case 'WEALTH-TECH SCALING':
      return ['stateless', 'fintech', 'infra'];
    case 'MARKET INTELLIGENCE':
      return ['wealthmanagement', 'difc', 'allocation'];
  }
}
