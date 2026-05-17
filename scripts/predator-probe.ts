import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const TARGET_CITY = "London";

function sendLog(data: unknown) {
  console.log('[predator-probe]', JSON.stringify(data));
}

async function runProbe() {
  console.log("🦅 Predator V9: Operation X-Ray (Network Probe)...");
  console.log("   Waiting to intercept API calls...");
  console.log(`   Target City: ${TARGET_CITY}`);
  sendLog({
    location: 'predator-probe.ts:10',
    message: 'Probe script started (V9)',
    data: { targetCity: TARGET_CITY },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'v9-probe',
    hypothesisId: 'H13',
  });

  let browser;
  let page;
  const interceptedRequests: Array<{
    method: string;
    url: string;
    headers: Record<string, string>;
    postData?: string;
    resourceType: string;
  }> = [];
  
  try {
    // Launch VISIBLE browser
    browser = await puppeteer.launch({
      headless: false, // We need to see this
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    sendLog({location:'predator-probe.ts:20',message:'Browser launched (V9)',data:{headless:false},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});

    page = await browser.newPage();

    // --- INTERCEPTION LOGIC ---
    await page.setRequestInterception(true);
  
    page.on('request', (request) => {
    const url = request.url();
    const resourceType = request.resourceType();
    
    // Log ALL XHR/Fetch requests (not just filtered) to see what's happening
    if (['xhr', 'fetch'].includes(resourceType)) {
      sendLog({location:'predator-probe.ts:35',message:'All XHR/Fetch Request (V9)',data:{method:request.method(),url,resourceType,postData:request.postData()?.substring(0,200)||null},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
      
      // Log ALL requests to SJP domain (not just filtered keywords)
      if (url.includes('sjp.co.uk')) {
           console.log(`\n🎯 SJP REQUEST: ${request.method()} ${url}`);
           console.log(`   Headers:`, JSON.stringify(request.headers(), null, 2));
           console.log(`   PostData:`, request.postData() || '(none)');
           
           sendLog({location:'predator-probe.ts:45',message:'SJP Domain Request (V9)',data:{method:request.method(),url,headers:request.headers(),postData:request.postData()||null,resourceType},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
           
           interceptedRequests.push({
             method: request.method(),
             url: url,
             headers: request.headers(),
             postData: request.postData() || undefined,
             resourceType: resourceType
           });
      }
      
      // Filter for likely search endpoints
      if (url.includes('api') || url.includes('search') || url.includes('partner') || url.includes('adviser') || url.includes('advisor') || url.includes('graphql') || url.includes('query')) {
           console.log(`\n🎯 INTERCEPTED: ${request.method()} ${url}`);
           console.log(`   Headers:`, JSON.stringify(request.headers(), null, 2));
           console.log(`   PostData:`, request.postData() || '(none)');
           
           sendLog({location:'predator-probe.ts:60',message:'INTERCEPTED API Request (V9)',data:{method:request.method(),url,headers:request.headers(),postData:request.postData()||null,resourceType},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
           
           interceptedRequests.push({
             method: request.method(),
             url: url,
             headers: request.headers(),
             postData: request.postData() || undefined,
             resourceType: resourceType
           });
      }
    }
      request.continue();
    });

    // Also intercept responses to see the data
    page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    
    if (['xhr', 'fetch'].includes(response.request().resourceType())) {
      if (url.includes('api') || url.includes('search') || url.includes('partner') || url.includes('adviser') || url.includes('advisor') || url.includes('graphql') || url.includes('query')) {
        try {
          const responseBody = await response.text();
          console.log(`\n📥 RESPONSE: ${status} ${url}`);
          const bodyPreview = responseBody.length < 5000 ? responseBody : responseBody.substring(0, 1000) + '...';
          if (responseBody.length < 5000) {
            console.log(`   Body:`, responseBody.substring(0, 1000));
          } else {
            console.log(`   Body (truncated):`, responseBody.substring(0, 1000), '...');
          }
          
          sendLog({location:'predator-probe.ts:55',message:'INTERCEPTED API Response (V9)',data:{status,url,bodyPreview:bodyPreview.substring(0,500),bodyLength:responseBody.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
        } catch (e) {
          // Response might not be text
        }
      }
    }
    });
    
    // Monitor navigation events (page reloads, form submissions)
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        console.log(`\n🧭 NAVIGATION: ${url}`);
        sendLog({location:'predator-probe.ts:120',message:'Page navigation (V9)',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
      }
    });

    // Main interaction flow
    // 1. Load Page
    console.log("\n📄 Loading SJP search page...");
    sendLog({location:'predator-probe.ts:75',message:'Starting probe - loading page (V9)',data:{targetCity:TARGET_CITY},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
    await page.goto('https://www.sjp.co.uk/individuals/find-an-adviser', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // 2. Clear Cookies (Start Fresh)
    try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
        console.log("   🍪 Cookies Accepted.");
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch(e) {
      console.log("   ⚠️ Cookie banner not found or already accepted.");
    }

    // 3. HUMAN INTERACTION (Slow & Deliberate)
    const inputSelector = '#edit-location, input[name="location"], input[type="text"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    
    // Focus & Type
    await page.click(inputSelector, { clickCount: 3 });
    await page.type(inputSelector, TARGET_CITY, { delay: 200 }); // Slow typing
    console.log(`   ⌨️ Typed "${TARGET_CITY}"...`);
    
    // Wait for Autocomplete
    console.log("   ⏳ Waiting for autocomplete to appear...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try to select first autocomplete option
    try {
      const pacContainer = await page.$('.pac-container');
      if (pacContainer) {
        const firstItem = await pacContainer.$('.pac-item');
        if (firstItem) {
          await firstItem.click();
          console.log("   ✅ Selected first autocomplete suggestion");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (e) {
      console.log("   ⚠️ Could not select autocomplete, continuing...");
    }
    
    // 4. TRIGGER ATTEMPTS
    console.log("\n   🖱️ Attempting triggers...");
    sendLog({location:'predator-probe.ts:120',message:'Starting trigger attempts (V9)',data:{targetCity:TARGET_CITY},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
    
    // Trigger A: Arrow + Enter
    await page.focus(inputSelector);
    await page.keyboard.press('ArrowDown');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.press('Enter');
    console.log("   ⌨️ Pressed ArrowDown + Enter");
    sendLog({location:'predator-probe.ts:127',message:'Trigger A: ArrowDown+Enter (V9)',data:{targetCity:TARGET_CITY},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger B: Click Search Button (if visible)
    try {
        const searchButton = await page.$('button[type="submit"], input[type="submit"]');
        if (searchButton) {
          await searchButton.click();
          console.log("   🖱️ Clicked Submit Button.");
          sendLog({location:'predator-probe.ts:136',message:'Trigger B: Button click (V9)',data:{targetCity:TARGET_CITY},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch(e) {
      console.log("   ⚠️ Submit button not found or not clickable");
    }

    // 5. OBSERVE
    console.log("\n   👀 Watching for 15 seconds...");
    sendLog({location:'predator-probe.ts:200',message:'Starting observation period (V9)',data:{duration:15000},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});
    await new Promise(resolve => setTimeout(resolve, 15000));
    sendLog({location:'predator-probe.ts:205',message:'Observation period complete (V9)',data:{interceptedCount:interceptedRequests.length},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-probe',hypothesisId:'H13'});

  } catch (e) {
    console.error("   ❌ Probe Failed:", e);
    console.error("   Error details:", e instanceof Error ? e.stack : String(e));
    sendLog({
      location: 'predator-probe.ts:180',
      message: 'Probe error (V9)',
      data: {
        error: String(e),
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'v9-probe',
      hypothesisId: 'H13',
    });
  } finally {
    console.log("\n🦅 Probe Complete.");
    console.log(`\n📊 Summary: Intercepted ${interceptedRequests.length} API requests`);

    sendLog({
      location: 'predator-probe.ts:190',
      message: 'Probe summary (V9)',
      data: {
        interceptedCount: interceptedRequests.length,
        requests: interceptedRequests.map((r) => ({
          method: r.method,
          url: r.url,
          hasPostData: !!r.postData,
        })),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'v9-probe',
      hypothesisId: 'H13',
    });

    if (interceptedRequests.length > 0) {
      console.log("\n🎯 KEY FINDINGS:");
      interceptedRequests.forEach((req, idx) => {
        console.log(`\n${idx + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`   Payload: ${req.postData.substring(0, 200)}${req.postData.length > 200 ? '...' : ''}`);
        }
      });
    } else {
      console.log("\n⚠️ No API requests intercepted. The search may not have triggered.");
      console.log("   Try running again or check if the page requires different interaction.");
    }
    console.log("\n💡 Keep the browser open to inspect manually if needed.");
    console.log("   Press Ctrl+C to close when done.");
    
    // Don't close immediately so you can inspect if needed
    // if (browser) await browser.close(); 
  }
}

runProbe().catch(console.error);

