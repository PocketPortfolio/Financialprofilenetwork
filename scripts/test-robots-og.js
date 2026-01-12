/**
 * Test script to verify robots.txt allows /api/og
 */

const http = require('http');

async function testRobotsTxt() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing robots.txt for /api/og access...\n');
    
    http.get('http://localhost:3000/robots.txt', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 robots.txt content:');
        console.log('='.repeat(60));
        console.log(data);
        console.log('='.repeat(60));
        
        // Check if /api/og is allowed
        const lines = data.split('\n');
        let inApiOgSection = false;
        let foundAllow = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.includes('Allow:') && line.includes('/api/og')) {
            foundAllow = true;
            console.log(`\n✅ Found Allow rule for /api/og at line ${i + 1}`);
          }
          
          // Check if there's a Disallow: /api/ that comes after an Allow: /api/og
          if (line.includes('Disallow:') && line.includes('/api/')) {
            if (foundAllow) {
              console.log(`⚠️  Found Disallow: /api/ at line ${i + 1}`);
              console.log('   Note: In robots.txt, more specific rules (Allow) take precedence');
              console.log('   So /api/og should still be accessible despite this disallow');
            }
          }
        }
        
        if (foundAllow) {
          console.log('\n✅ robots.txt correctly allows /api/og');
          resolve({ success: true });
        } else {
          console.log('\n❌ robots.txt does not explicitly allow /api/og');
          console.log('   This may cause issues with social media crawlers');
          resolve({ success: false });
        }
      });
    }).on('error', (err) => {
      console.error('❌ Error fetching robots.txt:', err.message);
      console.log('\n💡 Make sure the dev server is running: npm run dev');
      reject(err);
    });
  });
}

async function testOGImageAccess() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing OG image endpoint accessibility...\n');
    
    const url = 'http://localhost:3000/api/og?title=Test&description=Test';
    
    http.get(url, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);
      
      if (statusCode === 200 && contentType && contentType.includes('image')) {
        console.log('✅ OG image endpoint is accessible and returns an image');
        resolve({ success: true, statusCode, contentType });
      } else {
        console.log(`⚠️  OG image endpoint returned unexpected response`);
        resolve({ success: false, statusCode, contentType });
      }
      
      res.resume(); // Consume response
    }).on('error', (err) => {
      console.error('❌ Error accessing OG image:', err.message);
      reject(err);
    });
  });
}

async function runTests() {
  try {
    const robotsResult = await testRobotsTxt();
    const ogResult = await testOGImageAccess();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   robots.txt allows /api/og: ${robotsResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   OG image endpoint accessible: ${ogResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (robotsResult.success && ogResult.success) {
      console.log('\n✅ All tests passed! Social media crawlers should be able to access OG images.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

runTests();

