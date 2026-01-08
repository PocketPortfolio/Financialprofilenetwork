/**
 * Dynamic Sitemap API Route (Industry Standard) - Catch-All Version
 * Generates sitemaps on-demand via API routes - no static files needed
 * Uses catch-all route [...name] to work around Next.js 15 dynamic route bug
 * This is how large websites (Shopify, WordPress, etc.) handle sitemaps
 */

import { NextRequest, NextResponse } from 'next/server';
import { sitemapToXml } from '../../../lib/sitemap-xml-helper';

// Import sitemap generators
import sitemapStatic from '../../../sitemap-static';
import sitemapImports from '../../../sitemap-imports';
import sitemapTools from '../../../sitemap-tools';
import sitemapBlog from '../../../sitemap-blog';
import sitemapTickers1 from '../../../sitemap-tickers-1';
import sitemapTickers2 from '../../../sitemap-tickers-2';

// Route segment config for Vercel
export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Explicitly allow dynamic params (Next.js 15 requirement)
export const runtime = 'nodejs'; // Explicitly set runtime for Vercel
export const revalidate = 3600; // Revalidate every hour
export const maxDuration = 60; // 60 second timeout for large sitemaps

const SITEMAP_GENERATORS: Record<string, () => Promise<any>> = {
  'sitemap-static': sitemapStatic,
  'sitemap-imports': sitemapImports,
  'sitemap-tools': sitemapTools,
  'sitemap-blog': sitemapBlog,
  'sitemap-tickers-1': sitemapTickers1,
  'sitemap-tickers-2': sitemapTickers2,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string[] }> }
) {
  try {
    // Next.js 15: params is always a Promise
    // Catch-all route: name is an array
    const resolvedParams = await params;
    const nameArray = resolvedParams.name || [];
    
    // Extract sitemap name from array (first element)
    // Matches: /api/sitemap/sitemap-static -> name = ["sitemap-static"]
    const sitemapName = nameArray[0] || '';
    
    if (!sitemapName) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Sitemap name parameter required</message>
</error>`,
        {
          status: 400,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      );
    }
    
    // Remove .xml extension if present
    const cleanName = sitemapName.replace(/\.xml$/, '');
    
    const generator = SITEMAP_GENERATORS[cleanName];
    
    if (!generator) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Sitemap "${cleanName}" not found</message>
</error>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      );
    }
    
    // Generate sitemap on-demand
    const sitemap = await generator();
    
    if (!Array.isArray(sitemap)) {
      throw new Error(`Sitemap generator did not return an array`);
    }
    
    if (sitemap.length === 0) {
      console.warn(`[Sitemap API] ${cleanName}: Empty sitemap (0 URLs)`);
    }
    
    // Convert to XML
    const xml = sitemapToXml(sitemap);
    
    console.log(`[Sitemap API] ${cleanName}: Generated ${sitemap.length} URLs on-demand`);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[Sitemap API] Error generating sitemap:`, error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Internal server error generating sitemap</message>
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

