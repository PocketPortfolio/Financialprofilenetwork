/**
 * Autonomous Blog Post Generation Script
 * Uses OpenAI GPT-4 for content and DALL-E 3 for images
 * Runs via cron/GitHub Actions to generate scheduled posts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { fetchRelevantVideo } from './video-fetcher';

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

/**
 * Sanitize MDX content to prevent parsing errors
 * Fixes common issues that cause "Could not parse expression with acorn" errors
 */
function sanitizeMDXContent(content: string): string {
  let cleaned = content;
  
  // Fix 4+ backticks (common artifact)
  cleaned = cleaned.replace(/````+/g, '```');
  
  // Ensure code blocks are properly closed
  const codeBlockMatches = cleaned.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    console.warn('⚠️  Unmatched code block backticks detected - attempting to fix');
    // Try to close unclosed code blocks at the end
    if (!cleaned.trim().endsWith('```')) {
      cleaned = cleaned.trim() + '\n```';
    }
  }
  
  // Fix malformed code block endings (4+ backticks)
  cleaned = cleaned.replace(/````+(\w+)?/g, '```$1');
  
  // Ensure code blocks have proper newlines
  cleaned = cleaned.replace(/```(\w+)?([^\n])/g, '```$1\n$2');
  cleaned = cleaned.replace(/([^\n])```/g, '$1\n```');
  
  // Remove excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  
  return cleaned;
}

interface BlogPost {
  id: string;
  date: string;
  scheduledTime?: string; // Optional: "09:00" or "16:00" (UTC) - if not set, post can be generated anytime on the scheduled date
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  category?: 'how-to-in-tech' | 'deep-dive' | 'research'; // Content category: short-form daily posts vs long-form deep dives vs research reports
  videoId?: string; // YouTube video ID for Research posts
  keywords: string[];
  type?: 'ai-generated' | 'syndicated' | 'manual';
  source?: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group' | null;
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
  publishedAt?: string; // ISO timestamp when post was actually published
}

async function generateBlogPost(post: BlogPost, retryCount = 0): Promise<void> {
  const MAX_RETRIES = 2;
  const isHowTo = post.category === 'how-to-in-tech';
  const isResearch = post.category === 'research';
  console.log(`📝 Generating: ${post.title}${isHowTo ? ' [How-to Mode]' : isResearch ? ' [Research Mode]' : ''}${retryCount > 0 ? ` (Retry ${retryCount}/${MAX_RETRIES})` : ''}`);
  
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
  
  // Fetch video for Research posts
  let videoResult: { videoId: string; title: string; channelTitle: string } | null = null;
  if (isResearch) {
    console.log('🔍 Fetching relevant YouTube video for Research post...');
    const video = await fetchRelevantVideo(post.title, post.keywords);
    if (video) {
      videoResult = {
        videoId: video.videoId,
        title: video.title,
        channelTitle: video.channelTitle,
      };
      post.videoId = video.videoId; // Store in post object for later use
    }
  }

  // Generate article content
  const systemPrompt = isResearch
    ? `You are a Lead Technical Researcher at a high-frequency trading firm. You synthesize research reports with academic rigor, focusing on benchmarks, architectural trade-offs, and future trends. You write with the precision of a systems architect and the analytical depth of a quant researcher.

CRITICAL CONSTRAINTS FOR RESEARCH POSTS:
- NEVER mention "Excel editing" or "Spreadsheets" as a feature. Use "Raw Data" or "JSON" only.
- Write in MDX format with frontmatter
- Minimum 1500 words, maximum 2500 words (Research posts are longer)
- MUST include at least 3 external citations (Documentation, Whitepapers, Engineering Blogs) - NO hallucinations, only real sources
- Use markdown formatting (headers, lists, code blocks, bold, italic)
- Include benchmarks, performance data, and quantitative analysis when relevant
- Write in an academic but accessible tone
- Focus on architectural trade-offs, performance implications, and future trends
- Include practical examples and real-world scenarios

🔗 SEO STRATEGY - INTERNAL LINKING (CRITICAL):
- In the introduction OR the "Verdict" section, you MUST include ONE contextual link using this exact anchor text: "${selectedAnchor}" pointing to "${homepageLink}"
- DO NOT use generic phrases like "Click here" or "Learn more" - use the exact anchor text provided
${crossLink ? `- If relevant to the content, include a contextual link to "${crossLink}" using natural anchor text related to the topic.` : ''}
- The link should feel natural and contextual, not forced
- All links must use markdown format: [Anchor Text](/route)
- Anchor text routing:
  * "Sovereign Financial Tracking" → "/" (homepage)
  * "Google Drive Portfolio Sync" → "/features/google-drive-sync" (features page)
  * "JSON-based Investment Tracker" → "/" (homepage)
- Sponsor links must use: [Learn more about our Corporate and Founder Tiers](/sponsor) or [sponsor page](/sponsor)
- Feature links must use: [Set up Google Drive Sync](/features/google-drive-sync) or [Google Drive Sync](/features/google-drive-sync)`
    : `You are the CTO of a high-frequency trading firm. You write with the precision of Linus Torvalds and the philosophy of Naval Ravikant. You HATE vendor lock-in. You LOVE JSON.

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

  const userPrompt = isResearch
    ? `Act as a Lead Technical Researcher. Synthesize a comprehensive research report titled "${post.title}".

Pillar: ${post.pillar}
Keywords: ${post.keywords.join(', ')}

REQUIRED STRUCTURE:
1. **Abstract** (Executive Summary) - 150-200 words summarizing key findings
2. **Methodology** - How the research was conducted, data sources, benchmarks used
3. **Key Findings** - Core insights with benchmarks, architectural trade-offs, performance implications
${videoResult ? `\n4. **Video Reference** - A relevant video has been selected and will be displayed with the research findings. Reference the video topic "${videoResult.title}" by ${videoResult.channelTitle} in your analysis.\n\n` : ''}4. **References** - MUST cite at least 3 external sources:
   - Documentation (official docs, API references)
   - Whitepapers (technical papers, research papers)
   - Engineering Blogs (company tech blogs, case studies)
   - Format: [Source Title](URL) - Brief description
   - NO hallucinations - only real, verifiable sources

5. **Future Trends** - Analysis of where this technology/approach is heading

6. **Verdict** - Clear conclusion with actionable takeaways (MUST include link with anchor text: "${selectedAnchor}" pointing to "${homepageLink}")

⚠️ IMPORTANT: 
- DO NOT include a CTA section in your content. The blog template automatically adds a CTA at the bottom.
- The transparency footer will be automatically added by the template.
- Focus on quantitative analysis, benchmarks, and architectural trade-offs.

Format as MDX with frontmatter:
---
title: "${post.title}"
date: "${post.date}"
description: "[SEO-optimized description, 150-160 characters, include keywords]"
tags: [${post.keywords.map(k => `"${k}"`).join(', ')}]
author: "Pocket Portfolio Team"
image: "/images/blog/${post.slug}.png"
pillar: "${post.pillar}"
category: "research"
${videoResult ? `videoId: "${videoResult.videoId}"` : ''}
---

[Your research report content here]`
    : isHowTo
    ? `Write a concise, hacker-style technical guide titled "${post.title}".

Keywords: ${post.keywords.join(', ')}

Structure (300-500 words):
1. Brief problem statement (1-2 sentences)
2. Direct solution with code (the main content)
3. Explanation of key concepts (if needed)
4. Quick tip or gotcha (optional)

Format as MDX with frontmatter:
---
title: "${post.title}"
date: "${post.date}"
description: "[SEO-optimized description, 120-140 characters, include keywords]"
tags: [${post.keywords.map(k => `"${k}"`).join(', ')}]
author: "Pocket Portfolio Team"
image: "/images/blog/${post.slug}.png"
pillar: "${post.pillar}"
category: "how-to-in-tech"
---

[Your concise, code-first content here]`
    : `Write a comprehensive blog post titled "${post.title}".

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

    // ✅ SANITIZE MDX CONTENT to prevent parsing errors
    console.log('🧹 Sanitizing MDX content...');
    content = sanitizeMDXContent(content);

    // ✅ DIFFERENT IMAGE PROMPT FOR HOW-TO AND RESEARCH POSTS
    // CRITICAL: Strong text prohibition to prevent DALL-E from generating text in images
    const imagePrompt = isHowTo
      ? `Minimalist terminal interface, dark mode, bright green (#00ff41) text on black background, hacker aesthetic, code-focused, 8k resolution. Absolutely no text, no letters, no words, no numbers, no labels, no typography. Pure abstract visual elements only: geometric shapes, terminal windows, code blocks, command prompts, connecting lines. Theme: ${post.title}. Clean, technical, command-line style.`
      : isResearch
      ? `Academic research visualization, data charts and graphs, professional blue (#3b82f6) and grey (#64748b) palette, minimalist, 8k resolution. Absolutely no text, no letters, no words, no numbers, no labels, no typography. Pure abstract visual elements only: geometric shapes, data charts, graphs, pie charts, bar graphs, stacked blocks, connecting lines. Theme: ${post.title}. Scholarly, analytical, research-focused aesthetic.`
      : `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. Absolutely no text, no letters, no words, no numbers, no labels, no typography. Pure abstract visual elements only: geometric shapes, data charts, graphs, pie charts, bar graphs, stacked blocks, connecting lines. Theme: ${post.title}. Professional, modern, technical aesthetic.`;
    
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

    // Save files with atomic write operations and verification
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    
    // Atomic write: write to temp file first, then rename
    const imageTempPath = `${imagePath}.tmp`;
    fs.writeFileSync(imageTempPath, Buffer.from(imageBuffer));
    fs.renameSync(imageTempPath, imagePath);
    
    // Verify image was written correctly
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file was not created: ${imagePath}`);
    }
    const imageStats = fs.statSync(imagePath);
    if (imageStats.size === 0) {
      throw new Error(`Image file is empty: ${imagePath}`);
    }
    console.log(`💾 Image saved: ${imagePath} (${imageStats.size} bytes)`);

    const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
    fs.mkdirSync(path.dirname(mdxPath), { recursive: true });
    
    // ✅ VALIDATE MDX CAN BE PARSED before saving (prevents deployment of broken posts)
    try {
      // Test serialization to catch parsing errors early
      await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      });
      console.log(`✅ MDX validation passed: ${post.slug} can be parsed successfully`);
    } catch (parseError: any) {
      console.error(`❌ MDX validation failed for ${post.slug}:`, parseError.message);
      console.error(`   This post will fail to render in production!`);
      throw new Error(`MDX content cannot be parsed: ${parseError.message}. Post generation aborted to prevent broken deployment.`);
    }
    
    // Atomic write: write to temp file first, then rename
    const mdxTempPath = `${mdxPath}.tmp`;
    fs.writeFileSync(mdxTempPath, content, 'utf-8');
    fs.renameSync(mdxTempPath, mdxPath);
    
    // Verify MDX was written correctly and is valid
    if (!fs.existsSync(mdxPath)) {
      throw new Error(`MDX file was not created: ${mdxPath}`);
    }
    const mdxStats = fs.statSync(mdxPath);
    if (mdxStats.size === 0) {
      throw new Error(`MDX file is empty: ${mdxPath}`);
    }
    
    // Verify MDX content is valid (has frontmatter and content)
    const writtenContent = fs.readFileSync(mdxPath, 'utf-8');
    if (!writtenContent.includes('---')) {
      throw new Error(`MDX file missing frontmatter: ${mdxPath}`);
    }
    if (writtenContent.split('---').length < 3) {
      throw new Error(`MDX file has invalid frontmatter structure: ${mdxPath}`);
    }
    
    // Verify content matches what we wrote
    if (writtenContent !== content) {
      throw new Error(`MDX file content mismatch - file may be corrupted: ${mdxPath}`);
    }
    
    console.log(`💾 Post saved: ${mdxPath} (${mdxStats.size} bytes)`);

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
    // ✅ Load main calendar (deep dives)
    const mainCalendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
    let mainCalendar: BlogPost[] = [];
    if (fs.existsSync(mainCalendarPath)) {
      try {
        mainCalendar = JSON.parse(fs.readFileSync(mainCalendarPath, 'utf-8'));
      } catch (error: any) {
        console.error(`❌ Error parsing ${mainCalendarPath}:`, error.message);
        console.error('   Using empty calendar as fallback');
        mainCalendar = [];
      }
    }

    // ✅ Load "How to in Tech" calendar (daily posts)
    const howToCalendarPath = path.join(process.cwd(), 'content', 'how-to-tech-calendar.json');
    let howToCalendar: BlogPost[] = [];
    if (fs.existsSync(howToCalendarPath)) {
      try {
        howToCalendar = JSON.parse(fs.readFileSync(howToCalendarPath, 'utf-8'));
      } catch (error: any) {
        console.error(`❌ Error parsing ${howToCalendarPath}:`, error.message);
        console.error('   Using empty calendar as fallback');
        howToCalendar = [];
      }
    }

    // ✅ Load "Research" calendar (research posts)
    const researchCalendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
    let researchCalendar: BlogPost[] = [];
    if (fs.existsSync(researchCalendarPath)) {
      try {
        researchCalendar = JSON.parse(fs.readFileSync(researchCalendarPath, 'utf-8'));
      } catch (error: any) {
        console.error(`❌ Error parsing ${researchCalendarPath}:`, error.message);
        console.error('   Using empty calendar as fallback');
        researchCalendar = [];
      }
    }

    // ✅ Merge calendars and mark categories
    const calendar: BlogPost[] = [
      ...mainCalendar.map(p => ({ ...p, category: (p.category || 'deep-dive') as 'how-to-in-tech' | 'deep-dive' | 'research' })),
      ...howToCalendar.map(p => ({ ...p, category: 'how-to-in-tech' as const })),
      ...researchCalendar.map(p => ({ ...p, category: 'research' as const }))
    ];
    
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
    
    // ✅ PRE-GENERATION HEALTH CHECK: Detect orphaned "published" posts (marked as published but missing files)
    console.log('\n🔍 Pre-generation health check: Scanning for orphaned "published" posts...');
    const orphanedPosts: BlogPost[] = [];
    const publishedPosts = calendar.filter(p => p.status === 'published');
    
    for (const post of publishedPosts) {
      const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
      const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
      
      const mdxExists = fs.existsSync(mdxPath);
      const imageExists = fs.existsSync(imagePath);
      
      if (!mdxExists || !imageExists) {
        orphanedPosts.push(post);
        console.warn(`⚠️  ORPHANED POST DETECTED: ${post.title} (${post.slug})`);
        console.warn(`     Status: published, but MDX exists: ${mdxExists ? '✅' : '❌'}, Image exists: ${imageExists ? '✅' : '❌'}`);
        console.warn(`     Published at: ${post.publishedAt || 'unknown'}`);
      } else {
        // Verify files are not empty
        try {
          const mdxStats = fs.statSync(mdxPath);
          const imageStats = fs.statSync(imagePath);
          if (mdxStats.size === 0 || imageStats.size === 0) {
            orphanedPosts.push(post);
            console.warn(`⚠️  ORPHANED POST DETECTED: ${post.title} (${post.slug}) - files are empty`);
          }
        } catch (error) {
          orphanedPosts.push(post);
          console.warn(`⚠️  ORPHANED POST DETECTED: ${post.title} (${post.slug}) - cannot read file stats`);
        }
      }
    }
    
    if (orphanedPosts.length > 0) {
      console.error(`\n❌ CRITICAL: Found ${orphanedPosts.length} orphaned "published" post(s) missing files!`);
      console.error('   These posts are marked as "published" but their files are missing or invalid.');
      console.error('   Resetting status to "pending" so they can be regenerated...\n');
      
      for (const post of orphanedPosts) {
        post.status = 'pending';
        delete post.publishedAt; // Remove published timestamp
        console.log(`   🔄 Reset: ${post.title} → status: pending`);
      }
      
      // Save updated calendars immediately
      const mainPosts = calendar.filter(p => p.category !== 'how-to-in-tech' && p.category !== 'research');
      const howToPosts = calendar.filter(p => p.category === 'how-to-in-tech');
      const researchPosts = calendar.filter(p => p.category === 'research');
      fs.writeFileSync(mainCalendarPath, JSON.stringify(mainPosts, null, 2));
      if (fs.existsSync(howToCalendarPath) || howToPosts.length > 0) {
        fs.writeFileSync(howToCalendarPath, JSON.stringify(howToPosts, null, 2));
      }
      if (fs.existsSync(researchCalendarPath) || researchPosts.length > 0) {
        fs.writeFileSync(researchCalendarPath, JSON.stringify(researchPosts, null, 2));
      }
      console.log('   ✅ Calendars updated - orphaned posts reset to pending\n');
    } else {
      console.log('✅ No orphaned posts detected - all published posts have valid files\n');
    }
    
    // ✅ PRE-GENERATION HEALTH CHECK: Reset failed posts that are still due
    console.log('🔍 Pre-generation health check: Scanning for failed posts that are still due...');
    const failedPosts = calendar.filter(p => p.status === 'failed' && p.date <= today);
    
    if (failedPosts.length > 0) {
      console.warn(`\n⚠️  Found ${failedPosts.length} failed post(s) that are still due (date <= today):`);
      console.warn('   Resetting status to "pending" so they can be retried...\n');
      
      for (const post of failedPosts) {
        post.status = 'pending';
        console.log(`   🔄 Reset: ${post.title} (${post.date}) → status: pending (will retry)`);
      }
      
      // Save updated calendars immediately
      const mainPosts = calendar.filter(p => p.category !== 'how-to-in-tech' && p.category !== 'research');
      const howToPosts = calendar.filter(p => p.category === 'how-to-in-tech');
      const researchPosts = calendar.filter(p => p.category === 'research');
      fs.writeFileSync(mainCalendarPath, JSON.stringify(mainPosts, null, 2));
      if (fs.existsSync(howToCalendarPath) || howToPosts.length > 0) {
        fs.writeFileSync(howToCalendarPath, JSON.stringify(howToPosts, null, 2));
      }
      if (fs.existsSync(researchCalendarPath) || researchPosts.length > 0) {
        fs.writeFileSync(researchCalendarPath, JSON.stringify(researchPosts, null, 2));
      }
      console.log('   ✅ Calendars updated - failed posts reset to pending\n');
    } else {
      console.log('✅ No failed posts detected that need retry\n');
    }
    
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
        
        // ✅ CRITICAL: Verify files exist AND are valid BEFORE updating status
        const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
        const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
        
        if (!fs.existsSync(mdxPath)) {
          throw new Error(`MDX file not created: ${mdxPath}`);
        }
        if (!fs.existsSync(imagePath)) {
          throw new Error(`Image file not created: ${imagePath}`);
        }
        
        // Verify files are not empty
        const mdxStats = fs.statSync(mdxPath);
        const imageStats = fs.statSync(imagePath);
        
        if (mdxStats.size === 0) {
          throw new Error(`MDX file is empty: ${mdxPath}`);
        }
        if (imageStats.size === 0) {
          throw new Error(`Image file is empty: ${imagePath}`);
        }
        
        // Verify MDX has valid frontmatter
        const mdxContent = fs.readFileSync(mdxPath, 'utf-8');
        if (!mdxContent.includes('---')) {
          throw new Error(`MDX file missing frontmatter: ${mdxPath}`);
        }
        if (mdxContent.split('---').length < 3) {
          throw new Error(`MDX file has invalid frontmatter structure: ${mdxPath}`);
        }
        
        // Verify frontmatter has required fields
        try {
          const parsed = matter(mdxContent);
          if (!parsed.data.title || !parsed.data.date) {
            throw new Error(`MDX file missing required frontmatter fields: ${mdxPath}`);
          }
          if (!parsed.content || parsed.content.trim().length === 0) {
            throw new Error(`MDX file has no content body: ${mdxPath}`);
          }
          
          // ✅ CRITICAL: Verify image path matches actual file (prevents image rendering failures)
          const expectedImagePath = `/images/blog/${post.slug}.png`;
          if (parsed.data.image !== expectedImagePath) {
            throw new Error(`Image path mismatch in frontmatter: expected "${expectedImagePath}", got "${parsed.data.image}". This will cause the image to not render in production!`);
          }
          
          // ✅ CRITICAL: Verify the image file referenced in frontmatter actually exists
          const frontmatterImagePath = parsed.data.image?.startsWith('/') 
            ? parsed.data.image.substring(1) // Remove leading slash for file system path
            : parsed.data.image;
          const frontmatterImageFullPath = path.join(process.cwd(), frontmatterImagePath || '');
          if (!fs.existsSync(frontmatterImageFullPath)) {
            throw new Error(`Image file referenced in frontmatter does not exist: ${parsed.data.image} (resolved to: ${frontmatterImageFullPath})`);
          }
        } catch (parseError: any) {
          throw new Error(`MDX file failed frontmatter validation: ${mdxPath} - ${parseError.message}`);
        }
        
        // ✅ Only mark for status update if files are verified to exist AND be valid
        postsToUpdate.push(post);
        successCount++;
        console.log(`✅ Verified: ${post.slug} - Both MDX (${mdxStats.size} bytes) and image (${imageStats.size} bytes) files exist and are valid`);
        
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

    // ✅ Update calendars (save to appropriate files)
    const mainPosts = calendar.filter(p => p.category !== 'how-to-in-tech' && p.category !== 'research');
    const howToPosts = calendar.filter(p => p.category === 'how-to-in-tech');
    const researchPosts = calendar.filter(p => p.category === 'research');
    
    fs.writeFileSync(mainCalendarPath, JSON.stringify(mainPosts, null, 2));
    // ✅ Always save if file exists or if we have posts (ensures status updates are persisted)
    if (fs.existsSync(howToCalendarPath) || howToPosts.length > 0) {
      fs.writeFileSync(howToCalendarPath, JSON.stringify(howToPosts, null, 2));
    }
    // ✅ FIX: Save research posts to research-calendar.json (was missing!)
    if (fs.existsSync(researchCalendarPath) || researchPosts.length > 0) {
      fs.writeFileSync(researchCalendarPath, JSON.stringify(researchPosts, null, 2));
    }
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

    // ✅ POST-GENERATION HEALTH CHECK: Verify ALL published posts have valid files
    console.log('\n🔍 Post-generation health check: Verifying all published posts...');
    const allPublishedPosts = calendar.filter(post => post.status === 'published');
    const missingFiles: string[] = [];
    const invalidFiles: string[] = [];
    
    for (const post of allPublishedPosts) {
      const mdxPath = path.join(process.cwd(), 'content', 'posts', `${post.slug}.mdx`);
      const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${post.slug}.png`);
      
      // Check existence
      if (!fs.existsSync(mdxPath)) {
        missingFiles.push(`MDX: ${post.slug}.mdx`);
        console.error(`   ❌ Missing MDX: ${post.slug}.mdx`);
      }
      if (!fs.existsSync(imagePath)) {
        missingFiles.push(`Image: ${post.slug}.png`);
        console.error(`   ❌ Missing Image: ${post.slug}.png`);
      }
      
      // Check validity if files exist
      if (fs.existsSync(mdxPath)) {
        try {
          const mdxStats = fs.statSync(mdxPath);
          if (mdxStats.size === 0) {
            invalidFiles.push(`MDX: ${post.slug}.mdx (empty)`);
            console.error(`   ❌ Invalid MDX: ${post.slug}.mdx (empty file)`);
          } else {
            // Verify frontmatter
            const mdxContent = fs.readFileSync(mdxPath, 'utf-8');
            if (!mdxContent.includes('---') || mdxContent.split('---').length < 3) {
              invalidFiles.push(`MDX: ${post.slug}.mdx (invalid frontmatter)`);
              console.error(`   ❌ Invalid MDX: ${post.slug}.mdx (invalid frontmatter)`);
            }
          }
        } catch (error: any) {
          invalidFiles.push(`MDX: ${post.slug}.mdx (read error: ${error.message})`);
          console.error(`   ❌ Invalid MDX: ${post.slug}.mdx (${error.message})`);
        }
      }
      
      if (fs.existsSync(imagePath)) {
        try {
          const imageStats = fs.statSync(imagePath);
          if (imageStats.size === 0) {
            invalidFiles.push(`Image: ${post.slug}.png (empty)`);
            console.error(`   ❌ Invalid Image: ${post.slug}.png (empty file)`);
          }
        } catch (error: any) {
          invalidFiles.push(`Image: ${post.slug}.png (read error: ${error.message})`);
          console.error(`   ❌ Invalid Image: ${post.slug}.png (${error.message})`);
        }
      }
    }
    
    if (missingFiles.length === 0 && invalidFiles.length === 0) {
      console.log(`   ✅ All ${allPublishedPosts.length} published posts have valid files\n`);
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

