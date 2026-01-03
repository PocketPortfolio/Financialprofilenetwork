/**
 * Fix Imported Posts Script
 * Standardizes markdown formatting, fixes date formats, adds missing sections, and generates images
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * Normalize date format to YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // If it's an ISO string with time, extract just the date
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  
  // If it's already YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try to parse and format
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Normalize table formatting - FIXED VERSION
 * Ensures tables use proper markdown syntax without double leading pipes
 */
function normalizeTables(content: string): string {
  let cleaned = content;
  
  // Fix double leading pipes: || Status | -> | Status |
  cleaned = cleaned.replace(/^\|\|(\s*\|.+)$/gm, (match, rest) => {
    return '|' + rest.trim();
  });
  
  // Fix tables with single leading pipe that shouldn't be there
  // Pattern: | Status | Meaning | (correct) vs | | Status | (wrong)
  cleaned = cleaned.replace(/^\|\s+\|(\s*\|.+)$/gm, (match, rest) => {
    return '|' + rest.trim();
  });
  
  // Ensure proper spacing around tables (blank line before and after)
  // This regex ensures tables are separated from surrounding content
  cleaned = cleaned.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');
  cleaned = cleaned.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
  
  // Remove trailing whitespace from table rows
  cleaned = cleaned.replace(/^(\|[^\n]+\|)\s+$/gm, '$1');
  
  return cleaned;
}

/**
 * Remove incorrect code block wrappers
 * Detects code blocks containing tables or plain text and unwraps them
 */
