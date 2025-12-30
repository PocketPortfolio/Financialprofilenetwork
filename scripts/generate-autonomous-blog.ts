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
}

async function generateBlogPost(post: BlogPost): Promise<void> {
  console.log(`📝 Generating: ${post.title}`);
  
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
- Include practical examples and use cases`;

  const userPrompt = `Write a comprehensive blog post titled "${post.title}".

Pillar: ${post.pillar}
Keywords: ${post.keywords.join(', ')}

Structure:
1. Hook (compelling opening that addresses the problem)
2. Problem statement (why this matters)
3. Deep dive / analysis (technical or philosophical exploration)
4. Solution / insights (what we've learned or built)
5. Verdict (clear conclusion with actionable takeaways)
6. CTA for Sovereign Sync (link to /sponsor page)

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    // Generate image
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. No text. Theme: ${post.title}. Professional, modern, technical aesthetic.`;
    
    console.log(`🎨 Generating image for: ${post.slug}`);
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data[0]?.url;
    if (!imageUrl) throw new Error('No image generated');

    // Download and save image
    console.log(`📥 Downloading image: ${imageUrl}`);
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error(`Failed to download image: ${imageRes.statusText}`);
    
    const imageBuffer = await imageRes.arrayBuffer();
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    console.log(`💾 Image saved: ${imagePath}`);

    // Save MDX file
    const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
    fs.mkdirSync(path.dirname(mdxPath), { recursive: true });
    fs.writeFileSync(mdxPath, content);
    console.log(`💾 Post saved: ${mdxPath}`);

    console.log(`✅ Generated: ${post.slug}`);
  } catch (error) {
    console.error(`❌ Failed: ${post.slug}`, error);
    throw error;
  }
}

async function main() {
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
    return;
  }

  console.log(`📅 Found ${duePosts.length} posts due for generation`);
  console.log(`📅 Today: ${today}`);

  for (const post of duePosts) {
    try {
      await generateBlogPost(post);
      post.status = 'published';
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      post.status = 'failed';
      console.error(`Failed to generate ${post.id}:`, error);
    }
  }

  // Update calendar
  fs.writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
  console.log('✅ Calendar updated');
  console.log(`📊 Summary: ${duePosts.filter(p => p.status === 'published').length} published, ${duePosts.filter(p => p.status === 'failed').length} failed`);
}

main().catch(console.error);

