#!/usr/bin/env node
/**
 * Script to verify OG image configuration
 * Run: node scripts/verify-og-image.js
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://www.pocketportfolio.app';
const OG_IMAGE_URL = `${PRODUCTION_URL}/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&t=20250123`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verifyOGImage() {
  console.log('🔍 Verifying OG Image Configuration...\n');
  
  try {
    // 1. Test OG image endpoint
    console.log('1. Testing OG image endpoint...');
    const imageResponse = await fetch(OG_IMAGE_URL);
    console.log(`   Status: ${imageResponse.status}`);
    console.log(`   Content-Type: ${imageResponse.headers['content-type']}`);
    
    if (imageResponse.status === 200 && imageResponse.headers['content-type']?.includes('image')) {
      console.log('   ✅ OG image endpoint is working\n');
    } else {
      console.log('   ❌ OG image endpoint failed\n');
      return;
    }
    
    // 2. Check homepage meta tags
    console.log('2. Checking homepage meta tags...');
    const homeResponse = await fetch(PRODUCTION_URL);
    const html = homeResponse.body;
    
    // Extract OG image meta tag
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    
    if (ogImageMatch) {
      const ogImageUrl = ogImageMatch[1];
      console.log(`   OG Image URL: ${ogImageUrl}`);
      
      if (ogImageUrl.includes('/api/og') && (ogImageUrl.includes('t=20250123') || ogImageUrl.includes('v=3') || ogImageUrl.includes('v=2'))) {
        console.log('   ✅ OG image meta tag is correct\n');
      } else {
        console.log('   ⚠️  OG image URL might be outdated\n');
      }
    } else {
      console.log('   ❌ OG image meta tag not found\n');
    }
    
    if (twitterImageMatch) {
      const twitterImageUrl = twitterImageMatch[1];
      console.log(`   Twitter Image URL: ${twitterImageUrl}`);
      
      if (twitterImageUrl.includes('/api/og') && (twitterImageUrl.includes('t=20250123') || twitterImageUrl.includes('v=3') || twitterImageUrl.includes('v=2'))) {
        console.log('   ✅ Twitter image meta tag is correct\n');
      } else {
        console.log('   ⚠️  Twitter image URL might be outdated\n');
      }
    } else {
      console.log('   ❌ Twitter image meta tag not found\n');
    }
    
    console.log('✅ Verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Clear social media caches:');
    console.log('      - Facebook: https://developers.facebook.com/tools/debug/');
    console.log('      - Twitter: https://cards-dev.twitter.com/validator');
    console.log('      - LinkedIn: https://www.linkedin.com/post-inspector/');
    console.log('   2. Test sharing the URL in a new browser/incognito window');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyOGImage();

