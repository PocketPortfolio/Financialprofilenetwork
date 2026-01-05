/**
 * Verify Blog Posts Script
 * Checks that all published posts have their MDX and image files
 * Run this to verify the blog system is working correctly
 */

import fs from 'fs';
import path from 'path';

interface BlogPost {
  id: string;
  date: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: string;
  keywords: string[];
}

function verifyBlogPosts(): void {
  const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
  
  if (!fs.existsSync(calendarPath)) {
    console.error(`❌ Calendar not found: ${calendarPath}`);
    process.exit(1);
  }

  const calendar: BlogPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  const today = new Date().toISOString().split('T')[0];

  // Check all posts that should be published (date <= today and status = published)
  const shouldBePublished = calendar.filter(
    p => p.date <= today && p.status === 'published'
  );

  console.log(`📋 Checking ${shouldBePublished.length} published posts...\n`);

  let missing = 0;
  const missingPosts: Array<{ title: string; slug: string; missingFiles: string[] }> = [];

  shouldBePublished.forEach(post => {
    const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
    
    const missingFiles: string[] = [];
    
    if (!fs.existsSync(mdxPath)) {
      missingFiles.push('MDX');
    }
    
    if (!fs.existsSync(imagePath)) {
      missingFiles.push('Image');
    }
    
    if (missingFiles.length > 0) {
      console.error(`❌ Missing files for: ${post.title}`);
      console.error(`   Missing: ${missingFiles.join(', ')}`);
      console.error(`   MDX: ${mdxPath}`);
      console.error(`   Image: ${imagePath}\n`);
      missing++;
      missingPosts.push({
        title: post.title,
        slug: post.slug,
        missingFiles
      });
    }
  });

  // Check for overdue posts (date < today but still pending)
  const overdue = calendar.filter(
    p => p.date < today && p.status === 'pending'
  );

  if (overdue.length > 0) {
    console.log(`\n⚠️  Found ${overdue.length} overdue post(s):`);
    overdue.forEach(post => {
      const days = Math.floor(
        (new Date(today).getTime() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`   - ${post.title} (${post.date}) - ${days} day(s) overdue`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (missing > 0) {
    console.error(`\n❌ Verification Failed: ${missing} post(s) are missing files`);
    console.error('\nMissing Posts:');
    missingPosts.forEach(p => {
      console.error(`  - ${p.title} (${p.slug})`);
      console.error(`    Missing: ${p.missingFiles.join(', ')}`);
    });
    process.exit(1);
  } else {
    console.log(`\n✅ Verification Passed: All ${shouldBePublished.length} published posts have files`);
    if (overdue.length > 0) {
      console.log(`\n⚠️  Note: ${overdue.length} overdue post(s) detected (will be generated on next run)`);
    }
    process.exit(0);
  }
}

verifyBlogPosts();

