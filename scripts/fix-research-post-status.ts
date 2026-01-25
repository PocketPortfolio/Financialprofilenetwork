/**
 * Fix research post status after slug migration
 * Restores published status for posts that have files but were reset to pending
 */

import fs from 'fs';
import path from 'path';

interface ResearchPost {
  id: string;
  date: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  publishedAt?: string;
  [key: string]: any;
}

function fixResearchPostStatus() {
  const calendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
  
  if (!fs.existsSync(calendarPath)) {
    console.error('❌ Research calendar file not found');
    process.exit(1);
  }

  const calendar: ResearchPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  console.log(`📋 Loaded ${calendar.length} research posts`);

  const today = new Date().toISOString().split('T')[0];
  let fixedCount = 0;
  const fixed: Array<{ title: string; date: string; oldStatus: string; newStatus: string }> = [];

  for (const post of calendar) {
    // Only check posts that are pending but have files
    if (post.status !== 'pending') {
      continue;
    }

    // Check if files exist with the new slug (with date)
    const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
    
    const mdxExists = fs.existsSync(mdxPath);
    const imageExists = fs.existsSync(imagePath);

    // If both files exist and post date is in the past, it should be published
    if (mdxExists && imageExists && post.date < today) {
      // Verify files are not empty
      try {
        const mdxStats = fs.statSync(mdxPath);
        const imageStats = fs.statSync(imagePath);
        
        if (mdxStats.size > 0 && imageStats.size > 0) {
          // Files exist and are valid - restore published status
          const oldStatus = post.status;
          post.status = 'published';
          
          // Set publishedAt if not already set (use file modification time)
          if (!post.publishedAt) {
            const publishTime = new Date(Math.max(mdxStats.mtime.getTime(), imageStats.mtime.getTime()));
            post.publishedAt = publishTime.toISOString();
          }
          
          fixed.push({
            title: post.title,
            date: post.date,
            oldStatus,
            newStatus: post.status
          });
          fixedCount++;
        }
      } catch (error) {
        // Skip if we can't read file stats
        continue;
      }
    }
  }

  if (fixedCount === 0) {
    console.log('✅ No posts needed status fixes');
    return;
  }

  console.log(`\n📝 Fixing ${fixedCount} research post statuses:`);
  fixed.slice(0, 10).forEach(f => {
    console.log(`   ${f.title} (${f.date}): ${f.oldStatus} → ${f.newStatus}`);
  });
  if (fixed.length > 10) {
    console.log(`   ... and ${fixed.length - 10} more`);
  }

  // Backup original file
  const backupPath = `${calendarPath}.backup-status-fix-${Date.now()}`;
  fs.copyFileSync(calendarPath, backupPath);
  console.log(`\n💾 Backup created: ${backupPath}`);

  // Write updated calendar
  fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
  console.log(`✅ Fixed ${fixedCount} post statuses in research calendar`);
  console.log(`\n📋 Summary:`);
  console.log(`   Total posts: ${calendar.length}`);
  console.log(`   Fixed: ${fixedCount}`);
  console.log(`   Published: ${calendar.filter(p => p.status === 'published').length}`);
  console.log(`   Pending: ${calendar.filter(p => p.status === 'pending').length}`);
}

fixResearchPostStatus();

