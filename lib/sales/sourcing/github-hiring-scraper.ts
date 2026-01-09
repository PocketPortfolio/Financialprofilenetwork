/**
 * GitHub Hiring Repository Scraper
 * Searches for Fintech/Finance repositories with "hiring" in README + TypeScript
 * v2.1: Fintech-aligned queries (Sniper approach - industry-focused)
 * Strategy: Target CTOs in Fintech/Finance companies using TypeScript
 */

import { resolveEmailFromGitHub } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';

interface GitHubHiringLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'github_hiring';
}

/**
 * Source leads from GitHub hiring repositories
 * Searches for: Fintech/Finance companies hiring + language:TypeScript
 * v2.1: Fintech-aligned queries - industry-focused targeting
 * Note: React preference handled in enrichment scoring, not search query
 */
export async function sourceFromGitHubHiring(
  githubToken?: string,
  maxLeads?: number
): Promise<GitHubHiringLead[]> {
  if (!githubToken) {
    console.log('⚠️  GitHub token not provided, skipping GitHub sourcing');
    return [];
  }

  const leads: GitHubHiringLead[] = [];
  const maxResults = maxLeads || 100; // Default to 100, but can be higher for retries

  try {
    // v2.2: Tiered query expansion (narrow → broad for wider coverage)
    // Strategy: Start with focused queries, expand if results insufficient
    // Tier 1: Narrow (Fintech + TypeScript) - Highest quality
    const tier1Queries = [
      'hiring in:readme language:TypeScript "fintech"',
      'hiring in:readme language:TypeScript "finance"',
      'hiring in:readme language:TypeScript "wealth"',
      'hiring in:readme language:TypeScript "crypto"',
      'hiring in:readme language:TypeScript "blockchain"',
      'hiring in:readme language:TypeScript "payment"',
      'hiring in:readme language:TypeScript "trading"',
    ];

    // Tier 2: Medium (Fintech + JavaScript, or TypeScript + broader finance terms)
    const tier2Queries = [
      'hiring in:readme language:JavaScript "fintech"',
      'hiring in:readme language:JavaScript "finance"',
      'hiring in:readme language:TypeScript "banking"',
      'hiring in:readme language:TypeScript "investment"',
      'hiring in:readme language:TypeScript "financial"',
      'hiring in:readme language:TypeScript "fintech" location:London',
      'hiring in:readme language:TypeScript "finance" location:Remote',
      'hiring in:readme language:TypeScript "crypto" location:US',
    ];

    // Tier 3: Broad (TypeScript/JavaScript + DevTools/Startups, or remove industry filter)
    const tier3Queries = [
      'hiring in:readme language:TypeScript "startup"',
      'hiring in:readme language:TypeScript "devtools"',
      'hiring in:readme language:TypeScript "saas"',
      'hiring in:readme language:JavaScript "startup"',
      'hiring in:readme language:JavaScript "devtools"',
      'hiring in:readme language:TypeScript', // No industry filter
      'hiring in:readme language:JavaScript', // No industry filter
    ];

    // Tier 4: Very broad (any language, any industry, just "hiring")
    const tier4Queries = [
      'hiring in:readme language:TypeScript OR language:JavaScript',
      'hiring in:readme',
    ];

    // Determine which tiers to use based on results needed
    const resultsThreshold = Math.max(10, maxResults * 0.3); // Expand if we have <30% of target
    let currentTier = 1;
    let allQueries: string[] = [];

    // Start with Tier 1 (narrow)
    allQueries = [...tier1Queries];
    console.log(`📡 Using Tier ${currentTier} queries (narrow, Fintech-focused)`);

    let totalProcessed = 0;
    let totalSkipped = 0;
    let queryIndex = 0;

    // Process queries with expansion logic
    while (queryIndex < allQueries.length && leads.length < maxResults) {
      const query = allQueries[queryIndex];
      queryIndex++;

      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=20`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${githubToken}`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`GitHub API error for query "${query}": ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        for (const repo of data.items || []) {
          if (leads.length >= maxResults) {
            break; // Stop if we've reached the target
          }

          // Extract company name from repo owner
          const companyName = repo.owner?.login || repo.full_name?.split('/')[0] || 'Unknown';
          const githubUsername = repo.owner?.login || companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Try to extract location from repo description or owner profile
          const location = repo.description?.match(/location[:\s]+([^,\n]+)/i)?.[1] || 
                          repo.location || 
                          undefined;

          totalProcessed++;

          // CRITICAL: Attempt to resolve real email BEFORE creating lead
          try {
            const resolution = await resolveEmailFromGitHub(
              githubUsername,
              companyName,
              githubToken
            );

            // Only create lead if we have a valid email with good confidence
            if (resolution.email && resolution.confidence >= 50) {
              // Validate email with MX record check
              const validation = await validateEmail(resolution.email);
              
              if (validation.isValid) {
                leads.push({
                  email: resolution.email, // Use resolved email, not placeholder
                  companyName,
                  jobTitle: 'CTO', // Would need to detect from README content
                  location,
                  dataSource: 'github_hiring',
                });
                console.log(`   ✅ Resolved: ${resolution.email} for ${companyName} (confidence: ${resolution.confidence}%)`);
              } else {
                totalSkipped++;
                // Silently skip invalid emails (already logged in validation)
              }
            } else {
              totalSkipped++;
              // Silently skip unresolvable leads to reduce noise
            }
          } catch (resolveError: any) {
            totalSkipped++;
            // Silently skip on resolution errors
          }

          // Rate limit: small delay between resolutions
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        console.error(`Error processing GitHub query "${query}":`, error.message);
        continue;
      }

      // Query expansion: Check if we need to expand to next tier
      // Expand after processing all queries in current tier if results insufficient
      if (queryIndex >= allQueries.length && leads.length < resultsThreshold && currentTier < 4) {
        console.log(`⚠️  Only found ${leads.length} leads (target: ${maxResults}). Expanding to Tier ${currentTier + 1} queries...`);
        
        // Add next tier queries
        if (currentTier === 1) {
          allQueries = [...tier1Queries, ...tier2Queries];
          currentTier = 2;
          console.log(`📡 Expanded to Tier 2: Added JavaScript + broader finance terms`);
        } else if (currentTier === 2) {
          allQueries = [...tier1Queries, ...tier2Queries, ...tier3Queries];
          currentTier = 3;
          console.log(`📡 Expanded to Tier 3: Added DevTools/Startups, removed industry filters`);
        } else if (currentTier === 3) {
          allQueries = [...tier1Queries, ...tier2Queries, ...tier3Queries, ...tier4Queries];
          currentTier = 4;
          console.log(`📡 Expanded to Tier 4: Very broad queries (any industry)`);
        }
      }
    }

    console.log(`✅ GitHub sourcing: Found ${leads.length} valid leads (processed ${totalProcessed}, skipped ${totalSkipped}, tier: ${currentTier})`);
  } catch (error: any) {
    console.error('GitHub sourcing error:', error.message);
  }

  return leads;
}

/**
 * Extract hiring information from README content
 * Would parse README to find job titles, requirements, etc.
 */
export function extractHiringInfoFromReadme(readmeContent: string): {
  jobTitles: string[];
  techStack: string[];
  location?: string;
} {
  const jobTitles: string[] = [];
  const techStack: string[] = [];
  let location: string | undefined;

  // Simple pattern matching (would use more sophisticated parsing in production)
  const titlePatterns = [
    /(?:looking for|hiring|seeking).*?(?:CTO|Chief Technology Officer|VP Engineering|Head of Engineering)/i,
    /(?:CTO|Chief Technology Officer|VP Engineering|Head of Engineering).*?(?:wanted|needed|hiring)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = readmeContent.match(pattern);
    if (match) {
      if (match[0].includes('CTO') || match[0].includes('Chief Technology Officer')) {
        jobTitles.push('CTO');
      }
      if (match[0].includes('VP Engineering') || match[0].includes('Head of Engineering')) {
        jobTitles.push('VP Engineering');
      }
    }
  }

  // Extract location
  const locationMatch = readmeContent.match(/location[:\s]+([^,\n]+)/i);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  // Extract tech stack mentions
  const techKeywords = ['React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'Go', 'Rust'];
  for (const tech of techKeywords) {
    if (readmeContent.includes(tech)) {
      techStack.push(tech);
    }
  }

  return { jobTitles, techStack, location };
}

