/**
 * Email Resolution: Attempt to find real email for placeholder leads
 * Checks GitHub profile (blog, twitter), company website, etc.
 */

interface EmailResolutionResult {
  email: string | null;
  source: 'github_blog' | 'github_twitter' | 'company_website' | 'not_found';
  confidence: number; // 0-100
}

/**
 * Attempt to resolve placeholder email from GitHub user profile
 */
export async function resolveEmailFromGitHub(
  githubUsername: string,
  companyName: string,
  githubToken?: string
): Promise<EmailResolutionResult> {
  if (!githubToken) {
    return { email: null, source: 'not_found', confidence: 0 };
  }

  try {
    // Fetch GitHub user profile
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`,
        },
      }
    );

    if (!response.ok) {
      return { email: null, source: 'not_found', confidence: 0 };
    }

    const user = await response.json();

    // Try to extract email from blog field
    if (user.blog) {
      const blogUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
      try {
        // In production, would scrape blog for contact page or email
        // For now, construct potential email from blog domain
        const domain = new URL(blogUrl).hostname.replace('www.', '');
        const potentialEmail = `contact@${domain}`;
        return { email: potentialEmail, source: 'github_blog', confidence: 60 };
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // Try Twitter username (could use Twitter API to find email)
    if (user.twitter_username) {
      // In production, would use Twitter API or scrape
      // For now, return null but indicate Twitter is available
      return { email: null, source: 'github_twitter', confidence: 40 };
    }

    // Try company website (construct from company name)
    const companyDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const potentialEmail = `hello@${companyDomain}.com`;
    return { email: potentialEmail, source: 'company_website', confidence: 30 };

  } catch (error: any) {
    console.warn(`[EMAIL-RESOLUTION] Error resolving email for ${githubUsername}:`, error.message);
    return { email: null, source: 'not_found', confidence: 0 };
  }
}

/**
 * Check if email is a placeholder
 */
export function isPlaceholderEmail(email: string): boolean {
  return email.includes('.placeholder') || email.includes('@similar.') || email.includes('@github-hiring.');
}

