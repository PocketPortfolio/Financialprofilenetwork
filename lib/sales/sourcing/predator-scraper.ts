/**
 * Predator Bot V7.2: "Explicit Interaction Protocol" (The "Typing" Fix)
 * 
 * ARCHITECTURE CHANGE:
 * - Launch fresh browser for each city
 * - Use native Chrome proxy flags (--proxy-server)
 * - Kill browser after each city (clean state, zero memory leaks)
 * - 100% IP rotation if using rotating proxy gateway
 * - V7.2: Explicit typing interaction (human emulation)
 * 
 * CEO MANDATE: No third-party APIs. Predator Bot is the PRIMARY and ONLY source.
 * 
 * Target: 10,000 high-intent quality leads/day
 * Per-Run: ~833 leads (12 runs/day, every 2 hours)
 * 
 * Uses Drizzle ORM (not Supabase JS) to match existing architecture.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

// Use puppeteer-extra with stealth plugin to bypass Cloudflare
puppeteerExtra.use(StealthPlugin());

// #region Proxy Configuration
// PROXY: Required for Global Scaling. Format: http://user:pass@host:port
// Get from BrightData, IPRoyal, Smartproxy, etc.
let PROXY_URL_RAW = process.env.SALES_PROXY_URL || process.env.PROXY_URL;

// Auto-detect placeholder proxies and disable them
if (PROXY_URL_RAW && (PROXY_URL_RAW.includes('user123') || PROXY_URL_RAW.includes('proxy-pool.com') || PROXY_URL_RAW.includes('placeholder'))) {
  console.warn('   ⚠️  Placeholder proxy detected. Disabling proxy to prevent timeouts.');
  PROXY_URL_RAW = undefined;
}

// Parse proxy URL for Chrome flags (native proxy support)
let PROXY_SERVER: string | undefined = undefined;

if (PROXY_URL_RAW) {
  try {
    const url = new URL(PROXY_URL_RAW);
    // Chrome's --proxy-server accepts: http://host:port or socks5://host:port
    // For auth, we'll use page.authenticate() separately
    PROXY_SERVER = `${url.protocol}//${url.hostname}:${url.port}`;
    console.log('🛡️  Proxy Enabled: Rotating IP for each city.');
  } catch (e) {
    console.warn('⚠️  Invalid proxy URL format. Expected: http://user:pass@host:port');
    console.warn('   Proxy will be disabled.');
  }
} else {
  console.warn('⚠️  NO PROXY DETECTED. Expect Cloudflare bans after ~5 requests.');
  console.warn('💡 Set SALES_PROXY_URL in .env.local to enable proxy rotation.');
}

// Extract proxy auth if present
let PROXY_AUTH: { username: string; password: string } | undefined = undefined;
if (PROXY_URL_RAW) {
  try {
    const url = new URL(PROXY_URL_RAW);
    if (url.username && url.password) {
      PROXY_AUTH = {
        username: url.username,
        password: url.password
      };
    }
  } catch (e) {
    // Ignore
  }
}
// #endregion

// #region UK Wealth Hubs
interface WealthHub {
  name: string;
  lat: number;
  lng: number;
}

const UK_WEALTH_HUBS: WealthHub[] = [
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Leeds", lat: 53.8008, lng: -1.5491 },
  { name: "Manchester", lat: 53.4808, lng: -2.2426 },
  { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
  { name: "Bristol", lat: 51.4545, lng: -2.5879 },
  { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
  { name: "Newcastle", lat: 54.9783, lng: -1.6178 },
  { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
  { name: "Belfast", lat: 54.5973, lng: -5.9301 },
  { name: "Southampton", lat: 50.9097, lng: -1.4044 },
  { name: "Nottingham", lat: 52.9548, lng: -1.1581 },
  { name: "Sheffield", lat: 53.3811, lng: -1.4701 },
  { name: "Leicester", lat: 52.6369, lng: -1.1398 },
  { name: "Aberdeen", lat: 57.1497, lng: -2.0943 },
  { name: "Cambridge", lat: 52.2053, lng: 0.1218 },
  { name: "Oxford", lat: 51.7520, lng: -1.2577 },
  { name: "Brighton", lat: 50.8225, lng: -0.1372 },
  { name: "Reading", lat: 51.4543, lng: -0.9781 },
  { name: "Milton Keynes", lat: 52.0406, lng: -0.7594 },
  { name: "Luton", lat: 51.8797, lng: -0.4175 },
  { name: "Northampton", lat: 52.2405, lng: -0.9027 },
  { name: "Norwich", lat: 52.6309, lng: 1.2974 },
  { name: "Bournemouth", lat: 50.7192, lng: -1.8808 },
  { name: "Plymouth", lat: 50.3755, lng: -4.1427 },
  { name: "Exeter", lat: 50.7184, lng: -3.5339 },
  { name: "Swindon", lat: 51.5558, lng: -1.7797 },
  { name: "York", lat: 53.9600, lng: -1.0873 },
  { name: "Hull", lat: 53.7676, lng: -0.3274 },
  { name: "Bradford", lat: 53.7950, lng: -1.7594 },
  { name: "Stoke-on-Trent", lat: 53.0027, lng: -2.1794 },
  { name: "Wolverhampton", lat: 52.5862, lng: -2.1286 },
  { name: "Coventry", lat: 52.4068, lng: -1.5197 },
  { name: "Derby", lat: 52.9225, lng: -1.4746 },
  { name: "Sunderland", lat: 54.9069, lng: -1.3838 },
  { name: "Middlesbrough", lat: 54.5742, lng: -1.2350 },
  { name: "Blackpool", lat: 53.8175, lng: -3.0357 },
  { name: "Peterborough", lat: 52.5695, lng: -0.2405 },
  { name: "Chelmsford", lat: 51.7356, lng: 0.4685 },
  { name: "Colchester", lat: 51.8959, lng: 0.8919 },
  { name: "Ipswich", lat: 52.0567, lng: 1.1482 },
  { name: "Watford", lat: 51.6565, lng: -0.3903 },
  { name: "Slough", lat: 51.5105, lng: -0.5954 },
  { name: "Basildon", lat: 51.5719, lng: 0.4578 },
  { name: "Worthing", lat: 50.8190, lng: -0.3753 },
  { name: "Maidstone", lat: 51.2704, lng: 0.5227 },
  { name: "Hastings", lat: 50.8543, lng: 0.5732 },
  { name: "Eastbourne", lat: 50.7680, lng: 0.2905 },
  { name: "Guildford", lat: 51.2362, lng: -0.5704 },
  { name: "Woking", lat: 51.3168, lng: -0.5600 },
  { name: "Farnborough", lat: 51.2942, lng: -0.7557 },
  { name: "Basingstoke", lat: 51.2620, lng: -1.0873 },
];
// #endregion

// #region Email Cache & Deduplication
const emailCache = new Set<string>();
let cacheInitialized = false;

async function initializeEmailCache(): Promise<void> {
  if (cacheInitialized) return;
  
  try {
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
// #endregion

// #region Helper Functions
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function rotateIdentity(page: Page): Promise<void> {
  try {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUA);
  } catch (e) {
    // Fallback if CDP fails
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    await page.setUserAgent(userAgents[0]);
  }
}
// #endregion

// #region Lead Type
export interface PredatorLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  website?: string;
  dataSource: 'predator_sjp' | 'predator_vouchedfor' | 'predator_napfa' | 'predator_global';
  region: string;
}
// #endregion

/**
 * Process a single city: Launch browser → Scrape → Save → Kill browser
 * This is the core V7 architecture: One browser per city
 */
