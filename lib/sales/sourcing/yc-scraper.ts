/**
 * Y Combinator Company Scraper
 * Sources leads from YC companies (high-value, funded startups)
 * v2.1: Strategic Diversification - Channel 2
 * LIVE FEED: Direct connection to YC's Algolia index (no placeholders)
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

interface YCCompany {
  name: string;
  short_description?: string;
  website?: string;
  batch: string;
  tags?: string[];
  location?: string;
}

// YC's Public Algolia Credentials (standard for their directory)
const ALGOLIA_ID = '45AD1018D5';
const ALGOLIA_KEY = '8ea9a4445543c72828b507559e51c89f'; // Public search-only key
const ALGOLIA_ENDPOINT = `https://${ALGOLIA_ID}-dsn.algolia.net/1/indexes/Persisted_YC_Company_Production/query`;

/**
 * Source leads from Y Combinator companies
 * LIVE FEED: Direct connection to YC's Algolia index
 * Filters: Recent batches (W24, S24, W25), Fintech/DevTools/AI tags
 */
export async function sourceFromYC(
  maxLeads?: number
): Promise<YCLead[]> {
  const leads: YCLead[] = [];
  const maxResults = maxLeads || 50;

  // WAR MODE: Add retry logic for network resilience (Directive 011)
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`   🔄 YC Feed retry attempt ${attempt}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      } else {
        console.log('🔌 Connecting to Y Combinator Live Feed (Algolia)...');
      }

      // 1. Fetch Real Data (Recent Batches Only)
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased)

      let response: Response;
      try {
        response = await fetch(ALGOLIA_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': ALGOLIA_ID,
            'X-Algolia-API-Key': ALGOLIA_KEY,
            'User-Agent': 'Mozilla/5.0 (compatible; SalesPilot/1.0)',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            params: 'query=&hitsPerPage=500&filters=batch:W24 OR batch:S24 OR batch:W25 OR batch:W23 OR batch:S23'
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          lastError = new Error('YC Feed timeout: Request took longer than 15 seconds');
          if (attempt < MAX_RETRIES) continue; // Retry on timeout
          throw lastError;
        }
        lastError = new Error(`YC Feed network error: ${fetchError.message}`);
        if (attempt < MAX_RETRIES) continue; // Retry on network error
        throw lastError;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        lastError = new Error(`YC Feed failed: ${response.status} ${errorText}`);
        if (attempt < MAX_RETRIES && response.status >= 500) {
          continue; // Retry on server errors (5xx)
        }
        throw lastError;
      }

      const data = await response.json();
      const hits: YCCompany[] = data.hits || [];

      console.log(`📡 Received ${hits.length} raw companies from YC Live Feed.`);

      // 2. Filter for Relevance (The £100k Target)
      const candidates = hits.filter(c => {
        if (!c.website) return false;
        
        // Filter for high-value categories
        const tags = (c.tags || []).map(t => t.toLowerCase());
        return tags.includes('fintech') || 
               tags.includes('developer_tools') || 
               tags.includes('devtools') ||
               tags.includes('ai') ||
               tags.includes('artificial_intelligence');
      });

      console.log(`🎯 Filtered down to ${candidates.length} high-value targets (Fintech/DevTools/AI).`);

      let processed = 0;
      let skipped = 0;

      // 3. Resolve & Validate Emails
      for (const company of candidates) {
        if (leads.length >= maxResults) break;

        if (!company.website) {
          skipped++;
          continue;
        }

        processed++;

        // Extract domain from website
        let domain: string;
        try {
          const url = new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`);
          domain = url.hostname.replace('www.', '');
        } catch (error) {
          skipped++;
          continue;
        }

        // Strategy: Construct likely high-value emails
        // We prioritize "founders@" or "hello@" for early stage YC companies
        const potentialEmails = [
          `founders@${domain}`,
          `hello@${domain}`,
          `engineering@${domain}`,
          `cto@${domain}`,
          `contact@${domain}`,
        ];

        let resolvedEmail: string | null = null;

        for (const email of potentialEmails) {
          try {
            // THE GATEKEEPER: MX Record Check
            const validation = await validateEmail(email);
            if (validation.isValid) {
              resolvedEmail = email;
              break;
            }
          } catch (error) {
            // Continue to next pattern
          }
          // Small delay between validations
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Fallback: Try GitHub resolution if email patterns failed
        if (!resolvedEmail && process.env.GITHUB_TOKEN) {
          try {
            const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const resolution = await resolveEmailFromGitHub(
              companySlug,
              company.name,
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
          // Determine industry from tags
          const tags = (company.tags || []).map(t => t.toLowerCase());
          let industry = 'Fintech';
          if (tags.includes('developer_tools') || tags.includes('devtools')) {
            industry = 'DevTools';
          } else if (tags.includes('ai') || tags.includes('artificial_intelligence')) {
            industry = 'AI';
          }

          leads.push({
            email: resolvedEmail,
            companyName: company.name,
            jobTitle: 'CTO', // Default, will be enriched later
            dataSource: 'yc',
            batch: company.batch,
            industry: industry,
            location: company.location,
          });
          console.log(`   ✅ Validated YC Lead: ${company.name} (${resolvedEmail}) - Batch: ${company.batch}`);
        } else {
          skipped++;
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ YC sourcing: Found ${leads.length} valid leads (processed ${processed}, skipped ${skipped})`);
      return leads; // Success - return leads
    } catch (error: any) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        continue; // Retry on any error
      }
      // Final attempt failed - log and fail gracefully
      console.error(`❌ YC Scraper Error (after ${MAX_RETRIES} attempts):`, error.message);
      // Fail gracefully, let other channels fill the quota
      return [];
    }
  }

  // Should never reach here, but TypeScript needs it
  if (lastError) {
    console.error(`❌ YC Scraper Error (all retries exhausted):`, lastError.message);
  }
  return [];
}
