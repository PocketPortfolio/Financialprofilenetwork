/**
 * Table Scrub Script
 * Fixes all table formatting issues in MDX posts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function normalizeTables(content: string): string {
  let cleaned = content;
  
  // Fix double leading pipes: || Status | -> | Status |
  // This handles the case where a line starts with || followed by table content
  cleaned = cleaned.replace(/^\|\|/gm, '|');
  
  // Fix tables with extra leading pipe and space: | | Status | -> | Status |
  cleaned = cleaned.replace(/^\|\s+\|/gm, '|');
  
  // Remove code blocks wrapping tables
  cleaned = cleaned.replace(/```[\w]*\n(\s*\|[^\n]+\|\s*\n)+```/g, (match) => {
    return match.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
  });
  
  // Ensure proper spacing around tables
  cleaned = cleaned.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');
  cleaned = cleaned.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
  
  // Remove trailing whitespace from table rows
  cleaned = cleaned.replace(/^(\|[^\n]+\|)\s+$/gm, '$1');
  
  return cleaned;
}

async function main() {
  // Get the project root (parent of scripts directory)
  const projectRoot = path.resolve(__dirname, '..');
  const postsDir = path.join(projectRoot, 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ Posts directory not found');
    process.exit(1);
  }
  
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.mdx'))
    .map(file => path.join(postsDir, file));
  
  console.log(`🔍 Fixing tables in ${files.length} posts...\n`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    const fileName = path.basename(file);
    const fileContents = fs.readFileSync(file, 'utf-8');
    const { data, content } = matter(fileContents);
    
    const normalizedContent = normalizeTables(content);
    
    if (normalizedContent !== content) {
      const frontmatterString = Object.entries(data)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}]`;
          }
          if (value === null || value === undefined) return '';
          return `${key}: "${String(value).replace(/"/g, '\\"')}"`;
        })
        .filter(Boolean)
        .join('\n');
      
      const newContent = `---
${frontmatterString}
---

${normalizedContent}
`;
      
      fs.writeFileSync(file, newContent);
      console.log(`✅ Fixed tables in: ${fileName}`);
      fixedCount++;
    } else {
      console.log(`✓ No changes needed: ${fileName}`);
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${fixedCount} of ${files.length} posts`);
}

main().catch(console.error);

