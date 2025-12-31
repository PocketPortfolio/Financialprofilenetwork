/**
 * Import External Content Script
 * Fetches posts from Dev.to and CoderLegion, transforms to MDX, and injects SEO CTAs
 * Supports ritual parsing and canonical URL setup
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

interface ExternalPost {
  id: string;
  title: string;
  url: string;
  source: 'dev.to' | 'coderlegion_profile' | 'coderlegion_group';
  date: string;
  excerpt?: string;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  pillar?: 'philosophy' | 'technical' | 'market' | 'product';
  ritual?: 'ship-friday' | 'spec-clinic' | 'paper-club' | null;
  body_markdown?: string; // Full markdown content
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/**
 * Determine pillar from ritual
 */
function pillarFromRitual(ritual: string | null): 'philosophy' | 'technical' | 'market' | 'product' {
  if (ritual === 'ship-friday') return 'product';
  if (ritual === 'spec-clinic') return 'technical';
  if (ritual === 'paper-club') return 'philosophy';
  return 'product';
}

/**
 * Inject Sovereign Sync CTA
 */
function injectSovereignCTAContent(): string {
  return `

---

## 🚀 Unlock Sovereign Sync

**Ready to own your financial data?**

Pocket Portfolio's **Sovereign Sync** turns your Google Drive into a personal database. No vendor lock-in. No cloud dependencies. Just your data, your way.

👉 [Upgrade to Corporate/Founder Tier →](/sponsor)

*Sovereign Sync is available for Corporate and Founder tier sponsors. [Learn more →](/sponsor)`;
}

/**
 * Inject homepage link with strategic anchor text
 */