async function processCity(
  hub: WealthHub,
  maxLeads: number,
  currentLeadCount: number
): Promise<PredatorLead[]> {
  const cityLeads: PredatorLead[] = [];
  
  if (currentLeadCount >= maxLeads) {
    return cityLeads;
  }
  
  console.log(`\n🦅 Target Acquired: ${hub.name}`);
  
  // 1. Configure launch args with native proxy support
  const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--window-size=1920,1080',
    '--start-maximized',
        '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-infobars',
    '--disable-notifications',
    '--lang=en-GB',
  ];
  
  // Add native proxy server flag
  if (PROXY_SERVER) {
    launchArgs.push(`--proxy-server=${PROXY_SERVER}`);
  }
  
  // 2. Launch fresh browser for this city
  const browser = await puppeteerExtra.launch({
    headless: false, // Non-headless for better Cloudflare bypass
    args: launchArgs,
    ignoreDefaultArgs: ['--enable-automation'],
  });
  
  try {
    const page = await browser.newPage();
    
    // 3. Set proxy authentication if needed
    if (PROXY_AUTH) {
      await page.authenticate({
        username: PROXY_AUTH.username,
        password: PROXY_AUTH.password
      });
    }
    
    // 3.5. Monitor network requests to capture API calls
    const networkRequests: any[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('api') || url.includes('search') || url.includes('adviser') || url.includes('advisors')) {
        networkRequests.push({
          url: url.substring(0, 200),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
    });
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('api') || url.includes('search') || url.includes('adviser') || url.includes('advisors')) {
        networkRequests.push({
          url: url.substring(0, 200),
          status: response.status(),
          timestamp: Date.now(),
          type: 'response'
        });
      }
    });
    
    // 4. Rotate identity
    await rotateIdentity(page);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    // 5. V7.2: Load Generic Search Page (No URL Parameters)
    const targetUrl = 'https://www.sjp.co.uk/individuals/find-an-adviser';
    console.log(`   🎯 Loading search page...`);
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:293',message:'Before page.goto (V7.2)',data:{city:hub.name,url:targetUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.error(`   ❌ Failed to load page: ${e}`);
      throw e;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:299',message:'After page.goto (V7.2)',data:{city:hub.name,url:await page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    
    // 6. Handle Cookie Consent (Crucial to unblock UI)
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
      await page.click('#onetrust-accept-btn-handler');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`   ✅ Cookie consent accepted`);
    } catch (e) {
      // Cookie banner not found or already accepted
      console.log(`   ℹ️  Cookie banner not found (may already be accepted)`);
    }
    
    // 7. V7.2 EXPLICIT INTERACTION: Type Location & Search
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:310',message:'Before typing interaction (V7.2)',data:{city:hub.name},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    
    try {
      // Wait for location input field
      const inputSelector = '#edit-location, input[name="location"], input[type="text"]';
      await page.waitForSelector(inputSelector, { timeout: 10000 });
      console.log(`   📝 Found location input field`);
      
      // Clear any existing value and type city name
      await page.click(inputSelector, { clickCount: 3 }); // Triple-click to select all
      await page.type(inputSelector, hub.name, { delay: 100 }); // Type with human-like delay
      console.log(`   ⌨️  Typed "${hub.name}" into location field`);
      
      // Wait for autocomplete suggestions to appear
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // #region agent log - Check autocomplete state before interaction
      const beforeAutocomplete = await page.evaluate(() => {
        const input = document.querySelector('#edit-location, input[name="location"], input[type="text"]') as HTMLInputElement;
        const autocompleteDropdown = document.querySelector('[class*="autocomplete"], [class*="dropdown"], [id*="autocomplete"], [id*="suggestions"]');
        const searchButton = document.querySelector('button[type="submit"], input[type="submit"], button[class*="search"], [class*="search-button"]');
        return {
          inputValue: input?.value || '',
          inputFocused: document.activeElement === input,
          autocompleteVisible: !!autocompleteDropdown,
          autocompleteText: autocompleteDropdown?.textContent?.substring(0, 100) || '',
          searchButtonVisible: !!searchButton,
          searchButtonText: searchButton?.textContent || '',
          url: window.location.href
        };
      });
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:335',message:'Before autocomplete interaction (V7.2)',data:{city:hub.name,beforeAutocomplete},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2-fix',hypothesisId:'L'})}).catch(()=>{});
      // #endregion
      
      // Try multiple search trigger methods
      let searchTriggered = false;
      
      // Method 1: ArrowDown + Enter (original)
      try {
        await page.keyboard.press('ArrowDown'); // Select first suggestion
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.keyboard.press('Enter'); // Trigger search
        console.log(`   🔍 Method 1: Triggered search via ArrowDown + Enter`);
        searchTriggered = true;
      } catch (e) {
        console.log(`   ⚠️  Method 1 failed: ${e}`);
      }
      
      // Method 2: Click search button explicitly (if Enter didn't work)
      if (!searchTriggered) {
        try {
          const searchButton = await page.$('button[type="submit"], input[type="submit"], button[class*="search"], [class*="search-button"]');
          if (searchButton) {
            await searchButton.click();
            console.log(`   🔍 Method 2: Clicked search button explicitly`);
            searchTriggered = true;
          }
        } catch (e) {
          console.log(`   ⚠️  Method 2 failed: ${e}`);
        }
      }
      
      // Method 3: Press Enter on the input field directly (without ArrowDown)
      if (!searchTriggered) {
        try {
          await page.focus(inputSelector);
          await new Promise(resolve => setTimeout(resolve, 500));
          await page.keyboard.press('Enter');
          console.log(`   🔍 Method 3: Pressed Enter on input field directly`);
          searchTriggered = true;
        } catch (e) {
          console.log(`   ⚠️  Method 3 failed: ${e}`);
        }
      }
      
      // Wait for search to process and network requests
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait for AJAX
      
      // #region agent log - Check state after search trigger + Network requests
      const afterSearchTrigger = await page.evaluate(() => {
        const searchButton = document.querySelector('button[type="submit"], input[type="submit"], button[class*="search"], [class*="search-button"]') as HTMLButtonElement;
        return {
          url: window.location.href,
          title: document.title,
          partnerCards: document.querySelectorAll('.partner-card').length,
          adviserCards: document.querySelectorAll('.adviser-card').length,
          resultItems: document.querySelectorAll('.result-item').length,
          articles: document.querySelectorAll('article').length,
          inputValue: (document.querySelector('#edit-location, input[name="location"]') as HTMLInputElement)?.value || '',
          searchButtonDisabled: searchButton?.disabled || false,
          searchButtonText: searchButton?.textContent || '',
          bodyText: document.body?.textContent?.substring(0, 200) || ''
        };
      });
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:370',message:'After search trigger attempt (V7.2)',data:{city:hub.name,searchTriggered,afterSearchTrigger,networkRequests:networkRequests.slice(-10)},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2-fix2',hypothesisId:'U'})}).catch(()=>{});
      // #endregion
      
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      console.error(`   ⚠️  Interaction Error: ${errorMsg}`);
      // #region agent log
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:343',message:'Typing interaction error (V7.2)',data:{city:hub.name,error:errorMsg},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
      // #endregion
      // Continue anyway - results might have loaded
    }

    // 8. Wait for Results Grid
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:348',message:'Before waitForFunction (V7.2)',data:{city:hub.name},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    
    try {
      await page.waitForFunction(
        () => {
          const cards = document.querySelectorAll('.partner-card, .adviser-card, article, .result-item');
          return cards.length > 0;
        },
        { timeout: 20000 }
      );
      console.log(`   ✅ Results grid loaded`);
      // #region agent log
      const afterWait = await page.evaluate(() => {
        return {
          partnerCards:document.querySelectorAll('.partner-card').length,
          adviserCards:document.querySelectorAll('.adviser-card').length,
          resultItems:document.querySelectorAll('.result-item').length,
          advisorLinks:document.querySelectorAll('h3 a[href*="sjp.co.uk"], a[href*="/individuals/find-an-adviser/"][href*="sjp.co.uk"]').length,
          articles:document.querySelectorAll('article').length,
          sjpLinks:document.querySelectorAll('a[href*="sjp.co.uk"]').length
        };
      });
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:360',message:'After waitForFunction success (V7.2)',data:{city:hub.name,cardCounts:afterWait},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
      // #endregion
    } catch (e) {
      // Fallback: Check if we are on a results page anyway
      const cardCount = await page.evaluate(() => {
        return document.querySelectorAll('.partner-card, .adviser-card, article, .result-item').length;
      });
      if (cardCount > 0) {
        console.log(`   ✅ Found ${cardCount} cards (timeout but results present)`);
      } else {
        console.log(`   ⚠️  Timeout waiting for results grid. No cards found.`);
        // #region agent log
        const timeoutState = await page.evaluate(() => {
          return {
            partnerCards:document.querySelectorAll('.partner-card').length,
            adviserCards:document.querySelectorAll('.adviser-card').length,
            resultItems:document.querySelectorAll('.result-item').length,
            advisorLinks:document.querySelectorAll('h3 a[href*="sjp.co.uk"], a[href*="/individuals/find-an-adviser/"][href*="sjp.co.uk"]').length,
            articles:document.querySelectorAll('article').length,
            bodyText:document.body?.textContent?.substring(0,300)||'',
            title:document.title,
            url:window.location.href
          };
        });
        fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:370',message:'waitForFunction timeout (V7.2)',data:{city:hub.name,timeoutState},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
        // #endregion
        // Take screenshot for debugging
        try {
          await page.screenshot({ path: `error-${hub.name.replace(/\s+/g, '-')}-v7.2.png`, fullPage: true });
          console.log(`   📸 Screenshot saved: error-${hub.name.replace(/\s+/g, '-')}-v7.2.png`);
        } catch (screenshotError: any) {
          const errorMsg = screenshotError?.message || String(screenshotError);
          console.log(`   ⚠️  Could not save screenshot: ${errorMsg}`);
        }
      }
    }
    
    // 9. Auto-scroll to load all results
    await autoScroll(page);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 10. Extract leads - V7.2 uses same extraction logic
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:388',message:'Before extraction (V7.2)',data:{city:hub.name},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    
    const extracted = await page.evaluate((cityName) => {
      // Broad selector to catch any card-like element (V7.1 expanded selectors)
      const selectors = [
        '.partner-card',
        '.adviser-card',
        '.result-item',
        'article',
        '[class*="card"]',
        '[class*="profile"]',
        '[class*="listing"]'
      ];
      
      const cardSet = new Set<Element>();
      const selectorCounts: any = {};
      
      // Collect cards from all selectors
      selectors.forEach(selector => {
        try {
          const cards = document.querySelectorAll(selector);
          selectorCounts[selector] = cards.length;
          cards.forEach(card => cardSet.add(card));
        } catch (e) {
          selectorCounts[selector] = 0;
        }
      });
      
      const cards = Array.from(cardSet);
      const results: any[] = [];
      
      // Return debug info along with results
      (window as any).__debugExtraction = { selectorCounts, totalCards: cards.length };
      
      cards.forEach((card: Element) => {
        const nameEl = card.querySelector('h3, .name, [class*="name"]');
        const linkEl = card.querySelector('a[href*="sjp.co.uk"]');
        const text = card.textContent || '';
        
        // Email extraction: mailto links first, then regex
        const mailLink = card.querySelector('a[href^="mailto:"]');
        let email: string | null = null;
        
        if (mailLink) {
          email = mailLink.getAttribute('href')?.replace('mailto:', '') || null;
        } else {
          const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
          if (emailMatch) {
            email = emailMatch[0];
          }
        }
        
        if (email && !email.includes('sentry') && !email.includes('example.com') && !email.includes('example') && email.includes('@')) {
          const nameText = nameEl?.textContent?.trim() || 'Partner';
          const nameParts = nameText.split(' ');
          
          results.push({
            email: email.toLowerCase().trim(),
            firstName: nameParts[0] || 'Partner',
            lastName: nameParts.slice(1).join(' ') || '',
            companyName: "St. James's Place Partner",
            jobTitle: 'Independent Financial Advisor',
            location: cityName,
            website: linkEl ? (linkEl as HTMLAnchorElement).href : null,
            dataSource: 'predator_sjp' as const,
            region: 'UK'
          });
        }
      });
      
      return { results, debug: (window as any).__debugExtraction };
    }, hub.name);
    
    // 8. Deduplicate and add to results
    const extractedResults = (extracted as any).results || extracted;
    
    // #region agent log
    const extractionDebug = (extracted as any).debug || {};
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:420',message:'After extraction (V7.2)',data:{city:hub.name,extractionDebug,extractedCount:extractedResults.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:428',message:'Before deduplication (V7.2)',data:{city:hub.name,extractedCount:extractedResults.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    for (const lead of extractedResults) {
      if (!(await leadExists(lead.email))) {
        cityLeads.push(lead);
        emailCache.add(lead.email.toLowerCase());
      }
    }
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:437',message:'After deduplication (V7.2)',data:{city:hub.name,extractedCount:extractedResults.length,newLeads:cityLeads.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.2',hypothesisId:'V7.2'})}).catch(()=>{});
    // #endregion
    console.log(`   ✅ ${hub.name}: Found ${extractedResults.length} advisors, ${cityLeads.length} new leads captured`);
    
  } catch (error: any) {
    console.error(`   ❌ Failed ${hub.name}: ${error.message}`);
  } finally {
    // 11. Kill browser (clean state, zero memory leaks)
    await browser.close();
  }
  
  return cityLeads;
}

