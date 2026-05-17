/**
 * Partner design partnership decks (PPTX + PDF).
 *
 * Usage:
 *   npm run build:partner-deck -- --partner=freetrade
 *   npm run build:partner-deck -- --partner=plaid
 */
import { runDesignPartnershipDeck, type PartnerDeckId } from './lib/design-partnership-deck';

function parsePartner(): PartnerDeckId {
  const argv = process.argv.slice(2);
  for (const a of argv) {
    const m = /^--partner=(.+)$/.exec(a);
    if (m) {
      const v = (m[1] || '').toLowerCase();
      if (v === 'freetrade' || v === 'plaid') return v;
      throw new Error(`Unknown --partner=${m[1]}. Use: plaid | freetrade`);
    }
  }
  throw new Error('Missing --partner=plaid or --partner=freetrade');
}

void runDesignPartnershipDeck(parsePartner()).catch((e) => {
  console.error(e);
  process.exit(1);
});
