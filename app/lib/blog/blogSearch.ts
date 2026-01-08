/**
 * Blog Content Search & Matching System
 * AEO (Answer Engine Optimization) - Matches user queries to relevant blog posts
 * 
 * NOTE: This module uses Node.js fs module and must only be used server-side
 * For client-side usage, use the /api/aeo/blog endpoint instead
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPostMatch {
  slug: string;
  title: string;
  description: string;
  relevanceScore: number;
  matchingKeywords: string[];
  matchingSections?: string[];
  url: string;
  pillar: string;
  tags: string[];
  date: string;
}

export interface BlogSearchResult {
  query: string;
  matches: BlogPostMatch[];
  totalMatches: number;
  suggestedQueries?: string[];
}

/**
 * Load all blog posts with full content
 */
function loadAllBlogPosts(): Array<{
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  pillar: string;
  date: string;
  category?: string;
}> {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const files = fs.readdirSync(postsDir);
  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(postsDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContents);
      
      return {
        slug: file.replace('.mdx', ''),
        title: data.title || '',
        description: data.description || '',
        content: content || '',
        tags: data.tags || [],
        pillar: data.pillar || 'general',
        date: data.date || new Date().toISOString(),
        category: data.category || 'deep-dive',
      };
    });
}

/**
 * Calculate relevance score for a query against a blog post
 */
function calculateRelevanceScore(
  query: string,
  post: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    pillar: string;
  }
): { score: number; matchingKeywords: string[]; matchingSections?: string[] } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  let score = 0;
  const matchingKeywords: string[] = [];
  const matchingSections: string[] = [];

  // Title match (highest weight)
  const titleLower = post.title.toLowerCase();
  if (titleLower.includes(queryLower)) {
    score += 50;
    matchingKeywords.push('title');
  } else {
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        score += 20;
        matchingKeywords.push(word);
      }
    });
  }

  // Description match (high weight)
  const descLower = post.description.toLowerCase();
  if (descLower.includes(queryLower)) {
    score += 30;
  } else {
    queryWords.forEach(word => {
      if (descLower.includes(word)) {
        score += 10;
      }
    });
  }

  // Tags match (medium weight)
  post.tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes(queryLower) || queryWords.some(w => tagLower.includes(w))) {
      score += 15;
      matchingKeywords.push(tag);
    }
  });

  // Content match (lower weight, but can accumulate)
  const contentLower = post.content.toLowerCase();
  const contentMatches = queryWords.filter(word => contentLower.includes(word)).length;
  score += contentMatches * 2;

  // Extract matching sections (headers that contain query words)
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(post.content)) !== null) {
    const headerText = match[1].toLowerCase();
    if (queryWords.some(word => headerText.includes(word))) {
      matchingSections.push(match[1]);
      score += 5;
    }
  }

  // Pillar-based boost (if query matches pillar themes)
  const pillarThemes: Record<string, string[]> = {
    'philosophy': ['sovereign', 'privacy', 'data ownership', 'vendor lock-in', 'local-first'],
    'technical': ['json', 'api', 'code', 'technical', 'implementation', 'architecture'],
    'market': ['investment', 'portfolio', 'trading', 'market', 'stocks', 'finance'],
    'product': ['feature', 'product', 'sovereign sync', 'google drive', 'sync'],
  };

  const pillarTheme = pillarThemes[post.pillar] || [];
  if (pillarTheme.some(theme => queryLower.includes(theme))) {
    score += 10;
  }

  return {
    score: Math.min(100, score), // Cap at 100
    matchingKeywords: [...new Set(matchingKeywords)],
    matchingSections: matchingSections.length > 0 ? matchingSections.slice(0, 3) : undefined,
  };
}

/**
 * Search blog posts for relevant content matching a query
 */
export function searchBlogPosts(query: string, limit: number = 5): BlogSearchResult {
  if (!query || query.trim().length === 0) {
    return {
      query,
      matches: [],
      totalMatches: 0,
    };
  }

  const posts = loadAllBlogPosts();
  const queryLower = query.toLowerCase().trim();

  // Calculate relevance for each post
  const matches: BlogPostMatch[] = posts
    .map(post => {
      const { score, matchingKeywords, matchingSections } = calculateRelevanceScore(
        queryLower,
        post
      );

      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        relevanceScore: score,
        matchingKeywords,
        matchingSections,
        url: `https://www.pocketportfolio.app/blog/${post.slug}`,
        pillar: post.pillar,
        tags: post.tags,
        date: post.date,
      };
    })
    .filter(match => match.relevanceScore > 0) // Only include posts with some relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, limit); // Limit results

  // Generate suggested queries based on tags and pillars
  const allTags = new Set<string>();
  const allPillars = new Set<string>();
  matches.forEach(match => {
    match.tags.forEach(tag => allTags.add(tag));
    allPillars.add(match.pillar);
  });

  const suggestedQueries: string[] = [];
  if (allTags.size > 0) {
    suggestedQueries.push(...Array.from(allTags).slice(0, 3));
  }
  if (allPillars.size > 0) {
    suggestedQueries.push(...Array.from(allPillars).slice(0, 2));
  }

  return {
    query: queryLower,
    matches,
    totalMatches: matches.length,
    suggestedQueries: suggestedQueries.length > 0 ? suggestedQueries : undefined,
  };
}

/**
 * Get blog posts by pillar
 */
export function getBlogPostsByPillar(pillar: string): BlogPostMatch[] {
  const posts = loadAllBlogPosts();
  return posts
    .filter(post => post.pillar.toLowerCase() === pillar.toLowerCase())
    .map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      relevanceScore: 100, // All posts in pillar are equally relevant
      matchingKeywords: [],
      url: `https://www.pocketportfolio.app/blog/${post.slug}`,
      pillar: post.pillar,
      tags: post.tags,
      date: post.date,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get blog posts by tag
 */
export function getBlogPostsByTag(tag: string): BlogPostMatch[] {
  const posts = loadAllBlogPosts();
  return posts
    .filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
    .map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      relevanceScore: 100,
      matchingKeywords: [tag],
      url: `https://www.pocketportfolio.app/blog/${post.slug}`,
      pillar: post.pillar,
      tags: post.tags,
      date: post.date,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

