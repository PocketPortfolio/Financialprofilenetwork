/**
 * Backfill publishedAt timestamps for existing published posts
 * Uses file modification time as a reasonable estimate
 */

import fs from 'fs';
import path from 'path';

interface BlogPost {
  id: string;
  date: string;
  scheduledTime?: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  keywords: string[];
  publishedAt?: string;
}

async function main() {
  const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(calendarPath)) {
    console.error(`❌ Calendar not found: ${calendarPath}`);
    process.exit(1);
  }

  const calendar: BlogPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  let updatedCount = 0;

  for (const post of calendar) {
    if (post.status === 'published' && !post.publishedAt) {
      const mdxPath = path.join(postsDir, `${post.slug}.mdx`);
      
      if (fs.existsSync(mdxPath)) {
        const stats = fs.statSync(mdxPath);
        post.publishedAt = stats.mtime.toISOString();
        updatedCount++;
        console.log(`✅ Added publishedAt for: ${post.title} (${post.publishedAt})`);
      } else {
        console.warn(`⚠️  File not found for published post: ${post.slug}`);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
    console.log(`\n✅ Updated ${updatedCount} posts with publishedAt timestamps`);
  } else {
    console.log(`\n✅ All published posts already have publishedAt timestamps`);
  }
}

main().catch(console.error);

