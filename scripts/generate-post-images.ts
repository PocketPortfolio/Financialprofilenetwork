/**
 * Generate Images for Blog Posts
 * Uses OpenAI GPT Image models to generate images for posts that don't have them.
 * Defaults to gpt-image-1-mini; override via OPENAI_IMAGE_MODEL env var.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
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
        
        // Handle values that might span multiple lines or have quotes
        // For now, just take the first line's value
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
  console.error('❌ OPENAI_API_KEY environment variable is required');
  console.log('💡 Set it in .env.local or export it before running this script');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Check if image exists
 */
function imageExists(imagePath: string): boolean {
  if (!imagePath) return false;
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  return fs.existsSync(fullPath);
}

/**
 * Generate image using OpenAI GPT Image model.
 * Defaults to gpt-image-1-mini; override via OPENAI_IMAGE_MODEL env var.
 */
async function generateImage(title: string, slug: string, pillar: string): Promise<string | null> {
  try {
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. No text. Theme: ${title}. Professional, modern, technical aesthetic. Pillar: ${pillar}.`;

    const imageModel = (process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1-mini') as
      | 'gpt-image-2'
      | 'gpt-image-1.5'
      | 'gpt-image-1'
      | 'gpt-image-1-mini';

    console.log(`🎨 Generating image for: ${slug} (model: ${imageModel})`);
    const imageResponse = await openai.images.generate({
      model: imageModel,
      prompt: imagePrompt,
      size: '1024x1024',
      quality: 'medium',
    });

    const b64 = imageResponse.data?.[0]?.b64_json;
    if (!b64) {
      console.warn(`⚠️  No image returned for ${slug}`);
      return null;
    }

    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${slug}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, Buffer.from(b64, 'base64'));
    console.log(`💾 Image saved: ${imagePath}`);

    return `/images/blog/${slug}.png`;
  } catch (error) {
    console.error(`❌ Failed to generate image for ${slug}:`, error);
    return null;
  }
}

/**
 * Update post with new image path
 */
function updatePostImage(filePath: string, imagePath: string): void {
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);
  
  data.image = imagePath;
  
  const frontmatterString = Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}]`;
      }
      if (value === null || value === undefined) {
        return '';
      }
      return `${key}: "${String(value).replace(/"/g, '\\"')}"`;
    })
    .filter(Boolean)
    .join('\n');
  
  const updatedContent = `---
${frontmatterString}
---

${content}
`;
  
  fs.writeFileSync(filePath, updatedContent);
  console.log(`   ✅ Updated post with image path: ${imagePath}`);
}

async function main() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ Posts directory not found');
    process.exit(1);
  }
  
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.mdx'))
    .map(file => ({
      path: path.join(postsDir, file),
      slug: file.replace('.mdx', '')
    }));
  
  console.log(`🔍 Found ${files.length} posts\n`);
  
  const postsNeedingImages: Array<{ path: string; slug: string; title: string; pillar: string }> = [];
  
  // Check which posts need images
  for (const { path: filePath, slug } of files) {
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContents);
    
    if (!data.image || !imageExists(data.image)) {
      postsNeedingImages.push({
        path: filePath,
        slug,
        title: data.title || slug,
        pillar: data.pillar || 'product'
      });
    }
  }
  
  if (postsNeedingImages.length === 0) {
    console.log('✅ All posts already have images!');
    return;
  }
  
  console.log(`📸 Generating images for ${postsNeedingImages.length} posts...\n`);
  
  for (const post of postsNeedingImages) {
    try {
      const imagePath = await generateImage(post.title, post.slug, post.pillar);
      if (imagePath) {
        updatePostImage(post.path, imagePath);
      }
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to process ${post.slug}:`, error);
    }
  }
  
  console.log('\n✅ Image generation complete!');
}

main().catch(console.error);

