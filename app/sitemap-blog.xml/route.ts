/**
 * Sitemap: Blog Posts Route
 * Returns XML sitemap for blog posts
 */

import { NextRequest, NextResponse } from 'next/server';
import sitemapBlog from '../sitemap-blog';
import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

export async function GET(request: NextRequest) {
  try {
    const sitemap = await sitemapBlog();
    const xml = sitemapToXml(sitemap);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Blog] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

