import type { NewsroomBriefing, NewsroomPayload } from './types';
import { CATEGORY_MEDIA } from './categories';
import { CATEGORY_ART_URL, publisherLogoUrl } from './category-art';

export const SEED_BRIEFINGS: NewsroomBriefing[] = [
  {
    id: 'regulatory-compliance',
    category: 'REGULATORY COMPLIANCE',
    title: 'UK Wealth Platforms Face Consumer Duty Data Audits',
    snippet:
      'Supervisory focus shifts to provable data lineage across advice journeys — platforms must show how client records move from import to report without opaque warehousing.',
    tags: ['fca', 'compliance', 'data'],
    href: 'https://www.fca.org.uk/',
    source: 'FCA',
    publishedAt: new Date().toISOString(),
    imageUrl: null,
    categoryArtUrl: CATEGORY_ART_URL['REGULATORY COMPLIANCE'],
    publisherLogoUrl: publisherLogoUrl('https://www.fca.org.uk/'),
    mediaBackground: CATEGORY_MEDIA['REGULATORY COMPLIANCE'],
  },
  {
    id: 'wealth-tech-scaling',
    category: 'WEALTH-TECH SCALING',
    title: 'Edge-Inference Integration Shrinks SOC 2 Assurances',
    snippet:
      'Stateless inference at the browser boundary reduces persistent compute estates — operators document smaller blast radii when portfolio logic stays client-side.',
    tags: ['stateless', 'fintech', 'infra'],
    href: 'https://www.openportfolio.co.uk/architecture',
    source: 'Open Portfolio',
    publishedAt: new Date().toISOString(),
    imageUrl: null,
    categoryArtUrl: CATEGORY_ART_URL['WEALTH-TECH SCALING'],
    publisherLogoUrl: publisherLogoUrl('https://www.openportfolio.co.uk/'),
    mediaBackground: CATEGORY_MEDIA['WEALTH-TECH SCALING'],
  },
  {
    id: 'market-intelligence',
    category: 'MARKET INTELLIGENCE',
    title: 'Asset Allocation Under New Cross-Border DIFC Rules',
    snippet:
      'Multi-jurisdiction books need allocation models that respect emerging DIFC disclosure frames without duplicating ledger stores across regions.',
    tags: ['wealthmanagement', 'difc', 'allocation'],
    href: 'https://www.pocketportfolio.app/for/advisors',
    source: 'Pocket Portfolio',
    publishedAt: new Date().toISOString(),
    imageUrl: null,
    categoryArtUrl: CATEGORY_ART_URL['MARKET INTELLIGENCE'],
    publisherLogoUrl: publisherLogoUrl('https://www.pocketportfolio.app/'),
    mediaBackground: CATEGORY_MEDIA['MARKET INTELLIGENCE'],
  },
];

export const SEED_NEWSROOM_PAYLOAD: NewsroomPayload = {
  updatedAt: new Date().toISOString(),
  briefings: SEED_BRIEFINGS,
  source: 'seed',
};
