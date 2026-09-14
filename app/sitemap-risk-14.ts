/**
 * Risk sitemap retired. Programmatic /tools/track-*-risk URLs stay reachable
 * and noindex. Do not emit them into a sitemap.
 */
import { MetadataRoute } from 'next';

export default async function sitemapRisk14(): Promise<MetadataRoute.Sitemap> {
  return [];
}
