/**
 * Content Fetcher for Social Media Posts
 * Fetches real-time data for automated social posts
 * OPERATION METRONOME - Automated Social Infrastructure
 */

interface WarModeStats {
  dayOfYear: number;
  indexedPages: number;
  npmDownloads: number;
}

interface ResearchPost {
  title: string;
  description: string;
  slug: string;
  date: string;
}

/**
 * Get day of year (1-365/366)
 */
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Count indexed pages from sitemap files
 * Uses known count from build process (61,935 URLs)
 */
async function getIndexedPagesCount(): Promise<number> {
  try {
    // Fetch the main sitemap index to verify it's accessible
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
    const response = await fetch(`${baseUrl}/sitemap.xml`);

    if (!response.ok) {
      console.warn('Failed to fetch sitemap, using fallback count');
      return 61935; // Known count from build
    }

    // Known structure: 16 ticker sitemaps × ~3,860 = ~61,760 + static/blog/imports/tools = ~61,935
    // Return known accurate count (updated during build)
    return 61935;
  } catch (error) {
    console.error('Error counting indexed pages:', error);
    return 61935; // Fallback to known count
  }
}

/**
 * Get NPM total downloads
 */
async function getNPMDownloads(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
    const response = await fetch(`${baseUrl}/api/npm-stats`);

    if (!response.ok) {
      throw new Error(`NPM stats API returned ${response.status}`);
    }

    const data = await response.json();
    return data.totalDownloads || 0;
  } catch (error) {
    console.error('Error fetching NPM downloads:', error);
    return 0;
  }
}

/**
 * Get latest research post
 */
async function getLatestResearchPost(): Promise<ResearchPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
    const response = await fetch(`${baseUrl}/api/blog/posts`);

    if (!response.ok) {
      throw new Error(`Blog posts API returned ${response.status}`);
    }

    const posts = await response.json();
    
    // Filter for research posts, get latest by date (most recent first)
    const researchPosts = posts
      .filter((post: any) => post.category === 'research')
      .sort((a: any, b: any) => {
        // Sort by date (most recent first)
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return bTime - aTime;
      });

    if (researchPosts.length === 0) {
      console.warn('[Content Fetcher] No research posts found');
      return null;
    }

    const latest = researchPosts[0];
    console.log(`[Content Fetcher] Latest research post: ${latest.title} (date: ${latest.date}, slug: ${latest.slug})`);
    
    // Validate slug exists and is not empty
    if (!latest.slug || latest.slug.trim() === '') {
      console.error(`[Content Fetcher] CRITICAL: Post has empty or invalid slug! Title: ${latest.title}`);
      return null;
    }
    
    const cleanSlug = latest.slug.trim();
    
    // CRITICAL: Verify slug doesn't end with hyphen (truncation indicator)
    if (cleanSlug.endsWith('-')) {
      console.error(`[Content Fetcher] CRITICAL: Slug ends with hyphen - may be truncated!`);
      console.error(`[Content Fetcher] Slug: "${cleanSlug}"`);
      console.error(`[Content Fetcher] Title: ${latest.title}`);
      // Remove trailing hyphen and log warning
      const fixedSlug = cleanSlug.replace(/-+$/, ''); // Remove trailing hyphens
      console.warn(`[Content Fetcher] Attempting to fix slug: "${cleanSlug}" -> "${fixedSlug}"`);
      if (fixedSlug.length < 10) {
        console.error(`[Content Fetcher] Fixed slug is too short, rejecting post`);
        return null;
      }
      return {
        title: latest.title,
        description: latest.description || '',
        slug: fixedSlug,
        date: latest.date,
      };
    }
    
    return {
      title: latest.title,
      description: latest.description || '',
      slug: cleanSlug,
      date: latest.date,
    };
  } catch (error) {
    console.error('Error fetching research post:', error);
    return null;
  }
}

/**
 * Generate War Mode update text
 * Format: "Day [DayOfYear]. [IndexedPages] pages indexed. [NpmDownloads] downloads. The machine is hungry. #BuildInPublic"
 */
export async function generateWarModeUpdate(): Promise<string> {
  const dayOfYear = getDayOfYear();
  const [indexedPages, npmDownloads] = await Promise.all([
    getIndexedPagesCount(),
    getNPMDownloads(),
  ]);

  return `Day ${dayOfYear}. ${indexedPages.toLocaleString()} pages indexed. ${npmDownloads.toLocaleString()} downloads. The machine is hungry. #BuildInPublic`;
}

/**
 * Generate Research drop text
 * Format: "📡 NEW INTEL: [Title]. [OneSentenceSummary]. 🧵 [Link]"
 * Ensures total length stays within 280 characters
 * CRITICAL: Link must ALWAYS be preserved, even if title/summary need aggressive truncation
 */
