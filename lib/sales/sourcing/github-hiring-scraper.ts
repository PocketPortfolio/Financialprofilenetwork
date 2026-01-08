/**
 * GitHub Hiring Repository Scraper
 * Searches for repositories with "hiring" in README + TypeScript + Location filters
 * Sprint 4: Hybrid Sourcing Module
 */

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
 */
export async function sourceFromGitHubHiring(
  githubToken?: string
): Promise<GitHubHiringLead[]> {
  if (!githubToken) {
    console.log('⚠️  GitHub token not provided, skipping GitHub sourcing');
    return [];
  }

  const leads: GitHubHiringLead[] = [];

  try {
    // Use GitHub REST API (no external dependency needed for basic search)
    const searchQueries = [
      'hiring in:readme language:TypeScript location:London',
      'hiring in:readme language:TypeScript location:Remote',
      'hiring in:readme language:TypeScript location:UK',
      'hiring in:readme language:TypeScript location:Europe',
    ];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              ...(githubToken ? { 'Authorization': `token ${githubToken}` } : {}),
            },
          }
        );

        if (!response.ok) {
          console.warn(`GitHub API error for query "${query}": ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        for (const repo of data.items || []) {
          // Extract company name from repo owner
          const companyName = repo.owner?.login || repo.full_name?.split('/')[0] || 'Unknown';
          
          // Try to extract location from repo description or owner profile
          const location = repo.description?.match(/location[:\s]+([^,\n]+)/i)?.[1] || 
                          repo.location || 
                          undefined;

          // Create lead structure
          // Note: Email discovery would require additional API calls or external service
          leads.push({
            email: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@github-hiring.placeholder`, // Placeholder - needs email discovery
            companyName,
            jobTitle: 'CTO', // Would need to detect from README content
            location,
            dataSource: 'github_hiring',
          });
        }
      } catch (error: any) {
        console.error(`Error processing GitHub query "${query}":`, error.message);
        continue;
      }
    }

    console.log(`✅ GitHub sourcing: Found ${leads.length} potential leads`);
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

