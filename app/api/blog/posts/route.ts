import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}





