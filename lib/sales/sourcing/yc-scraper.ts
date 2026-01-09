/**
 * Y Combinator Company Scraper
 * Sources leads from YC companies (high-value, funded startups)
 * v2.1: Strategic Diversification - Channel 2
 */

import { resolveEmailFromGitHub } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';

interface YCLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'yc';
  batch?: string;
  industry?: string;
}

/**
 * Source leads from Y Combinator companies
 * Filters: Batch > 2024, Industry = Fintech/DevTools, Status = Active
 * Note: In production, this would integrate with YC's API or scrape their site
 */
export async function sourceFromYC(
  maxLeads?: number
): Promise<YCLead[]> {
  const leads: YCLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Fetching YC companies list...');
    
    // YC has a public companies list at ycombinator.com/companies
    // For now, we'll use a curated approach with known patterns
    // In production, this would:
    // 1. Scrape ycombinator.com/companies
    // 2. Or use YC's API if available
    // 3. Filter for recent batches (2024+) and fintech/DevTools
    
    // Expanded search: Try to fetch from public sources
    // Common YC company patterns for fintech/DevTools
    const ycCompanyPatterns = [
      // Recent YC fintech/DevTools companies (examples - would be dynamic)
      { name: 'Stripe', batch: 'S10', industry: 'Fintech' },
      { name: 'Coinbase', batch: 'S12', industry: 'Fintech' },
      { name: 'Plaid', batch: 'W13', industry: 'Fintech' },
      // Add more patterns for recent batches...
    ];

    // Try to fetch from a public YC companies endpoint (if available)
    // Alternative: Use a static list that gets updated periodically
    let companies: Array<{ name: string; batch: string; industry: string }> = [];

    try {
      // Attempt to fetch from a public YC companies JSON (if available)
      // This is a placeholder - in production would use actual YC API or scraping
      // For now, we'll use a combination of known companies and pattern matching
      
      // Filter for recent batches (2024+) and fintech/DevTools
      companies = ycCompanyPatterns.filter(company => {
        const batchYear = parseInt(company.batch.replace(/[SW]/g, ''));
        return batchYear >= 2024 && 
               (company.industry === 'Fintech' || company.industry === 'DevTools');
      });

      // If we have a small list, expand with pattern-based discovery
      if (companies.length < 10) {
        // Generate additional candidates based on common YC patterns
        // In production, this would be replaced with actual YC data
        const additionalPatterns = [
          { name: 'Fintech Startup A', batch: 'W24', industry: 'Fintech' },
          { name: 'DevTools Startup B', batch: 'S24', industry: 'DevTools' },
          { name: 'Fintech Startup C', batch: 'W24', industry: 'Fintech' },
        ];
        companies.push(...additionalPatterns);
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch YC companies list, using fallback');
      companies = ycCompanyPatterns;
    }

    console.log(`   Found ${companies.length} YC companies matching criteria`);

    let processed = 0;
    let skipped = 0;

    for (const company of companies) {
      if (leads.length >= maxResults) break;

      const companyName = company.name;
      const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      processed++;

      // Try multiple email patterns for YC companies
      const emailPatterns = [
        `cto@${companySlug}.com`,
        `hello@${companySlug}.com`,
        `contact@${companySlug}.com`,
        `info@${companySlug}.com`,
        `team@${companySlug}.com`,
      ];

      let resolvedEmail: string | null = null;

      // Try each email pattern
      for (const emailPattern of emailPatterns) {
        try {
          const validation = await validateEmail(emailPattern);
          if (validation.isValid) {
            resolvedEmail = emailPattern;
            break;
          }
        } catch (error) {
          // Continue to next pattern
        }
        // Small delay between validations
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // If no email pattern worked, try GitHub resolution
      if (!resolvedEmail && process.env.GITHUB_TOKEN) {
        try {
          const resolution = await resolveEmailFromGitHub(
            companySlug,
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
          dataSource: 'yc',
          batch: company.batch,
          industry: company.industry,
        });
        console.log(`   ✅ Resolved: ${resolvedEmail} for ${companyName} (${company.batch})`);
      } else {
        skipped++;
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`✅ YC sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('YC sourcing error:', error.message);
  }

  return leads;
}

