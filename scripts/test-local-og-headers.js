/**
 * Test OG image route with explicit headers locally
 */

const http = require('http');

async function testOGImageWithHeaders(port = 3000) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing OG Image Route with Headers (port ${port})...\n`);
    
    const url = `http://localhost:${port}/api/og?title=Test&description=Test`;
    
    http.get(url, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      const cacheControl = res.headers['cache-control'];
      const contentLength = res.headers['content-length'];
      const xContentTypeOptions = res.headers['x-content-type-options'];
      const accessControlAllowOrigin = res.headers['access-control-allow-origin'];
      
      console.log(`URL: ${url}`);
      console.log(`Status: ${statusCode}`);
      console.log(`\n📋 Response Headers:`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Cache-Control: ${cacheControl}`);
      console.log(`   Content-Length: ${contentLength || 'chunked'}`);
      console.log(`   X-Content-Type-Options: ${xContentTypeOptions}`);
      console.log(`   Access-Control-Allow-Origin: ${accessControlAllowOrigin}`);
      
      // Collect image data
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const size = imageBuffer.length;
        
        console.log(`\n📊 Image Analysis:`);
        console.log(`   Size: ${size} bytes`);
        
        // Check PNG signature
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const isPNG = imageBuffer.slice(0, 8).equals(pngSignature);
        console.log(`   PNG Signature: ${isPNG ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`   First 16 bytes (hex): ${imageBuffer.slice(0, 16).toString('hex')}`);
        
        // Verify headers
        const hasCorrectContentType = contentType === 'image/png';
        const hasCacheControl = !!cacheControl;
        const hasXContentTypeOptions = xContentTypeOptions === 'nosniff';
        const hasCORS = accessControlAllowOrigin === '*';
        
        console.log(`\n✅ Header Checks:`);
        console.log(`   Content-Type is image/png: ${hasCorrectContentType ? '✅' : '❌'}`);
        console.log(`   Cache-Control present: ${hasCacheControl ? '✅' : '❌'}`);
        console.log(`   X-Content-Type-Options: nosniff: ${hasXContentTypeOptions ? '✅' : '❌'}`);
        console.log(`   CORS header present: ${hasCORS ? '✅' : '❌'}`);
        
        const allGood = statusCode === 200 && 
                        isPNG && 
                        hasCorrectContentType && 
                        hasCacheControl && 
                        hasXContentTypeOptions && 
                        hasCORS;
        
        if (allGood) {
          console.log(`\n✅ All checks passed! Image is valid and headers are correct.`);
        } else {
          console.log(`\n⚠️  Some checks failed. Review the output above.`);
        }
        
        resolve({ 
          success: allGood,
          statusCode,
          contentType,
          isPNG,
          size,
          hasCorrectContentType,
          hasCacheControl,
          hasXContentTypeOptions,
          hasCORS
        });
      });
    }).on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.error(`\n❌ Cannot connect to http://localhost:${port}`);
        console.log('💡 Make sure the dev server is running: npm run dev');
      } else {
        console.error(`\n❌ Error: ${err.message}`);
      }
      reject(err);
    });
  });
}

async function testWithFacebookUserAgent(port = 3000) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing with Facebook Crawler User-Agent...\n`);
    
    const url = `http://localhost:${port}/api/og?title=Test&description=Test`;
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/og?title=Test&description=Test',
      method: 'GET',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'image/png,image/*,*/*',
      }
    };
    
    http.get(options, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const isPNG = imageBuffer.slice(0, 8).equals(pngSignature);
        
        console.log(`Image Size: ${imageBuffer.length} bytes`);
        console.log(`Valid PNG: ${isPNG ? '✅' : '❌'}`);
        
        resolve({ success: statusCode === 200 && isPNG && contentType === 'image/png' });
      });
    }).on('error', reject);
  });
}

async function main() {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
  
  console.log('🧪 Local OG Image Route Header Test\n');
  console.log('='.repeat(70));
  
  try {
    const result1 = await testOGImageWithHeaders(port);
    const result2 = await testWithFacebookUserAgent(port);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test Summary:');
    console.log('='.repeat(70));
    console.log(`   OG Image with Headers: ${result1.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Facebook Crawler Test: ${result2.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result1.success && result2.success) {
      console.log('\n✅ All tests passed! Ready for deployment.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();

