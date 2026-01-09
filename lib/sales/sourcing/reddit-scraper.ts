/**
 * Reddit Scraper
 * Sources leads from Reddit hiring subreddits
 * Free: Reddit API (requires auth, but free)
 * v2.1: Strategic Diversification - Channel 6
 */

import { validateEmail } from '@/lib/sales/email-validation';

interface RedditLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'reddit';
  subreddit?: string;
}

/**
 * Source leads from Reddit hiring subreddits
 * Subreddits: r/forhire, r/startups, r/fintech, r/remotework
 */
export async function sourceFromReddit(
  maxLeads?: number
): Promise<RedditLead[]> {
  const leads: RedditLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Searching Reddit for Fintech/DevTools hiring posts...');
    
    // Reddit API (free, requires user agent)
    const subreddits = ['forhire', 'startups', 'fintech', 'remotework', 'cscareerquestions'];
    const keywords = ['hiring', 'cto', 'vp engineering', 'typescript', 'fintech', 'remote'];
    
    let processed = 0;
    let skipped = 0;

    for (const subreddit of subreddits) {
      if (leads.length >= maxResults) break;

      try {
        // Reddit JSON API (no auth required for public data)
        const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=100`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'SalesPilot/1.0 (Lead Generation Bot)',
          },
        });

        if (!response.ok) {
          console.warn(`⚠️  Reddit API error for r/${subreddit}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const posts = data.data?.children || [];

        for (const post of posts) {
          if (leads.length >= maxResults) break;

          const postData = post.data;
          const title = (postData.title || '').toLowerCase();
          const selftext = (postData.selftext || '').toLowerCase();
          const combined = `${title} ${selftext}`;

          // Filter for relevant keywords
          const hasKeywords = keywords.some(keyword => combined.includes(keyword));
          if (!hasKeywords) {
            continue;
          }

          processed++;

          // Extract email from post
          const emailPatterns = [
            /contact[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /reach out[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
          ];

          let extractedEmail: string | null = null;

          for (const pattern of emailPatterns) {
            const match = combined.match(pattern);
            if (match) {
              const rawEmail = match[1] || match[0];
              if (rawEmail && !rawEmail.includes('example') && !rawEmail.includes('test')) {
                extractedEmail = rawEmail.toLowerCase().trim();
                break;
              }
            }
          }

          if (!extractedEmail) {
            skipped++;
            continue;
          }

          // Validate email
          try {
            const validation = await validateEmail(extractedEmail);
            if (!validation.isValid) {
              skipped++;
              continue;
            }
          } catch (error) {
            skipped++;
            continue;
          }

          // Extract company name from title or selftext
          const companyMatch = title.match(/(?:hiring|looking for).*?at\s+([A-Z][a-zA-Z0-9\s]+)/i) ||
                              title.match(/([A-Z][a-zA-Z0-9\s]+)\s+(?:is|are)\s+hiring/i);
          const companyName = companyMatch ? companyMatch[1].trim() : postData.author || 'Unknown Company';

          // Determine job title
          let jobTitle = 'CTO';
          if (combined.includes('cto') || combined.includes('chief technology officer')) {
            jobTitle = 'CTO';
          } else if (combined.includes('vp engineering') || combined.includes('vice president')) {
            jobTitle = 'VP Engineering';
          } else if (combined.includes('head of engineering')) {
            jobTitle = 'Head of Engineering';
          }

          leads.push({
            email: extractedEmail,
            companyName,
            jobTitle,
            dataSource: 'reddit',
            subreddit,
          });
          console.log(`   ✅ Validated Reddit Lead: ${companyName} (${extractedEmail}) from r/${subreddit}`);
        }

        // Rate limit: 1 request per second (Reddit API limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Error processing r/${subreddit}:`, error.message);
        continue;
      }
    }

    console.log(`✅ Reddit sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('❌ Reddit Scraper Error:', error.message);
    return [];
  }

  return leads;
}


