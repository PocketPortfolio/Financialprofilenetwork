import { NextResponse } from 'next/server';

import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

import openSitemapStatic from '../sitemap-static';

export const dynamic = 'force-dynamic';

/**
 * Dynamic B2B sitemap — SSOT is OPEN_ALIAS_ROUTES via openSitemapStatic().
 * Served at /open/sitemap.xml; Open-host requests rewrite /sitemap.xml here (middleware).
 */
export async function GET() {
  const entries = await openSitemapStatic();
  const xml = sitemapToXml(entries);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
