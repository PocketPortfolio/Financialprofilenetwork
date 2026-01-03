/**
 * Generate Specific Image for Blog Post
 * Generates a DALL-E 3 image for a specific post
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
      // Ignore errors
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
 * Generate image using DALL-E
 */
async function generateImage(title: string, imagePath: string, pillar: string = 'Philosophy'): Promise<string | null> {
  try {
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. No text. Theme: ${title}. Professional, modern, technical aesthetic. Pillar: ${pillar}.`;
    
    console.log(`🎨 Generating image: ${imagePath}`);
    console.log(`   Theme: ${title}`);
    console.log(`   Pillar: ${pillar}`);
    
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      console.warn(`⚠️  No image URL returned`);
      return null;
    }

    // Download and save image
    console.log(`📥 Downloading image...`);
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download image: ${imageRes.statusText}`);
    }
    
    const imageBuffer = await imageRes.arrayBuffer();
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from(imageBuffer));
    console.log(`💾 Image saved: ${fullPath}`);
    
    return imagePath;
  } catch (error) {
    console.error(`❌ Failed to generate image:`, error);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npm run generate-specific-image -- <image-path> <title> [pillar]');
    console.error('Example: npm run generate-specific-image -- /images/blog/local-first-architecture.png "Local-First Architecture" Philosophy');
    process.exit(1);
  }
  
  const imagePath = args[0];
  const title = args[1];
  const pillar = args[2] || 'Philosophy';
  
  const result = await generateImage(title, imagePath, pillar);
  
  if (result) {
    console.log(`\n✅ Image generated successfully!`);
    console.log(`   Path: ${result}`);
  } else {
    console.log(`\n❌ Failed to generate image`);
    process.exit(1);
  }
}

main().catch(console.error);



