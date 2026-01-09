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
    const posts = files
      .filter(file => file.endsWith('.mdx'))
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
          category: data.category || 'deep-dive', // ✅ ADD CATEGORY
        };
      })
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