function injectHomepageLink(content: string, anchorText: string): string {
  // Try to inject in introduction or verdict section
  const homepageLink = `[${anchorText}](/)`;
  
  // Look for "Verdict" or "Conclusion" section
  const verdictRegex = /(##\s+(?:Verdict|Conclusion|Takeaways?)[\s\S]*?)(?=##|$)/i;
  const match = content.match(verdictRegex);
  
  if (match) {
    // Inject in verdict section
    return content.replace(verdictRegex, `$1\n\nFor more on ${anchorText.toLowerCase()}, see our [homepage](${homepageLink}).`);
  }
  
  // Otherwise inject in first paragraph
  const firstParagraphRegex = /^([^\n]+\n)/;
  if (firstParagraphRegex.test(content)) {
    return content.replace(firstParagraphRegex, `$1\n\nLearn more about [${anchorText}](/).`);
  }
  
  // Fallback: append to intro
  return `${homepageLink}\n\n${content}`;
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
  
  // Fix tables with extra leading pipe: | | Status | -> | Status |
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
 * Remove code block artifacts (incorrect wrappers)
 */
function scrubCodeBlockArtifacts(content: string): string {
  let cleaned = content;
  
  // Fix 4+ backticks (common artifact)
  cleaned = cleaned.replace(/````+/g, '```');
  
  // Detect and unwrap code blocks that contain tables or plain text
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
  
  // Fix malformed code block endings
  cleaned = cleaned.replace(/````+(\w+)?/g, '```$1');
  
  // Remove code blocks that only contain markdown tables
  cleaned = cleaned.replace(/```\n(\s*\|.+\|\s*\n)+\s*```/g, (match) => {
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
 * Generate SEO-optimized meta description using AI
 */
async function generateSEODescription(title: string, body: string): Promise<string> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback description');
    return `${title} - Learn about data sovereignty and local-first finance with Pocket Portfolio.`;
  }

  // Extract first 500 words for context
  const preview = body.split(/\s+/).slice(0, 500).join(' ');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO Copywriter specializing in financial technology. Generate compelling meta descriptions (150-160 characters) that maximize click-through rates on Google. Focus on data sovereignty, local-first architecture, JSON-based finance, and vendor lock-in avoidance. Never use phrases like "In this post I will" or "This article discusses".'
        },
        {
          role: 'user',
          content: `Rewrite this article summary into a high-CTR meta description (<160 chars) for Google. Focus on "Data Ownership" and "Sovereign Finance" keywords. Make it compelling and action-oriented.\n\nTitle: ${title}\n\nContent Preview: ${preview}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const description = response.choices[0]?.message?.content?.trim() || '';
    
    // Ensure it's within 160 chars (Google's limit)
    if (description.length > 160) {
      return description.substring(0, 157).trim() + '...';
    }
    
    // Ensure minimum quality (at least 50 chars)
    if (description.length < 50) {
      console.warn('⚠️  Generated description too short, using fallback');
      return `${title} - Learn about data sovereignty and local-first finance with Pocket Portfolio.`;
    }
    
    return description;
  } catch (error) {
    console.error('❌ Failed to generate SEO description:', error);
    return `${title} - Learn about data sovereignty and local-first finance with Pocket Portfolio.`;
  }
}

/**
 * Inject Key Takeaways with Sovereign Sync mention
 */
function injectKeyTakeaways(content: string): string {
  const takeaways = `## Key Takeaways

Unlike cloud apps, Pocket Portfolio uses **Sovereign Sync** to turn your Google Drive into a database. This approach ensures:

- **Data Ownership**: Your financial data lives in your Google Drive, not a vendor's database
- **No Vendor Lock-in**: Export anytime, use any tool
- **Privacy by Default**: Your data never leaves your control
- **Local-First Resilience**: Works offline, syncs when online

`;
  
  // Look for existing "Key Takeaways" or "Takeaways" section
  if (/##\s+(?:Key\s+)?Takeaways?/i.test(content)) {
    // Replace existing
    return content.replace(/##\s+(?:Key\s+)?Takeaways?[\s\S]*?(?=##|$)/i, takeaways);
  }
  
  // Insert before Verdict/Conclusion
  const verdictRegex = /(##\s+(?:Verdict|Conclusion))/i;
  if (verdictRegex.test(content)) {
    return content.replace(verdictRegex, `${takeaways}$1`);
  }
  
  // Append before CTA
  return content.replace(/(---\s*\n##\s*🚀)/, `${takeaways}$1`);
}

/**
 * Extract slug from Dev.to URL
 */
function extractDevToSlug(url: string): string | null {
  // Dev.to URLs: https://dev.to/pocketportfolioapp/slug-1234
  const match = url.match(/dev\.to\/[^/]+\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Extract article ID from CoderLegion URL
 */
function extractCoderLegionId(url: string): string | null {
  // CoderLegion URLs: https://coderlegion.com/user/.../posts/123 or /groups/.../posts/123
  const match = url.match(/\/posts\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch full article content from Dev.to
 */
async function fetchDevToContent(url: string): Promise<string | null> {
  try {
    const slug = extractDevToSlug(url);
    if (!slug) {
      console.warn(`⚠️  Could not extract slug from Dev.to URL: ${url}`);
      return null;
    }

    // Try the article endpoint first
    const articleResponse = await fetch(`https://dev.to/api/articles/${slug}`);
    if (articleResponse.ok) {
      const article = await articleResponse.json();
      // CRITICAL: Only return body_markdown, not description or summary
      if (article.body_markdown && article.body_markdown.length > 500) {
        console.log(`✅ Fetched full body_markdown from Dev.to API (${article.body_markdown.length} chars)`);
        return article.body_markdown;
      } else if (article.body_markdown) {
        console.warn(`⚠️  body_markdown seems short (${article.body_markdown.length} chars). May be truncated.`);
        return article.body_markdown; // Return anyway, but warn
      }
    }

    // Fallback: try with username prefix
    const usernameResponse = await fetch(`https://dev.to/api/articles/pocketportfolioapp/${slug}`);
    if (usernameResponse.ok) {
      const article = await usernameResponse.json();
      if (article.body_markdown && article.body_markdown.length > 500) {
        console.log(`✅ Fetched full body_markdown from Dev.to API with username (${article.body_markdown.length} chars)`);
        return article.body_markdown;
      } else if (article.body_markdown) {
        console.warn(`⚠️  body_markdown seems short (${article.body_markdown.length} chars). May be truncated.`);
        return article.body_markdown;
      }
    }

    console.warn(`⚠️  Dev.to API returned no content for: ${url}`);
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch Dev.to content:`, error);
    return null;
  }
}

/**
 * Fetch full article content from CoderLegion
 */
async function fetchCoderLegionContent(url: string): Promise<string | null> {
  try {
    const articleId = extractCoderLegionId(url);
    if (articleId) {
      // Try Forem-compatible API with article ID
      const response = await fetch(`https://coderlegion.com/api/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        if (article.body_markdown || article.body_html) {
          console.log(`✅ Fetched full content from CoderLegion API`);
          return article.body_markdown || article.body_html;
        }
      }
    }

    // Try organization/group endpoint
    if (url.includes('/groups/')) {
      const groupMatch = url.match(/\/groups\/([^/]+)/);
      if (groupMatch) {
        const groupSlug = groupMatch[1];
        const response = await fetch(`https://coderlegion.com/api/articles?organization=${encodeURIComponent(groupSlug)}`);
        if (response.ok) {
          const articles = await response.json();
          // Find matching article by URL or title
          const article = Array.isArray(articles) ? articles.find((a: any) => 
            a.url === url || url.includes(a.id?.toString() || '')
          ) : null;
          if (article?.body_markdown || article?.body_html) {
            console.log(`✅ Fetched full content from CoderLegion Group API`);
            return article.body_markdown || article.body_html;
          }
        }
      }
    }

    // Try user endpoint
    if (url.includes('/user/')) {
      const userMatch = url.match(/\/user\/([^/]+)/);
      if (userMatch) {
        const username = userMatch[1].replace('+', ' ');
        const response = await fetch(`https://coderlegion.com/api/articles?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const articles = await response.json();
          const article = Array.isArray(articles) ? articles.find((a: any) => 
            a.url === url || url.includes(a.id?.toString() || '')
          ) : null;
          if (article?.body_markdown || article?.body_html) {
            console.log(`✅ Fetched full content from CoderLegion User API`);
            return article.body_markdown || article.body_html;
          }
        }
      }
    }

    console.warn(`⚠️  CoderLegion API returned no content for: ${url}`);
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch CoderLegion content:`, error);
    return null;
  }
}

/**
 * Validate content completeness
 */
function validateContentCompleteness(content: string | null | undefined, title: string): { isComplete: boolean; wordCount: number; warning?: string } {
  if (!content) {
    return { isComplete: false, wordCount: 0, warning: 'No content fetched' };
  }
  
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 500) {
    return {
      isComplete: false,
      wordCount,
      warning: `⚠️ POTENTIAL TRUNCATION: Only ${wordCount} words. Expected full body_markdown, but got summary/description.`
    };
  }
  
  return { isComplete: true, wordCount };
}

