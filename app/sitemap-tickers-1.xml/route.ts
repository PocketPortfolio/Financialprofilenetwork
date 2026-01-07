/**
 * Sitemap: Ticker Pages Part 1 Route
 * Returns XML sitemap for first half of ticker pages
 */

import { NextRequest, NextResponse } from 'next/server';
import sitemapTickers1 from '../sitemap-tickers-1';
import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

export async function GET(request: NextRequest) {
  try {
    const sitemap = await sitemapTickers1();
    const xml = sitemapToXml(sitemap);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Tickers-1] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

