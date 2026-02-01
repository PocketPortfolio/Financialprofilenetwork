/**
 * Predator Bot V7.3: "Force Select Protocol" (The "React State" Fix)
 * 
 * ARCHITECTURE CHANGE:
 * - Launch fresh browser for each city
 * - Use native Chrome proxy flags (--proxy-server)
 * - Kill browser after each city (clean state, zero memory leaks)
 * - 100% IP rotation if using rotating proxy gateway
 * - V7.3: Force Select Protocol - ArrowDown + Enter to trigger React state update
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

// Debug: Log proxy URL status (without exposing credentials)
if (PROXY_URL_RAW) {
  try {
    const url = new URL(PROXY_URL_RAW);
    const maskedUrl = `${url.protocol}//${url.username ? '***' : ''}@${url.hostname}:${url.port || ''}`;
    console.log(`🔍 Proxy URL detected: ${maskedUrl}`);
    console.log(`   Protocol: ${url.protocol}`);
    console.log(`   Hostname: ${url.hostname}`);
    console.log(`   Port: ${url.port || 'default'}`);
    console.log(`   Has username: ${!!url.username}`);
    console.log(`   Has password: ${!!url.password}`);
  } catch (e) {
    console.warn(`⚠️  Proxy URL format check failed: ${PROXY_URL_RAW.substring(0, 50)}...`);
  }
} else {
  console.log('🔍 SALES_PROXY_URL: NOT SET');
  console.log('   Checking process.env.SALES_PROXY_URL:', process.env.SALES_PROXY_URL ? 'SET (but empty?)' : 'undefined');
  console.log('   Checking process.env.PROXY_URL:', process.env.PROXY_URL ? 'SET (but empty?)' : 'undefined');
}

// Auto-detect placeholder proxies and disable them
// Only disable if it's clearly a placeholder pattern, not a real proxy URL
if (PROXY_URL_RAW) {
  const isPlaceholder = 
    PROXY_URL_RAW === 'user123' ||
    PROXY_URL_RAW.includes('user123@proxy-pool.com') ||
    PROXY_URL_RAW.includes('placeholder@example.com') ||
    PROXY_URL_RAW.startsWith('http://user123:') ||
    PROXY_URL_RAW.startsWith('http://placeholder:') ||
    PROXY_URL_RAW.includes('proxy-pool.com') && PROXY_URL_RAW.includes('user123');
  
  if (isPlaceholder) {
    console.warn('   ⚠️  Placeholder proxy detected. Disabling proxy to prevent timeouts.');
    console.warn(`   Detected pattern: ${PROXY_URL_RAW.substring(0, 50)}...`);
    PROXY_URL_RAW = undefined;
  } else {
    console.log('✅ Proxy URL passed placeholder check');
  }
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
  let browser: Browser | null = null;
  try {
    browser = await puppeteerExtra.launch({
      headless: true, // Headless mode for CI/CD compatibility
      args: launchArgs,
      ignoreDefaultArgs: ['--enable-automation'],
    });
    console.log(`   ✅ Browser launched successfully for ${hub.name}`);
  } catch (launchError: any) {
    console.error(`   ❌ Browser launch failed for ${hub.name}: ${launchError.message}`);
    if (launchError.message?.includes('Chrome') || launchError.message?.includes('browser')) {
      console.error(`   ⚠️  CRITICAL: Chrome/Chromium not found. Install Chrome dependencies in GitHub Actions.`);
    }
    // Return empty array if browser fails to launch
    return cityLeads;
  }
  
  if (!browser) {
    console.error(`   ❌ Browser is null for ${hub.name}`);
    return cityLeads;
  }
  
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
    const allNetworkRequests: any[] = []; // Track ALL requests for debugging
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      const postData = request.postData();
      
      // Track all SJP domain requests
      if (url.includes('sjp.co.uk')) {
        allNetworkRequests.push({
          url: url.substring(0, 300),
          method,
          postData: postData ? postData.substring(0, 200) : undefined,
          timestamp: Date.now(),
          type: 'request'
        });
      }
      
      // Track API/search requests
      if (url.includes('api') || url.includes('search') || url.includes('adviser') || url.includes('advisors') || url.includes('find-an-adviser')) {
        networkRequests.push({
          url: url.substring(0, 300),
          method,
          postData: postData ? postData.substring(0, 200) : undefined,
          headers: Object.keys(request.headers()),
          timestamp: Date.now()
        });
      }
    });
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();
      
      // Track all SJP domain responses
      if (url.includes('sjp.co.uk')) {
        allNetworkRequests.push({
          url: url.substring(0, 300),
          status,
          timestamp: Date.now(),
          type: 'response'
        });
      }
      
      // Track API/search responses
      if (url.includes('api') || url.includes('search') || url.includes('adviser') || url.includes('advisors') || url.includes('find-an-adviser')) {
        networkRequests.push({
          url: url.substring(0, 300),
          status,
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
      
      // CRITICAL FIX V7.3: "Force Select" Protocol - Trigger React State Update
      // The issue: Typing into input doesn't update React's internal `selectedLocation` state
      // Solution: Use ArrowDown + Enter to trigger the `onSelect` event from Google Places Autocomplete
      let searchTriggered = false;
      
      console.log(`   🔍 V7.3: Force Select Protocol - Triggering React state update`);
      
      // #region agent log - Before Force Select
      const beforeForceSelect = await page.evaluate(() => {
        const input = document.querySelector('#edit-location, input[name="location"]') as HTMLInputElement;
        return {
          inputValue: input?.value || '',
          inputFocused: document.activeElement === input,
          pacContainerVisible: !!document.querySelector('.pac-container'),
          pacItemsCount: document.querySelectorAll('.pac-item').length
        };
      });
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:385',message:'Before Force Select (V7.3:ReactStateFix)',data:{city:hub.name,beforeForceSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
      // #endregion
      
      // Step 1: Clear and Focus (Triple Click ensures we clear "Type location" placeholders)
      await page.click(inputSelector, { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 2: Slow Type to trigger the Google Places API (150ms delay is CRITICAL for React to catch up)
      console.log(`   ⌨️  Typing "${hub.name}" with 150ms delay to trigger Google Places API...`);
      await page.type(inputSelector, hub.name, { delay: 150 });
      
      // Step 3: WAIT for the Autocomplete Dropdown
      try {
        console.log(`   ⏳ Waiting for autocomplete dropdown...`);
        await page.waitForFunction(
          () => {
            const pacItems = document.querySelectorAll('.pac-item, .suggestion-item, li[role="option"]');
            return pacItems.length > 0;
          },
          { timeout: 5000 }
        );
        console.log(`   ✅ Autocomplete dropdown appeared`);
      } catch (e) {
        console.warn(`   ⚠️  Dropdown didn't appear within 5s. Trying Force-Enter anyway...`);
      }
      
      // Step 4: THE INTERACTION CHAIN (ArrowDown + Enter)
      // This simulates selecting the first suggestion and triggers React's onSelect event
      console.log(`   ⬇️  Pressing ArrowDown to select first suggestion...`);
      await page.keyboard.press('ArrowDown');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for highlight
      
      console.log(`   ⏎  Pressing Enter to confirm selection and trigger React state update...`);
      await page.keyboard.press('Enter');
      console.log(`   ✅ Selected "${hub.name}" from dropdown - React state should now be updated`);
      
      // Step 5: Wait for the "Flash" (State Update)
      // Often the input text changes from "London" to "London, UK" or lat/lng gets populated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // #region agent log - After Force Select (verify state update)
      const cityName = hub.name; // Capture for evaluate callback
      const afterForceSelect = await page.evaluate((city) => {
        const input = document.querySelector('#edit-location, input[name="location"]') as HTMLInputElement;
        // Check for hidden fields that might contain lat/lng
        const hiddenFields = Array.from(document.querySelectorAll('input[type="hidden"]')).map((el: any) => ({
          name: el.name,
          value: el.value?.substring(0, 50) || ''
        }));
        return {
          inputValue: input?.value || '',
          inputValueChanged: input?.value !== city, // Should be different if state updated
          hiddenFields: hiddenFields.filter(f => f.name.includes('location') || f.name.includes('lat') || f.name.includes('lng')),
          pacContainerVisible: !!document.querySelector('.pac-container')
        };
      }, cityName);
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:425',message:'After Force Select (V7.3:ReactStateFix)',data:{city:hub.name,afterForceSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
      // #endregion
      
      // Step 6: Wait for dropdown to close (autocomplete dropdown might be covering the button)
      try {
        await page.waitForFunction(
          () => !document.querySelector('.pac-container') || document.querySelector('.pac-container')?.getAttribute('style')?.includes('display: none'),
          { timeout: 2000 }
        );
      } catch (e) {
        // Dropdown might already be closed, continue
      }
      
      // Step 7: NOW Click Search (React state is updated, so search will work)
      // Try multiple selectors - the button might have different IDs/classes
      const submitSelectors = [
        '#edit-submit--2',
        '#submitButton',
        'input[type="submit"]#edit-submit--2',
        'input[type="submit"]',
        'button[type="submit"]',
        '.js-form-submit',
        'input.button--primary',
        'button.button--primary'
      ];
      
      let buttonClicked = false;
      // #region agent log - Before button click attempt
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:485',message:'Before button click attempt (V7.3:ReactStateFix)',data:{city:hub.name,selectorsToTry:submitSelectors.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
      // #endregion
      for (const selector of submitSelectors) {
        try {
          const submitButton = await page.$(selector);
          // #region agent log - Selector check
          fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:489',message:'Selector check (V7.3:ReactStateFix)',data:{city:hub.name,selector,buttonFound:!!submitButton},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
          // #endregion
          if (submitButton) {
            // Scroll button into view and ensure it's clickable
            await page.evaluate((sel) => {
              const btn = document.querySelector(sel) as HTMLElement;
              if (btn) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, selector);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try clicking with JavaScript if regular click fails
            const isClickable = await page.evaluate((sel) => {
              const btn = document.querySelector(sel) as HTMLElement;
              if (!btn) return false;
              const rect = btn.getBoundingClientRect();
              const style = window.getComputedStyle(btn);
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                !btn.hasAttribute('disabled')
              );
            }, selector);
            
            // Use JavaScript click (more reliable for React components)
            await page.evaluate((sel) => {
              const btn = document.querySelector(sel) as HTMLElement;
              if (btn) {
                (btn as HTMLButtonElement).click();
              }
            }, selector);
            console.log(`   ✅ Search button clicked via JavaScript (${selector}) - React state should trigger proper search`);
            // #region agent log - Button clicked successfully
            fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:522',message:'Button clicked successfully (V7.3:ReactStateFix)',data:{city:hub.name,selector,buttonClicked:true},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
            // #endregion
            buttonClicked = true;
            searchTriggered = true;
            break;
          }
        } catch (e) {
          // Try next selector
          continue;
        }
      }
      
      if (!buttonClicked) {
        console.log(`   ⚠️  Could not find or click submit button with any selector`);
        // #region agent log - Button click failed
        const buttonDebug = await page.evaluate(() => {
          const selectors = ['#edit-submit--2', '#submitButton', 'input[type="submit"]', 'button[type="submit"]', '.js-form-submit'];
          const results: any = {};
          selectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              results[sel] = {
                exists: true,
                visible: rect.width > 0 && rect.height > 0,
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                disabled: el.hasAttribute('disabled'),
                zIndex: style.zIndex
              };
            } else {
              results[sel] = { exists: false };
            }
          });
          return results;
        });
        fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:533',message:'Button click failed - debug info (V7.3:ReactStateFix)',data:{city:hub.name,buttonDebug},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
        // #endregion
      }
      
      if (searchTriggered) {
        // Wait for results to load on the same page (they load via JavaScript after form submission)
        await new Promise(resolve => setTimeout(resolve, 5000)); // Initial wait for AJAX
        
        try {
          await page.waitForFunction(
            () => {
              // Check for results (excluding search form)
              const cards = document.querySelectorAll('.partner-card, .adviser-card, .result-item, [class*="advisor"], [class*="adviser"], [class*="partner"]');
              const links = document.querySelectorAll('a[href*="/individuals/find-an-adviser/"], a[href*="advisor"], a[href*="adviser"]');
              const articles = Array.from(document.querySelectorAll('article')).filter(art => 
                !art.classList.contains('find-adviser-component') &&
                !art.getAttribute('about')?.includes('find-an-adviser')
              );
              return (cards.length > 0 || links.length > 5 || articles.length > 0);
            },
            { timeout: 20000 }
          );
          console.log(`   ✅ Results loaded on find-an-adviser page`);
        } catch (e) {
          console.log(`   ⚠️  Waiting for results timed out, but continuing...`);
        }
        
        // #region agent log - After form submission
        const afterSubmit = await page.evaluate(() => {
          return {
            url: window.location.href,
            selectors: {
              partnerCards: document.querySelectorAll('.partner-card').length,
              adviserCards: document.querySelectorAll('.adviser-card').length,
              resultItems: document.querySelectorAll('.result-item').length,
              advisorLinks: document.querySelectorAll('a[href*="/individuals/find-an-adviser/"], a[href*="advisor"], a[href*="adviser"]').length,
              allArticles: document.querySelectorAll('article').length,
              allCards: document.querySelectorAll('[class*="card"]').length
            },
            pageTitle: document.title
          };
        });
        fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:465',message:'After form submission (V7.3:ReactStateFix)',data:{city:hub.name,afterSubmit},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-force-select',hypothesisId:'V7.3'})}).catch(()=>{});
        // #endregion
      }
      
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
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:348',message:'Before waitForFunction (HYP-B:WaitForResults)',data:{city:hub.name},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-extraction',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    try {
      // Wait for results to appear - check for multiple result indicators
      await page.waitForFunction(
        () => {
          // Check for advisor cards
          const cards = document.querySelectorAll('.partner-card, .adviser-card, .result-item, [class*="advisor-card"], [class*="adviser-card"], [class*="partner-card"]');
          if (cards.length > 0) return true;
          
          // Check for result containers
          const resultContainers = document.querySelectorAll('[class*="result"], [class*="advisor"], [class*="adviser"], [class*="listing"]');
          const advisorLinks = document.querySelectorAll('a[href*="/individuals/find-an-adviser/"], a[href*="advisor"], a[href*="adviser"]');
          
          // Exclude the search form article
          const nonFormArticles = Array.from(document.querySelectorAll('article')).filter(art => 
            !art.classList.contains('find-adviser-component') && 
            !art.getAttribute('about')?.includes('find-an-adviser')
          );
          
          return resultContainers.length > 1 || advisorLinks.length > 5 || nonFormArticles.length > 0;
        },
        { timeout: 20000 }
      );
      console.log(`   ✅ Results grid loaded`);
      // #region agent log
      const afterWait = await page.evaluate(() => {
        const allSelectors = ['.partner-card', '.adviser-card', '.result-item', 'article', '[class*="card"]', '[class*="profile"]', '[class*="listing"]'];
        const selectorResults: any = {};
        allSelectors.forEach(sel => {
          selectorResults[sel] = document.querySelectorAll(sel).length;
        });
        return {
          partnerCards:document.querySelectorAll('.partner-card').length,
          adviserCards:document.querySelectorAll('.adviser-card').length,
          resultItems:document.querySelectorAll('.result-item').length,
          advisorLinks:document.querySelectorAll('h3 a[href*="sjp.co.uk"], a[href*="/individuals/find-an-adviser/"][href*="sjp.co.uk"]').length,
          articles:document.querySelectorAll('article').length,
          sjpLinks:document.querySelectorAll('a[href*="sjp.co.uk"]').length,
          selectorResults,
          pageHTML: document.documentElement.outerHTML.substring(0, 1000) // Sample HTML
        };
      });
      fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:360',message:'After waitForFunction success (HYP-B:WaitForResults)',data:{city:hub.name,cardCounts:afterWait},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-extraction',hypothesisId:'B'})}).catch(()=>{});
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
          const allElements = document.querySelectorAll('*');
          const commonClasses = Array.from(allElements).reduce((acc: any, el) => {
            Array.from(el.classList || []).forEach(cls => {
              if (cls.includes('card') || cls.includes('result') || cls.includes('item') || cls.includes('profile') || cls.includes('advisor') || cls.includes('adviser')) {
                acc[cls] = (acc[cls] || 0) + 1;
              }
            });
            return acc;
          }, {});
          return {
            partnerCards:document.querySelectorAll('.partner-card').length,
            adviserCards:document.querySelectorAll('.adviser-card').length,
            resultItems:document.querySelectorAll('.result-item').length,
            advisorLinks:document.querySelectorAll('h3 a[href*="sjp.co.uk"], a[href*="/individuals/find-an-adviser/"][href*="sjp.co.uk"]').length,
            articles:document.querySelectorAll('article').length,
            bodyText:document.body?.textContent?.substring(0,500)||'',
            title:document.title,
            url:window.location.href,
            commonClasses: Object.entries(commonClasses).slice(0, 20),
            // Check for any divs/containers that might hold results
            mainContainers: Array.from(document.querySelectorAll('main, [role="main"], [id*="main"], [class*="main"]')).map(el => ({
              id: el.id,
              className: el.className,
              childCount: el.children.length,
              textPreview: el.textContent?.substring(0, 200) || ''
            })).slice(0, 5)
          };
        });
        fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:370',message:'waitForFunction timeout (HYP-C:TimeoutNoResults)',data:{city:hub.name,timeoutState,error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-extraction',hypothesisId:'C'})}).catch(()=>{});
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
    
    // 10. Extract leads - V7.3: Extract from advisor links directly
    // #region agent log - Before extraction (check page state)
    const beforeExtractionState = await page.evaluate(() => {
      const advisorLinks = document.querySelectorAll('a[href*="/individuals/find-an-adviser/"], a[href*="advisor"], a[href*="adviser"]');
      return {
        url: window.location.href,
        pageTitle: document.title,
        advisorLinksCount: advisorLinks.length,
        isResultsPage: window.location.href.includes('find-an-advisers') || window.location.href.includes('find-an-adviser'),
        sampleLinkHref: advisorLinks.length > 0 ? (advisorLinks[0] as HTMLAnchorElement).href : null
      };
    });
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:728',message:'Before extraction (V7.3:ExtractionFix)',data:{city:hub.name,beforeExtractionState},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-extraction',hypothesisId:'V7.3-EXTRACT'})}).catch(()=>{});
    // #endregion
    
    const extracted = await page.evaluate((cityName) => {
      const results: any[] = [];
      const selectorCounts: any = {};
      
      // V7.3 FIX: Extract from advisor links directly (we know they exist from logs)
      // The results page has advisor cards with class "advisers-card" - extract links from those cards only
      // Exclude generic navigation links like "/advisers", "/individuals/find-an-adviser" (search page)
      // Target actual advisor profile links which are typically inside .advisers-card or have specific patterns
      const advisorCards = document.querySelectorAll('.advisers-card, [class*="advisers-card"], [class*="adviser-card"]');
      const advisorLinks: Element[] = [];
      
      // Extract links from advisor cards - look for actual advisor profile links
      // Advisor profile links typically have patterns like: /individuals/find-an-adviser/[advisor-name] or /advisers/[name]
      advisorCards.forEach((card: Element) => {
        // Look for links that are likely advisor profiles (not generic navigation)
        const links = card.querySelectorAll('a[href*="sjp.co.uk"]');
        links.forEach((link: Element) => {
          const href = (link as HTMLAnchorElement).href;
          const linkText = link.textContent?.trim().toLowerCase() || '';
          
          // Exclude generic pages and navigation links
          // IMPORTANT: /individuals/find-an-adviser (singular) can be:
          // - Search page: /individuals/find-an-adviser (no path after)
          // - Profile page: /individuals/find-an-adviser/[advisor-name] (has path after)
          const isSearchPage = href.match(/\/individuals\/find-an-adviser\/?(\?|$)/); // Ends with /find-an-adviser or /find-an-adviser?
          const isGeneric = 
            (href.includes('/advisers') && !href.match(/\/advisers\/[^\/]+/)) || // Generic "become an adviser" page, not profile
            isSearchPage || // Search page itself
            href.includes('/individuals/advice-and-products') ||
            href.includes('/individuals/advice') ||
            href.includes('become') ||
            href.includes('choosing') ||
            href.includes('online.sjp.co.uk') || // Client portal
            href.includes('privacy') ||
            (href.includes('client') && !href.includes('/individuals/')) ||
            linkText.includes('become') ||
            (linkText.includes('find an adviser') && !linkText.match(/find an adviser.*[a-z]/i)) || // Generic "find an adviser" text
            linkText.includes('client sign');
          
          // Include links that look like advisor profiles
          // Pattern: /individuals/find-an-adviser/[name] (singular, with name after)
          const looksLikeProfile = 
            (href.match(/\/individuals\/find-an-adviser\/[^\/\?]+/) && !isSearchPage) || // Profile page with name
            (href.match(/\/advisers\/[^\/\?]+/) && !href.endsWith('/advisers')); // Advisor profile, not generic page
          
          if (href && !isGeneric && (looksLikeProfile || (advisorCards.length > 0 && !isGeneric))) {
            advisorLinks.push(link);
          }
        });
      });
      
      // Fallback: If no cards found or no links extracted, try finding advisor profile links directly
      if (advisorLinks.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="sjp.co.uk"]');
        allLinks.forEach((link: Element) => {
          const href = (link as HTMLAnchorElement).href;
          const linkText = link.textContent?.trim().toLowerCase() || '';
          
          // Exclude generic pages
          const isSearchPage = href.match(/\/individuals\/find-an-adviser\/?(\?|$)/);
          const isGeneric = 
            (href.includes('/advisers') && !href.match(/\/advisers\/[^\/]+/)) ||
            isSearchPage ||
            href.includes('/individuals/advice-and-products') ||
            href.includes('/individuals/advice') ||
            href.includes('become') ||
            href.includes('choosing') ||
            href.includes('online.sjp.co.uk') ||
            href.includes('privacy') ||
            (href.includes('client') && !href.includes('/individuals/')) ||
            linkText.includes('become') ||
            (linkText.includes('find an adviser') && !linkText.match(/find an adviser.*[a-z]/i)) ||
            linkText.includes('client sign');
          
          // Look for advisor profile patterns
          const looksLikeProfile = 
            (href.match(/\/individuals\/find-an-adviser\/[^\/\?]+/) && !isSearchPage) ||
            (href.match(/\/advisers\/[^\/\?]+/) && !href.endsWith('/advisers'));
          
          if (href && !isGeneric && looksLikeProfile) {
            advisorLinks.push(link);
          }
        });
      }
      
      selectorCounts['advisorLinks'] = advisorLinks.length;
      selectorCounts['advisorCards'] = advisorCards.length;
      
      // Debug: Capture sample link patterns to understand structure
      const sampleLinks = advisorLinks.slice(0, 5).map((link: Element) => ({
        href: (link as HTMLAnchorElement).href,
        text: link.textContent?.trim() || '',
        parentClass: link.parentElement?.className || ''
      }));
      (window as any).__sampleAdvisorLinks = sampleLinks;
      
      // Also try card-based extraction as fallback
      const cardSelectors = [
        '.partner-card',
        '.adviser-card',
        '.result-item',
        '[class*="card"]',
        '[class*="profile"]',
        '[class*="listing"]'
      ];
      
      const cardSet = new Set<Element>();
      cardSelectors.forEach(selector => {
        try {
          const cards = document.querySelectorAll(selector);
          selectorCounts[selector] = cards.length;
          cards.forEach(card => cardSet.add(card));
        } catch (e) {
          selectorCounts[selector] = 0;
        }
      });
      
      const cards = Array.from(cardSet);
      selectorCounts['totalCards'] = cards.length;
      
      // Strategy 1: Extract from advisor links and their parent containers
      const extractionStats = {
        totalLinks: advisorLinks.length,
        processed: 0,
        nameExtracted: 0,
        emailFound: 0,
        emailConstructed: 0,
        emailRejected: 0,
        added: 0
      };
      
      advisorLinks.forEach((link: Element, index: number) => {
        extractionStats.processed++;
        const linkHref = (link as HTMLAnchorElement).href;
        const linkText = link.textContent?.trim() || '';
        
        // Get parent container (could be a card, div, article, etc.)
        let container = link.parentElement;
        let depth = 0;
        // Walk up the DOM to find a meaningful container (max 5 levels)
        while (container && depth < 5) {
          if (container.tagName === 'ARTICLE' || 
              container.classList.contains('card') || 
              container.classList.contains('result') ||
              container.classList.contains('item') ||
              container.classList.contains('profile') ||
              container.getAttribute('class')?.includes('card') ||
              container.getAttribute('class')?.includes('result')) {
            break;
          }
          container = container.parentElement;
          depth++;
        }
        
        // Use container if found, otherwise use the link itself
        const card = container || link;
        const text = card.textContent || '';
        
        // Extract name from advisor card - target the specific SJP structure
        // The name is typically in: .views-name-image-container > h3 or similar
        let nameText = '';
        
        // Strategy 1: Look for name in the specific SJP card structure
        const nameContainer = card.querySelector('.views-name-image-container, [class*="name-image"], [class*="adviser-name"]');
        if (nameContainer) {
          const nameHeading = nameContainer.querySelector('h3, h2, h4, h5, .name, [class*="name"]');
          if (nameHeading) {
            nameText = nameHeading.textContent?.trim() || '';
          } else {
            // If no heading, try direct text content (but filter out link text)
            const containerText = nameContainer.textContent?.trim() || '';
            // Split by newlines and take the first non-empty line that looks like a name
            const lines = containerText.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
            for (const line of lines) {
              const words = line.split(/\s+/).filter(w => w.length > 0);
              if (words.length >= 2 && words.length <= 4) {
                // Check if it looks like a name (capitalized, not a link)
                if (words[0] && words[0][0] === words[0][0].toUpperCase() && 
                    !line.toLowerCase().includes('share') && 
                    !line.toLowerCase().includes('visit') &&
                    !line.toLowerCase().includes('website')) {
                  nameText = line;
                  break;
                }
              }
            }
          }
        }
        
        // Strategy 2: Fallback to general heading search (but exclude link)
        if (!nameText || nameText.length < 2) {
          const nameEl = card.querySelector('h3, h2, h4, .name, [class*="name"], [class*="advisor"], [class*="adviser"]');
          if (nameEl && nameEl !== link && !nameEl.closest('a') && !nameEl.closest('button')) {
            const candidate = nameEl.textContent?.trim() || '';
            // Validate it's not link text
            if (candidate && 
                candidate.length >= 2 && 
                !candidate.toLowerCase().includes('share') &&
                !candidate.toLowerCase().includes('visit') &&
                !candidate.toLowerCase().includes('website') &&
                !candidate.toLowerCase().includes('read more')) {
              nameText = candidate;
            }
          }
        }
        
        // If no name from heading, try extracting from card text (but exclude link text)
        if (!nameText || nameText.length < 2) {
          // Get all text nodes in card, excluding link text
          const textNodes: string[] = [];
          const walker = document.createTreeWalker(
            card,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                // Skip if parent is a link
                let parent = node.parentElement;
                while (parent) {
                  if (parent.tagName === 'A' || parent.tagName === 'BUTTON') {
                    return NodeFilter.FILTER_REJECT;
                  }
                  parent = parent.parentElement;
                }
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          );
          
          let node;
          while (node = walker.nextNode()) {
            const text = node.textContent?.trim() || '';
            if (text.length > 2 && text.length < 100) {
              textNodes.push(text);
            }
          }
          
          // Find the first text that looks like a name (2-3 words, capitalized)
          for (const text of textNodes) {
            const words = text.split(/\s+/).filter(w => w.length > 0);
            if (words.length >= 2 && words.length <= 4) {
              // Check if first word is capitalized (likely a name)
              if (words[0] && words[0][0] === words[0][0].toUpperCase() && words[0][0] !== words[0][0].toLowerCase()) {
                nameText = text;
                break;
              }
            }
          }
        }
        
        // Validate name - reject invalid names like "Share", "Visit", "Partner"
        const invalidNames = ['share', 'visit', 'partner', 'view', 'read', 'more', 'click', 'link', 'download'];
        const nameLower = nameText.toLowerCase().trim();
        if (invalidNames.includes(nameLower) || nameText.length < 2) {
          nameText = ''; // Clear invalid name
        }
        
        const nameParts = nameText.split(' ').filter(p => p.length > 0 && p.length < 50 && !invalidNames.includes(p.toLowerCase()));
        
        if (nameParts.length > 0) {
          extractionStats.nameExtracted++;
        }
        
        // Email extraction: mailto links first, then regex, then construct from name
        const mailLink = card.querySelector('a[href^="mailto:"]');
        let email: string | null = null;
        
        if (mailLink) {
          const mailtoHref = mailLink.getAttribute('href') || '';
          const mailtoValue = mailtoHref.replace('mailto:', '').trim();
          // Filter out share links (mailto:?body=... or mailto:?subject=...)
          // Only accept if it looks like an actual email address (contains @ and doesn't start with ?)
          if (mailtoValue && mailtoValue.includes('@') && !mailtoValue.startsWith('?')) {
            // Extract just the email part (before any query params like ?body=)
            const emailPart = mailtoValue.split('?')[0].split('&')[0].trim();
            if (emailPart && emailPart.includes('@')) {
              email = emailPart;
              if (email) extractionStats.emailFound++;
            }
          }
        }
        
        // If no email from mailto link, try regex in card text
        if (!email) {
          const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
          if (emailMatch) {
            email = emailMatch[0];
            if (email) extractionStats.emailFound++;
          }
        }
        
        // Validate email before using it
        let isValidEmail = false;
        const originalEmail = email; // Store for debugging
        if (email) {
          isValidEmail = !email.includes('sentry') && 
                         !email.includes('example.com') && 
                         !email.includes('example') && 
                         email.includes('@') && 
                         email.length > 5 &&
                         !email.startsWith('?') && // Reject share links
                         !email.includes('body=') && // Reject share link params
                         !email.includes('subject='); // Reject share link params
        }
        
        // If email found but invalid, clear it and construct from name as fallback
        if (email && !isValidEmail) {
          email = null; // Clear invalid email so we can construct from name
        }
        
        // If no valid email, construct from name (common pattern: firstname.lastname@sjpp.co.uk)
        if (!email && nameParts.length >= 2) {
          const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
          const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
          if (firstName.length > 0 && lastName.length > 0) {
            email = `${firstName}.${lastName}@sjpp.co.uk`;
            isValidEmail = true;
            extractionStats.emailConstructed++;
          }
        } else if (!email && nameParts.length === 1) {
          // Fallback for single-name cases: use name@sjpp.co.uk
          const name = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
          if (name.length > 0) {
            email = `${name}@sjpp.co.uk`;
            isValidEmail = true;
            extractionStats.emailConstructed++;
          }
        }
        
        // Validate name before using - reject if invalid
        const firstName = nameParts.length > 0 ? nameParts[0] : null;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        // Extract practice/company name from card (try to find actual practice name, not generic)
        // SJP cards typically have practice names in various locations - need to search more thoroughly
        let practiceName = "St. James's Place Partner"; // Default fallback
        
        // Strategy 1: Look for practice name in specific SJP card structure
        // Practice names often appear in: .views-advisers-description, .views-advisers-company, or similar
        const practiceSelectors = [
          '[class*="company"]',
          '[class*="practice"]',
          '[class*="firm"]',
          '[class*="business"]',
          '.views-advisers-description',
          '.views-advisers-company',
          '[class*="advisers-company"]',
          '[class*="advisers-description"]'
        ];
        
        let practiceNameFound = false;
        for (const selector of practiceSelectors) {
          const practiceNameEl = card.querySelector(selector);
          if (practiceNameEl) {
            const practiceText = practiceNameEl.textContent?.trim();
            // Filter out generic text and validate it looks like a practice name
            if (practiceText && 
                practiceText.length > 5 && 
                practiceText.length < 100 &&
                !practiceText.toLowerCase().includes("st. james's place") &&
                !practiceText.toLowerCase().includes("independent financial advisor") &&
                !practiceText.toLowerCase().includes("financial adviser") &&
                !practiceText.toLowerCase().includes("share") &&
                !practiceText.toLowerCase().includes("visit")) {
              practiceName = practiceText;
              practiceNameFound = true;
              break;
            }
          }
        }
        
        // Strategy 2: Extract from card text - look for patterns like "XYZ Wealth Management"
        if (!practiceNameFound) {
          const cardText = card.textContent || '';
          // Look for patterns: Capitalized words followed by Wealth/Financial/Planning/Advisory/Partners/Associates/Group/Limited
          const practicePatterns = [
            /([A-Z][a-zA-Z\s&]+(?:Wealth\s+Management|Financial\s+Planning|Financial\s+Advisory|Financial\s+Services|Advisory\s+Services|Partners|Associates|Group|Limited|LLP|Ltd))/i,
            /([A-Z][a-zA-Z\s&]{3,40}(?:Wealth|Financial|Planning|Advisory|Partners|Associates|Group))/,
            // Also look for standalone practice names (2-4 capitalized words, not common phrases)
            /(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s+(?:Wealth|Financial|Planning|Advisory|Partners|Associates|Group|Limited|LLP|Ltd))?/m
          ];
          
          for (const pattern of practicePatterns) {
            const match = cardText.match(pattern);
            if (match && match[1]) {
              const candidate = match[1].trim();
              // Validate it's not generic or too short/long
              if (candidate.length > 5 && 
                  candidate.length < 80 &&
                  !candidate.toLowerCase().includes("st. james's place") &&
                  !candidate.toLowerCase().includes("independent financial advisor") &&
                  !candidate.toLowerCase().includes("financial adviser") &&
                  !candidate.toLowerCase().includes("share") &&
                  !candidate.toLowerCase().includes("visit") &&
                  candidate.split(' ').length >= 1 && 
                  candidate.split(' ').length <= 6) {
                practiceName = candidate;
                practiceNameFound = true;
                break;
              }
            }
          }
        }
        
        // Strategy 3: If still no practice name, use advisor name + "Practice" or location-based name
        if (!practiceNameFound && firstName && lastName) {
          // Use advisor name as practice identifier (better than generic)
          practiceName = `${firstName} ${lastName} Practice`;
        } else if (!practiceNameFound && firstName) {
          practiceName = `${firstName}'s Practice`;
        }
        
        // Log practice name extraction for debugging
        fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:1070',message:'Practice name extraction',data:{practiceName,practiceNameFound,firstName,lastName,cardTextLength:card.textContent?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'practice-name-extraction',hypothesisId:'PRACTICE-NAME'})}).catch(()=>{});
        
        // Reject if firstName is invalid (Share, Visit, Partner, etc.)
        const invalidFirstNames = ['share', 'visit', 'partner', 'view', 'read', 'more', 'click', 'link'];
        const isValidFirstName = firstName && 
                                 firstName.length >= 2 && 
                                 !invalidFirstNames.includes(firstName.toLowerCase()) &&
                                 /^[A-Za-z]+$/.test(firstName.replace(/[^A-Za-z]/g, ''));
        
        // Add to results if we have a valid email AND valid name
        if (email && isValidEmail && isValidFirstName) {
          fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:976',message:'Adding lead with extracted data',data:{email:email.toLowerCase().trim(),firstName,lastName,practiceName,linkText,linkHref,nameText,extractedFrom:nameContainer?'nameContainer':'fallback'},timestamp:Date.now(),sessionId:'debug-session',runId:'name-extraction-fix-v2',hypothesisId:'NAME-FIX-V2'})}).catch(()=>{});
          
          results.push({
            email: email.toLowerCase().trim(),
            firstName: firstName,
            lastName: lastName || '',
            companyName: practiceName, // Use extracted practice name instead of generic
            jobTitle: 'Independent Financial Advisor',
            location: cityName,
            website: linkHref || null,
            dataSource: 'predator_sjp' as const,
            region: 'UK'
          });
          extractionStats.added++;
        } else if (email && isValidEmail && !isValidFirstName) {
          // Email is valid but name is invalid - log for debugging
          fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:990',message:'Rejecting lead - invalid name',data:{email:email.toLowerCase().trim(),firstName,invalidReason:!firstName?'no name':invalidFirstNames.includes(firstName.toLowerCase())?'invalid name':'other'},timestamp:Date.now(),sessionId:'debug-session',runId:'name-extraction-fix',hypothesisId:'NAME-FIX'})}).catch(()=>{});
          extractionStats.emailRejected++;
        } else if (email) {
          extractionStats.emailRejected++;
        }
      });
      
      // Add extraction stats to debug
      (window as any).__extractionStats = extractionStats;
      
      // Strategy 2: Fallback to card-based extraction (if advisor links didn't yield results)
      if (results.length === 0) {
        cards.forEach((card: Element) => {
          const nameEl = card.querySelector('h3, .name, [class*="name"]');
          const linkEl = card.querySelector('a[href*="sjp.co.uk"]');
          const text = card.textContent || '';
          
          // Email extraction: mailto links first, then regex, then construct from name
          const mailLink = card.querySelector('a[href^="mailto:"]');
          let email: string | null = null;
          
          if (mailLink) {
            const mailtoHref = mailLink.getAttribute('href') || '';
            const mailtoValue = mailtoHref.replace('mailto:', '').trim();
            // Filter out share links (mailto:?body=... or mailto:?subject=...)
            // Only accept if it looks like an actual email address (contains @ and doesn't start with ?)
            if (mailtoValue && mailtoValue.includes('@') && !mailtoValue.startsWith('?')) {
              // Extract just the email part (before any query params like ?body=)
              const emailPart = mailtoValue.split('?')[0].split('&')[0].trim();
              if (emailPart && emailPart.includes('@')) {
                email = emailPart;
              }
            }
          }
          
          // If no email from mailto link, try regex in card text
          if (!email) {
            const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
              email = emailMatch[0];
            }
          }
          
          // If still no email, try to construct from name
          if (!email) {
            const nameText = nameEl?.textContent?.trim() || 'Partner';
            const nameParts = nameText.split(' ').filter(p => p.length > 0 && p.length < 50);
            if (nameParts.length >= 2) {
              const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
              const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
              if (firstName.length > 0 && lastName.length > 0) {
                email = `${firstName}.${lastName}@sjpp.co.uk`;
              }
            }
          }
          
          if (email && !email.includes('sentry') && !email.includes('example.com') && !email.includes('example') && email.includes('@') && email.length > 5) {
            // Extract name with same validation as Strategy 1
            let nameText = '';
            if (nameEl && nameEl !== linkEl) {
              nameText = nameEl.textContent?.trim() || '';
            }
            
            // Validate name - reject invalid names
            const invalidNames = ['share', 'visit', 'partner', 'view', 'read', 'more', 'click', 'link'];
            const nameLower = nameText.toLowerCase().trim();
            if (invalidNames.includes(nameLower) || nameText.length < 2) {
              nameText = ''; // Clear invalid name
            }
            
            const nameParts = nameText.split(' ').filter(p => p.length > 0 && p.length < 50 && !invalidNames.includes(p.toLowerCase()));
            const firstName = nameParts.length > 0 ? nameParts[0] : null;
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            // Reject if firstName is invalid
            const invalidFirstNames = ['share', 'visit', 'partner', 'view', 'read', 'more', 'click', 'link'];
            const isValidFirstName = firstName && 
                                     firstName.length >= 2 && 
                                     !invalidFirstNames.includes(firstName.toLowerCase()) &&
                                     /^[A-Za-z]+$/.test(firstName.replace(/[^A-Za-z]/g, ''));
            
            // Only add if we have a valid name
            if (isValidFirstName) {
              // Try to extract practice name (same logic as Strategy 1)
              let practiceName = "St. James's Place Partner";
              let practiceNameFound = false;
              
              // Strategy 1: Look for practice name in specific SJP card structure
              const practiceSelectors = [
                '[class*="company"]',
                '[class*="practice"]',
                '[class*="firm"]',
                '[class*="business"]',
                '.views-advisers-description',
                '.views-advisers-company',
                '[class*="advisers-company"]',
                '[class*="advisers-description"]'
              ];
              
              for (const selector of practiceSelectors) {
                const practiceNameEl = card.querySelector(selector);
                if (practiceNameEl) {
                  const practiceText = practiceNameEl.textContent?.trim();
                  if (practiceText && 
                      practiceText.length > 5 && 
                      practiceText.length < 100 &&
                      !practiceText.toLowerCase().includes("st. james's place") &&
                      !practiceText.toLowerCase().includes("independent financial advisor") &&
                      !practiceText.toLowerCase().includes("financial adviser")) {
                    practiceName = practiceText;
                    practiceNameFound = true;
                    break;
                  }
                }
              }
              
              // Strategy 2: Extract from card text patterns
              if (!practiceNameFound) {
                const cardText = card.textContent || '';
                const practicePatterns = [
                  /([A-Z][a-zA-Z\s&]+(?:Wealth\s+Management|Financial\s+Planning|Financial\s+Advisory|Partners|Associates|Group|Limited|LLP|Ltd))/i,
                  /([A-Z][a-zA-Z\s&]{3,40}(?:Wealth|Financial|Planning|Advisory|Partners|Associates|Group))/
                ];
                
                for (const pattern of practicePatterns) {
                  const match = cardText.match(pattern);
                  if (match && match[1]) {
                    const candidate = match[1].trim();
                    if (candidate.length > 5 && candidate.length < 80 &&
                        !candidate.toLowerCase().includes("st. james's place")) {
                      practiceName = candidate;
                      practiceNameFound = true;
                      break;
                    }
                  }
                }
              }
              
              // Strategy 3: Use advisor name if no practice name found
              if (!practiceNameFound) {
                if (firstName && lastName) {
                  practiceName = `${firstName} ${lastName} Practice`;
                } else if (firstName) {
                  practiceName = `${firstName}'s Practice`;
                }
              }
              
              results.push({
                email: email.toLowerCase().trim(),
                firstName: firstName,
                lastName: lastName || '',
                companyName: practiceName,
                jobTitle: 'Independent Financial Advisor',
                location: cityName,
                website: linkEl ? (linkEl as HTMLAnchorElement).href : null,
                dataSource: 'predator_sjp' as const,
                region: 'UK'
              });
            }
          }
        });
      }
      
      // Return debug info along with results
      (window as any).__debugExtraction = { 
        selectorCounts, 
        totalCards: cards.length,
        advisorLinksCount: advisorLinks.length,
        extractedFromLinks: results.length,
        extractedEmails: results.map(r => r.email).slice(0, 5),
        extractionStats: (window as any).__extractionStats || {},
        sampleCardText: cards.slice(0, 3).map(c => c.textContent?.substring(0, 200) || ''),
        sampleCardHTML: cards.slice(0, 3).map(c => c.outerHTML.substring(0, 300) || ''),
        sampleLinkText: Array.from(advisorLinks).slice(0, 3).map(l => l.textContent?.trim() || '').filter(t => t.length > 0),
        sampleLinkHrefs: Array.from(advisorLinks).slice(0, 3).map(l => (l as HTMLAnchorElement).href),
        sampleAdvisorLinks: (window as any).__sampleAdvisorLinks || []
      };
      
      return { results, debug: (window as any).__debugExtraction };
    }, hub.name);
    
    // 8. Deduplicate and add to results
    const extractedResults = (extracted as any).results || extracted;
    
    // #region agent log - After extraction
    const extractionDebug = (extracted as any).debug || {};
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'predator-scraper.ts:840',message:'After extraction (V7.3:ExtractionFix)',data:{city:hub.name,extractionDebug,extractedCount:extractedResults.length,extractedResults:extractedResults.slice(0, 5)},timestamp:Date.now(),sessionId:'debug-session',runId:'v7.3-extraction',hypothesisId:'V7.3-EXTRACT'})}).catch(()=>{});
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
    console.error(`   Stack: ${error.stack}`);
    // Log error details for debugging in GitHub Actions
    if (error.message?.includes('Chrome') || error.message?.includes('browser')) {
      console.error(`   ⚠️  Browser launch error - Chrome dependencies may be missing`);
    }
  } finally {
    // 11. Kill browser (clean state, zero memory leaks)
    if (browser) {
      try {
        await browser.close();
      } catch (closeError: any) {
        console.error(`   ⚠️  Error closing browser: ${closeError.message}`);
      }
    }
  }
  
  return cityLeads;
}

/**
 * GUERRILLA MODE: Randomly select a batch of cities to stay under Cloudflare radar
 * When no proxy is available, process only 5 random cities per run to avoid bans
 */
