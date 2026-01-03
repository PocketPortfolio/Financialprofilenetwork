/**
 * External Content Audit Script
 * Analyzes Dev.to, CoderLegion Profile, and CoderLegion Group for content to import
 * Generates content/external-audit.json with prioritized import list
 */

import fs from 'fs';
import path from 'path';

interface ExternalPost {
  id: string;
  title: string;
  url: string;
  source: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group';
  date: string;
  excerpt?: string;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  pillar?: 'philosophy' | 'technical' | 'market' | 'product';
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
}

interface AuditResult {
  timestamp: string;
  sources: {
    devto: { url: string; posts: ExternalPost[] };
    coderlegion_profile: { url: string; posts: ExternalPost[] };
    coderlegion_group: { url: string; posts: ExternalPost[] };
  };
  prioritized: ExternalPost[];
  summary: {
    total: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
  };
}

/**
 * Detect pillar from title/keywords
 */
function detectPillar(title: string, tags: string[] = []): 'philosophy' | 'technical' | 'market' | 'product' | undefined {
  const text = (title + ' ' + tags.join(' ')).toLowerCase();
  
  if (text.includes('database') || text.includes('local-first') || text.includes('sovereign') || text.includes('vendor lock-in')) {
    return 'philosophy';
  }
  if (text.includes('json') || text.includes('parsing') || text.includes('performance') || text.includes('architecture')) {
    return 'technical';
  }
  if (text.includes('investment') || text.includes('portfolio') || text.includes('market') || text.includes('trading')) {
    return 'market';
  }
  if (text.includes('sync') || text.includes('feature') || text.includes('update') || text.includes('changelog')) {
    return 'product';
  }
  return undefined;
}

/**
 * Detect ritual from title
 */
function detectRitual(title: string): 'ship-friday' | 'spec-clinic' | 'paper-club' | null {
  const lower = title.toLowerCase();
  if (lower.includes('ship friday') || lower.includes('changelog') || lower.includes('update')) {
    return 'ship-friday';
  }
  if (lower.includes('spec clinic') || lower.includes('rfc') || lower.includes('rfd')) {
    return 'spec-clinic';
  }
  if (lower.includes('paper club') || lower.includes('research') || lower.includes('theory')) {
    return 'paper-club';
  }
  return null;
}

/**
 * Determine priority
 */
function determinePriority(post: ExternalPost): 'high' | 'medium' | 'low' {
  // High priority: "Stop building fintech with databases" and similar foundational content
  if (post.title.toLowerCase().includes('stop building') || 
      post.title.toLowerCase().includes('local-first') ||
      post.title.toLowerCase().includes('sovereign')) {
    return 'high';
  }
  
  // Medium: Ritual-based content or pillar-aligned
  if (post.ritual || post.pillar) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Fetch Dev.to posts (Forem API)
 */
async function fetchDevToPosts(username: string = 'pocketportfolioapp'): Promise<ExternalPost[]> {
  try {
    const response = await fetch(`https://dev.to/api/articles?username=${username}`);
    if (!response.ok) {
      console.warn(`⚠️  Dev.to API failed: ${response.statusText}`);
      return [];
    }
    
    const articles = await response.json();
    return articles.map((article: any) => {
      const pillar = detectPillar(article.title, article.tag_list || []);
      const ritual = detectRitual(article.title);
      
      const post: ExternalPost = {
        id: `devto-${article.id}`,
        title: article.title,
        url: article.url,
        source: 'dev.to',
        date: article.published_at || article.created_at,
        excerpt: article.description,
        tags: article.tag_list || [],
        pillar,
        ritual,
        priority: 'medium', // Will be recalculated
      };
      
      post.priority = determinePriority(post);
      return post;
    });
  } catch (error) {
    console.error('❌ Dev.to fetch failed:', error);
    return [];
  }
}

/**
 * Fetch CoderLegion Profile posts
 * Note: CoderLegion may use Forem API or custom API
 */
async function fetchCoderLegionProfile(username: string = 'Pocket+Portfolio'): Promise<ExternalPost[]> {
  try {
    // Try Forem-compatible API first
    const response = await fetch(`https://coderlegion.com/api/articles?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      console.warn(`⚠️  CoderLegion Profile API failed: ${response.statusText}`);
      // Return manual entry for known high-value post
      return [{
        id: 'coderlegion-profile-manual',
        title: 'Pocket Portfolio Beta',
        url: 'https://coderlegion.com/user/Pocket+Portfolio',
        source: 'coderlegion_profile' as const,
        date: '2024-10-20',
        priority: 'medium' as const,
      }];
    }
    
    const articles = await response.json();
    return articles.map((article: any) => {
      const pillar = detectPillar(article.title, article.tags || []);
      const ritual = detectRitual(article.title);
      
      const post: ExternalPost = {
        id: `coderlegion-profile-${article.id}`,
        title: article.title,
        url: article.url || `https://coderlegion.com/user/${username}/posts/${article.id}`,
        source: 'coderlegion_profile',
        date: article.published_at || article.created_at,
        excerpt: article.description,
        tags: article.tags || [],
        pillar,
        ritual,
        priority: 'medium',
      };
      
      post.priority = determinePriority(post);
      return post;
    });
  } catch (error) {
    console.error('❌ CoderLegion Profile fetch failed:', error);
    return [];
  }
}

