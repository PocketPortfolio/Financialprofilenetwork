import type { NewsroomBriefing } from './types';
import { CATEGORY_ART_URL } from './category-art';

/** Backfill art fields for KV payloads cached before image support shipped. */
export function normalizeBriefing(briefing: NewsroomBriefing): NewsroomBriefing {
  return {
    ...briefing,
    categoryArtUrl: briefing.categoryArtUrl ?? CATEGORY_ART_URL[briefing.category],
  };
}

export function normalizeBriefings(briefings: NewsroomBriefing[]): NewsroomBriefing[] {
  return briefings.map(normalizeBriefing);
}
