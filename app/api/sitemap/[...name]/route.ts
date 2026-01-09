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
import sitemapTickers3 from '../../../sitemap-tickers-3';
import sitemapTickers4 from '../../../sitemap-tickers-4';
import sitemapTickers5 from '../../../sitemap-tickers-5';
import sitemapTickers6 from '../../../sitemap-tickers-6';
import sitemapTickers7 from '../../../sitemap-tickers-7';
import sitemapTickers8 from '../../../sitemap-tickers-8';
import sitemapTickers9 from '../../../sitemap-tickers-9';
import sitemapTickers10 from '../../../sitemap-tickers-10';
import sitemapTickers11 from '../../../sitemap-tickers-11';
import sitemapTickers12 from '../../../sitemap-tickers-12';
import sitemapTickers13 from '../../../sitemap-tickers-13';
import sitemapTickers14 from '../../../sitemap-tickers-14';
import sitemapTickers15 from '../../../sitemap-tickers-15';
import sitemapTickers16 from '../../../sitemap-tickers-16';

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
  'sitemap-tickers-3': sitemapTickers3,
  'sitemap-tickers-4': sitemapTickers4,
  'sitemap-tickers-5': sitemapTickers5,
  'sitemap-tickers-6': sitemapTickers6,
  'sitemap-tickers-7': sitemapTickers7,
  'sitemap-tickers-8': sitemapTickers8,
  'sitemap-tickers-9': sitemapTickers9,
  'sitemap-tickers-10': sitemapTickers10,
  'sitemap-tickers-11': sitemapTickers11,
  'sitemap-tickers-12': sitemapTickers12,
  'sitemap-tickers-13': sitemapTickers13,
  'sitemap-tickers-14': sitemapTickers14,
  'sitemap-tickers-15': sitemapTickers15,
  'sitemap-tickers-16': sitemapTickers16,
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

