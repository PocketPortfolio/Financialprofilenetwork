/**
 * Test OG image response to diagnose Facebook "Corrupted Image" issue
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PROD_URL = 'https://www.pocketportfolio.app';
const OG_IMAGE_URL = `${PROD_URL}/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=2`;

async function testImageResponse(userAgent = 'Mozilla/5.0') {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing OG Image with User-Agent: ${userAgent}\n`);
    
    const url = new URL(OG_IMAGE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/png,image/*,*/*',
      }
    };
    
    https.get(options, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      const headers = res.headers;
      
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);
      console.log(`Content-Length: ${contentLength || 'chunked'}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));
      
      if (statusCode !== 200) {
        console.log(`❌ Non-200 status code: ${statusCode}`);
        resolve({ success: false, statusCode, contentType });
        res.resume();
        return;
      }
      
      // Collect the image data
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const size = imageBuffer.length;
        
        console.log(`\n📊 Image Analysis:`);
        console.log(`   Size: ${size} bytes`);
        console.log(`   First 16 bytes (hex): ${imageBuffer.slice(0, 16).toString('hex')}`);
        
        // Check PNG signature (should start with 89 50 4E 47 0D 0A 1A 0A)
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const isPNG = imageBuffer.slice(0, 8).equals(pngSignature);
        
        console.log(`   PNG Signature: ${isPNG ? '✅ Valid' : '❌ Invalid'}`);
        
        if (!isPNG) {
          console.log(`   ⚠️  Image does not have valid PNG signature!`);
          console.log(`   First bytes: ${Array.from(imageBuffer.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
          
          // Check if it's HTML/error message
          const textStart = imageBuffer.slice(0, 100).toString('utf-8');
          if (textStart.includes('<') || textStart.includes('Error') || textStart.includes('error')) {
            console.log(`   ⚠️  Response appears to be HTML/text, not an image:`);
            console.log(`   ${textStart.substring(0, 200)}`);
          }
        }
        
        // Save image for inspection
        const filename = `og-image-test-${Date.now()}.png`;
        const filepath = path.join(process.cwd(), filename);
        fs.writeFileSync(filepath, imageBuffer);
        console.log(`\n💾 Saved image to: ${filepath}`);
        
        resolve({ 
          success: isPNG && statusCode === 200,
          statusCode,
          contentType,
          size,
          isPNG,
          filepath
        });
      });
    }).on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  console.log('🧪 OG Image Response Diagnostic Test\n');
  console.log('='.repeat(70));
  console.log(`Testing: ${OG_IMAGE_URL}\n`);
  
  try {
    // Test with regular browser
    console.log('1️⃣  Testing with regular browser User-Agent:');
    const browserResult = await testImageResponse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Test with Facebook crawler
    console.log('\n' + '='.repeat(70));
    console.log('2️⃣  Testing with Facebook crawler User-Agent:');
    const facebookResult = await testImageResponse('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)');
    
    // Test with Twitter crawler
    console.log('\n' + '='.repeat(70));
    console.log('3️⃣  Testing with Twitter crawler User-Agent:');
    const twitterResult = await testImageResponse('Twitterbot/1.0');
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 Summary:');
    console.log('='.repeat(70));
    console.log(`   Browser: ${browserResult.success ? '✅ Valid PNG' : '❌ Invalid'}`);
    console.log(`   Facebook: ${facebookResult.success ? '✅ Valid PNG' : '❌ Invalid'}`);
    console.log(`   Twitter: ${twitterResult.success ? '✅ Valid PNG' : '❌ Invalid'}`);
    
    if (!facebookResult.isPNG) {
      console.log('\n⚠️  Facebook crawler is receiving an invalid image!');
      console.log('   This explains the "Corrupted Image" error.');
      console.log('   Check the saved image file to see what Facebook is receiving.');
    }
    
    if (browserResult.success && facebookResult.success && twitterResult.success) {
      console.log('\n✅ All crawlers receive valid PNG images');
      console.log('   The issue may be cached responses. Clear caches on platforms.');
    } else {
      console.log('\n❌ Some crawlers are receiving invalid images');
      console.log('   This needs to be fixed in the OG image route.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();

