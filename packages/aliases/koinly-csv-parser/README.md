<div align="center">

# Pocket Portfolio
### The Local-First Investment Tracker

[![Founder's Club](https://img.shields.io/badge/UK%20FOUNDER'S%20CLUB-42%2F50%20Left-red?style=for-the-badge&logo=github&labelColor=black)](https://www.pocketportfolio.app/sponsor?ref=readme_badge)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dw/@pocket-portfolio/koinly-csv-parser?style=for-the-badge&color=orange)](https://www.npmjs.com/package/@pocket-portfolio/koinly-csv-parser)

<p align="center">
  <b>🚨 LAUNCH SPECIAL:</b> <a href="https://www.pocketportfolio.app/sponsor?ref=readme_text">Join the UK Founder's Club</a> before Batch 1 sells out.
</p>

</div>

---

# koinly-csv-parser

Parse Koinly CSV exports into normalized format

## Installation

```bash
npm install @pocket-portfolio/koinly-csv-parser
```

## Usage

```javascript
import { parseCSV } from '@pocket-portfolio/koinly-csv-parser';

const file = // ... File object
const result = await parseCSV(file, 'en-US');

console.log(`Parsed ${result.trades.length} trades`);
```

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

