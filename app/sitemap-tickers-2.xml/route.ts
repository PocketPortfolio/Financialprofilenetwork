/**
 * Sitemap: Ticker Pages Part 2 Route
 * Returns XML sitemap for second half of ticker pages
 */

import { NextRequest, NextResponse } from 'next/server';
import sitemapTickers2 from '../sitemap-tickers-2';
import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

export async function GET(request: NextRequest) {
  try {
    const sitemap = await sitemapTickers2();
    const xml = sitemapToXml(sitemap);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Tickers-2] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

