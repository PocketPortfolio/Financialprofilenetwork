# @pocket-portfolio/universal-csv-importer

Parse **any** broker CSV with **Smart Mapping** – no broker-specific adapter required.

Import trading history from any CSV (unknown broker, custom export, or spreadsheet) by mapping columns once. Heuristic-based mapping works out of the box; no API keys needed.

## Installation

```bash
npm install @pocket-portfolio/universal-csv-importer
```

## Usage

### Quick: parse with automatic column inference

```javascript
const { parseUniversal } = require('@pocket-portfolio/universal-csv-importer');

const file = /* File or { name, arrayBuffer, ... } */;
const result = await parseUniversal(file, 'en-US');

if (result.trades) {
  console.log(`Parsed ${result.trades.length} trades`);
} else {
  // result.type === 'REQUIRES_MAPPING' – show UI to confirm/edit column mapping
  console.log('Headers:', result.headers);
  console.log('Proposed mapping:', result.proposedMapping);
  // Then call genericParse(result.rawCsvText, userMapping, 'en-US') with final mapping
}
```

### With explicit column mapping

```javascript
const { genericParse } = require('@pocket-portfolio/universal-csv-importer');

const csvText = 'Date,Symbol,Action,Qty,Price\n...';
const mapping = {
  date: 'Date',
  ticker: 'Symbol',
  action: 'Action',
  quantity: 'Qty',
  price: 'Price',
};
const result = genericParse(csvText, mapping, 'en-US');
console.log(result.trades.length);
```

### Infer mapping only (for custom UIs)

```javascript
const { inferMapping } = require('@pocket-portfolio/universal-csv-importer');

const { mapping, confidence, source } = await inferMapping({
  headers: ['Date', 'Symbol', 'Type', 'Qty', 'Price'],
  sampleRows: [/* first few rows */],
});
// Use mapping in your UI; source is 'heuristic' or 'llm'
```

## Smart Mapping

- **Heuristics:** Built-in synonyms match common column names (Date, Symbol, Action, Qty, Price, etc.) so most CSVs map automatically.
- **Optional LLM:** When used inside an app that provides an LLM endpoint, low-confidence cases can be improved; the package works without it.

## Types (TypeScript)

For `UniversalMapping`, `RequiresMappingResult`, `StandardField`, etc., use the core package:

```ts
import type { UniversalMapping, RequiresMappingResult } from '@pocket-portfolio/importer';
```

## Related

- [@pocket-portfolio/importer](https://www.npmjs.com/package/@pocket-portfolio/importer) – Core library (broker-specific parsers + universal API)
- [Pocket Portfolio](https://www.pocketportfolio.app) – Free portfolio tracker

## Support the project

This package is **100% free and open-source**.

**[Support the work → pocketportfolio.app/sponsor](https://www.pocketportfolio.app/sponsor)**

## License

MIT
