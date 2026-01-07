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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const resolvedParams = await params;
  const name = resolvedParams.name;
  
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
    return new NextResponse('Sitemap not found', { status: 404 });
  }
  
  try {
    const sitemap = await sitemapFn();
    const xml = sitemapToXml(sitemap);
    
    console.log(`[Sitemap ${name}] Generated ${sitemap.length} URLs`);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(`[Sitemap ${name}] Error:`, error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

