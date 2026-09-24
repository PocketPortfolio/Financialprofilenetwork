/**
 * Pocket → Open permanent redirects (host-scoped in next.config.js).
 *
 * SSOT for which B2B paths leave Pocket. Must stay in lockstep with
 * `OPEN_ALIAS_ROUTES` in lib/canonical-claims.ts — exclude only `/press`
 * (consumer media hub stays on Pocket). Unit test enforces the sync.
 *
 * @type {readonly string[]}
 */
const OPEN_ALIAS_POCKET_TO_OPEN_PATHS = Object.freeze([
  '/architecture',
  '/designchallenge',
  '/tier1designpartner',
  '/board-of-investors',
  '/sovereign-ai-grant',
  '/learn/sovereign-stack',
  '/learn/sovereign-finance',
  '/learn/local-first',
  '/learn/vendor-lock-in',
  '/learn/sovereign-ai-architecture',
  '/learn/dora-eu-ai-act-wealth',
  '/learn/stateless-edge-ingestion',
  '/learn/enterprise-design-partnership',
  '/learn/ai-in-wealth-management',
  '/learn/ai-for-financial-advisors',
  '/learn/edge-ingestion-vs-warehouse',
  '/learn/open-portfolio-vs-portfolio-data-api',
  '/learn/open-portfolio-vs-plaid',
  '/playbooks/sovereign-strike',
  '/openbrokercsv',
  '/static/csv-etoro-to-openbrokercsv',
  '/static/portfolio-tracker',
  '/static/why-we-are-fast',
  '/stack-reveal',
  '/press/abba-lawal',
  '/sponsor',
  '/learn',
  '/privacy',
  '/terms',
]);

/** Paths in OPEN_ALIAS_ROUTES that intentionally stay on Pocket (no 301). */
const OPEN_ALIAS_POCKET_RETAINED_PATHS = Object.freeze(['/press']);

module.exports = {
  OPEN_ALIAS_POCKET_TO_OPEN_PATHS,
  OPEN_ALIAS_POCKET_RETAINED_PATHS,
};
