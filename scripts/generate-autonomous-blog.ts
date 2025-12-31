/**
 * Autonomous Blog Post Generation Script
 * Uses OpenAI GPT-4 for content and DALL-E 3 for images
 * Runs via cron/GitHub Actions to generate scheduled posts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required. Set it in GitHub Secrets or .env.local');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface BlogPost {
  id: string;
  date: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  keywords: string[];
  type?: 'ai-generated' | 'syndicated' | 'manual';
  source?: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group' | null;
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
}

async function generateBlogPost(post: BlogPost, retryCount = 0): Promise<void> {
  const MAX_RETRIES = 2;
  console.log(`📝 Generating: ${post.title}${retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : ''}`);
  
  // Determine homepage anchor text based on pillar
  const homepageAnchors = [
    'Sovereign Financial Tracking',
    'Google Drive Portfolio Sync',
    'JSON-based Investment Tracker'
  ];
  const selectedAnchor = homepageAnchors[Math.floor(Math.random() * homepageAnchors.length)];

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
- ALWAYS include a CTA for Corporate/Founder Tiers to unlock Sovereign Sync
- Write in MDX format with frontmatter
- Minimum 1200 words, maximum 2000 words
- Use code examples when relevant (especially JSON examples)
- Include real-world scenarios and data
- Write in a technical but accessible tone
- Use markdown formatting (headers, lists, code blocks, bold, italic)
- Include practical examples and use cases

🔗 SEO STRATEGY - INTERNAL LINKING (CRITICAL):
- In the introduction OR the "Verdict" section, you MUST include ONE contextual link back to the homepage (/) using this exact anchor text: "${selectedAnchor}"
- DO NOT use generic phrases like "Click here" or "Learn more" - use the exact anchor text provided
- When generating the "Key Takeaways" section, explicitly mention: "Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database." This reinforces the keywords found on the homepage.
${crossLink ? `- If relevant to the content, include a contextual link to ${crossLink} using natural anchor text related to the topic.` : ''}
- The homepage link should feel natural and contextual, not forced`;

  const userPrompt = `Write a comprehensive blog post titled "${post.title}".

Pillar: ${post.pillar}
Keywords: ${post.keywords.join(', ')}

Structure:
1. Hook (compelling opening that addresses the problem)
2. Problem statement (why this matters)
3. Deep dive / analysis (technical or philosophical exploration)
4. Solution / insights (what we've learned or built)
5. Key Takeaways section (MUST include: "Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database.")
6. Verdict (clear conclusion with actionable takeaways - MUST include homepage link with anchor text: "${selectedAnchor}")
7. CTA for Sovereign Sync (link to /sponsor page)

🔗 REQUIRED INTERNAL LINKS:
- Homepage link: In the introduction or Verdict section, link to "/" using anchor text "${selectedAnchor}"
${crossLink ? `- Cross-link: If relevant, include a natural link to "${crossLink}"` : ''}

Format as MDX with frontmatter:
---
title: "${post.title}"
date: "${post.date}"
description: "[SEO-optimized description, 150-160 characters, include keywords]"
tags: [${post.keywords.map(k => `"${k}"`).join(', ')}]
author: "Pocket Portfolio AI"
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
    const duePosts = calendar.filter(
      post => post.date <= today && post.status === 'pending'
    );

    if (duePosts.length === 0) {
      console.log('✅ No posts due for generation');
      process.exit(0);
    }

    console.log(`📅 Found ${duePosts.length} posts due for generation`);
    console.log(`📅 Today: ${today}`);
    console.log('');

    let successCount = 0;
    let failureCount = 0;

    for (const post of duePosts) {
      try {
        await generateBlogPost(post);
        post.status = 'published';
        successCount++;
        // Delay to avoid rate limits (2 seconds between posts)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        post.status = 'failed';
        failureCount++;
        console.error(`❌ Failed to generate ${post.id}:`, error.message || error);
        // Continue with next post even if one fails
      }
    }

    // Update calendar (always save, even if some posts failed)
    fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
    console.log('');
    console.log('✅ Calendar updated');
    console.log(`📊 Summary: ${successCount} published, ${failureCount} failed`);

    // Exit with error code if all posts failed
    if (failureCount > 0 && successCount === 0) {
      console.error('❌ All posts failed to generate');
      process.exit(1);
    }

    // Exit with warning code if some posts failed
    if (failureCount > 0) {
      console.warn(`⚠️ ${failureCount} post(s) failed, but ${successCount} succeeded`);
      process.exit(0); // Still exit successfully to allow deployment
    }

    console.log('✅ All posts generated successfully');
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