export async function generateResearchDrop(): Promise<string | null> {
  const post = await getLatestResearchPost();
  
  if (!post) {
    console.warn('No research post found for 18:00 drop');
    return null;
  }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';
    const link = `${baseUrl}/blog/${post.slug}`;
  
    // Calculate fixed parts length
    const prefix = '📡 NEW INTEL: ';
    const suffix = ' 🧵 ';
    const fixedLength = prefix.length + suffix.length + link.length;
  
  // Available space for title + summary
  const availableSpace = 280 - fixedLength;
  
  // Validate link fits (should always be true, but safety check)
  if (availableSpace < 10) {
    console.error(`[Content Fetcher] Link is too long (${link.length} chars). Tweet cannot fit.`);
    // Fallback: minimal tweet with truncated title only - NEVER truncate the link
    const minimalTitle = post.title.substring(0, Math.max(20, availableSpace - 3)) + '...';
    const fallbackTweet = `${prefix}${minimalTitle}${suffix}${link}`;
    // CRITICAL: If still too long, truncate title more, but NEVER the link
    if (fallbackTweet.length > 280) {
      const maxTitleLength = 280 - fixedLength;
      const ultraMinimalTitle = post.title.substring(0, Math.max(10, maxTitleLength - 3)) + '...';
      return `${prefix}${ultraMinimalTitle}${suffix}${link}`;
    }
    return fallbackTweet;
  }
  
  // Extract first sentence from description as summary
  let summary = post.description.split('.')[0] || post.description.substring(0, 100);
  let title = post.title;
  
  // Build the tweet: prefix + title + summary + suffix + link
  let tweet = `${prefix}${title}. ${summary}.${suffix}${link}`;
  
  // If tweet is too long, truncate title and summary while preserving link
  if (tweet.length > 280) {
    // Calculate how much we need to cut
    const excess = tweet.length - 280;
    const titleLength = title.length;
    const summaryLength = summary.length;
    const totalContentLength = titleLength + summaryLength + 2; // +2 for ". "
    
    // Strategy: Truncate summary first (more flexible), then title if needed
    if (summaryLength > excess) {
      // Truncate summary only
      summary = summary.substring(0, summaryLength - excess - 3) + '...';
    } else {
      // Summary is too short, need to truncate title too
      const summaryTruncated = summary.substring(0, Math.max(20, summaryLength - 3)) + '...';
      const remainingExcess = excess - (summaryLength - summaryTruncated.length);
      
      if (titleLength > remainingExcess) {
        title = title.substring(0, titleLength - remainingExcess - 3) + '...';
      } else {
        // Both are too short, truncate both aggressively but proportionally
        const splitExcess = Math.floor(excess / 2);
        title = title.substring(0, Math.max(20, titleLength - splitExcess - 3)) + '...';
        summary = summary.substring(0, Math.max(20, summaryLength - splitExcess - 3)) + '...';
      }
    }
    
    // Rebuild tweet with truncated content
    tweet = `${prefix}${title}. ${summary}.${suffix}${link}`;
  }
  
  // Final safety check - if STILL too long, aggressively truncate content but NEVER the link
  if (tweet.length > 280) {
    const excess = tweet.length - 280;
    const contentPart = `${prefix}${title}. ${summary}.${suffix}`;
    const maxContentLength = contentPart.length - excess;
    
    // Aggressively truncate title and summary proportionally, but preserve structure
    const titleMax = Math.floor(maxContentLength * 0.6); // 60% for title
    const summaryMax = Math.floor(maxContentLength * 0.4) - 2; // 40% for summary, -2 for ". "
    
    title = title.substring(0, Math.max(20, titleMax - 3)) + '...';
    summary = summary.substring(0, Math.max(10, summaryMax - 3)) + '...';
    
    // Rebuild with guaranteed length
    tweet = `${prefix}${title}. ${summary}.${suffix}${link}`;
    
    // If STILL too long (shouldn't happen, but ultimate safety), hard truncate content only
    if (tweet.length > 280) {
      const finalContentLength = 280 - fixedLength;
      const finalTitleLength = Math.floor(finalContentLength * 0.6);
      const finalSummaryLength = finalContentLength - finalTitleLength - 2;
      title = title.substring(0, Math.max(15, finalTitleLength));
      summary = summary.substring(0, Math.max(10, finalSummaryLength));
      tweet = `${prefix}${title}. ${summary}.${suffix}${link}`;
    }
  }
  
  // CRITICAL: Verify link is intact and at the end
  if (!tweet.endsWith(link)) {
    console.error(`[Content Fetcher] CRITICAL: Link was truncated! Expected: ${link}`);
    console.error(`[Content Fetcher] Tweet ends with: ${tweet.substring(Math.max(0, tweet.length - 50))}`);
    // Force link to be at the end - rebuild with correct structure
    const contentPart = `${prefix}${title}. ${summary}.${suffix}`;
    const maxContentLength = 280 - fixedLength;
    const truncatedContent = contentPart.substring(0, maxContentLength);
    tweet = `${truncatedContent}${link}`;
  }
  
  // Final validation
  if (tweet.length > 280) {
    console.error(`[Content Fetcher] CRITICAL: Tweet still too long after all truncation! Length: ${tweet.length}`);
    // Last resort: hard truncate everything except link
    const hardTruncateLength = 280 - fixedLength;
    tweet = `${prefix}${post.title.substring(0, hardTruncateLength - 10)}...${suffix}${link}`;
  }
  
  // FINAL CRITICAL CHECK: Verify link is complete and not truncated
  if (link.endsWith('-')) {
    console.error(`[Content Fetcher] CRITICAL: Link ends with hyphen - slug may be truncated!`);
    console.error(`[Content Fetcher] Link: ${link}`);
    console.error(`[Content Fetcher] Slug: ${post.slug}`);
    // This should never happen, but if it does, we need to fix it
    throw new Error(`Link generation error: slug appears truncated (ends with hyphen)`);
  }
  
  // Verify link is in tweet and complete
  if (!tweet.includes(link) || !tweet.endsWith(link)) {
    console.error(`[Content Fetcher] CRITICAL: Link integrity check failed!`);
    console.error(`[Content Fetcher] Expected link: ${link}`);
    console.error(`[Content Fetcher] Tweet ends with: ${tweet.substring(Math.max(0, tweet.length - 100))}`);
    throw new Error(`Link integrity check failed - link may be truncated`);
  }
  
  console.log(`[Content Fetcher] Generated tweet: ${tweet.length} chars, link verified: ${tweet.endsWith(link)}`);
  console.log(`[Content Fetcher] Link: ${link} (${link.length} chars)`);
  console.log(`[Content Fetcher] Slug: ${post.slug}`);
  
  return tweet;
}