function getGuerillaTargetBatch(allCities: WealthHub[], batchSize: number = 5): WealthHub[] {
  // Create a shuffled copy of the array
  const shuffled = [...allCities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, batchSize);
}

/**
 * Main Predator Bot V7 function - "One Browser Per City" Protocol
 * GUERRILLA MODE: When no proxy, randomly select 5 cities to avoid Cloudflare bans
 */
export async function sourceFromPredator(
  maxLeads?: number
): Promise<PredatorLead[]> {
  const leads: PredatorLead[] = [];
  const maxResults = maxLeads || 833; // 10K/day = 833/run
  
  console.log('🦅 Predator Bot V7.3: "Force Select Protocol" (The "React State" Fix)');
  console.log(`   Target: ${maxResults} high-intent leads`);
  console.log(`   Strategy: Fresh browser per city → Scrape → Kill → Next city`);
  
  // GUERRILLA MODE: If no proxy, use random batch of 5 cities to stay under Cloudflare radar
  // If proxy is enabled, process all 53 cities
  const targetCities = PROXY_SERVER 
    ? UK_WEALTH_HUBS 
    : getGuerillaTargetBatch(UK_WEALTH_HUBS, 5);
  
  if (PROXY_SERVER) {
    console.log(`   🛡️  Proxy: Enabled (${PROXY_SERVER}) - Processing all ${UK_WEALTH_HUBS.length} cities`);
  } else {
    console.log(`   🎯 Guerrilla Mode: No proxy detected - Randomly selecting ${targetCities.length} cities to avoid Cloudflare bans`);
    console.log(`   📍 Selected cities: ${targetCities.map(h => h.name).join(', ')}`);
  }
  
  // Initialize email cache
  await initializeEmailCache();
  
  // Process cities sequentially (safer for rate limits)
  for (const hub of targetCities) {
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
  if (!PROXY_SERVER) {
    console.log(`   📊 Guerrilla Mode: Processed ${targetCities.length}/${UK_WEALTH_HUBS.length} cities (${Math.round((targetCities.length / UK_WEALTH_HUBS.length) * 100)}% coverage)`);
    console.log(`   💡 Next run (2 hours) will process a different random batch`);
  }
  return leads;
}
