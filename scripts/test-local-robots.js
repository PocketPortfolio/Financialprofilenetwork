/**
 * Test script to fetch and display local robots.txt
 */

const http = require('http');

function fetchRobotsTxt(port = 3000) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${port}/robots.txt`;
    
    console.log(`🔍 Fetching robots.txt from ${url}\n`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 robots.txt Content:');
        console.log('='.repeat(70));
        console.log(data);
        console.log('='.repeat(70));
        
        // Analyze the content
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
            console.log(`\n✅ Found Allow rule for /api/og at line ${allowLine}:`);
            console.log(`   ${line}`);
          }
          
          if (line.includes('Disallow:') && line.includes('/api/')) {
            foundApiDisallow = true;
            disallowLine = i + 1;
            console.log(`\n⚠️  Found Disallow rule for /api/ at line ${disallowLine}:`);
            console.log(`   ${line}`);
          }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 Analysis:');
        console.log(`   Allow /api/og: ${foundApiOgAllow ? '✅ YES' : '❌ NO'}`);
        console.log(`   Disallow /api/: ${foundApiDisallow ? '⚠️  YES' : '❌ NO'}`);
        
        if (foundApiOgAllow && foundApiDisallow) {
          if (allowLine < disallowLine) {
            console.log(`\n✅ CORRECT: Allow /api/og comes BEFORE Disallow /api/`);
            console.log('   This means /api/og will be accessible to crawlers!');
            console.log('   (More specific rules take precedence in robots.txt)');
          } else {
            console.log(`\n⚠️  WARNING: Allow /api/og comes AFTER Disallow /api/`);
            console.log('   This might cause issues. The Allow rule should come first.');
          }
        } else if (foundApiOgAllow) {
          console.log('\n✅ CORRECT: /api/og is explicitly allowed');
        } else {
          console.log('\n❌ ERROR: /api/og is not explicitly allowed!');
          console.log('   Social media crawlers may be blocked.');
        }
        
        resolve({ 
          success: foundApiOgAllow && (allowLine < disallowLine || !foundApiDisallow),
          content: data,
          foundApiOgAllow,
          foundApiDisallow,
          allowLine,
          disallowLine
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

async function testOGImageAccess(port = 3000) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing OG image endpoint accessibility...\n`);
    
    const url = `http://localhost:${port}/api/og?title=Test&description=Test`;
    
    http.get(url, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      
      console.log(`URL: ${url}`);
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);
      
      if (statusCode === 200 && contentType && contentType.includes('image')) {
        console.log('✅ OG image endpoint is accessible and returns an image');
        resolve({ success: true, statusCode, contentType });
      } else {
        console.log(`⚠️  Unexpected response: ${statusCode}, ${contentType}`);
        resolve({ success: false, statusCode, contentType });
      }
      
      res.resume();
    }).on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.error(`❌ Cannot connect to http://localhost:${port}`);
        console.log('💡 Make sure the dev server is running: npm run dev');
      } else {
        console.error(`❌ Error: ${err.message}`);
      }
      reject(err);
    });
  });
}

async function main() {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
  
  console.log('🧪 Testing Local robots.txt Configuration\n');
  console.log('='.repeat(70));
  
  try {
    const robotsResult = await fetchRobotsTxt(port);
    const ogResult = await testOGImageAccess(port);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 Final Test Summary:');
    console.log(`   robots.txt allows /api/og: ${robotsResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   OG image endpoint accessible: ${ogResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (robotsResult.success && ogResult.success) {
      console.log('\n✅ All tests passed! Ready to deploy.');
      console.log('\n💡 After deployment, clear social media caches:');
      console.log('   - Facebook: https://developers.facebook.com/tools/debug/');
      console.log('   - Twitter: https://cards-dev.twitter.com/validator');
      console.log('   - LinkedIn: https://www.linkedin.com/post-inspector/');
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

