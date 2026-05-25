/**
 * News Room briefing → SOTA plate slot router (Pocket landing).
 */

import type { NewsroomBriefing, NewsroomCategory } from '@/lib/newsroom/types';
import {
  type PocketLandingVisualId,
  pocketVisual,
  pocketPlateUrl,
} from '@/lib/pocket-landing-visuals';

const TAG_TO_PLATE: Record<string, PocketLandingVisualId> = {
  fca: 'newsRegulatory',
  compliance: 'newsRegulatory',
  data: 'newsRegulatory',
  regulatory: 'newsRegulatory',
  stateless: 'newsInfra',
  fintech: 'newsInfra',
  infra: 'newsInfra',
  infrastructure: 'newsInfra',
  wealthmanagement: 'newsMarket',
  difc: 'newsMarket',
  allocation: 'newsMarket',
  market: 'newsMarket',
  wealth: 'newsWealthTech',
  'wealth-tech': 'newsWealthTech',
};

const CATEGORY_FALLBACK: Record<NewsroomCategory, PocketLandingVisualId> = {
  'REGULATORY COMPLIANCE': 'newsRegulatory',
  'WEALTH-TECH SCALING': 'newsWealthTech',
  'MARKET INTELLIGENCE': 'newsMarket',
};

export function plateIdForBriefing(briefing: NewsroomBriefing): PocketLandingVisualId {
  for (const tag of briefing.tags) {
    const normalized = tag.toLowerCase().replace(/\s+/g, '');
    const match = TAG_TO_PLATE[normalized];
    if (match) return match;
  }
  const cat = briefing.category as NewsroomCategory;
  return CATEGORY_FALLBACK[cat] ?? 'newsWealthTech';
}

export function plateUrlForBriefing(briefing: NewsroomBriefing): string {
  const id = plateIdForBriefing(briefing);
  return pocketPlateUrl(pocketVisual(id));
}
