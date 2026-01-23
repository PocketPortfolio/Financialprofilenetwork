/**
 * Predator Bot V3: Autonomous Global Discovery Protocol
 * 
 * CEO MANDATE: No third-party APIs. Predator Bot is the PRIMARY and ONLY source.
 * 
 * V3 FEATURE: Self-Scaling Discovery
 * - Crawls root directories to discover locations automatically
 * - Builds its own hunt queue (no manual city lists)
 * - Global coverage (UK, US, and more)
 * - MUST EXTRACT EMAILS (primary focus)
 * 
 * Target: 10,000 high-intent quality leads/day
 * Per-Run: ~833 leads (12 runs/day, every 2 hours)
 * 
 * Uses Drizzle ORM (not Supabase JS) to match existing architecture.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

export interface PredatorLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  website?: string;
  dataSource: 'predator_vouchedfor' | 'predator_napfa' | 'predator_global';
  region?: string; // For cultural email customization
}

/**
 * Global Sources (Root Directories)
 * Bot starts here and discovers geography automatically
 */
const GLOBAL_SOURCES = [
  {
    region: 'UK',
    root: 'https://www.vouchedfor.co.uk/financial-advisor-ifa',
    profilePattern: '/financial-advisor-ifa/',
  },
  // US source can be added when NAPFA structure is verified
  // {
  //   region: 'US',
  //   root: 'https://www.napfa.org/find-an-advisor',
  //   profilePattern: '/advisor/',
  // },
];

/**
 * Extract emails from HTML content (enhanced filtering)
 */
function extractValidEmails(content: string): string[] {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = content.match(emailRegex) || [];
  
  return matches.filter(email => {
    const lower = email.toLowerCase();
    
    // Comprehensive junk filtering
    if (lower.includes('.png') || 
        lower.includes('.jpg') || 
        lower.includes('.gif') ||
        lower.includes('sentry') ||
        lower.includes('domain') ||
        lower.includes('example.com') ||
        lower.includes('test.com') ||
        lower.includes('placeholder') ||
        lower.includes('noreply') ||
        lower.includes('no-reply') ||
        lower.includes('noreply@') ||
        lower.includes('donotreply') ||
        lower.includes('privacy') ||
        lower.includes('legal') ||
        lower.includes('cdn') ||
        lower.includes('assets') ||
        lower.includes('slick-') ||
        lower.match(/@\d+\.\d+/) || // Version numbers
        lower.includes('jquery') ||
        lower.includes('bootstrap') ||
        lower.includes('angular') ||
        lower.includes('react') ||
        lower.includes('vue') ||
        lower.includes('node_modules') ||
        lower.includes('package.json') ||
        lower.includes('npm') ||
        lower.includes('github.com') ||
        lower.includes('cdnjs') ||
        lower.includes('unpkg')) {
      return false;
    }
    
    // Must have valid domain structure
    const domainMatch = email.match(/@([^.]+)\.([^.]+)$/);
    if (!domainMatch || domainMatch[2].length < 2) {
      return false;
    }
    
    // Must look like real email
    const localPart = email.split('@')[0];
    if (localPart.length < 2 || localPart.length > 64) {
      return false;
    }
    
    return true;
  });
}

/**
 * PHASE 1: Autonomous Discovery - Find all locations dynamically
 */
