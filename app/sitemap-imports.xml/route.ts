/**
 * Sitemap: Broker Imports Route
 * Returns XML sitemap for broker import pages
 */

import { NextRequest, NextResponse } from 'next/server';
import sitemapImports from '../sitemap-imports';
import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

export async function GET(request: NextRequest) {
  try {
    const sitemap = await sitemapImports();
    const xml = sitemapToXml(sitemap);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Imports] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

