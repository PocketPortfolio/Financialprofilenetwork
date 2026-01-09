/**
 * AEO (Answer Engine Optimization) Blog Recommendation API
 * Provides blog-based answers and recommendations for user queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchBlogPosts, getBlogPostsByPillar, getBlogPostsByTag } from '@/app/lib/blog/blogSearch';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const pillar = searchParams.get('pillar');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // If specific pillar requested
    if (pillar) {
      const posts = getBlogPostsByPillar(pillar);
      return NextResponse.json({
        query: `pillar:${pillar}`,
        matches: posts.slice(0, limit),
        totalMatches: posts.length,
        type: 'pillar',
      });
    }

    // If specific tag requested
    if (tag) {
      const posts = getBlogPostsByTag(tag);
      return NextResponse.json({
        query: `tag:${tag}`,
        matches: posts.slice(0, limit),
        totalMatches: posts.length,
        type: 'tag',
      });
    }

    // If query provided, search
    if (query) {
      const results = searchBlogPosts(query, limit);
      return NextResponse.json({
        ...results,
        type: 'search',
      });
    }

    // No query provided - return error
    return NextResponse.json(
      {
        error: 'Missing query parameter',
        message: 'Please provide a query (q or query), pillar, or tag parameter',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[AEO Blog API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for complex queries (future: AI-powered matching)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context, portfolio } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query in request body' },
        { status: 400 }
      );
    }

    // Basic search (can be enhanced with AI in future)
    const results = searchBlogPosts(query, 10);

    // If portfolio context provided, boost portfolio-related posts
    if (portfolio && portfolio.positions) {
      const tickers = portfolio.positions.map((p: any) => p.ticker?.toLowerCase() || '');
      results.matches = results.matches.map(match => {
        const hasTickerMatch = tickers.some((ticker: string) =>
          match.title.toLowerCase().includes(ticker) ||
          match.description.toLowerCase().includes(ticker) ||
          match.tags.some(tag => tag.toLowerCase().includes(ticker))
        );
        if (hasTickerMatch) {
          return {
            ...match,
            relevanceScore: Math.min(100, match.relevanceScore + 20), // Boost score
          };
        }
        return match;
      });
      // Re-sort after boosting
      results.matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return NextResponse.json({
      ...results,
      type: 'enhanced_search',
      context: context || null,
    });
  } catch (error) {
    console.error('[AEO Blog API POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