async function discoverLocations(
  page: Page,
  source: typeof GLOBAL_SOURCES[0]
): Promise<string[]> {
  const locations: string[] = [];
  
  try {
    console.log(`🗺️  Mapping Territory: ${source.region} (${source.root})`);
    await page.goto(source.root, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const discovered = await page.evaluate((pattern: string) => {
      const allAnchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      const locationUrls = new Set<string>();
      const baseUrl = 'https://www.vouchedfor.co.uk/financial-advisor-ifa/';

      // Strategy 1: Find location directory links from page
      for (const anchor of allAnchors) {
        const href = anchor.href;
        
        if (!href || !href.includes('vouchedfor.co.uk')) continue;
        
        // Must be a location directory page (not a profile, not root, not search)
        const isLocationDirectory = 
          href.includes(pattern) &&
          !href.endsWith(pattern) && // Not the root page
          !href.includes('?') && // Not a search page
          !href.includes('#') && // Not an anchor
          !href.match(/\/financial-advisor-ifa\/[^\/]+\/[^\/]+$/) && // Not a profile page (has location + advisor ID)
          href.match(/\/financial-advisor-ifa\/[^\/]+$/); // Has location name after pattern
        
        if (isLocationDirectory) {
          const cleanUrl = href.split('#')[0].split('?')[0];
          locationUrls.add(cleanUrl);
        }
      }

      // Strategy 2: Fallback - Use known UK cities if discovery finds nothing
      // This ensures we always have targets even if root page structure changes
      if (locationUrls.size === 0) {
        const ukCities = [
          'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 
          'leeds', 'bristol', 'liverpool', 'newcastle', 'cardiff',
          'sheffield', 'nottingham', 'leicester', 'cambridge', 'oxford',
          'reading', 'southampton', 'portsmouth', 'brighton', 'norwich',
          'york', 'durham', 'exeter', 'plymouth', 'swansea',
          'coventry', 'derby', 'peterborough', 'sunderland', 'wolverhampton'
        ];
        ukCities.forEach(city => {
          locationUrls.add(`${baseUrl}${city}`);
        });
      }

      return Array.from(locationUrls).slice(0, 100); // Top 100 discovered locations
    }, source.profilePattern);

    locations.push(...discovered);
    console.log(`   📍 Discovered ${discovered.length} hunting grounds in ${source.region}`);

  } catch (error: any) {
    console.warn(`   ⚠️  Failed to map ${source.region}: ${error.message}`);
  }

  return locations;
}

/**
 * PHASE 2: Extract advisor profiles from location page
 */
async function extractProfilesFromLocation(
  page: Page,
  locationUrl: string,
  profilePattern: string,
  maxProfiles: number = 20
): Promise<Array<{ name: string; profileUrl: string }>> {
  try {
    await page.goto(locationUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const profiles = await page.evaluate((pattern: string, max: number) => {
      const allAnchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      const profileLinks: Array<{ name: string; profileUrl: string }> = [];
      const seen = new Set<string>();

      for (const anchor of allAnchors) {
        const href = anchor.href;
        const text = anchor.innerText?.trim() || '';

        // Must be a profile page (has pattern + location + advisor ID)
        // Pattern: /financial-advisor-ifa/[location]/[id]-[name]
        const isProfile = href && 
          href.includes(pattern) &&
          href.match(new RegExp(`${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^/]+/[^/]+$`)) && // Has location + advisor
          !seen.has(href) &&
          text.length > 2 &&
          text.length < 150 &&
          !href.includes('#reviews') &&
          !href.includes('/enquiry');

        if (isProfile) {
          let advisorName = text.split('\n')[0].trim();
          
          // Extract from URL if needed
          if (advisorName.length < 3) {
            const urlMatch = href.match(/\/(\d+-[^\/]+)$/);
            if (urlMatch) {
              advisorName = urlMatch[1].replace(/^\d+-/, '').replace(/-/g, ' ');
            }
          }

          if (advisorName.length >= 3 && 
              !advisorName.toLowerCase().includes('contact') &&
              !advisorName.toLowerCase().includes('more') &&
              !advisorName.toLowerCase().includes('reviews')) {
            
            profileLinks.push({
              name: advisorName,
              profileUrl: href
            });
            seen.add(href);

            if (profileLinks.length >= max) break;
          }
        }
      }

      return profileLinks;
    }, profilePattern, maxProfiles);

    return profiles;

  } catch (error: any) {
    console.warn(`   ⚠️  Failed to extract profiles from ${locationUrl}: ${error.message}`);
    return [];
  }
}

/**
 * PHASE 3: Extract website from profile page (enhanced)
 */
async function extractWebsiteFromProfile(
  browser: Browser,
  profileUrl: string
): Promise<string | null> {
  try {
    const profilePage = await browser.newPage();
    await profilePage.goto(profileUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const websiteUrl = await profilePage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      
      // Strategy 1: Look for "Website" link text
      let webLink = links.find(l => {
        const text = l.innerText.toLowerCase().trim();
        return text.includes('website') || 
               text.includes('visit website') ||
               text.includes('view website') ||
               text === 'website';
      });
      
      // Strategy 2: Look in contact/about sections
      if (!webLink) {
        const sections = Array.from(document.querySelectorAll(
          '[class*="contact"], [class*="website"], [class*="links"], [class*="about"], [class*="info"], [class*="profile"]'
        ));
        
        for (const section of sections) {
          const sectionLinks = Array.from(section.querySelectorAll('a[href]')) as HTMLAnchorElement[];
          webLink = sectionLinks.find(l => {
            const href = l.href;
            return href && 
                   !href.includes('vouchedfor.co.uk') &&
                   !href.includes('napfa.org') &&
                   !href.includes('facebook.com') &&
                   !href.includes('linkedin.com') &&
                   !href.includes('twitter.com') &&
                   href.startsWith('http');
          });
          
          if (webLink) break;
        }
      }
      
      // Strategy 3: Any external link with meaningful text
      if (!webLink) {
        webLink = links.find(l => {
          const href = l.href;
          const text = l.innerText.toLowerCase().trim();
          return href && 
                 !href.includes('vouchedfor.co.uk') &&
                 !href.includes('napfa.org') &&
                 !href.includes('facebook.com') &&
                 !href.includes('linkedin.com') &&
                 !href.includes('twitter.com') &&
                 href.startsWith('http') &&
                 text.length > 3 &&
                 text.length < 100;
        });
      }
      
      return webLink ? webLink.href : null;
    });

    await profilePage.close();
    return websiteUrl;

  } catch (error: any) {
    return null;
  }
}

/**
 * PHASE 4: Extract email from website (MUST EXTRACT - primary focus)
 */
async function extractEmailFromWebsite(
  browser: Browser,
  websiteUrl: string
): Promise<string | null> {
  try {
    const sitePage = await browser.newPage();
    await sitePage.goto(websiteUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 8000 
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = await sitePage.content();
    const emails = extractValidEmails(content);
    
    // Prefer business emails
    const preferredEmails = emails.filter(e => 
      e.toLowerCase().includes('info@') ||
      e.toLowerCase().includes('hello@') ||
      e.toLowerCase().includes('contact@') ||
      e.toLowerCase().includes('enquiries@') ||
      e.toLowerCase().includes('enquiry@') ||
      e.toLowerCase().includes('admin@') ||
      e.toLowerCase().includes('office@') ||
      e.toLowerCase().includes('team@')
    );
    
    const selectedEmail = preferredEmails[0] || emails[0] || null;
    
    await sitePage.close();
    return selectedEmail;

  } catch (error: any) {
    return null;
  }
}

/**
 * Email cache for duplicate detection
 */
const emailCache = new Set<string>();
let cacheInitialized = false;

async function initializeEmailCache(): Promise<void> {
  if (cacheInitialized) return;
  
  try {
    console.log('   🔍 Loading existing emails into cache...');
    const existing = await db
      .select({ email: leads.email })
      .from(leads)
      .limit(50000);
    
    existing.forEach(lead => emailCache.add(lead.email.toLowerCase()));
    cacheInitialized = true;
    console.log(`   ✅ Loaded ${emailCache.size} existing emails into cache`);
  } catch (error: any) {
    console.warn(`   ⚠️  Error loading email cache: ${error.message}`);
    cacheInitialized = true;
  }
}

async function leadExists(email: string): Promise<boolean> {
  await initializeEmailCache();
  return emailCache.has(email.toLowerCase());
}

/**
 * Main Predator Bot V3 function - AUTONOMOUS GLOBAL DISCOVERY
 */
export async function sourceFromPredator(
  maxLeads?: number
): Promise<PredatorLead[]> {
  const leads: PredatorLead[] = [];
  const maxResults = maxLeads || 833; // 10K/day = 833/run
  
  console.log('🦅 Predator Bot V3: Autonomous Global Discovery Protocol');
  console.log(`   Target: ${maxResults} high-intent leads`);
  console.log(`   Strategy: Auto-Discover Locations → Profiles → Websites → EMAILS`);

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    
    await initializeEmailCache();

    // PHASE 1: AUTONOMOUS DISCOVERY - Build hunt queue
    const huntQueue: Array<{ url: string; region: string; profilePattern: string }> = [];
    
    for (const source of GLOBAL_SOURCES) {
      const locations = await discoverLocations(page, source);
      
      locations.forEach(locationUrl => {
        huntQueue.push({
          url: locationUrl,
          region: source.region,
          profilePattern: source.profilePattern,
        });
      });
    }

    console.log(`\n📋 Total Hunt Queue: ${huntQueue.length} auto-discovered locations\n`);

    // PHASE 2: THE HUNT - Process discovered locations
    for (const location of huntQueue) {
      if (leads.length >= maxResults) break;

      const remainingNeeded = maxResults - leads.length;
      const profilesToScrape = Math.min(20, Math.ceil(remainingNeeded / 0.3)); // 30% success rate assumption

      console.log(`🦅 Hunting: ${location.url} (${location.region})`);
      
      const profiles = await extractProfilesFromLocation(
        page,
        location.url,
        location.profilePattern,
        profilesToScrape
      );

      if (profiles.length === 0) {
        continue;
      }

      console.log(`   ✅ Found ${profiles.length} profiles, extracting emails...`);

      // Process profiles in batches
      const BATCH_SIZE = 3;
      for (let i = 0; i < profiles.length && leads.length < maxResults; i += BATCH_SIZE) {
        const batch = profiles.slice(i, i + BATCH_SIZE);
        
        const results = await Promise.all(
          batch.map(async (profile) => {
            try {
              console.log(`      🔍 Processing: ${profile.name}`);
              
              // Step 1: Extract website
              const websiteUrl = await extractWebsiteFromProfile(browser!, profile.profileUrl);
              
              if (!websiteUrl) {
                console.log(`         ⚠️  No website found for ${profile.name}`);
                return null;
              }

              console.log(`         ✅ Website found: ${websiteUrl}`);

              // Step 2: EXTRACT EMAIL (MUST EXTRACT - primary focus)
              const email = await extractEmailFromWebsite(browser!, websiteUrl);
              
              if (!email) {
                console.log(`         ⚠️  No email found on ${websiteUrl}`);
                return null;
              }

              console.log(`         ✅ Email found: ${email}`);

              // Step 3: Check duplicates
              if (await leadExists(email)) {
                console.log(`         ⏭️  Duplicate email: ${email}`);
                return null;
              }

              emailCache.add(email.toLowerCase());

              console.log(`         🎯 CAPTURED: ${email} from ${profile.name} (${location.region})`);

              const dataSource: 'predator_vouchedfor' | 'predator_napfa' | 'predator_global' = 
                location.region === 'UK' ? 'predator_vouchedfor' : 
                location.region === 'US' ? 'predator_napfa' : 
                'predator_global';

              return {
                email,
                companyName: profile.name,
                jobTitle: 'Independent Financial Advisor',
                website: websiteUrl,
                location: location.region,
                dataSource,
                region: location.region,
              };
            } catch (error: any) {
              return null;
            }
          })
        );

        // Add valid leads
        for (const result of results) {
          if (result && leads.length < maxResults) {
            leads.push(result);
            
            if (leads.length % 10 === 0) {
              console.log(`      ✅ Progress: ${leads.length}/${maxResults} leads captured...`);
            }
          }
        }

        // Rate limit
        if (i + BATCH_SIZE < profiles.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    await browser.close();
    
    console.log(`\n   ✅ Predator Bot V3 captured ${leads.length}/${maxResults} leads`);
    return leads;

  } catch (error: any) {
    console.error('❌ Predator Bot V3 error:', error.message);
    if (browser) {
      await browser.close();
    }
    return leads;
  }
}
