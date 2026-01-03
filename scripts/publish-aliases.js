const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packages = [
  'robinhood-csv-parser',
  'etoro-history-importer',
  'trading212-to-json',
  'fidelity-csv-export',
  'coinbase-transaction-parser'
];

console.log('🚀 Publishing NPM alias packages...\n');

packages.forEach((pkgName, index) => {
  const pkgPath = path.join(__dirname, '../packages/aliases', pkgName);
  
  if (!fs.existsSync(pkgPath)) {
    console.error(`❌ Package directory not found: ${pkgPath}`);
    return;
  }
  
  console.log(`[${index + 1}/${packages.length}] Publishing ${pkgName}...`);
  
  try {
    // Change to package directory and publish
    process.chdir(pkgPath);
    
    // Run npm publish
    execSync('npm publish --access public', {
      stdio: 'inherit',
      cwd: pkgPath
    });
    
    console.log(`✅ Successfully published ${pkgName}\n`);
  } catch (error) {
    console.error(`❌ Failed to publish ${pkgName}:`, error.message);
    console.log('   Make sure you are logged in: npm login\n');
  }
  
  // Return to original directory
  process.chdir(__dirname);
});

console.log('✨ Publishing complete!');



