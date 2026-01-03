/**
 * Extract dev.to article URLs from profile page
 * This helps find the correct slugs for articles
 */

const https = require('https');

https.get('https://dev.to/pocketportfolioapp', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Find all article links
    const articleLinkRegex = /href="(\/pocketportfolioapp\/[^"]+)"/g;
    const matches = [];
    let match;
    
    while ((match = articleLinkRegex.exec(data)) !== null) {
      const url = 'https://dev.to' + match[1];
      if (!matches.includes(url)) {
        matches.push(url);
      }
    }
    
    console.log('Found article URLs:');
    matches.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    // Also search for article titles to match them
    const titleRegex = /<h2[^>]*>.*?<a[^>]*href="(\/pocketportfolioapp\/[^"]+)"[^>]*>(.*?)<\/a>/gs;
    const titleMatches = [];
    let titleMatch;
    
    while ((titleMatch = titleRegex.exec(data)) !== null) {
      titleMatches.push({
        url: 'https://dev.to' + titleMatch[1],
        title: titleMatch[2].replace(/<[^>]+>/g, '').trim()
      });
    }
    
    console.log('\nArticles with titles:');
    titleMatches.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.url}\n`);
    });
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});


















