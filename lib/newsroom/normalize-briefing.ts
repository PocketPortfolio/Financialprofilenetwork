import type { NewsroomBriefing } from './types';
import { CATEGORY_ART_URL } from './category-art';
import { decodeHtmlEntities } from './decode-html';

/** Backfill art fields + decode HTML entities in cached RSS titles/snippets. */
export function normalizeBriefing(briefing: NewsroomBriefing): NewsroomBriefing {
  return {
    ...briefing,
    title: decodeHtmlEntities(briefing.title),
    snippet: decodeHtmlEntities(briefing.snippet),
    categoryArtUrl: briefing.categoryArtUrl ?? CATEGORY_ART_URL[briefing.category],
  };
}

export function normalizeBriefings(briefings: NewsroomBriefing[]): NewsroomBriefing[] {
  return briefings.map(normalizeBriefing);
}
