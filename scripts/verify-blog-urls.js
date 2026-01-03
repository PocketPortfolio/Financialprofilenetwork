/**
 * Blog URL Verification Script
 * Validates all blog post URLs to ensure they are accessible
 * 
 * Usage: node scripts/verify-blog-urls.js
 * 
 * NOTE: This script checks the URLs defined in app/lib/blog/articles.ts
 * Update the articles array there, then sync the URLs here for verification
 */

const https = require('https');
const http = require('http');

// Blog articles - keep in sync with app/lib/blog/articles.ts
const featuredArticles = [
  {
    title: "Price Pipeline Health — transparency you can see (and trust)",
    url: "https://dev.to/pocketportfolioapp/price-pipeline-health-transparency-you-can-see-and-trust-1m2f",
    platform: "dev.to"
  },
  {
    title: "Devlog: Building the Price Pipeline Health Card",
    url: "https://dev.to/pocketportfolioapp/devlog-building-the-price-pipeline-health-card-so-you-know-when-data-is-fresh-or-fallback-57p2",
    platform: "dev.to"
  },
  {
    title: "Designing a 'Never-0.00' Price Pipeline in the Real World",
    url: "https://coderlegion.com/5866/designing-a-never-0-00-price-pipeline-in-the-real-world",
    platform: "coderlegion"
  },
  {
    title: "OpenBrokerCSV v0.1 — let's standardise broker CSVs so everyone can build better tools",
    url: "https://coderlegion.com/5823/openbrokercsv-v0-1-lets-standardise-broker-csvs-so-everyone-can-build-better-tools",
    platform: "coderlegion"
  },
  {
    title: "DISCUSS: The 'Never 0.00' Challenge — design a resilient price pipeline",
    url: "https://coderlegion.com/5755/discuss-the-never-0-00-challenge-design-a-resilient-price-pipeline-client-edge-together",
    platform: "coderlegion"
  }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Pocket Portfolio Blog URL Validator'
      }
    };

    const req = client.request(options, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        accessible: res.statusCode >= 200 && res.statusCode < 400,
        error: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        accessible: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        accessible: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function verifyAllUrls() {
  console.log('🔍 Verifying blog post URLs...\n');
  
  const results = await Promise.all(
    featuredArticles.map(async (article) => {
      const result = await checkUrl(article.url);
      return {
        ...article,
        ...result
      };
    })
  );

  console.log('📊 Results:\n');
  
  let allValid = true;
  results.forEach((result) => {
    const status = result.accessible ? '✅' : '❌';
    console.log(`${status} [${result.platform}] ${result.title}`);
    console.log(`   URL: ${result.url}`);
    if (result.accessible) {
      console.log(`   Status: ${result.statusCode}`);
    } else {
      console.log(`   Error: ${result.error || 'Unknown error'}`);
      allValid = false;
    }
    console.log('');
  });

  if (allValid) {
    console.log('✅ All blog URLs are accessible!');
    process.exit(0);
  } else {
    console.log('❌ Some blog URLs are not accessible. Please verify and update URLs.');
    process.exit(1);
  }
}

verifyAllUrls().catch((error) => {
  console.error('Error verifying URLs:', error);
  process.exit(1);
});

