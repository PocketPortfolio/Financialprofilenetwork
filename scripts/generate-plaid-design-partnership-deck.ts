/**
 * @deprecated Use `npm run build:partner-deck -- --partner=plaid` (single implementation path).
 * Kept so existing CI/docs/scripts that call this entry continue to work.
 */
import { runDesignPartnershipDeck } from './lib/design-partnership-deck';

void runDesignPartnershipDeck('plaid').catch((e) => {
  console.error(e);
  process.exit(1);
});
