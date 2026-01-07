/**
 * Dynamic Sitemap API Route Handler
 * Handles all sub-sitemaps via API route: /api/sitemap/static, /api/sitemap/blog, etc.
 * URLs are rewritten from /sitemap-*.xml to /api/sitemap/* via next.config.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { sitemapToXml } from '@/app/lib/sitemap-xml-helper';

// Route segment config - required for Next.js 15 dynamic routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Explicitly allow dynamic params
export const runtime = 'nodejs'; // Explicitly set runtime for Vercel
export const revalidate = 0; // Force no caching - ensure fresh data
export const maxDuration = 60; // Maximum execution time (60 seconds for Pro plan)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const startTime = Date.now();
  let name: string;
  
  try {
    const resolvedParams = await params;
    name = resolvedParams.name;
  } catch (error) {
    console.error('[Sitemap] Error resolving params:', error);
    return new NextResponse('Invalid request', { 
      status: 400,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
  
  // Map route names to sitemap functions
  const sitemapMap: Record<string, () => Promise<any>> = {
    'static': () => import('../../../sitemap-static').then(m => m.default()),
    'imports': () => import('../../../sitemap-imports').then(m => m.default()),
    'tools': () => import('../../../sitemap-tools').then(m => m.default()),
    'blog': () => import('../../../sitemap-blog').then(m => m.default()),
    'tickers-1': () => import('../../../sitemap-tickers-1').then(m => m.default()),
    'tickers-2': () => import('../../../sitemap-tickers-2').then(m => m.default()),
  };
  
  const sitemapFn = sitemapMap[name];
  if (!sitemapFn) {
    console.error(`[Sitemap ${name}] Sitemap not found`);
    return new NextResponse('Sitemap not found', { 
      status: 404,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }

  try {
    console.log(`[Sitemap ${name}] Starting generation...`);
    const sitemap = await sitemapFn();
    
    if (!Array.isArray(sitemap)) {
      console.error(`[Sitemap ${name}] Invalid sitemap format:`, typeof sitemap);
      return new NextResponse('Invalid sitemap format', { 
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      });
    }
    
    if (sitemap.length === 0) {
      console.warn(`[Sitemap ${name}] Empty sitemap generated`);
    }
    
    const xml = sitemapToXml(sitemap);
    const duration = Date.now() - startTime;
    
    console.log(`[Sitemap ${name}] Generated ${sitemap.length} URLs in ${duration}ms`);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Sitemap-URLs': sitemap.length.toString(),
        'X-Generation-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Sitemap ${name}] Error after ${duration}ms:`, error);
    
    // Return a valid XML error response instead of plain text
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Sitemap generation failed</message>
  <sitemap>${name}</sitemap>
  <timestamp>${new Date().toISOString()}</timestamp>
</error>`;
    
    return new NextResponse(errorXml, { 
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