/**
 * Fetch CoderLegion Group posts
 * CRITICAL: This is the "open-fintech-builders" group
 */
async function fetchCoderLegionGroup(groupSlug: string = 'openfi-builders'): Promise<ExternalPost[]> {
  try {
    // Try Forem-compatible API
    const response = await fetch(`https://coderlegion.com/api/articles?organization=${encodeURIComponent(groupSlug)}`);
    if (!response.ok) {
      console.warn(`⚠️  CoderLegion Group API failed: ${response.statusText}`);
      // Return manual entries for known high-value posts
      return [
        {
          id: 'coderlegion-group-stop-building',
          title: 'Stop building fintech with databases. Why I went local-first for Pocket Portfolio.',
          url: 'https://coderlegion.com/groups/openfi-builders',
          source: 'coderlegion_group' as const,
          date: '2024-12-22',
          excerpt: 'Stop building fintech with databases. Why I went local-first for Pocket Portfolio. For the last decade, building a fintech app meant one architecture: a centralized PostgreSQL database, a backend in...',
          tags: ['local-first', 'fintech', 'architecture'],
          pillar: 'philosophy' as const,
          ritual: null,
          priority: 'high' as const,
        },
        {
          id: 'coderlegion-group-beta',
          title: 'Pocket Portfolio Beta',
          url: 'https://coderlegion.com/groups/openfi-builders',
          source: 'coderlegion_group' as const,
          date: '2024-10-20',
          tags: ['fintech', 'opensource', 'nextjs'],
          priority: 'medium' as const,
        },
      ];
    }
    
    const articles = await response.json();
    return articles.map((article: any) => {
      const pillar = detectPillar(article.title, article.tags || []);
      const ritual = detectRitual(article.title);
      
      const post: ExternalPost = {
        id: `coderlegion-group-${article.id}`,
        title: article.title,
        url: article.url || `https://coderlegion.com/groups/${groupSlug}/posts/${article.id}`,
        source: 'coderlegion_group',
        date: article.published_at || article.created_at,
        excerpt: article.description,
        tags: article.tags || [],
        pillar,
        ritual,
        priority: 'medium',
      };
      
      post.priority = determinePriority(post);
      return post;
    });
  } catch (error) {
    console.error('❌ CoderLegion Group fetch failed:', error);
    // Return manual entry as fallback
    return [{
      id: 'coderlegion-group-stop-building',
      title: 'Stop building fintech with databases. Why I went local-first for Pocket Portfolio.',
      url: 'https://coderlegion.com/groups/openfi-builders',
      source: 'coderlegion_group' as const,
      date: '2024-12-22',
      priority: 'high' as const,
      pillar: 'philosophy' as const,
    }];
  }
}

async function main() {
  console.log('🔍 Starting External Content Audit...\n');

  const devtoPosts = await fetchDevToPosts();
  console.log(`📰 Dev.to: Found ${devtoPosts.length} posts`);

  const profilePosts = await fetchCoderLegionProfile();
  console.log(`👤 CoderLegion Profile: Found ${profilePosts.length} posts`);

  const groupPosts = await fetchCoderLegionGroup();
  console.log(`👥 CoderLegion Group: Found ${groupPosts.length} posts`);

  // Combine and prioritize
  const allPosts = [...devtoPosts, ...profilePosts, ...groupPosts];
  const prioritized = allPosts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const audit: AuditResult = {
    timestamp: new Date().toISOString(),
    sources: {
      devto: {
        url: 'https://dev.to/pocketportfolioapp',
        posts: devtoPosts,
      },
      coderlegion_profile: {
        url: 'https://coderlegion.com/user/Pocket+Portfolio',
        posts: profilePosts,
      },
      coderlegion_group: {
        url: 'https://coderlegion.com/groups/openfi-builders',
        posts: groupPosts,
      },
    },
    prioritized,
    summary: {
      total: allPosts.length,
      high_priority: allPosts.filter(p => p.priority === 'high').length,
      medium_priority: allPosts.filter(p => p.priority === 'medium').length,
      low_priority: allPosts.filter(p => p.priority === 'low').length,
    },
  };

  // Save audit
  const auditPath = path.join(process.cwd(), 'content', 'external-audit.json');
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));

  console.log('\n✅ Audit Complete!');
  console.log(`📊 Total Posts: ${audit.summary.total}`);
  console.log(`🔥 High Priority: ${audit.summary.high_priority}`);
  console.log(`📝 Medium Priority: ${audit.summary.medium_priority}`);
  console.log(`📄 Low Priority: ${audit.summary.low_priority}`);
  console.log(`\n💾 Saved to: ${auditPath}`);

  // Show top 3 prioritized
  console.log('\n🎯 Top 3 Priority Posts:');
  prioritized.slice(0, 3).forEach((post, i) => {
    console.log(`  ${i + 1}. [${post.priority.toUpperCase()}] ${post.title}`);
    console.log(`     Source: ${post.source} | Pillar: ${post.pillar || 'N/A'} | Ritual: ${post.ritual || 'N/A'}`);
  });
}

main().catch(console.error);



