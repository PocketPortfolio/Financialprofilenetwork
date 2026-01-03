/**
 * Enforce Pocket MDX Standard
 * Validates and fixes all posts to match the immutable Pocket Portfolio MDX schema
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Validate frontmatter against Pocket MDX schema
 */
function validateFrontmatter(data: any, slug: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.title) errors.push('Missing title');
  if (!data.date) errors.push('Missing date');
  if (!data.description) errors.push('Missing description');
  if (!data.tags || !Array.isArray(data.tags)) errors.push('Missing or invalid tags');
  if (!data.author) errors.push('Missing author');
  if (!data.pillar) errors.push('Missing pillar');
  if (!data.image) errors.push('Missing image');
  
  // Date format validation
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push(`Invalid date format: ${data.date} (must be YYYY-MM-DD)`);
  }
  
  // Description length
  if (data.description && data.description.length > 160) {
    errors.push(`Description too long: ${data.description.length} chars (max 160)`);
  }
  
  // Pillar validation
  const validPillars = ['Product', 'Technical', 'Philosophy', 'Market'];
  if (data.pillar && !validPillars.includes(data.pillar)) {
    errors.push(`Invalid pillar: ${data.pillar} (must be one of: ${validPillars.join(', ')})`);
  }
  
  // Image path validation
  if (data.image && !data.image.startsWith('/images/blog/')) {
    errors.push(`Invalid image path: ${data.image} (must start with /images/blog/)`);
  }
  
  // Tags validation (lowercase, kebab-case)
  if (data.tags) {
    data.tags.forEach((tag: string, i: number) => {
      if (tag !== tag.toLowerCase()) {
        errors.push(`Tag ${i + 1} not lowercase: ${tag}`);
      }
      if (!/^[a-z0-9-]+$/.test(tag)) {
        errors.push(`Tag ${i + 1} not kebab-case: ${tag}`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check for forbidden "Excel" mentions
 */
function checkForExcel(content: string): { found: boolean; lines: number[] } {
  const excelRegex = /(?:edit|editing|edit in|editable in)\s+(?:excel|Excel|EXCEL|spreadsheet|Spreadsheet)/gi;
  const lines: number[] = [];
  const contentLines = content.split('\n');
  
  contentLines.forEach((line, index) => {
    if (excelRegex.test(line)) {
      lines.push(index + 1);
    }
  });
  
  return { found: lines.length > 0, lines };
}

/**
 * Check for required Key Takeaways with Sovereign Sync
 */
function checkKeyTakeaways(content: string): { hasSection: boolean; hasSovereignSync: boolean } {
  const hasSection = /##\s+(?:Key\s+)?Takeaways?/i.test(content);
  const hasSovereignSync = /Sovereign\s+Sync/i.test(content);
  
  return { hasSection, hasSovereignSync };
}

/**
 * Check for CTA footer
 */
function checkCTA(content: string): boolean {
  return /##\s*🚀\s*Unlock\s+Sovereign\s+Sync/i.test(content) || 
         /Corporate\/Founder\s+Tier/i.test(content);
}

/**
 * Normalize table formatting
 */
function normalizeTables(content: string): string {
  let cleaned = content;
  
  // Fix double leading pipes: || Status | -> | Status |
  cleaned = cleaned.replace(/^\|\|(\s*\|.+)$/gm, (match, rest) => {
    return '|' + rest.trim();
  });
  
  // Fix tables with single leading pipe that shouldn't be there
  cleaned = cleaned.replace(/^\|\s+\|(\s*\|.+)$/gm, (match, rest) => {
    return '|' + rest.trim();
  });
  
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

/**
 * Enforce Pocket MDX standard on a post
 */
function enforceStandard(filePath: string): { fixed: boolean; issues: string[] } {
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);
  const slug = path.basename(filePath, '.mdx');
  const issues: string[] = [];
  let needsRewrite = false;
  let cleanedContent = content;
  
  // Validate frontmatter
  const validation = validateFrontmatter(data, slug);
  if (!validation.valid) {
    issues.push(...validation.errors.map(e => `Frontmatter: ${e}`));
    needsRewrite = true;
  }
  
  // Fix date format if needed
  if (data.date && data.date.includes('T')) {
    data.date = data.date.split('T')[0];
    needsRewrite = true;
  }
  
  // Fix pillar capitalization
  const pillarMap: Record<string, string> = {
    'philosophy': 'Philosophy',
    'technical': 'Technical',
    'market': 'Market',
    'product': 'Product'
  };
  if (data.pillar && pillarMap[data.pillar.toLowerCase()]) {
    data.pillar = pillarMap[data.pillar.toLowerCase()] as any;
    needsRewrite = true;
  }
  
  // Normalize tags
  if (data.tags) {
    const normalizedTags = data.tags.map((tag: string) => 
      tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    );
    if (JSON.stringify(data.tags) !== JSON.stringify(normalizedTags)) {
      data.tags = normalizedTags;
      needsRewrite = true;
    }
  }
  
  // Normalize tables (NEW)
  const normalizedContent = normalizeTables(cleanedContent);
  if (normalizedContent !== cleanedContent) {
    cleanedContent = normalizedContent;
    needsRewrite = true;
  }
  
  // Check for Excel mentions
  const excelCheck = checkForExcel(cleanedContent);
  if (excelCheck.found) {
    issues.push(`Forbidden "Excel" mention found on lines: ${excelCheck.lines.join(', ')}`);
  }
  
  // Check Key Takeaways
  const keyTakeaways = checkKeyTakeaways(cleanedContent);
  if (!keyTakeaways.hasSection) {
    issues.push('Missing Key Takeaways section');
  }
  if (!keyTakeaways.hasSovereignSync) {
    issues.push('Key Takeaways missing "Sovereign Sync" mention');
  }
  
  // Check CTA
  if (!checkCTA(cleanedContent)) {
    issues.push('Missing Corporate/Founder Tier CTA footer');
  }
  
  // Rewrite if needed
  if (needsRewrite) {
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

${cleanedContent}
`;
    
    fs.writeFileSync(filePath, newContent);
  }
  
  return { fixed: needsRewrite, issues };
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
  
  console.log(`🔍 Validating ${files.length} posts against Pocket MDX Standard...\n`);
  
  let totalIssues = 0;
  let fixedCount = 0;
  
  for (const file of files) {
    const fileName = path.basename(file);
    console.log(`📄 ${fileName}`);
    
    const result = enforceStandard(file);
    
    if (result.issues.length > 0) {
      console.log(`   ⚠️  Issues found:`);
      result.issues.forEach(issue => console.log(`      - ${issue}`));
      totalIssues += result.issues.length;
    } else {
      console.log(`   ✅ Compliant`);
    }
    
    if (result.fixed) {
      console.log(`   🔧 Fixed frontmatter`);
      fixedCount++;
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total issues: ${totalIssues}`);
  console.log(`   Posts fixed: ${fixedCount}`);
  console.log(`   Posts compliant: ${files.length - (totalIssues > 0 ? 1 : 0)}`);
  
  if (totalIssues === 0) {
    console.log(`\n✅ All posts comply with Pocket MDX Standard!`);
  } else {
    console.log(`\n⚠️  Some posts need manual fixes (see issues above)`);
  }
}

main().catch(console.error);

