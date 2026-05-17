import { unstable_cache } from 'next/cache';
import { kv } from '@vercel/kv';
import { ingestNewsroomBriefings } from './ingest';
import {
  NEWSROOM_CACHE_SECONDS,
  NEWSROOM_KV_TTL_SECONDS,
  STALE_PAYLOAD_MAX_AGE_HOURS,
} from './constants';
import type { NewsroomPayload } from './types';
import { normalizeBriefings } from './normalize-briefing';
import { SEED_NEWSROOM_PAYLOAD } from './seed';

export const NEWSROOM_KV_KEY = 'newsroom:briefings:v1';

/** Cached live RSS ingest — used when KV is empty or stale. */
const getCachedLiveIngest = unstable_cache(
  async () => ingestNewsroomBriefings(),
  ['newsroom-live-ingest-v2'],
  { revalidate: NEWSROOM_CACHE_SECONDS, tags: ['newsroom'] },
);

function isLivePayload(payload: NewsroomPayload): boolean {
  return payload.source === 'google-news-rss' || payload.source === 'kv-cache';
}

function payloadAgeHours(updatedAt: string): number {
  return (Date.now() - new Date(updatedAt).getTime()) / (60 * 60 * 1000);
}

function isPayloadFresh(updatedAt: string): boolean {
  return payloadAgeHours(updatedAt) <= STALE_PAYLOAD_MAX_AGE_HOURS;
}

export async function getNewsroomPayload(): Promise<NewsroomPayload> {
  if (process.env.KV_REST_API_URL) {
    try {
      const cached = await kv.get<NewsroomPayload>(NEWSROOM_KV_KEY);
      if (
        cached?.briefings?.length &&
        isLivePayload(cached) &&
        isPayloadFresh(cached.updatedAt)
      ) {
        return {
          ...cached,
          source: 'kv-cache',
          briefings: normalizeBriefings(cached.briefings),
        };
      }
    } catch (error) {
      console.warn('[newsroom] KV read failed:', error);
    }
  }

  try {
    const live = await getCachedLiveIngest();
    if (live.briefings.length >= 3 && live.source === 'google-news-rss') {
      if (process.env.KV_REST_API_URL) {
        void setNewsroomPayload(live).catch((err) => {
          console.warn('[newsroom] KV backfill after live ingest failed:', err);
        });
      }
      return { ...live, briefings: normalizeBriefings(live.briefings) };
    }
  } catch (error) {
    console.warn('[newsroom] Live ingest failed:', error);
  }

  return { ...SEED_NEWSROOM_PAYLOAD, briefings: normalizeBriefings(SEED_NEWSROOM_PAYLOAD.briefings) };
}

export async function setNewsroomPayload(payload: NewsroomPayload): Promise<boolean> {
  if (!process.env.KV_REST_API_URL) {
    return false;
  }
  await kv.set(NEWSROOM_KV_KEY, payload, { ex: NEWSROOM_KV_TTL_SECONDS });
  return true;
}
