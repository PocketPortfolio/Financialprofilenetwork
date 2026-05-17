/**
 * Generate Specific Image for Blog Post
 * Generates an image for a specific post using OpenAI GPT Image models.
 * Defaults to gpt-image-1-mini; override via OPENAI_IMAGE_MODEL env var.
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
 * Generate image using OpenAI GPT Image model.
 */
async function generateImage(title: string, imagePath: string, pillar: string = 'Philosophy'): Promise<string | null> {
  try {
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. Absolutely no text, no letters, no words, no numbers, no labels, no typography. Pure abstract visual elements only: geometric shapes, data charts, graphs, pie charts, bar graphs, stacked blocks, connecting lines. Theme: ${title}. Professional, modern, technical aesthetic. Pillar: ${pillar}.`;

    const imageModel = (process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1-mini') as
      | 'gpt-image-2'
      | 'gpt-image-1.5'
      | 'gpt-image-1'
      | 'gpt-image-1-mini';

    console.log(`🎨 Generating image: ${imagePath}`);
    console.log(`   Theme:  ${title}`);
    console.log(`   Pillar: ${pillar}`);
    console.log(`   Model:  ${imageModel}`);

    const imageResponse = await openai.images.generate({
      model: imageModel,
      prompt: imagePrompt,
      size: '1024x1024',
      quality: 'medium',
    });

    const b64 = imageResponse.data?.[0]?.b64_json;
    if (!b64) {
      console.warn(`⚠️  No image returned from ${imageModel}`);
      return null;
    }

    const fullPath = path.join(process.cwd(), 'public', imagePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from(b64, 'base64'));
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



