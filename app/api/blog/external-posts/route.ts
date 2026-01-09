import { NextResponse } from 'next/server';

// Disable caching to ensure fresh posts are always returned
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface ExternalPost {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: 'dev.to' | 'coderlegion';
  date: string;
  datePublished: string;
  author: string;
  tags: string[];
}

/**
 * Fetch Dev.to posts using Forem API
 */
async function fetchDevToPosts(username: string = 'pocketportfolioapp'): Promise<ExternalPost[]> {
  try {
    const response = await fetch(`https://dev.to/api/articles?username=${username}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.warn(`⚠️  Dev.to API failed: ${response.statusText}`);
      return [];
    }
    
    const articles = await response.json();
    return articles.slice(0, 5).map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description || article.excerpt || '',
      url: article.url,
      platform: 'dev.to' as const,
      date: article.published_at ? article.published_at.split('T')[0] : article.created_at.split('T')[0],
      datePublished: article.published_at || article.created_at,
      author: article.user?.name || 'Pocket Portfolio Team',
      tags: article.tag_list || []
    }));
  } catch (error) {
    console.error('❌ Dev.to fetch failed:', error);
    return [];
  }
}

/**
 * Fetch CoderLegion posts
 * Note: CoderLegion uses Forem API but may need fallback
 */
async function fetchCoderLegionPosts(): Promise<ExternalPost[]> {
  try {
    // Try profile posts first
    const profileResponse = await fetch(`https://coderlegion.com/api/articles?username=${encodeURIComponent('Pocket+Portfolio')}`, {
      next: { revalidate: 3600 }
    });
    
    let posts: ExternalPost[] = [];
    
    if (profileResponse.ok) {
      const articles = await profileResponse.json();
      posts = articles.slice(0, 3).map((article: any) => ({
        id: `coderlegion-profile-${article.id}`,
        title: article.title,
        description: article.description || article.excerpt || '',
        url: article.url || `https://coderlegion.com/user/Pocket+Portfolio/posts/${article.id}`,
        platform: 'coderlegion' as const,
        date: article.published_at ? article.published_at.split('T')[0] : article.created_at.split('T')[0],
        datePublished: article.published_at || article.created_at,
        author: article.user?.name || 'Pocket Portfolio Team',
        tags: article.tags || []
      }));
    }
    
    // Try group posts (openfi-builders)
    try {
      const groupResponse = await fetch(`https://coderlegion.com/api/articles?organization=${encodeURIComponent('openfi-builders')}`, {
        next: { revalidate: 3600 }
      });
      
      if (groupResponse.ok) {
        const groupArticles = await groupResponse.json();
        const groupPosts = groupArticles.slice(0, 2).map((article: any) => ({
          id: `coderlegion-group-${article.id}`,
          title: article.title,
          description: article.description || article.excerpt || '',
          url: article.url || `https://coderlegion.com/groups/openfi-builders`,
          platform: 'coderlegion' as const,
          date: article.published_at ? article.published_at.split('T')[0] : article.created_at.split('T')[0],
          datePublished: article.published_at || article.created_at,
          author: article.user?.name || 'Pocket Portfolio Team',
          tags: article.tags || []
        }));
        posts = [...posts, ...groupPosts];
      }
    } catch (error) {
      console.warn('⚠️  CoderLegion group fetch failed:', error);
    }
    
    // Fallback to known posts if API fails
    if (posts.length === 0) {
      posts = [
        {
          id: 'coderlegion-fallback-1',
          title: "OpenBrokerCSV v0.1 — let's standardise broker CSVs so everyone can build better tools",
          description: "Introducing OpenBrokerCSV: a standard format for broker CSV exports to enable better portfolio tracking tools.",
          url: 'https://coderlegion.com/5823/openbrokercsv-v0-1-lets-standardise-broker-csvs-so-everyone-can-build-better-tools',
          platform: 'coderlegion' as const,
          date: '2024-10-20',
          datePublished: '2024-10-20T00:00:00Z',
          author: 'Pocket Portfolio Team',
          tags: ['csv', 'standardization', 'open-source']
        },
        {
          id: 'coderlegion-fallback-2',
          title: "DISCUSS: The 'Never 0.00' Challenge — design a resilient price pipeline",
          description: "Community discussion on designing a resilient client-to-edge price pipeline that never fails users.",
          url: 'https://coderlegion.com/5755/discuss-the-never-0-00-challenge-design-a-resilient-price-pipeline-client-edge-together',
          platform: 'coderlegion' as const,
          date: '2024-10-18',
          datePublished: '2024-10-18T00:00:00Z',
          author: 'Pocket Portfolio Team',
          tags: ['discussion', 'community', 'architecture']
        }
      ];
    }
    
    return posts.slice(0, 5);
  } catch (error) {
    console.error('❌ CoderLegion fetch failed:', error);
    // Return fallback posts
    return [
      {
        id: 'coderlegion-fallback-1',
        title: "OpenBrokerCSV v0.1 — let's standardise broker CSVs so everyone can build better tools",
        description: "Introducing OpenBrokerCSV: a standard format for broker CSV exports to enable better portfolio tracking tools.",
        url: 'https://coderlegion.com/5823/openbrokercsv-v0-1-lets-standardise-broker-csvs-so-everyone-can-build-better-tools',
        platform: 'coderlegion' as const,
        date: '2024-10-20',
        datePublished: '2024-10-20T00:00:00Z',
        author: 'Pocket Portfolio Team',
        tags: ['csv', 'standardization', 'open-source']
      }
    ];
  }
}

export async function GET() {
  try {
    // Fetch from all sources in parallel
    const [devToPosts, coderLegionPosts] = await Promise.all([
      fetchDevToPosts(),
      fetchCoderLegionPosts()
    ]);
    
    return NextResponse.json({
      devto: devToPosts,
      coderlegion: coderLegionPosts,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching external posts:', error);
    return NextResponse.json({
      devto: [],
      coderlegion: [],
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch external posts'
    }, { status: 500 });
  }
}

