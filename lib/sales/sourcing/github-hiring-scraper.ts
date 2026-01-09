/**
 * GitHub Hiring Repository Scraper
 * Searches for repositories with "hiring" in README + TypeScript + Location filters
 * Sprint 4: Hybrid Sourcing Module
 * v2.1: Resolves emails before returning leads (no placeholders)
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
 * Searches for: hiring in README + language:TypeScript + location filters
 * v2.1: Resolves emails before returning (no placeholders)
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
    // Expanded search queries for more coverage
    const searchQueries = [
      'hiring in:readme language:TypeScript',
      'hiring in:readme language:TypeScript location:London',
      'hiring in:readme language:TypeScript location:Remote',
      'hiring in:readme language:TypeScript location:UK',
      'hiring in:readme language:TypeScript location:Europe',
      'hiring in:readme language:TypeScript location:US',
      'hiring in:readme language:JavaScript',
      'hiring in:readme language:TypeScript stars:>10',
      'hiring in:readme language:TypeScript pushed:>2024-01-01',
    ];

    let totalProcessed = 0;
    let totalSkipped = 0;

    for (const query of searchQueries) {
      if (leads.length >= maxResults) {
        break; // Stop if we've reached the target
      }

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
    }

    console.log(`✅ GitHub sourcing: Found ${leads.length} valid leads (processed ${totalProcessed}, skipped ${totalSkipped})`);
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

