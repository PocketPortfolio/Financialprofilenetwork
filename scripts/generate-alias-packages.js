const fs = require('fs');
const path = require('path');

const ALIASES = [
  {
    name: 'robinhood-csv-parser',
    description: 'Parse Robinhood CSV exports into normalized format',
    keywords: ['robinhood', 'csv', 'parser', 'portfolio', 'finance']
  },
  {
    name: 'etoro-history-importer',
    description: 'Import eToro transaction history from CSV',
    keywords: ['etoro', 'csv', 'importer', 'portfolio', 'finance']
  },
  {
    name: 'trading212-to-json',
    description: 'Convert Trading212 CSV exports to JSON format',
    keywords: ['trading212', 'csv', 'json', 'converter', 'portfolio']
  },
  {
    name: 'fidelity-csv-export',
    description: 'Parse Fidelity CSV exports for portfolio tracking',
    keywords: ['fidelity', 'csv', 'export', 'parser', 'portfolio']
  },
  {
    name: 'coinbase-transaction-parser',
    description: 'Parse Coinbase transaction history from CSV',
    keywords: ['coinbase', 'crypto', 'csv', 'parser', 'transactions']
  },
  {
    name: 'koinly-csv-parser',
    description: 'Parse Koinly CSV exports into normalized format',
    keywords: ['koinly', 'crypto', 'tax', 'csv', 'parser', 'portfolio', 'finance']
  },
  {
    name: 'turbotax-csv-parser',
    description: 'Parse TurboTax Universal Gains CSV exports into normalized format',
    keywords: ['turbotax', 'tax', 'csv', 'parser', 'portfolio', 'finance', 'intuit']
  },
  {
    name: 'ghostfolio-csv-parser',
    description: 'Parse Ghostfolio CSV exports into normalized format',
    keywords: ['ghostfolio', 'portfolio', 'tracker', 'csv', 'parser', 'finance']
  },
  {
    name: 'sharesight-csv-parser',
    description: 'Parse Sharesight CSV exports into normalized format',
    keywords: ['sharesight', 'portfolio', 'tracker', 'csv', 'parser', 'finance', 'tax']
  }
];

function generatePackage(pkg) {
  const dir = path.join(__dirname, '../packages/aliases', pkg.name);
  
  // Create directory
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // package.json
  const packageJson = {
    name: `@pocket-portfolio/${pkg.name}`,
    version: '1.0.6',
    description: `${pkg.description}. Free & open-source. Support: pocketportfolio.app/sponsor`,
    main: 'index.js',
    scripts: {
      postinstall: 'node -e "console.log(\'Support the work: pocketportfolio.app/sponsor\')"'
    },
    keywords: pkg.keywords,
    author: 'Pocket Portfolio',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/PocketPortfolio/Financialprofilenetwork.git',
      directory: `packages/aliases/${pkg.name}`
    },
    dependencies: {
      '@pocket-portfolio/importer': '^1.0.6'
    },
    homepage: 'https://www.pocketportfolio.app',
    bugs: {
      url: 'https://github.com/PocketPortfolio/Financialprofilenetwork/issues'
    },
    publishConfig: {
      access: 'public'
    }
  };
  
  // index.js - Re-export core library
  const indexJs = `/**
 * ${pkg.description}
 * 
 * This package is a lightweight wrapper around @pocket-portfolio/importer
 * for ${pkg.name.replace(/-/g, ' ')}.
 * 
 * @example
 * \`\`\`javascript
 * import { parseCSV } from '@pocket-portfolio/${pkg.name}';
 * 
 * const result = await parseCSV(file, 'en-US');
 * console.log(\`Parsed \${result.trades.length} trades\`);
 * \`\`\`
 */

// Re-export everything from core importer
module.exports = require('@pocket-portfolio/importer');
`;

  // README.md
  const readme = `# ${pkg.name}

${pkg.description}

## Installation

\`\`\`bash
npm install @pocket-portfolio/${pkg.name}
\`\`\`

## Usage

\`\`\`javascript
import { parseCSV } from '@pocket-portfolio/${pkg.name}';

const file = // ... File object
const result = await parseCSV(file, 'en-US');

console.log(\`Parsed \${result.trades.length} trades\`);
\`\`\`

## Visualize Your Data

After parsing, visualize your portfolio instantly at [pocketportfolio.app](https://www.pocketportfolio.app) - no signup required!

## Support the Project

This package is **100% free and open-source**. Help us keep the servers running:

**[Support the work → pocketportfolio.app/sponsor](https://www.pocketportfolio.app/sponsor)**

Every contribution helps us maintain and improve this tool for the community.

## Related

- [@pocket-portfolio/importer](https://www.npmjs.com/package/@pocket-portfolio/importer) - Core library
- [Pocket Portfolio](https://www.pocketportfolio.app) - Free portfolio tracker

## License

MIT
`;

  // Write files
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(path.join(dir, 'index.js'), indexJs);
  fs.writeFileSync(path.join(dir, 'README.md'), readme);
  
  console.log(`✅ Generated ${pkg.name}`);
}

// Generate all packages
console.log('Generating NPM alias packages...\n');
ALIASES.forEach(generatePackage);
console.log('\n✅ All alias packages generated!');
console.log('\nNext steps:');
console.log('1. cd packages/aliases/[package-name]');
console.log('2. npm publish --access public');

