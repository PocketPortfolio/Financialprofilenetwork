#!/usr/bin/env node
/**
 * One-shot migration: gate [DIVIDEND_DEBUG] logs and redact URL secrets.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'app/api/dividend/route.ts',
  'app/api/dividend/[ticker]/route.ts',
];

const importLine =
  "import { logDividendDebug, redactUrlForLog } from '@/app/lib/server/safe-log';\n";

for (const file of files) {
  let src = readFileSync(file, 'utf8');

  if (!src.includes("from '@/app/lib/server/safe-log'")) {
    src = src.replace(
      /^(import \{ NextRequest, NextResponse \} from 'next\/server';)\n/m,
      `$1\n${importLine}`,
    );
  }

  src = src.replace(
    /const keyPrefix = ALPHA_VANTAGE_API_KEY \? `\$\{ALPHA_VANTAGE_API_KEY\.substring\(0, 4\)\}\.\.\.` : 'NONE';\s*\n\s*/g,
    '',
  );

  src = src.replace(/\| Key_Used: \$\{keyPrefix\}/g, '| ApiKeyConfigured: true');
  src = src.replace(/Key_Used: \$\{keyPrefix\}/g, 'ApiKeyConfigured: true');

  src = src.replace(/console\.warn\(`\[DIVIDEND_DEBUG\]/g, 'logDividendDebug(`');
  src = src.replace(/console\.warn\('\[DIVIDEND_DEBUG\]/g, "logDividendDebug('");

  src = src.replace(
    /\$\{url\.substring\((\d+)(?:,\s*(\d+))?\)\}/g,
    (_, a, b) =>
      b !== undefined
        ? '${redactUrlForLog(url).substring(' + a + ', ' + b + ')}'
        : '${redactUrlForLog(url).substring(' + a + ')}',
  );

  src = src.replace(
    /URL: \$\{url\}/g,
    'URL: ${redactUrlForLog(url)}',
  );

  writeFileSync(file, src);
  console.log('Migrated', file);
}
