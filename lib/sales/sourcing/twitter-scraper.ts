/**
 * Twitter/X Scraper
 * Sources leads from Twitter hiring posts
 * Free: Twitter API v2 (requires Bearer token, free tier available)
 * v2.1: Strategic Diversification - Channel 7
 */

import { validateEmail } from '@/lib/sales/email-validation';

interface TwitterLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'twitter';
  tweetId?: string;
}

/**
 * Source leads from Twitter/X
 * Searches for: "hiring CTO" + "fintech" + "TypeScript"
 */
export async function sourceFromTwitter(
  maxLeads?: number
): Promise<TwitterLead[]> {
  const leads: TwitterLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Searching Twitter/X for Fintech/DevTools hiring posts...');
    
    // Twitter API v2 (requires Bearer token)
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!twitterBearerToken) {
      console.log('⚠️  TWITTER_BEARER_TOKEN not provided, skipping Twitter sourcing');
      return [];
    }

    // Search queries for Fintech/DevTools hiring
    const searchQueries = [
      'hiring CTO fintech -is:retweet',
      'hiring VP Engineering TypeScript -is:retweet',
      'fintech startup hiring remote -is:retweet',
      'hiring CTO DevTools -is:retweet',
    ];

    let processed = 0;
    let skipped = 0;

    for (const query of searchQueries) {
      if (leads.length >= maxResults) break;

      try {
        const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=50&tweet.fields=author_id,created_at,text`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'Authorization': `Bearer ${twitterBearerToken}`,
            'User-Agent': 'SalesPilot/1.0',
          },
        });

        if (!response.ok) {
          console.warn(`⚠️  Twitter API error for query "${query}": ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const tweets = data.data || [];

        for (const tweet of tweets) {
          if (leads.length >= maxResults) break;

          const tweetText = (tweet.text || '').toLowerCase();
          
          // Filter for relevant content
          if (!tweetText.includes('hiring') && !tweetText.includes('looking for')) {
            continue;
          }

          processed++;

          // Extract email from tweet
          const emailPatterns = [
            /contact[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /dm\s+for\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
          ];

          let extractedEmail: string | null = null;

          for (const pattern of emailPatterns) {
            const match = tweet.text.match(pattern);
            if (match) {
              const rawEmail = match[1] || match[0];
              if (rawEmail && !rawEmail.includes('example') && !rawEmail.includes('test')) {
                extractedEmail = rawEmail.toLowerCase().trim();
                break;
              }
            }
          }

          // If no email, try to extract from Twitter profile or bio
          if (!extractedEmail) {
            // Would need to fetch user profile for email (not always available)
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

          // Extract company name from tweet
          const companyMatch = tweet.text.match(/(?:hiring|looking for).*?at\s+([A-Z][a-zA-Z0-9\s]+)/i) ||
                              tweet.text.match(/([A-Z][a-zA-Z0-9\s]+)\s+(?:is|are)\s+hiring/i);
          const companyName = companyMatch ? companyMatch[1].trim() : 'Unknown Company';

          // Determine job title
          let jobTitle = 'CTO';
          if (tweetText.includes('cto') || tweetText.includes('chief technology officer')) {
            jobTitle = 'CTO';
          } else if (tweetText.includes('vp engineering') || tweetText.includes('vice president')) {
            jobTitle = 'VP Engineering';
          }

          leads.push({
            email: extractedEmail,
            companyName,
            jobTitle,
            dataSource: 'twitter',
            tweetId: tweet.id,
          });
          console.log(`   ✅ Validated Twitter Lead: ${companyName} (${extractedEmail})`);
        }

        // Rate limit: Twitter API allows 300 requests per 15 minutes
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error processing Twitter query "${query}":`, error.message);
        continue;
      }
    }

    console.log(`✅ Twitter sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('❌ Twitter Scraper Error:', error.message);
    return [];
  }

  return leads;
}


