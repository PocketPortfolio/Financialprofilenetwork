/**
 * Test script to verify OG image endpoint and meta tags
 * Run with: node scripts/test-og-preview.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const PROD_URL = 'https://www.pocketportfolio.app';

async function testOGImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const fullUrl = `${url}/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing`;
    
    console.log(`\n🔍 Testing OG Image: ${fullUrl}`);
    
    client.get(fullUrl, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      
      console.log(`   Status: ${statusCode}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Content-Length: ${contentLength}`);
      
      if (statusCode === 200) {
        if (contentType && contentType.includes('image')) {
          console.log(`   ✅ OG Image endpoint working correctly`);
          resolve({ success: true, statusCode, contentType });
        } else {
          console.log(`   ⚠️  Unexpected content type: ${contentType}`);
          resolve({ success: false, statusCode, contentType, error: 'Wrong content type' });
        }
      } else {
        console.log(`   ❌ Failed with status ${statusCode}`);
        resolve({ success: false, statusCode, contentType });
      }
      
      res.resume(); // Consume response to free up memory
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

async function testMetaTags(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`\n🔍 Testing Meta Tags: ${url}`);
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const statusCode = res.statusCode;
        console.log(`   Status: ${statusCode}`);
        
        if (statusCode === 200) {
          // Check for OG meta tags
          const ogImageMatch = data.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
          const ogTitleMatch = data.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
          const ogDescriptionMatch = data.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
          const twitterImageMatch = data.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
          
          console.log(`   OG Image: ${ogImageMatch ? ogImageMatch[1] : '❌ Not found'}`);
          console.log(`   OG Title: ${ogTitleMatch ? ogTitleMatch[1].substring(0, 50) + '...' : '❌ Not found'}`);
          console.log(`   OG Description: ${ogDescriptionMatch ? ogDescriptionMatch[1].substring(0, 50) + '...' : '❌ Not found'}`);
          console.log(`   Twitter Image: ${twitterImageMatch ? twitterImageMatch[1] : '❌ Not found'}`);
          
          const hasOGImage = !!ogImageMatch;
          const hasOGTitle = !!ogTitleMatch;
          const hasOGDescription = !!ogDescriptionMatch;
          const hasTwitterImage = !!twitterImageMatch;
          
          if (hasOGImage && hasOGTitle && hasOGDescription && hasTwitterImage) {
            console.log(`   ✅ All meta tags present`);
            resolve({ success: true, hasOGImage, hasOGTitle, hasOGDescription, hasTwitterImage });
          } else {
            console.log(`   ⚠️  Some meta tags missing`);
            resolve({ success: false, hasOGImage, hasOGTitle, hasOGDescription, hasTwitterImage });
          }
        } else {
          console.log(`   ❌ Failed with status ${statusCode}`);
          resolve({ success: false, statusCode });
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing OG Preview Configuration\n');
  console.log('='.repeat(60));
  
  const testUrl = process.argv[2] || BASE_URL;
  console.log(`Testing URL: ${testUrl}\n`);
  
  try {
    // Test OG Image endpoint
    const ogResult = await testOGImage(testUrl);
    
    // Test Meta Tags
    const metaResult = await testMetaTags(testUrl);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   OG Image Endpoint: ${ogResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Meta Tags: ${metaResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (ogResult.success && metaResult.success) {
      console.log('\n✅ All tests passed! OG preview should work correctly.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

runTests();

