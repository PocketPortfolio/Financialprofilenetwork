/**
 * Product Hunt Scraper
 * Sources leads from Product Hunt "Made with" tags and maker profiles
 * Free: Public API access
 * v2.1: Strategic Diversification - Channel 5
 */

import { resolveEmailFromGitHub } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';

interface ProductHuntLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'producthunt';
  productUrl?: string;
}

/**
 * Source leads from Product Hunt
 * Filters: Fintech, DevTools, AI products
 */
export async function sourceFromProductHunt(
  maxLeads?: number
): Promise<ProductHuntLead[]> {
  const leads: ProductHuntLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Searching Product Hunt for Fintech/DevTools products...');
    
    // Product Hunt API (requires token, but has free tier)
    const productHuntToken = process.env.PRODUCTHUNT_API_TOKEN;
    
    if (!productHuntToken) {
      console.log('⚠️  PRODUCTHUNT_API_TOKEN not provided, using public API fallback');
      return await sourceFromProductHuntPublic(maxResults);
    }

    // Search for recent Fintech/DevTools products
    const searchUrl = 'https://api.producthunt.com/v2/api/graphql';
    
    const query = `
      query {
        posts(first: 50, order: VOTES, postedAfter: "${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}") {
          edges {
            node {
              name
              tagline
              website
              topics {
                edges {
                  node {
                    name
                  }
                }
              }
              user {
                username
                name
              }
            }
          }
        }
      }
    `;

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${productHuntToken}`,
        'User-Agent': 'Mozilla/5.0 (compatible; SalesPilot/1.0)',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.warn(`⚠️  Product Hunt API error (${response.status}): ${errorText}`);
      return await sourceFromProductHuntPublic(maxResults);
    }

    const data = await response.json();
    
    // Log API response for debugging
    if (data.errors) {
      console.warn(`⚠️  Product Hunt GraphQL errors:`, JSON.stringify(data.errors));
    }
    
    const posts = data.data?.posts?.edges || [];
    console.log(`📡 Product Hunt API: Received ${posts.length} posts from API`);

    // Filter for Fintech/DevTools/AI
    const relevantPosts = posts.filter((edge: any) => {
      const topics = edge.node.topics?.edges?.map((t: any) => t.node.name.toLowerCase()) || [];
      return topics.some((topic: string) => 
        topic.includes('fintech') || 
        topic.includes('finance') || 
        topic.includes('developer tools') ||
        topic.includes('devtools') ||
        topic.includes('ai') ||
        topic.includes('artificial intelligence')
      );
    });

    let processed = 0;
    let skipped = 0;

    for (const edge of relevantPosts.slice(0, maxResults)) {
      if (leads.length >= maxResults) break;

      const post = edge.node;
      const companyName = post.name;
      const website = post.website;
      const user = post.user;

      if (!companyName || !website || !user) {
        skipped++;
        continue;
      }

      processed++;

      // Extract domain
      let domain: string;
      try {
        const url = new URL(website.startsWith('http') ? website : `https://${website}`);
        domain = url.hostname.replace('www.', '');
      } catch (error) {
        skipped++;
        continue;
      }

      // Try email patterns
      const potentialEmails = [
        `founders@${domain}`,
        `hello@${domain}`,
        `cto@${domain}`,
        `contact@${domain}`,
      ];

      let resolvedEmail: string | null = null;

      for (const email of potentialEmails) {
        try {
          const validation = await validateEmail(email);
          if (validation.isValid) {
            resolvedEmail = email;
            break;
          }
        } catch (error) {
          // Continue
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Fallback: GitHub resolution using maker username
      if (!resolvedEmail && process.env.GITHUB_TOKEN && user?.username) {
        try {
          const makerUsername = user.username;
          const resolution = await resolveEmailFromGitHub(
            makerUsername,
            companyName,
            process.env.GITHUB_TOKEN
          );

          if (resolution.email && resolution.confidence >= 50) {
            const validation = await validateEmail(resolution.email);
            if (validation.isValid) {
              resolvedEmail = resolution.email;
            }
          }
        } catch (error) {
          // Silently continue
        }
      }

      if (resolvedEmail) {
        leads.push({
          email: resolvedEmail,
          companyName,
          jobTitle: 'CTO',
          dataSource: 'producthunt',
          productUrl: website,
        });
        console.log(`   ✅ Validated Product Hunt Lead: ${companyName} (${resolvedEmail})`);
      } else {
        skipped++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`✅ Product Hunt sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('❌ Product Hunt Scraper Error:', error.message);
    return await sourceFromProductHuntPublic(maxResults);
  }

  return leads;
}

/**
 * Fallback: Public Product Hunt scraping
 */
async function sourceFromProductHuntPublic(maxResults: number): Promise<ProductHuntLead[]> {
  // Scrape public Product Hunt pages
  // For now, return empty (requires implementation)
  console.log('⚠️  Product Hunt public scraping not yet implemented');
  return [];
}

