/**
 * Shared ticker sitemap builder — allowlisted symbols only (Day-28 de-farm).
 */

import type { MetadataRoute } from 'next';
import { detectAssetType, AssetType } from '@/app/lib/portfolio/sectorClassification';
import { TOP_100_SYMBOL_INDEX_ALLOWLIST } from '@/lib/seo/symbol-index-allowlist';

const BASE_URL = 'https://www.pocketportfolio.app';
const PART_COUNT = 16;

/**
 * Build sitemap entries for one sixteenth of the allowlist.
 * Non-allowlisted farm URLs are never emitted.
 */
export function buildAllowlistedTickerSitemapSlice(
  partIndexZeroBased: number,
): MetadataRoute.Sitemap {
  const now = new Date();
  const tickers = [...TOP_100_SYMBOL_INDEX_ALLOWLIST];
  const sliceSize = Math.ceil(tickers.length / PART_COUNT);
  const start = partIndexZeroBased * sliceSize;
  const part = tickers.slice(start, start + sliceSize);

  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  for (const ticker of part) {
    const tickerLower = ticker.toLowerCase().replace(/-/g, '');
    const assetType = detectAssetType(ticker.toUpperCase());
    const hasInsiderData = assetType === AssetType.STOCK || assetType === AssetType.REIT;

    const push = (url: string, changeFrequency: 'daily' | 'weekly', priority: number) => {
      if (seen.has(url)) return;
      seen.add(url);
      entries.push({ url, lastModified: now, changeFrequency, priority });
    };

    push(`${BASE_URL}/s/${tickerLower}`, 'daily', 0.7);
    push(`${BASE_URL}/s/${tickerLower}/json-api`, 'weekly', 0.65);
    push(`${BASE_URL}/s/${tickerLower}/dividend-history`, 'weekly', 0.6);
    if (hasInsiderData) {
      push(`${BASE_URL}/s/${tickerLower}/insider-trading`, 'weekly', 0.6);
    }
  }

  return entries;
}
