/**
 * Fetch dev.to articles using the public API
 * This will get the correct URLs and slugs
 */

const https = require('https');

https.get('https://dev.to/api/articles?username=pocketportfolioapp', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const articles = JSON.parse(data);
      
      console.log(`Found ${articles.length} articles:\n`);
      
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Published: ${article.published_at}`);
        console.log('');
      });
      
      // Find our specific articles
      console.log('\n=== Matching Articles ===\n');
      
      const targetArticles = [
        'Price Pipeline Health',
        'Devlog: Building',
        'Never-0.00',
        'Never 0.00'
      ];
      
      articles.forEach((article) => {
        const title = article.title.toLowerCase();
        const matches = targetArticles.some(target => 
          title.includes(target.toLowerCase())
        );
        
        if (matches) {
          console.log(`✓ ${article.title}`);
          console.log(`  ${article.url}`);
          console.log('');
        }
      });
      
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});


















