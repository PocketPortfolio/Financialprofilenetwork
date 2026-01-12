/**
 * Production Test Script for OG Image Fix
 * 
 * This script verifies that the robots.txt fix is working in production
 * and that social media platforms can access the OG image endpoint.
 * 
 * Usage: node scripts/test-production-og-fix.js
 */

const https = require('https');
const PROD_URL = 'https://www.pocketportfolio.app';

async function testRobotsTxt() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing Production robots.txt...\n');
    
    https.get(`${PROD_URL}/robots.txt`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 robots.txt Content:');
        console.log('='.repeat(70));
        console.log(data);
        console.log('='.repeat(70));
        
        const lines = data.split('\n');
        let foundApiOgAllow = false;
        let foundApiDisallow = false;
        let allowLine = -1;
        let disallowLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.includes('Allow:') && line.includes('/api/og')) {
            foundApiOgAllow = true;
            allowLine = i + 1;
            console.log(`\n✅ Found Allow rule for /api/og at line ${allowLine}`);
          }
          
          if (line.includes('Disallow:') && line.includes('/api/') && !line.includes('/api/tickers')) {
            foundApiDisallow = true;
            if (disallowLine === -1) disallowLine = i + 1;
          }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 robots.txt Analysis:');
        console.log(`   Allow /api/og: ${foundApiOgAllow ? '✅ YES' : '❌ NO'}`);
        console.log(`   Disallow /api/: ${foundApiDisallow ? '⚠️  YES' : '❌ NO'}`);
        
        if (foundApiOgAllow && foundApiDisallow) {
          if (allowLine < disallowLine) {
            console.log(`\n✅ CORRECT: Allow /api/og (line ${allowLine}) comes BEFORE Disallow /api/ (line ${disallowLine})`);
            console.log('   Social media crawlers can access /api/og!');
          } else {
            console.log(`\n⚠️  WARNING: Allow /api/og comes AFTER Disallow /api/`);
            console.log('   This may cause issues. The Allow rule should come first.');
          }
        }
        
        resolve({ 
          success: foundApiOgAllow && (allowLine < disallowLine || !foundApiDisallow),
          foundApiOgAllow,
          foundApiDisallow,
          allowLine,
          disallowLine
        });
      });
    }).on('error', (err) => {
      console.error('❌ Error fetching robots.txt:', err.message);
      reject(err);
    });
  });
}

async function testOGImageEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing OG Image Endpoint...\n');
    
    const url = `${PROD_URL}/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=2`;
    
    https.get(url, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      
      console.log(`URL: ${url}`);
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);
      console.log(`Content-Length: ${contentLength} bytes`);
      
      if (statusCode === 200 && contentType && contentType.includes('image')) {
        console.log('✅ OG image endpoint is accessible and returns an image');
        resolve({ success: true, statusCode, contentType, contentLength });
      } else {
        console.log(`⚠️  Unexpected response: ${statusCode}, ${contentType}`);
        resolve({ success: false, statusCode, contentType });
      }
      
      res.resume();
    }).on('error', (err) => {
      console.error('❌ Error accessing OG image:', err.message);
      reject(err);
    });
  });
}

async function testMetaTags() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing Meta Tags...\n');
    
    https.get(PROD_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const ogImageMatch = data.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        const twitterImageMatch = data.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
        const ogTitleMatch = data.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        const ogDescriptionMatch = data.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        
        console.log('Meta Tags Found:');
        if (ogImageMatch) {
          console.log(`  ✅ og:image: ${ogImageMatch[1]}`);
          console.log(`     ${ogImageMatch[1].includes('/api/og') ? '✅ Uses /api/og endpoint' : '❌ Does not use /api/og'}`);
          console.log(`     ${ogImageMatch[1].includes('v=2') ? '✅ Has cache-busting parameter' : '⚠️  Missing cache-busting'}`);
        } else {
          console.log('  ❌ og:image: Not found');
        }
        
        if (twitterImageMatch) {
          console.log(`  ✅ twitter:image: ${twitterImageMatch[1]}`);
        } else {
          console.log('  ❌ twitter:image: Not found');
        }
        
        if (ogTitleMatch) {
          console.log(`  ✅ og:title: ${ogTitleMatch[1].substring(0, 60)}...`);
        } else {
          console.log('  ❌ og:title: Not found');
        }
        
        if (ogDescriptionMatch) {
          console.log(`  ✅ og:description: ${ogDescriptionMatch[1].substring(0, 60)}...`);
        } else {
          console.log('  ❌ og:description: Not found');
        }
        
        const hasOGImage = !!ogImageMatch;
        const usesApiOg = ogImageMatch && ogImageMatch[1].includes('/api/og');
        const hasCacheBusting = ogImageMatch && ogImageMatch[1].includes('v=2');
        
        resolve({ 
          success: hasOGImage && usesApiOg,
          hasOGImage,
          usesApiOg,
          hasCacheBusting,
          ogImageUrl: ogImageMatch ? ogImageMatch[1] : null
        });
      });
    }).on('error', (err) => {
      console.error('❌ Error fetching page:', err.message);
      reject(err);
    });
  });
}

