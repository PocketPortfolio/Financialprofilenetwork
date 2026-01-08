/**
 * Dynamic Sitemap Index Route (Industry Standard)
 * Generates sitemap index on-demand - references API routes for sub-sitemaps
 * This is how large websites handle sitemap indices
 */

import { NextRequest, NextResponse } from 'next/server';

// Route segment config for Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.pocketportfolio.app';
    const now = new Date().toISOString().split('T')[0];
    
    // Reference API routes for all sub-sitemaps (dynamic generation)
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-static</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-imports</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-tools</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-blog</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-tickers-1</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/sitemap-tickers-2</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(sitemapIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Index] Error generating sitemap index:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Internal server error generating sitemap index</message>
</error>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );
  }
}

