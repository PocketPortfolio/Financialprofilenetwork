import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import http from 'http';

puppeteer.use(StealthPlugin());

const TARGET_CITY = "London";

function sendLog(data: any) {
  const payload = JSON.stringify(data);
  const options = {
    hostname: '127.0.0.1',
    port: 43110,
    path: '/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  const req = http.request(options, () => {});
  req.on('error', () => {});
  req.write(payload);
  req.end();
}

async function runProbe() {
  console.log("🦅 Predator V9: Simple Network Probe...");
  console.log(`   Target: ${TARGET_CITY}`);
  
  sendLog({location:'probe-simple.ts:30',message:'Probe started',data:{targetCity:TARGET_CITY},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
  
  const allRequests: Array<{method: string, url: string, type: string, postData?: string}> = [];
  
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    sendLog({location:'probe-simple.ts:40',message:'Browser launched',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
    
    const page = await browser.newPage();
    
    // Log ALL requests (not just XHR/Fetch)
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      const resourceType = request.resourceType();
      const postData = request.postData();
      
      // Log ALL requests to SJP domain
      if (url.includes('sjp.co.uk')) {
        console.log(`\n🎯 SJP REQUEST: ${method} ${resourceType} ${url}`);
        if (postData) {
          console.log(`   POST Data: ${postData.substring(0, 200)}`);
        }
        
        allRequests.push({
          method,
          url,
          type: resourceType,
          postData: postData || undefined
        });
        
        sendLog({location:'probe-simple.ts:65',message:'SJP Request',data:{method,url,type:resourceType,hasPostData:!!postData},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
      }
      
      request.continue();
    });
    
    // Monitor navigation
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        console.log(`\n🧭 NAVIGATED: ${frame.url()}`);
        sendLog({location:'probe-simple.ts:75',message:'Navigation',data:{url:frame.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
      }
    });
    
    console.log("\n📄 Loading page...");
    await page.goto('https://www.sjp.co.uk/individuals/find-an-adviser', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    sendLog({location:'probe-simple.ts:85',message:'Page loaded',data:{url:page.url()},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
    
    // Accept cookies
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 });
      console.log("   🍪 Cookies accepted");
    } catch (e) {}
    
    // Wait for input
    const inputSelector = '#edit-location';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    console.log("   ✅ Input found");
    
    // Type city
    await page.click(inputSelector, { clickCount: 3 });
    await page.type(inputSelector, TARGET_CITY, { delay: 100 });
    console.log(`   ⌨️  Typed "${TARGET_CITY}"`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Try autocomplete selection
    try {
      const pacItem = await page.$('.pac-item');
      if (pacItem) {
        await pacItem.click();
        console.log("   ✅ Selected autocomplete");
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {}
    
    // Click search button
    console.log("\n   🖱️  Clicking search button...");
    sendLog({location:'probe-simple.ts:115',message:'Clicking search',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
    
    try {
      await page.click('button[type="submit"]');
      console.log("   ✅ Button clicked");
    } catch (e) {
      console.log(`   ❌ Button click failed: ${e}`);
    }
    
    // Wait and observe
    console.log("\n   👀 Observing for 10 seconds...");
    await new Promise(r => setTimeout(r, 10000));
    
    // Check final state
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasResults: document.querySelectorAll('.partner-card, .adviser-card, article').length > 0,
        resultCount: document.querySelectorAll('.partner-card, .adviser-card, article').length
      };
    });
    
    console.log("\n📊 Final State:");
    console.log(`   URL: ${finalState.url}`);
    console.log(`   Results found: ${finalState.hasResults} (${finalState.resultCount} items)`);
    
    sendLog({location:'probe-simple.ts:140',message:'Final state',data:finalState,timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
    
    console.log(`\n📊 Summary: ${allRequests.length} SJP requests intercepted`);
    sendLog({location:'probe-simple.ts:145',message:'Summary',data:{requestCount:allRequests.length,requests:allRequests.map(r=>({method:r.method,url:r.url,type:r.type}))},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
    
    console.log("\n💡 Browser will stay open. Press Ctrl+C to close.");
    
  } catch (e) {
    console.error("❌ Error:", e);
    sendLog({location:'probe-simple.ts:150',message:'Error',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'v9-simple',hypothesisId:'H13'});
  }
}

runProbe().catch(console.error);





