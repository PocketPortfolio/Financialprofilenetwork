/**
 * Rename research post files from old slugs to new slugs (with dates)
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

function renameResearchFiles() {
  const calendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
  const calendar: ResearchPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
  
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');
  
  let renamedCount = 0;
  const renamed: Array<{ title: string; oldSlug: string; newSlug: string }> = [];

  for (const post of calendar) {
    // Check if new slug includes date (already migrated)
    if (!post.slug.match(/-2026-\d{2}-\d{2}$/)) {
      continue; // Skip if slug doesn't have date
    }

    const oldSlug = post.slug.replace(/-2026-\d{2}-\d{2}$/, '');
    const newSlug = post.slug;

    const oldMdxPath = path.join(postsDir, `${oldSlug}.mdx`);
    const newMdxPath = path.join(postsDir, `${newSlug}.mdx`);
    const oldImagePath = path.join(imagesDir, `${oldSlug}.png`);
    const newImagePath = path.join(imagesDir, `${newSlug}.png`);

    // Check if old files exist and new files don't
    const oldMdxExists = fs.existsSync(oldMdxPath);
    const newMdxExists = fs.existsSync(newMdxPath);
    const oldImageExists = fs.existsSync(oldImagePath);
    const newImageExists = fs.existsSync(newImagePath);

    if (oldMdxExists && !newMdxExists) {
      // Rename MDX file
      fs.renameSync(oldMdxPath, newMdxPath);
      console.log(`✅ Renamed MDX: ${oldSlug}.mdx → ${newSlug}.mdx`);
      renamedCount++;
    }

    if (oldImageExists && !newImageExists) {
      // Rename image file
      fs.renameSync(oldImagePath, newImagePath);
      console.log(`✅ Renamed Image: ${oldSlug}.png → ${newSlug}.png`);
    }

    if ((oldMdxExists && !newMdxExists) || (oldImageExists && !newImageExists)) {
      renamed.push({
        title: post.title,
        oldSlug,
        newSlug
      });
    }
  }

  if (renamedCount === 0) {
    console.log('✅ No files needed renaming');
    return;
  }

  console.log(`\n📋 Summary:`);
  console.log(`   Files renamed: ${renamedCount}`);
  console.log(`   Posts affected: ${renamed.length}`);
}

renameResearchFiles();

