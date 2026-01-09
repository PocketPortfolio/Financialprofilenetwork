/**
 * Hacker News "Who is Hiring" Scraper
 * Sources leads from HN monthly hiring threads (high-intent, active hiring)
 * v2.1: Strategic Diversification - Channel 3
 */

import { validateEmail } from '@/lib/sales/email-validation';

interface HiringPostLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'hiring_posts';
  postDate?: string;
}

/**
 * Source leads from Hacker News "Who is Hiring" threads
 * Filters: Keywords: TypeScript, Remote, London, US, CTO, VP Engineering
 */
export async function sourceFromHiringPosts(
  maxLeads?: number
): Promise<HiringPostLead[]> {
  const leads: HiringPostLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Fetching HN "Who is Hiring" thread...');
    
    // HN Algolia API endpoint for "Who is Hiring" posts
    // Search for the latest "Who is hiring?" post
    const searchUrl = 'https://hn.algolia.com/api/v1/search?query=who%20is%20hiring&tags=story&numericFilters=created_at_i>0';
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SalesPilot/1.0)',
      },
    });

    if (!searchResponse.ok) {
      console.warn('⚠️  HN API error:', searchResponse.statusText);
      return [];
    }

    const searchData = await searchResponse.json();
    
    // Find the most recent "Who is hiring?" post (usually posted on 1st of month)
    const hiringPosts = (searchData.hits || [])
      .filter((hit: any) => {
        const title = (hit.title || '').toLowerCase();
        return title.includes('who is hiring') || title.includes('hiring?');
      })
      .sort((a: any, b: any) => (b.created_at_i || 0) - (a.created_at_i || 0))
      .slice(0, 1); // Get the most recent one

    if (hiringPosts.length === 0) {
      console.log('⚠️  No "Who is Hiring" thread found');
      return [];
    }

    const postId = hiringPosts[0].objectID;
    console.log(`   Found "Who is Hiring" thread: ${postId} (${hiringPosts[0].title})`);

    // Fetch comments from the thread
    const commentsUrl = `https://hn.algolia.com/api/v1/search?tags=comment,story_${postId}&hitsPerPage=1000`;
    const commentsResponse = await fetch(commentsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SalesPilot/1.0)',
      },
    });
    
    if (!commentsResponse.ok) {
      console.warn('⚠️  HN Comments API error:', commentsResponse.statusText);
      return [];
    }

    const commentsData = await commentsResponse.json();
    const comments = commentsData.hits || [];

    console.log(`   Found ${comments.length} comments in thread`);

    // Keywords to filter for (companies actively hiring with relevant tech)
    const keywords = ['typescript', 'remote', 'london', 'us', 'cto', 'vp engineering', 'head of engineering', 'fintech'];
    
    let processed = 0;
    let skipped = 0;

    for (const comment of comments) {
      if (leads.length >= maxResults) break;

      const commentText = (comment.comment_text || '').toLowerCase();
      
      // Filter for relevant keywords
      const hasKeywords = keywords.some(keyword => commentText.includes(keyword));
      if (!hasKeywords) {
        continue;
      }

      processed++;

      // Extract email from comment (common patterns)
      const emailPatterns = [
        /contact[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /reach out[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      ];

      let extractedEmail: string | null = null;

      for (const pattern of emailPatterns) {
        const match = comment.comment_text?.match(pattern);
        if (match) {
          const rawEmail = match[1] || match[0];
          if (rawEmail) {
            // Clean up email (remove trailing punctuation)
            extractedEmail = rawEmail.replace(/[.,;!?]+$/, '');
            break;
          }
        }
      }

      // Extract company name (usually at the start of comment or after "|")
      const companyMatch = comment.comment_text?.match(/^([A-Z][a-zA-Z0-9\s&]+)|.*?\|([A-Z][a-zA-Z0-9\s&]+)/);
      const companyName = companyMatch ? (companyMatch[1] || companyMatch[2] || 'Unknown').trim() : 'Unknown';

      // Extract location
      const locationMatch = comment.comment_text?.match(/(?:location|based in|remote|onsite)[:\s]+([^,\n]+)/i);
      const location = locationMatch ? locationMatch[1].trim() : undefined;

      // Extract job title if mentioned
      let jobTitle = 'CTO'; // Default
      if (comment.comment_text?.match(/cto|chief technology officer/i)) {
        jobTitle = 'CTO';
      } else if (comment.comment_text?.match(/vp engineering|vp of engineering/i)) {
        jobTitle = 'VP Engineering';
      } else if (comment.comment_text?.match(/head of engineering/i)) {
        jobTitle = 'Head of Engineering';
      }

      if (extractedEmail && extractedEmail.length > 0) {
        // Validate email
        try {
          const validation = await validateEmail(extractedEmail);
          if (validation.isValid) {
            leads.push({
              email: extractedEmail,
              companyName,
              jobTitle,
              location,
              dataSource: 'hiring_posts',
              postDate: comment.created_at ? new Date(comment.created_at).toISOString() : undefined,
            });
            console.log(`   ✅ Found: ${extractedEmail} for ${companyName} (${jobTitle})`);
          } else {
            skipped++;
          }
        } catch (error) {
          skipped++;
        }
      } else {
        skipped++;
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ HN sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('HN sourcing error:', error.message);
  }

  return leads;
}

