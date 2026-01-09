/**
 * Crunchbase Scraper
 * Sources leads from Crunchbase public data
 * Free tier: Limited API access, public profiles
 * v2.1: Strategic Diversification - Channel 4
 */

import { resolveEmailFromGitHub } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';

interface CrunchbaseLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'crunchbase';
  fundingStage?: string;
}

/**
 * Source leads from Crunchbase
 * Filters: Fintech, DevTools, AI companies
 */
export async function sourceFromCrunchbase(
  maxLeads?: number
): Promise<CrunchbaseLead[]> {
  const leads: CrunchbaseLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Searching Crunchbase for Fintech/DevTools companies...');
    
    // Crunchbase Basic API (free tier) - requires API key
    // Alternative: Scrape public profiles (rate-limited, respectful)
    const crunchbaseApiKey = process.env.CRUNCHBASE_API_KEY;
    
    if (!crunchbaseApiKey) {
      console.log('⚠️  CRUNCHBASE_API_KEY not provided, using public scraping fallback');
      // Fallback: Use public Crunchbase search (limited)
      return await sourceFromCrunchbasePublic(maxResults);
    }

    // Use Crunchbase Basic API
    const searchUrl = `https://api.crunchbase.com/v4/searches/organizations?user_key=${crunchbaseApiKey}`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SalesPilot/1.0)',
      },
      body: JSON.stringify({
        query: [
          {
            type: 'query',
            field: 'categories',
            operator_id: 'includes',
            value: ['financial_services', 'developer_tools', 'artificial_intelligence'],
          },
        ],
        limit: 100,
      }),
    });

    if (!response.ok) {
      console.warn('⚠️  Crunchbase API error, falling back to public scraping');
      return await sourceFromCrunchbasePublic(maxResults);
    }

    const data = await response.json();
    const companies = data.entities || [];

    let processed = 0;
    let skipped = 0;

    for (const company of companies.slice(0, maxResults)) {
      if (leads.length >= maxResults) break;

      const companyName = company.properties?.name;
      const website = company.properties?.website || company.properties?.homepage_url;
      
      if (!companyName || !website) {
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

      // Fallback: GitHub resolution
      if (!resolvedEmail && process.env.GITHUB_TOKEN) {
        try {
          const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
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
          dataSource: 'crunchbase',
          location: company.properties?.location_identifiers?.[0]?.value,
          fundingStage: company.properties?.funding_stage,
        });
        console.log(`   ✅ Validated Crunchbase Lead: ${companyName} (${resolvedEmail})`);
      } else {
        skipped++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`✅ Crunchbase sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
  } catch (error: any) {
    console.error('❌ Crunchbase Scraper Error:', error.message);
    // Try public fallback
    return await sourceFromCrunchbasePublic(maxResults);
  }

  return leads;
}

/**
 * Fallback: Public Crunchbase scraping (limited, respectful)
 */
async function sourceFromCrunchbasePublic(maxResults: number): Promise<CrunchbaseLead[]> {
  // This would scrape public Crunchbase profiles
  // For now, return empty (requires implementation)
  console.log('⚠️  Crunchbase public scraping not yet implemented');
  return [];
}