/**
 * Fetch full article content
 */
async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    // For Dev.to, use API
    if (url.includes('dev.to')) {
      return await fetchDevToContent(url);
    }
    
    // For CoderLegion, try API
    if (url.includes('coderlegion.com')) {
      return await fetchCoderLegionContent(url);
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch content from ${url}:`, error);
    return null;
  }
}

/**
 * Transform external post to MDX
 */
async function transformToMDX(post: ExternalPost, bodyMarkdown?: string): Promise<string> {
  const slug = generateSlug(post.title);
  const pillar = post.pillar || pillarFromRitual(post.ritual || null);
  const today = new Date().toISOString().split('T')[0];
  
  // Select homepage anchor text
  const anchors = [
    'Sovereign Financial Tracking',
    'Google Drive Portfolio Sync',
    'JSON-based Investment Tracker'
  ];
  const anchorText = anchors[Math.floor(Math.random() * anchors.length)];
  
  // Get content
  let content = bodyMarkdown || post.excerpt || '';
  
  // 🧹 AUTOMATIC SANITIZATION (Critical: Do this BEFORE injections)
  console.log('   🧹 Sanitizing markdown...');
  content = normalizeTables(content);
  content = scrubCodeBlockArtifacts(content);
  content = removeExcessiveBlankLines(content);
  
  // ✅ THEN inject enhancements
  content = injectKeyTakeaways(content);
  content = injectHomepageLink(content, anchorText);
  content += injectSovereignCTAContent();
  
  // 🧠 Generate SEO-optimized description using AI
  let seoDescription: string;
  if (bodyMarkdown && bodyMarkdown.length > 200) {
    console.log('   🧠 Generating AI-powered SEO description...');
    seoDescription = await generateSEODescription(post.title, bodyMarkdown);
  } else {
    // Fallback for short content
    seoDescription = post.excerpt || `${post.title} - Pocket Portfolio`;
    console.log('   ⚠️  Using fallback description (content too short for AI)');
  }
  
  // Build frontmatter
  const frontmatter = {
    title: post.title,
    date: post.date,
    updated: today,
    description: seoDescription,
    tags: post.tags || [],
    author: 'Pocket Portfolio',
    image: `/images/blog/${slug}.png`,
    pillar,
    source: post.source,
    original_url: post.url,
    canonical_url: `https://pocketportfolio.app/blog/${slug}`,
    ...(post.ritual && { ritual: post.ritual }),
  };
  
  // Format as MDX
  const frontmatterString = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      }
      return `${key}: "${value}"`;
    })
    .join('\n');
  
  return `---
${frontmatterString}
---

${content}
`;
}

