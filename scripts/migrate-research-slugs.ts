/**
 * Migration script to update research post slugs to include dates
 * This fixes the duplicate slug issue while preserving post status
 */

import fs from 'fs';
import path from 'path';

interface ResearchPost {
  id: string;
  date: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  [key: string]: any;
}

function migrateResearchSlugs() {
  const calendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
  
  if (!fs.existsSync(calendarPath)) {
    console.error('❌ Research calendar file not found');
    process.exit(1);
  }

  const calendar: ResearchPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  console.log(`📋 Loaded ${calendar.length} research posts`);

  let updatedCount = 0;
  const updates: Array<{ oldSlug: string; newSlug: string; date: string }> = [];

  for (const post of calendar) {
    // Check if slug already includes date (format: slug-YYYY-MM-DD)
    const datePattern = /-\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(post.slug)) {
      // Already migrated
      continue;
    }

    // Generate new slug with date
    const newSlug = `${post.slug}-${post.date.replace(/-/g, '-')}`;
    
    if (post.slug !== newSlug) {
      updates.push({
        oldSlug: post.slug,
        newSlug: newSlug,
        date: post.date
      });
      post.slug = newSlug;
      updatedCount++;
    }
  }

  if (updatedCount === 0) {
    console.log('✅ All research post slugs already include dates - no migration needed');
    return;
  }

  console.log(`\n📝 Updating ${updatedCount} research post slugs:`);
  updates.slice(0, 10).forEach(update => {
    console.log(`   ${update.oldSlug} → ${update.newSlug} (${update.date})`);
  });
  if (updates.length > 10) {
    console.log(`   ... and ${updates.length - 10} more`);
  }

  // Backup original file
  const backupPath = `${calendarPath}.backup-${Date.now()}`;
  fs.copyFileSync(calendarPath, backupPath);
  console.log(`\n💾 Backup created: ${backupPath}`);

  // Write updated calendar
  fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
  console.log(`✅ Updated ${updatedCount} slugs in research calendar`);
  console.log(`\n📋 Summary:`);
  console.log(`   Total posts: ${calendar.length}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Unchanged: ${calendar.length - updatedCount}`);
  
  // Verify no duplicates remain
  const slugs = calendar.map(p => p.slug);
  const uniqueSlugs = new Set(slugs);
  if (slugs.length === uniqueSlugs.size) {
    console.log(`\n✅ Verification: All slugs are now unique!`);
  } else {
    console.error(`\n❌ Verification failed: Still have ${slugs.length - uniqueSlugs.size} duplicate slugs!`);
    process.exit(1);
  }
}

migrateResearchSlugs();