/**
 * Main Predator Bot V7 function - "One Browser Per City" Protocol
 */
export async function sourceFromPredator(
  maxLeads?: number
): Promise<PredatorLead[]> {
  const leads: PredatorLead[] = [];
  const maxResults = maxLeads || 833; // 10K/day = 833/run
  
  console.log('🦅 Predator Bot V7.2: "Explicit Interaction Protocol" (The "Typing" Fix)');
  console.log(`   Target: ${maxResults} high-intent leads`);
  console.log(`   Strategy: Fresh browser per city → Scrape → Kill → Next city`);
  if (PROXY_SERVER) {
    console.log(`   🛡️  Proxy: Enabled (${PROXY_SERVER})`);
  } else {
    console.log(`   ⚠️  Proxy: Disabled (expect Cloudflare bans)`);
  }
  
  // Initialize email cache
  await initializeEmailCache();
  
  // Process cities sequentially (safer for rate limits)
  // For parallel processing, use p-limit library
  for (const hub of UK_WEALTH_HUBS) {
    if (leads.length >= maxResults) {
      console.log(`\n   ✅ Target reached (${leads.length}/${maxResults}). Stopping.`);
      break;
    }
    
    const cityLeads = await processCity(hub, maxResults, leads.length);
    leads.push(...cityLeads);
    
    // Human-like pause between cities (2-7 seconds)
    if (leads.length < maxResults) {
      const pause = Math.floor(Math.random() * 5000) + 2000;
      console.log(`   ⏳ Cooling down for ${pause/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, pause));
    }
  }
  
  console.log(`\n   ✅ Predator Bot V7 captured ${leads.length}/${maxResults} leads`);
  return leads;
}
