/**
 * Sitemap: Allowlisted ticker pages (part 8 / 16) — Day-28 de-farm.
 */
import { MetadataRoute } from 'next';
import { buildAllowlistedTickerSitemapSlice } from './lib/seo/ticker-sitemap';

export default async function sitemapTickers8(): Promise<MetadataRoute.Sitemap> {
  return buildAllowlistedTickerSitemapSlice(7);
}
