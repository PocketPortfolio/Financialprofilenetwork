/**
 * Content Quality Checker
 * Validates all posts for truncation, formatting issues, and completeness
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface QualityReport {
  file: string;
  wordCount: number;
  issues: string[];
  status: 'good' | 'warning' | 'error';
}

function checkPost(filePath: string): QualityReport {
  const fileName = path.basename(filePath);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);
  
  const issues: string[] = [];
  let status: 'good' | 'warning' | 'error' = 'good';
  
  // Word count check
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 500) {
    issues.push(`Truncation risk: Only ${wordCount} words (expected 500+)`);
    status = 'error';
  } else if (wordCount < 800) {
    issues.push(`Short content: ${wordCount} words (may be incomplete)`);
    status = 'warning';
  }
  
  // Code block artifacts
  if (/````+/.test(content)) {
    issues.push('Code block artifacts: Found 4+ backticks');
    status = status === 'good' ? 'warning' : status;
  }
  
  // Excessive blank lines
  if (/\n{4,}/.test(content)) {
    issues.push('Excessive blank lines detected');
    status = status === 'good' ? 'warning' : status;
  }
  
  // Duplicate Key Takeaways
  const keyTakeawaysMatches = content.match(/##\s+(?:Key\s+)?Takeaways?/gi);
  if (keyTakeawaysMatches && keyTakeawaysMatches.length > 1) {
    issues.push(`Duplicate Key Takeaways sections (${keyTakeawaysMatches.length} found)`);
    status = status === 'good' ? 'warning' : status;
  }
  
  // Missing Key Takeaways
  if (!/##\s+(?:Key\s+)?Takeaways?/i.test(content)) {
    issues.push('Missing Key Takeaways section');
    status = 'error';
  }
  
  // Missing Sovereign Sync mention
  if (!/Sovereign\s+Sync/i.test(content)) {
    issues.push('Missing "Sovereign Sync" mention');
    status = status === 'good' ? 'warning' : status;
  }
  
  return { file: fileName, wordCount, issues, status };
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
  
  console.log(`🔍 Quality checking ${files.length} posts...\n`);
  
  const reports: QualityReport[] = files.map(checkPost);
  
  const good = reports.filter(r => r.status === 'good');
  const warnings = reports.filter(r => r.status === 'warning');
  const errors = reports.filter(r => r.status === 'error');
  
  reports.forEach(report => {
    const icon = report.status === 'good' ? '✅' : report.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${report.file}`);
    console.log(`   Words: ${report.wordCount}`);
    if (report.issues.length > 0) {
      report.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    console.log('');
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Good: ${good.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  
  if (errors.length > 0 || warnings.length > 0) {
    console.log(`\n💡 Run 'npm run fix-imported-posts' to auto-fix issues`);
    process.exit(1);
  } else {
    console.log(`\n✅ All posts pass quality checks!`);
  }
}

main().catch(console.error);