function scrubCodeBlockArtifacts(content: string): string {
  let cleaned = content;
  
  // Fix 4+ backticks (common artifact)
  cleaned = cleaned.replace(/````+/g, '```');
  
  // Detect and unwrap code blocks that contain tables or plain text
  // Pattern: ``` followed by content with pipes (tables) or long plain text
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  cleaned = cleaned.replace(codeBlockRegex, (match, lang, codeContent) => {
    // Check if it's a table (contains pipe characters in a structured way)
    const hasTableStructure = /^\s*\|.+\|/m.test(codeContent) && 
                              codeContent.split('\n').filter((line: string) => line.includes('|')).length >= 2;
    
    // Check if it's plain text without code syntax
    const hasCodeSyntax = /\b(var|const|let|function|class|import|export|return|if|else|for|while|=>|::|->)\b/.test(codeContent);
    const isLongPlainText = codeContent.length > 200 && !hasCodeSyntax && !hasTableStructure;
    
    // If it's a table or plain text, unwrap it
    if (hasTableStructure || isLongPlainText) {
      return codeContent.trim();
    }
    
    // Keep legitimate code blocks
    return match;
  });
  
  // Fix malformed code block endings (4+ backticks)
  cleaned = cleaned.replace(/````+(\w+)?/g, '```$1');
  
  // Remove code blocks that only contain markdown tables
  cleaned = cleaned.replace(/```\n(\s*\|.+\|\s*\n)+\s*```/g, (match) => {
    // Extract just the table content
    return match.replace(/```\n?/g, '').trim();
  });
  
  return cleaned;
}

/**
 * Remove excessive blank lines
 */
function removeExcessiveBlankLines(content: string): string {
  // Replace 4+ consecutive newlines with 2
  let cleaned = content.replace(/\n{4,}/g, '\n\n\n');
  
  // Remove blank lines at start/end of content sections
  cleaned = cleaned.replace(/^\n+/, '');
  cleaned = cleaned.replace(/\n+$/, '');
  
  // Normalize spacing around headers
  cleaned = cleaned.replace(/\n{3,}(##+)/g, '\n\n$1');
  
  return cleaned;
}

/**
 * Remove duplicate Key Takeaways sections
 */
function removeDuplicateKeyTakeaways(content: string): string {
  const keyTakeawaysRegex = /##\s+(?:Key\s+)?Takeaways?[\s\S]*?(?=##|$)/gi;
  const matches = content.match(keyTakeawaysRegex);
  
  if (matches && matches.length > 1) {
    // Keep only the last one (most likely to have Sovereign Sync)
    const lastMatch = matches[matches.length - 1];
    
    // Remove all but the last
    let cleaned = content;
    for (let i = 0; i < matches.length - 1; i++) {
      cleaned = cleaned.replace(matches[i], '');
    }
    
    // Clean up excessive blank lines that may result
    cleaned = removeExcessiveBlankLines(cleaned);
    
    return cleaned;
  }
  
  return content;
}

/**
 * Clean content - remove duplicate frontmatter, fix formatting
 */
function cleanContent(content: string): string {
  // Remove duplicate frontmatter blocks
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/g;
  const matches = content.match(frontmatterRegex);
  
  if (matches && matches.length > 1) {
    // Keep only the first frontmatter, remove the rest
    const firstFrontmatter = matches[0];
    const afterFirst = content.substring(content.indexOf(firstFrontmatter) + firstFrontmatter.length);
    // Remove any subsequent frontmatter blocks
    const cleaned = afterFirst.replace(frontmatterRegex, '').trim();
    return firstFrontmatter + '\n' + cleaned;
  }
  
  // Fix broken markdown patterns
  let cleaned = content;
  
  // Fix broken link patterns like "Learn more about [Text](/).title:"
  cleaned = cleaned.replace(/\]\(\/\)\.title:/g, '](/).\n\n## ');
  cleaned = cleaned.replace(/\]\(\/\)title:/g, '](/)\n\n## ');
  
  // Normalize table formatting
  cleaned = normalizeTables(cleaned);
  
  // Scrub code block artifacts
  cleaned = scrubCodeBlockArtifacts(cleaned);
  
  // Remove duplicate Key Takeaways
  cleaned = removeDuplicateKeyTakeaways(cleaned);
  
  // Remove excessive blank lines
  cleaned = removeExcessiveBlankLines(cleaned);
  
  // Fix URLs that should be links
  cleaned = cleaned.replace(/(https?:\/\/[^\s\)]+)/g, (url) => {
    // Don't convert if already in markdown link
    if (cleaned.includes(`[${url}]`)) return url;
    // Convert plain URLs to links
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    return `[${domain}](${url})`;
  });
  
  return cleaned;
}

/**
 * Ensure Key Takeaways section exists
 */
function ensureKeyTakeaways(content: string): string {
  // Check if Key Takeaways already exists
  if (/##\s+(?:Key\s+)?Takeaways?/i.test(content)) {
    return content;
  }
  
  const takeaways = `## Key Takeaways

Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database. This approach ensures:

- **Data Ownership**: Your financial data lives in your Google Drive, not a vendor's database
- **No Vendor Lock-in**: Export anytime, use any tool
- **Privacy by Default**: Your data never leaves your control
- **Local-First Resilience**: Works offline, syncs when online

Learn how to set up [Google Drive Sync](/features/google-drive-sync) and turn your Drive into your personal financial database.

`;
  
  // Insert before Verdict/Conclusion or CTA
  const verdictRegex = /(##\s+(?:Verdict|Conclusion|🚀\s+Unlock))/i;
  if (verdictRegex.test(content)) {
    return content.replace(verdictRegex, `${takeaways}$1`);
  }
  
  // Append before CTA
  return content.replace(/(---\s*\n##\s*🚀)/, `${takeaways}$1`);
}

/**
 * Generate image using DALL-E
 */
async function generateImage(title: string, slug: string, pillar: string): Promise<string | null> {
  if (!openai) {
    console.warn(`   ⚠️  OPENAI_API_KEY not set, skipping image generation`);
    return null;
  }
  
  try {
    const imagePrompt = `Abstract FinTech data visualization, isometric, dark mode, orange (#f59e0b) and slate grey (#475569) palette, minimalist, 8k resolution. No text. Theme: ${title}. Professional, modern, technical aesthetic. Pillar: ${pillar}.`;
    
    console.log(`🎨 Generating image for: ${slug}`);
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      console.warn(`⚠️  No image URL returned for ${slug}`);
      return null;
    }

    // Download and save image
    console.log(`📥 Downloading image: ${imageUrl}`);
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download image: ${imageRes.statusText}`);
    }
    
    const imageBuffer = await imageRes.arrayBuffer();
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', `${slug}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    console.log(`💾 Image saved: ${imagePath}`);
    
    return `/images/blog/${slug}.png`;
  } catch (error) {
    console.error(`❌ Failed to generate image for ${slug}:`, error);
    return null;
  }
}

/**
 * Check if image exists
 */
function imageExists(imagePath: string): boolean {
  if (!imagePath) return false;
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  return fs.existsSync(fullPath);
}

/**
 * Fix a single post
 */
async function fixPost(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  const slug = fileName.replace('.mdx', '');
  
  console.log(`\n🔧 Fixing: ${fileName}`);
  
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);
  
  // Check word count for truncation
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 500) {
    console.warn(`   ⚠️  POTENTIAL TRUNCATION: Only ${wordCount} words. Expected 500+ for full post.`);
  } else {
    console.log(`   📊 Word count: ${wordCount} (✅ Complete)`);
  }
  
  // Normalize date
  const normalizedDate = normalizeDate(data.date);
  if (data.date !== normalizedDate) {
    console.log(`   📅 Fixed date: ${data.date} → ${normalizedDate}`);
    data.date = normalizedDate;
  }
  
  // Clean content
  let cleanedContent = cleanContent(content);
  
  // Ensure Key Takeaways
  cleanedContent = ensureKeyTakeaways(cleanedContent);
  
  // Check if image exists, generate if not
  if (!data.image || !imageExists(data.image)) {
    console.log(`   🖼️  Image missing or invalid: ${data.image || 'none'}`);
    const newImagePath = await generateImage(data.title, slug, data.pillar || 'product');
    if (newImagePath) {
      data.image = newImagePath;
      console.log(`   ✅ Generated new image: ${newImagePath}`);
    } else {
      // Use default image path
      data.image = `/images/blog/${slug}.png`;
      console.log(`   ⚠️  Using default image path: ${data.image}`);
    }
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Ensure updated field
  if (!data.updated) {
    data.updated = new Date().toISOString().split('T')[0];
  }
  
  // Ensure canonical_url
  if (!data.canonical_url) {
    data.canonical_url = `https://pocketportfolio.app/blog/${slug}`;
  }
  
  // Rebuild frontmatter
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
  
  // Write fixed file
  const fixedContent = `---
${frontmatterString}
---

${cleanedContent}
`;
  
  fs.writeFileSync(filePath, fixedContent);
  console.log(`   ✅ Fixed: ${fileName}`);
}

async function main() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ Posts directory not found');
    process.exit(1);
  }
  
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.mdx'))
    .map(file => path.join(postsDir, file));
  
  console.log(`🔍 Found ${files.length} posts to fix\n`);
  
  for (const file of files) {
    try {
      await fixPost(file);
    } catch (error) {
      console.error(`❌ Failed to fix ${file}:`, error);
    }
  }
  
  console.log('\n✅ All posts fixed!');
}

main().catch(console.error);

