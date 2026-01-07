/**
 * Autonomous Blog Post Generation Script
 * Uses OpenAI GPT-4 for content and DALL-E 3 for images
 * Runs via cron/GitHub Actions to generate scheduled posts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Load .env.local if it exists
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split(/\r?\n/);
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex <= 0) continue;
        
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1);
        
        value = value.trim();
        
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Only set if not already in process.env
        if (!process.env[key] && value) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      console.warn(`⚠️  Failed to load ${envFile}:`, error);
    }
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required. Set it in GitHub Secrets or .env.local');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface BlogPost {
  id: string;
  date: string;
  scheduledTime?: string; // Optional: "09:00" or "16:00" (UTC) - if not set, post can be generated anytime on the scheduled date
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  keywords: string[];
  type?: 'ai-generated' | 'syndicated' | 'manual';
  source?: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group' | null;
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
  publishedAt?: string; // ISO timestamp when post was actually published
}

async function generateBlogPost(post: BlogPost, retryCount = 0): Promise<void> {
  const MAX_RETRIES = 2;
  console.log(`📝 Generating: ${post.title}${retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : ''}`);
  
  // Determine homepage anchor text and route based on pillar
  const homepageAnchors = [
    { text: 'Sovereign Financial Tracking', route: '/' },
    { text: 'Google Drive Portfolio Sync', route: '/features/google-drive-sync' },
    { text: 'JSON-based Investment Tracker', route: '/' }
  ];
  const selectedAnchorObj = homepageAnchors[Math.floor(Math.random() * homepageAnchors.length)];
  const selectedAnchor = selectedAnchorObj.text;
  const homepageLink = selectedAnchorObj.route;

  // Determine cross-pollination link based on content
  let crossLink = '';
  if (post.keywords.some(k => k.toLowerCase().includes('privacy') || k.toLowerCase().includes('data ownership'))) {
    crossLink = '/features/privacy';
  } else if (post.keywords.some(k => k.toLowerCase().includes('aapl') || k.toLowerCase().includes('apple') || k.toLowerCase().includes('tech stock'))) {
    crossLink = '/stock/aapl';
  } else if (post.pillar === 'product') {
    crossLink = '/features';
  } else if (post.pillar === 'market') {
    crossLink = '/dashboard';
  }
  
  // Generate article content
  const systemPrompt = `You are the CTO of a high-frequency trading firm. You write with the precision of Linus Torvalds and the philosophy of Naval Ravikant. You HATE vendor lock-in. You LOVE JSON.

CRITICAL CONSTRAINTS:
- NEVER mention "Excel editing" or "Spreadsheets" as a feature. Use "Raw Data" or "JSON" only.
- NEVER promise users can "edit in Excel" - this is a lie that breaks the sync.
- ALWAYS include a "Verdict" section at the end with a clear conclusion
- DO NOT include a CTA section in the content - the template already includes one at the bottom
- Write in MDX format with frontmatter
- Minimum 1200 words, maximum 2000 words
- Use code examples when relevant (especially JSON examples)
- Include real-world scenarios and data
- Write in a technical but accessible tone
- Use markdown formatting (headers, lists, code blocks, bold, italic)
- Include practical examples and use cases

🔗 SEO STRATEGY - INTERNAL LINKING (CRITICAL):
- In the introduction OR the "Verdict" section, you MUST include ONE contextual link using this exact anchor text: "${selectedAnchor}" pointing to "${homepageLink}"
- DO NOT use generic phrases like "Click here" or "Learn more" - use the exact anchor text provided
- When generating the "Key Takeaways" section, explicitly mention: "Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database." This reinforces the keywords found on the homepage.
${crossLink ? `- If relevant to the content, include a contextual link to "${crossLink}" using natural anchor text related to the topic.` : ''}
- The link should feel natural and contextual, not forced
- All links must use markdown format: [Anchor Text](/route)
- Anchor text routing:
  * "Sovereign Financial Tracking" → "/" (homepage)
  * "Google Drive Portfolio Sync" → "/features/google-drive-sync" (features page)
  * "JSON-based Investment Tracker" → "/" (homepage)
- Sponsor links must use: [Learn more about our Corporate and Founder Tiers](/sponsor) or [sponsor page](/sponsor)
- Feature links must use: [Set up Google Drive Sync](/features/google-drive-sync) or [Google Drive Sync](/features/google-drive-sync)`;

  const userPrompt = `Write a comprehensive blog post titled "${post.title}".

Pillar: ${post.pillar}
Keywords: ${post.keywords.join(', ')}

Structure:
1. Hook (compelling opening that addresses the problem)
2. Problem statement (why this matters)
3. Deep dive / analysis (technical or philosophical exploration)
4. Solution / insights (what we've learned or built)
5. Key Takeaways section (MUST include: "Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database.")
6. Verdict (clear conclusion with actionable takeaways - MUST include link with anchor text: "${selectedAnchor}" pointing to "${homepageLink}")

🔗 REQUIRED INTERNAL LINKS (CRITICAL):
- Primary link: In the introduction or Verdict section, link to "${homepageLink}" using anchor text "${selectedAnchor}" (format: [${selectedAnchor}](${homepageLink}))
${crossLink ? `- Cross-link: If relevant, include a natural link to "${crossLink}" using contextual anchor text` : ''}

⚠️ IMPORTANT: DO NOT include a CTA section in your content. The blog template automatically adds a CTA at the bottom of every post.

Format as MDX with frontmatter:
---
title: "${post.title}"
date: "${post.date}"
description: "[SEO-optimized description, 150-160 characters, include keywords]"
tags: [${post.keywords.map(k => `"${k}"`).join(', ')}]
author: "Pocket Portfolio Team"
image: "/images/blog/${post.slug}.png"
pillar: "${post.pillar}"
---

[Your content here]`;

  try {
    // Generate article content with retry logic
    let content: string | null = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!content && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`📝 Generating content (attempt ${attempts}/${maxAttempts})...`);
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        content = completion.choices[0]?.message?.content || null;
        if (!content) {
          throw new Error('No content generated from OpenAI');
        }
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate content after ${maxAttempts} attempts: ${error.message}`);
        }
        console.warn(`⚠️ Attempt ${attempts} failed, retrying... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, 5000 * attempts)); // Exponential backoff
      }
    }

    if (!content) {
      throw new Error('Failed to generate content after all retries');
    }

    // Generate image with retry logic
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. No text. Theme: ${post.title}. Professional, modern, technical aesthetic.`;
    
    console.log(`🎨 Generating image for: ${post.slug}`);
    let imageUrl: string | null = null;
    attempts = 0;
    
    while (!imageUrl && attempts < maxAttempts) {
      attempts++;
      try {
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt,
          size: '1024x1024',
          quality: 'standard',
        });

        imageUrl = imageResponse.data?.[0]?.url || null;
        if (!imageUrl) {
          throw new Error('No image URL returned from DALL-E');
        }
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate image after ${maxAttempts} attempts: ${error.message}`);
        }
        console.warn(`⚠️ Image generation attempt ${attempts} failed, retrying... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, 5000 * attempts)); // Exponential backoff
      }
    }

    if (!imageUrl) {
      throw new Error('Failed to generate image after all retries');
    }

    // Download and save image with retry logic
    console.log(`📥 Downloading image: ${imageUrl}`);
    let imageBuffer: ArrayBuffer | null = null;
    attempts = 0;
    
    while (!imageBuffer && attempts < maxAttempts) {
      attempts++;
      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          throw new Error(`HTTP ${imageRes.status}: ${imageRes.statusText}`);
        }
        imageBuffer = await imageRes.arrayBuffer();
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to download image after ${maxAttempts} attempts: ${error.message}`);
        }
        console.warn(`⚠️ Image download attempt ${attempts} failed, retrying... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
      }
    }

    if (!imageBuffer) {
      throw new Error('Failed to download image after all retries');
    }

    // Save files
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    console.log(`💾 Image saved: ${imagePath}`);

    const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
    fs.mkdirSync(path.dirname(mdxPath), { recursive: true });
    fs.writeFileSync(mdxPath, content);
    console.log(`💾 Post saved: ${mdxPath}`);

    console.log(`✅ Generated: ${post.slug}`);
  } catch (error: any) {
    console.error(`❌ Failed: ${post.slug}`, error);
    
    // Retry the entire post generation if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying post generation (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 10000 * (retryCount + 1))); // Exponential backoff
      return generateBlogPost(post, retryCount + 1);
    }
    
    throw error;
  }
}

async function main() {
  try {
    const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
    
    if (!fs.existsSync(calendarPath)) {
      console.error(`❌ Calendar not found: ${calendarPath}`);
      console.log('💡 Run: npm run generate-blog-calendar');
      process.exit(1);
    }

    const calendar: BlogPost[] = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    // Debug logging
    console.log(`📅 Today's date: ${today}`);
    console.log(`🕐 Current UTC time: ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
    console.log(`📋 Total posts in calendar: ${calendar.length}`);
    console.log(`📋 Posts with status "pending": ${calendar.filter(p => p.status === 'pending').length}`);
    console.log(`📋 Posts with date <= today: ${calendar.filter(p => p.date <= today).length}`);
    console.log(`📋 Posts with date === today: ${calendar.filter(p => p.date === today).length}`);
    console.log(`📋 Posts with date === today AND status === 'pending': ${calendar.filter(p => p.date === today && p.status === 'pending').length}`);
    
    // Show which posts have date <= today (for debugging)
    const postsWithDateLeToday = calendar.filter(p => p.date <= today);
    if (postsWithDateLeToday.length > 0) {
      console.log(`\n📋 Posts with date <= today (${postsWithDateLeToday.length}):`);
      postsWithDateLeToday.forEach(p => {
        console.log(`   - ${p.title} (${p.date}) - Status: ${p.status} - ${p.status === 'pending' ? '✅ Should generate' : '❌ Already published/failed'}`);
      });
    }
    
    // Log NYE post specifically if it exists
    const nyePost = calendar.find(p => p.id === 'nye-2025-review');
    if (nyePost) {
      console.log(`\n🔍 NYE Post Debug:`);
      console.log(`   - Date: ${nyePost.date}`);
      console.log(`   - Status: ${nyePost.status}`);
      console.log(`   - Date <= today: ${nyePost.date <= today}`);
      console.log(`   - Status === 'pending': ${nyePost.status === 'pending'}`);
      console.log(`   - Should be included: ${nyePost.date <= today && nyePost.status === 'pending'}`);
    }
    
    // Log Jan 6 post specifically if it exists
    const jan6Post = calendar.find(p => p.id === 'engine-verification-test-jan-6');
    if (jan6Post) {
      console.log(`\n🔍 Jan 6 Post Debug:`);
      console.log(`   - Date: ${jan6Post.date}`);
      console.log(`   - Status: ${jan6Post.status}`);
      console.log(`   - Date <= today: ${jan6Post.date <= today}`);
      console.log(`   - Status === 'pending': ${jan6Post.status === 'pending'}`);
      console.log(`   - Should be included: ${jan6Post.date <= today && jan6Post.status === 'pending'}`);
    }
    
    // Log Jan 7 posts specifically if they exist
    const jan7Posts = calendar.filter(p => p.id.includes('jan-7'));
    if (jan7Posts.length > 0) {
      console.log(`\n🔍 Jan 7 Posts Debug (${jan7Posts.length} found):`);
      jan7Posts.forEach(post => {
        console.log(`   - ${post.id}:`);
        console.log(`     Date: ${post.date}`);
        console.log(`     Status: ${post.status}`);
        console.log(`     Date <= today: ${post.date <= today}`);
        console.log(`     Date === today: ${post.date === today}`);
        console.log(`     Status === 'pending': ${post.status === 'pending'}`);
        console.log(`     Should be included: ${post.date <= today && post.status === 'pending'}`);
      });
    }
    
    // Find all posts that are due (date <= today) or overdue (date < today)
    // If scheduledTime is set, only include if current time >= scheduled time
    const duePosts = calendar.filter(post => {
      if (post.status !== 'pending') return false;
      
      const postDate = new Date(post.date + 'T00:00:00Z');
      const todayDate = new Date(today + 'T00:00:00Z');
      
      // If post date is in the past, always include (overdue)
      if (postDate < todayDate) return true;
      
      // If post date is in the future, exclude
      if (postDate > todayDate) return false;
      
      // Post date is today - check scheduled time
      if (post.scheduledTime) {
        const [hour, minute] = post.scheduledTime.split(':').map(Number);
        const scheduledTimeMinutes = hour * 60 + minute;
        
        // Only include if current time >= scheduled time
        const isTimeReached = currentTimeMinutes >= scheduledTimeMinutes;
        
        if (!isTimeReached) {
          console.log(`⏰ Post "${post.title}" scheduled for ${post.scheduledTime} UTC - current time ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} UTC (not yet due)`);
        }
        
        return isTimeReached;
      }
      
      // No scheduled time - can be generated anytime today
      return true;
    });

    // Check for overdue posts (past their date but still pending) for logging
    const overduePosts = duePosts.filter(post => post.date < today);
    
    if (overduePosts.length > 0) {
      console.log(`\n⚠️  Found ${overduePosts.length} overdue post(s) that should have been generated:`);
      overduePosts.forEach(post => {
        const daysOverdue = Math.floor((new Date(today).getTime() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   - ${post.title} (${post.date}) - ${daysOverdue} day(s) overdue`);
      });
      console.log(`   → These will be generated now to catch up\n`);
    }

    if (duePosts.length === 0) {
      console.log('\n⚠️  No posts due for generation');
      console.log('💡 Debug: Check if any posts have date <= today and status === "pending"');
      
      // Check for posts with date === today (exact match) - these SHOULD be generated
      const todayPosts = calendar.filter(
        post => post.date === today && post.status === 'pending'
      );
      
      if (todayPosts.length > 0) {
        // Check if any are waiting for scheduled time
        const waitingForTime = todayPosts.filter(post => {
          if (!post.scheduledTime) return false;
          const [hour, minute] = post.scheduledTime.split(':').map(Number);
          const scheduledTimeMinutes = hour * 60 + minute;
          return currentTimeMinutes < scheduledTimeMinutes;
        });
        
        const shouldBeGenerated = todayPosts.filter(post => {
          if (!post.scheduledTime) return true; // No time = should be generated
          const [hour, minute] = post.scheduledTime.split(':').map(Number);
          const scheduledTimeMinutes = hour * 60 + minute;
          return currentTimeMinutes >= scheduledTimeMinutes;
        });
        
        if (shouldBeGenerated.length > 0) {
          console.error('\n❌ CRITICAL ERROR: Found posts scheduled for TODAY that should be generated NOW but were not detected!');
          console.error(`   Expected ${shouldBeGenerated.length} post(s) for ${today} at ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} UTC:`);
          shouldBeGenerated.forEach(post => {
            console.error(`   - ${post.title} (ID: ${post.id})`);
            console.error(`     Date: ${post.date}, Status: ${post.status}`);
            console.error(`     Scheduled Time: ${post.scheduledTime || 'anytime'}`);
            console.error(`     Date === today: ${post.date === today}`);
            console.error(`     Status === 'pending': ${post.status === 'pending'}`);
          });
          console.error('\n   This is a BUG in the date/time comparison logic!');
          console.error('   The posts exist and should be generated, but the filter is not finding them.');
          process.exit(1);
        }
        
        if (waitingForTime.length > 0) {
          console.log(`\n⏰ ${waitingForTime.length} post(s) scheduled for today but waiting for scheduled time:`);
          waitingForTime.forEach(post => {
            console.log(`   - ${post.title} - scheduled for ${post.scheduledTime} UTC`);
          });
        }
      }
      
      // If no posts for today, that's fine - exit normally
      console.log(`\n✅ No posts scheduled for ${today} (or all already generated)`);
      process.exit(0);
    }

    console.log(`📅 Found ${duePosts.length} posts due for generation`);
    console.log(`📅 Today: ${today}`);
    console.log('');

    let successCount = 0;
    let failureCount = 0;
    const postsToUpdate: BlogPost[] = [];

    for (const post of duePosts) {
      try {
        await generateBlogPost(post);
        
        // ✅ CRITICAL: Verify files exist BEFORE updating status
        const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
        const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
        
        if (!fs.existsSync(mdxPath)) {
          throw new Error(`MDX file not created: ${mdxPath}`);
        }
        if (!fs.existsSync(imagePath)) {
          throw new Error(`Image file not created: ${imagePath}`);
        }
        
        // ✅ Only mark for status update if files are verified to exist
        postsToUpdate.push(post);
        successCount++;
        console.log(`✅ Verified: ${post.slug} - Both MDX and image files exist`);
        
        // Delay to avoid rate limits (2 seconds between posts)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        post.status = 'failed';
        failureCount++;
        console.error(`❌ Failed to generate ${post.id}:`, error.message || error);
        // Continue with next post even if one fails
      }
    }

    // ✅ UPDATE STATUS ONLY FOR POSTS WITH VERIFIED FILES
    // This ensures status is only 'published' when files actually exist
    const publishTimestamp = new Date().toISOString();
    for (const post of postsToUpdate) {
      post.status = 'published';
      post.publishedAt = publishTimestamp; // Store actual publish time
      console.log(`📝 Status updated to 'published': ${post.slug} (published at ${publishTimestamp})`);
    }

    // Update calendar (always save, even if some posts failed)
    fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
    console.log('');
    console.log('✅ Calendar updated');
    console.log(`📊 Summary: ${successCount} published, ${failureCount} failed`);

    // CRITICAL: Verify posts scheduled for TODAY were actually generated
    // Only check posts that should have been generated (time has passed or no scheduled time)
    const todayExpectedPosts = calendar.filter(post => {
      if (post.date !== today || post.status !== 'pending') return false;
      
      // If no scheduled time, should have been generated
      if (!post.scheduledTime) return true;
      
      // If scheduled time, only check if time has passed
      const [hour, minute] = post.scheduledTime.split(':').map(Number);
      const scheduledTimeMinutes = hour * 60 + minute;
      return currentTimeMinutes >= scheduledTimeMinutes;
    });
    
    if (todayExpectedPosts.length > 0) {
      console.error('\n❌ CRITICAL ERROR: Posts scheduled for TODAY were not generated!');
      console.error(`   Expected ${todayExpectedPosts.length} post(s) for ${today} at ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} UTC:`);
      todayExpectedPosts.forEach(post => {
        console.error(`   - ${post.title} (ID: ${post.id})`);
        console.error(`     Status: ${post.status} (should be 'published')`);
        console.error(`     Scheduled Time: ${post.scheduledTime || 'anytime'}`);
        
        // Check if file exists
        const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
        const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
        const mdxExists = fs.existsSync(mdxPath);
        const imageExists = fs.existsSync(imagePath);
        
        console.error(`     MDX file exists: ${mdxExists ? '✅' : '❌'}`);
        console.error(`     Image file exists: ${imageExists ? '✅' : '❌'}`);
      });
      console.error('\n   This is a CRITICAL FAILURE - posts for today were not generated!');
      console.error('   The workflow will fail to alert you immediately.');
      process.exit(1);
    }

    // Verify generated posts actually have files on disk
    const generatedPosts = duePosts.filter(post => post.status === 'published');
    const missingFiles: string[] = [];
    
    for (const post of generatedPosts) {
      const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
      const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
      
      if (!fs.existsSync(mdxPath)) {
        missingFiles.push(`MDX: ${post.slug}.mdx`);
      }
      if (!fs.existsSync(imagePath)) {
        missingFiles.push(`Image: ${post.slug}.png`);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error('\n❌ CRITICAL ERROR: Generated posts are missing files!');
      console.error('   Missing files:');
      missingFiles.forEach(file => console.error(`   - ${file}`));
      console.error('   This indicates a file write failure.');
      process.exit(1);
    }

    // Check if any posts scheduled for TODAY failed
    const todayFailedPosts = calendar.filter(
      post => post.date === today && post.status === 'failed'
    );
    
    if (todayFailedPosts.length > 0) {
      console.error('\n❌ CRITICAL ERROR: Posts scheduled for TODAY failed to generate!');
      console.error(`   Failed ${todayFailedPosts.length} post(s) for ${today}:`);
      todayFailedPosts.forEach(post => {
        console.error(`   - ${post.title} (ID: ${post.id})`);
      });
      console.error('   The workflow will fail to alert you immediately.');
      process.exit(1);
    }

    // Exit with error code if all posts failed
    if (failureCount > 0 && successCount === 0) {
      console.error('❌ All posts failed to generate');
      process.exit(1);
    }

    // Exit with warning code if some posts failed (but not today's posts)
    if (failureCount > 0) {
      console.warn(`⚠️ ${failureCount} post(s) failed, but ${successCount} succeeded`);
      console.warn('   Note: Failed posts were not scheduled for today, so workflow continues.');
      process.exit(0); // Still exit successfully to allow deployment
    }

    console.log('✅ All posts generated successfully');
    console.log('✅ All expected posts for today were generated and verified');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Fatal error in blog generation:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

