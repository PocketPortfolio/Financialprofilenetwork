import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Disable caching to ensure fresh posts are always returned
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    
    if (!fs.existsSync(postsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(postsDir);
    const allPosts = files
      .filter(file => {
        // Exclude backup files
        if (file.endsWith('.bak.mdx')) return false;
        
        // ✅ FIX: For research posts, only include files with date-based slugs
        // Old research posts without dates should be excluded (they've been migrated)
        if (file.startsWith('research-') && file.endsWith('.mdx')) {
          const slug = file.replace('.mdx', '');
          // Research posts should have date in slug (format: research-*-YYYY-MM-DD)
          const hasDate = /\d{4}-\d{2}-\d{2}$/.test(slug);
          if (!hasDate) {
            console.warn(`[Blog API] Skipping old research post without date: ${file}`);
            return false;
          }
        }
        
        return file.endsWith('.mdx');
      })
      .map(file => {
        const filePath = path.join(postsDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContents);
        
        return {
          slug: file.replace('.mdx', ''),
          title: data.title,
          description: data.description,
          date: data.date,
          author: data.author || 'Pocket Portfolio Team',
          tags: data.tags || [],
          image: data.image,
          pillar: data.pillar,
          category: data.category || 'deep-dive',
        };
      });

    // ✅ DEDUPLICATION: For research posts, deduplicate by title+date
    // If multiple files exist for same title+date, keep only one (prefer the one with date in slug)
    const postMap = new Map<string, typeof allPosts[0]>();
    
    for (const post of allPosts) {
      if (post.category === 'research') {
        // Use title+date as unique key for research posts
        const key = `${post.title}|${post.date}`;
        const existing = postMap.get(key);
        
        if (existing) {
          // Prefer the one with date in slug (new format) over any variant
          const existingHasDate = /\d{4}-\d{2}-\d{2}$/.test(existing.slug);
          const currentHasDate = /\d{4}-\d{2}-\d{2}$/.test(post.slug);
          
          if (currentHasDate && !existingHasDate) {
            // Current has date, existing doesn't - replace
            postMap.set(key, post);
          } else if (currentHasDate && existingHasDate) {
            // Both have dates - if same date, prefer the one that matches expected format
            // Keep the first one encountered (shouldn't happen if slugs are correct)
            console.warn(`[Blog API] Duplicate research post detected: ${post.title} (${post.date}) - keeping first occurrence (slug: ${existing.slug}), skipping duplicate (slug: ${post.slug})`);
            // Skip current duplicate - keep existing
            continue;
          }
          // If existing has date and current doesn't, keep existing (skip current)
          continue;
        } else {
          // First occurrence - add it
          postMap.set(key, post);
        }
      } else {
        // Non-research posts: deduplicate by slug (should be unique)
        if (!postMap.has(post.slug)) {
          postMap.set(post.slug, post);
        } else {
          console.warn(`[Blog API] Duplicate non-research post slug detected: ${post.slug} - keeping first occurrence`);
        }
      }
    }
    
    // Convert map back to array and sort
    const posts = Array.from(postMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}





