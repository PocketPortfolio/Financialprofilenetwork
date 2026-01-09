/**
 * AEO (Answer Engine Optimization) Question Answering API
 * Provides direct answers from blog content for AI/LLM consumption
 * Optimized for Answer Engines (Perplexity, ChatGPT, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchBlogPosts } from '@/app/lib/blog/blogSearch';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface AnswerResult {
  question: string;
  answer: string;
  source: {
    title: string;
    url: string;
    slug: string;
    excerpt: string;
    relevanceScore: number;
  };
  relatedPosts?: Array<{
    title: string;
    url: string;
    relevanceScore: number;
  }>;
}

/**
 * Extract answer from blog post content
 */
function extractAnswerFromPost(
  query: string,
  postContent: string,
  postTitle: string
): string | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  // Find relevant sections
  const sections: string[] = [];
  
  // Pattern 1: Find headers that match query
  const headerRegex = /^##+\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(postContent)) !== null) {
    const headerText = match[1].toLowerCase();
    if (queryWords.some(word => headerText.includes(word))) {
      // Extract content after this header until next header
      const sectionStart = match.index + match[0].length;
      const nextHeaderMatch = postContent.substring(sectionStart).match(/^##+\s+/m);
      const sectionEnd = (nextHeaderMatch && typeof nextHeaderMatch.index === 'number')
        ? sectionStart + nextHeaderMatch.index 
        : postContent.length;
      
      const sectionContent = postContent.substring(sectionStart, sectionEnd).trim();
      if (sectionContent.length > 50) {
        sections.push(sectionContent);
      }
    }
  }
  
  // Pattern 2: Find paragraphs containing query words
  if (sections.length === 0) {
    const paragraphs = postContent.split(/\n\n+/);
    for (const para of paragraphs) {
      const paraLower = para.toLowerCase();
      const matchCount = queryWords.filter(word => paraLower.includes(word)).length;
      if (matchCount >= queryWords.length / 2 && para.length > 50) {
        sections.push(para.trim());
      }
    }
  }
  
  // Pattern 3: Extract from "Verdict" or "Key Takeaways" sections
  const verdictMatch = postContent.match(/##+\s+(?:Verdict|Key Takeaways|Conclusion)[^#]*/i);
  if (verdictMatch && sections.length === 0) {
    sections.push(verdictMatch[0].replace(/^##+\s+(?:Verdict|Key Takeaways|Conclusion):?\s*/i, '').trim());
  }
  
  // Combine sections into answer
  if (sections.length > 0) {
    const answer = sections
      .slice(0, 3) // Max 3 sections
      .join('\n\n')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
      .substring(0, 1000); // Limit length
    
    return answer.length > 50 ? answer : null;
  }
  
  return null;
}

/**
 * Load blog post content by slug
 */
function loadBlogPost(slug: string): { content: string; title: string; description: string } | null {
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const filePath = path.join(postsDir, `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContents);
    
    return {
      content,
      title: data.title || '',
      description: data.description || '',
    };
  } catch (error) {
    console.error(`[AEO Answer API] Error loading post ${slug}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Missing query parameter',
          message: 'Please provide a query (q or query) parameter',
        },
        { status: 400 }
      );
    }
    
    // Search for relevant blog posts
    const searchResults = searchBlogPosts(query, 5);
    
    if (searchResults.matches.length === 0) {
      return NextResponse.json({
        question: query,
        answer: null,
        message: 'No relevant blog posts found for this query',
        sources: [],
      });
    }
    
    // Get the most relevant post
    const topMatch = searchResults.matches[0];
    
    // Load full content of top match
    const postData = loadBlogPost(topMatch.slug);
    
    if (!postData) {
      return NextResponse.json({
        question: query,
        answer: topMatch.description, // Fallback to description
        source: {
          title: topMatch.title,
          url: topMatch.url,
          slug: topMatch.slug,
          excerpt: topMatch.description,
          relevanceScore: topMatch.relevanceScore,
        },
        relatedPosts: searchResults.matches.slice(1, 4).map(m => ({
          title: m.title,
          url: m.url,
          relevanceScore: m.relevanceScore,
        })),
      });
    }
    
    // Extract answer from post content
    const answer = extractAnswerFromPost(query, postData.content, postData.title) || postData.description;
    
    const result: AnswerResult = {
      question: query,
      answer: answer.substring(0, 2000), // Limit answer length
      source: {
        title: topMatch.title,
        url: topMatch.url,
        slug: topMatch.slug,
        excerpt: postData.description,
        relevanceScore: topMatch.relevanceScore,
      },
      relatedPosts: searchResults.matches.slice(1, 4).map(m => ({
        title: m.title,
        url: m.url,
        relevanceScore: m.relevanceScore,
      })),
    };
    
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[AEO Answer API] Error:', error);
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
 * POST endpoint for complex question answering
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context } = body;
    
    if (!question) {
      return NextResponse.json(
        { error: 'Missing question in request body' },
        { status: 400 }
      );
    }
    
    // Build enhanced query with context
    let query = question;
    if (context) {
      query = `${question} ${context}`;
    }
    
    // Search for relevant posts
    const searchResults = searchBlogPosts(query, 10);
    
    if (searchResults.matches.length === 0) {
      return NextResponse.json({
        question,
        answer: null,
        message: 'No relevant blog posts found',
        sources: [],
      });
    }
    
    // Try to extract answer from multiple top posts
    const answers: Array<{ answer: string; source: string; score: number }> = [];
    
    for (const match of searchResults.matches.slice(0, 3)) {
      const postData = loadBlogPost(match.slug);
      if (postData) {
        const answer = extractAnswerFromPost(question, postData.content, postData.title);
        if (answer) {
          answers.push({
            answer,
            source: match.url,
            score: match.relevanceScore,
          });
        }
      }
    }
    
    // Combine answers or use best one
    const bestAnswer = answers.length > 0 
      ? answers[0].answer 
      : searchResults.matches[0].description;
    
    return NextResponse.json({
      question,
      answer: bestAnswer.substring(0, 2000),
      sources: searchResults.matches.slice(0, 5).map(m => ({
        title: m.title,
        url: m.url,
        relevanceScore: m.relevanceScore,
        excerpt: m.description,
      })),
      confidence: searchResults.matches[0].relevanceScore / 100,
    });
  } catch (error) {
    console.error('[AEO Answer API POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