/**
 * Import a single post
 */
async function importPost(post: ExternalPost): Promise<void> {
  console.log(`📥 Importing: ${post.title}`);
  console.log(`   Source: ${post.source} | URL: ${post.url}`);
  
  // Fetch full content if not provided
  let bodyMarkdown = post.body_markdown;
  if (!bodyMarkdown) {
    console.log(`   Fetching full content from ${post.source}...`);
    bodyMarkdown = await fetchArticleContent(post.url) || undefined;
    
    // Validate completeness
    if (bodyMarkdown) {
      const validation = validateContentCompleteness(bodyMarkdown, post.title);
      console.log(`   📊 Word count: ${validation.wordCount}`);
      
      if (!validation.isComplete) {
        console.warn(`   ${validation.warning}`);
        if (validation.wordCount < 500) {
          console.warn(`   ⚠️  This post may be truncated. Consider manual import.`);
        }
      } else {
        console.log(`   ✅ Content appears complete (${validation.wordCount} words)`);
      }
    } else {
      console.warn(`   ⚠️  Could not fetch full content. Using excerpt as fallback.`);
      bodyMarkdown = post.excerpt || undefined;
    }
  } else {
    // Validate existing content
    const validation = validateContentCompleteness(bodyMarkdown, post.title);
    if (!validation.isComplete) {
      console.warn(`   ${validation.warning}`);
    }
  }
  
  // Transform to MDX
  const mdxContent = await transformToMDX(post, bodyMarkdown);
  
  // Save MDX file
  const slug = generateSlug(post.title);
  const mdxPath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`);
  fs.mkdirSync(path.dirname(mdxPath), { recursive: true });
  fs.writeFileSync(mdxPath, mdxContent);
  
  console.log(`✅ Saved: ${mdxPath}`);
}

async function main() {
  const auditPath = path.join(process.cwd(), 'content', 'external-audit.json');
  
  if (!fs.existsSync(auditPath)) {
    console.error('❌ Audit file not found. Run: npm run audit-external-content');
    process.exit(1);
  }
  
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
  
  // Get command line arguments for filtering
  const args = process.argv.slice(2);
  const importAll = args.includes('--all');
  const importMedium = args.includes('--medium');
  
  let postsToImport: ExternalPost[];
  
  if (importAll) {
    // Import all posts
    postsToImport = audit.prioritized;
    console.log(`🚀 Starting import of ALL ${postsToImport.length} posts...\n`);
  } else if (importMedium) {
    // Import high and medium priority
    postsToImport = audit.prioritized.filter((p: ExternalPost) => 
      p.priority === 'high' || p.priority === 'medium'
    );
    console.log(`🚀 Starting import of ${postsToImport.length} high/medium-priority posts...\n`);
  } else {
    // Import high priority posts only (default)
    postsToImport = audit.prioritized.filter((p: ExternalPost) => p.priority === 'high');
    console.log(`🚀 Starting import of ${postsToImport.length} high-priority posts...\n`);
  }
  
  if (postsToImport.length === 0) {
    console.log('✅ No posts to import.');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const post of postsToImport) {
    try {
      await importPost(post);
      successCount++;
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      failCount++;
      console.error(`❌ Failed to import ${post.id}:`, error);
    }
  }
  
  console.log('\n✅ Import complete!');
  console.log(`📊 Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log('\n📋 Next Steps:');
  console.log('1. Review imported posts in content/posts/');
  console.log('2. Set canonical URLs on external platforms:');
  console.log('   - CoderLegion: Edit post → Canonical URL → https://pocketportfolio.app/blog/{slug}');
  console.log('   - Dev.to: Edit post → Canonical URL → https://pocketportfolio.app/blog/{slug}');
  console.log('3. Update profile/group bios with new messaging');
  console.log('\n💡 Tip: Run with --medium to import medium-priority posts, or --all for everything');
}

main().catch(console.error);