async function testSocialMediaCrawlerSimulation() {
  console.log('\n🔍 Simulating Social Media Crawler Access...\n');
  
  // Test with a user-agent that simulates Twitter/Facebook crawlers
  const userAgents = [
    'Twitterbot/1.0',
    'facebookexternalhit/1.1',
    'LinkedInBot/1.0'
  ];
  
  const results = [];
  
  for (const userAgent of userAgents) {
    try {
      const result = await new Promise((resolve, reject) => {
        const url = `${PROD_URL}/api/og?title=Test&description=Test`;
        const options = {
          headers: {
            'User-Agent': userAgent
          }
        };
        
        https.get(url, options, (res) => {
          const statusCode = res.statusCode;
          const contentType = res.headers['content-type'];
          
          const success = statusCode === 200 && contentType && contentType.includes('image');
          results.push({ userAgent, success, statusCode, contentType });
          resolve({ userAgent, success, statusCode, contentType });
        }).on('error', (err) => {
          reject(err);
        });
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${result.userAgent}: ${result.statusCode} ${result.contentType}`);
    } catch (err) {
      console.log(`  ❌ ${userAgent}: Error - ${err.message}`);
      results.push({ userAgent, success: false });
    }
  }
  
  return { success: results.every(r => r.success), results };
}

async function main() {
  console.log('🧪 Production OG Image Fix Verification\n');
  console.log('='.repeat(70));
  console.log(`Testing: ${PROD_URL}\n`);
  
  try {
    const robotsResult = await testRobotsTxt();
    const ogResult = await testOGImageEndpoint();
    const metaResult = await testMetaTags();
    const crawlerResult = await testSocialMediaCrawlerSimulation();
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 Final Test Summary:');
    console.log('='.repeat(70));
    console.log(`   robots.txt allows /api/og: ${robotsResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   OG image endpoint accessible: ${ogResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Meta tags configured: ${metaResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Uses /api/og endpoint: ${metaResult.usesApiOg ? '✅ YES' : '❌ NO'}`);
    console.log(`   Has cache-busting: ${metaResult.hasCacheBusting ? '✅ YES' : '⚠️  NO'}`);
    console.log(`   Social crawler simulation: ${crawlerResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = robotsResult.success && ogResult.success && metaResult.success && crawlerResult.success;
    
    if (allPassed) {
      console.log('\n✅ All tests passed! The fix is working correctly.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Clear social media caches using the tools below');
      console.log('   2. Test sharing your URL on each platform');
      console.log('   3. Verify the preview image appears correctly');
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above.');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🔧 Manual Testing Tools:');
    console.log('='.repeat(70));
    console.log('Facebook Sharing Debugger:');
    console.log(`   https://developers.facebook.com/tools/debug/`);
    console.log(`   Enter: ${PROD_URL}`);
    console.log(`   Click "Scrape Again" to clear cache`);
    console.log('');
    console.log('Twitter Card Validator:');
    console.log(`   https://cards-dev.twitter.com/validator`);
    console.log(`   Enter: ${PROD_URL}`);
    console.log(`   Click "Preview card"`);
    console.log('');
    console.log('LinkedIn Post Inspector:');
    console.log(`   https://www.linkedin.com/post-inspector/`);
    console.log(`   Enter: ${PROD_URL}`);
    console.log(`   Click "Inspect"`);
    console.log('');
    console.log('Open Graph Checker:');
    console.log(`   https://www.opengraph.xyz/url/${encodeURIComponent(PROD_URL)}`);
    console.log('');
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

main();

