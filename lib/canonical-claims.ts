/**
 * canonical-claims.ts — Single Source of Truth (SSOT) for Pocket Portfolio's
 * machine-readable identity. Every public surface (/press, /llms.txt, JSON-LD
 * blocks, profile bios) MUST source from here.
 *
 * Numeric snapshot rows resolve back to docs/seed/NUMBERS-PACK.md row IDs.
 * Live aggregate (npm downloads) is fetched at request time from /api/npm-stats
 * and is NOT mirrored here.
 *
 * Refresh discipline (Sovereign Threshold #4):
 *   LAST_HUMAN_VERIFIED must be within 30 days of any production build, or
 *   tests/canonical-claims.spec.ts will fail in CI.
 */

export const LAST_HUMAN_VERIFIED = '2026-04-26' as const;

// ──────────────────────────────────────────────────────────────────────────────
// Positioning
// ──────────────────────────────────────────────────────────────────────────────

export const POSITIONING = {
  /** Primary canonical phrasing — must appear verbatim on /press hero, deck Slide 01, llms.txt §Identity. */
  primary: 'The Sovereign Ingestion & Inference Layer.',
  /** Secondary semantic match for search/answer-engine intent queries. */
  secondary: 'The sovereign financial data layer.',
} as const;

export const TAGLINE_LONG =
  'Pocket Portfolio is the Sovereign Ingestion & Inference Layer for wealth-tech: a local-first import SDK plus stateless AI reasoning that lets platforms and operators reason over broker data without warehousing PII.';

// ──────────────────────────────────────────────────────────────────────────────
// Moat Claims — technical defensibility phrases (evidence-backed, audit-ready)
// ──────────────────────────────────────────────────────────────────────────────
//
// Each entry is a phrase authorised for verbatim use on high-authority off-platform
// surfaces (GitHub, npm, LinkedIn, press) where technical claim density matters
// for AEO/GEO entity disambiguation. Phrases must be backed by in-repo evidence
// so a third-party engineer can verify the claim within ~5 minutes of clone-and-grep.
//
// Authorised by Unified Command 2026-04-26 (Phase 2 charter ratification).
// Drift discipline: any change to a phrase or its evidenceRefs requires a
// corresponding bump of MoatClaim.asOf; tests/unit/moat-claims.spec.ts enforces
// evidenceRefs file-existence in CI.

export interface MoatClaim {
  /** Short canonical phrase — used verbatim on profile bios, package descriptions, headlines. */
  phrase: string;
  /** One-sentence longer form for About sections / OG descriptions. */
  longForm: string;
  /** In-repo file references whose existence/behaviour validates the claim. */
  evidenceRefs: ReadonlyArray<string>;
  /** External regulatory or standards references (optional, citation-grade). */
  externalRefs?: ReadonlyArray<string>;
  /** Date the phrase was last reviewed against the evidence. */
  asOf: string;
  /** Surfaces authorised for verbatim use of the phrase. */
  authorisedSurfaces: ReadonlyArray<
    'github' | 'npm' | 'linkedin' | 'coderlegion' | 'devto' | 'press' | 'llms.txt'
  >;
}

export const MOAT_CLAIMS: Readonly<Record<string, MoatClaim>> = {
  /**
   * Asserts Pocket Portfolio's stateless, minimum-data architecture:
   *   - Broker CSV/Excel parsing happens entirely in-browser (no upload).
   *   - AI inference is stateless via /api/ai/chat (no per-user persistence).
   *   - Client-side persistence (Zustand persist) is deliberately partialized
   *     to UI preferences only — broker positions and historical data are
   *     NOT persisted on disk and clear on tab close.
   * This matches GDPR Art. 4(8) "processor" positioning where scope is
   * technically limited by architecture rather than policy alone, and supports
   * the Art. 5(1)(c) data-minimisation principle.
   */
  limitedScopeProcessor: {
    phrase: 'Limited-Scope Processor',
    longForm:
      'A limited-scope processor architecture: broker data parses in-browser, never warehouses server-side, and AI inference runs stateless — minimising the per-user data footprint by design.',
    evidenceRefs: [
      'app/api/ai/chat/route.ts',
      'app/lib/store/portfolioStore.ts',
      'packages/importer/',
      'app/architecture/page.tsx',
    ],
    externalRefs: [
      'GDPR Art. 4(8) — definition of processor',
      'GDPR Art. 5(1)(c) — data-minimisation principle',
    ],
    asOf: LAST_HUMAN_VERIFIED,
    authorisedSurfaces: ['github', 'npm', 'linkedin', 'coderlegion', 'devto', 'press', 'llms.txt'],
  },
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Organization
// ──────────────────────────────────────────────────────────────────────────────

export const ORG = {
  name: 'Pocket Portfolio',
  legalName: 'Pocket Portfolio',
  /** Secondary canonical phrasing surfaced as schema:alternateName for AEO/GEO. */
  alternateName: POSITIONING.secondary,
  url: 'https://www.pocketportfolio.app',
  logo: 'https://www.pocketportfolio.app/icon-512.png',
  /** TRAC-11: production launch (soft anchor) — ISO 8601 (YYYY-MM-DD). */
  foundingDate: '2025-10-01',
  description: TAGLINE_LONG,
  sameAs: [
    'https://github.com/PocketPortfolio',
    'https://www.npmjs.com/org/pocket-portfolio',
    'https://www.linkedin.com/company/pocket-portfolio-community/',
    'https://coderlegion.com/user/Pocket+Portfolio',
    'https://dev.to/pocketportfolioapp',
  ],
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Founder (Person schema — institutional receipts only, per Command lock-in)
// ──────────────────────────────────────────────────────────────────────────────

export const PERSON_ABBA = {
  name: 'Abba Lawal',
  jobTitle: 'Head of AI & Community Ops, Pocket Portfolio',
  description:
    'Founder-engineer behind Pocket Portfolio. Previously Lead Product Manager at National Grid Ventures (2023–2025); engineering and product roles spanning IBM, NHS Digital, and Container Solutions. Contributor to the Whale Watch ESG platform (4.7B data points; 2024 DataIQ ESG Award).',
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'University of Stirling',
      url: 'https://www.stir.ac.uk/',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'University of Portsmouth',
      url: 'https://www.port.ac.uk/',
    },
  ],
  /** Institutional receipts only. Personal/contact data is intentionally excluded per Command lock-in (2026-04-26). */
  knowsAbout: [
    'Local-first software architecture',
    'Sovereign AI infrastructure',
    'Wealth-tech ingestion and broker-data parsing',
    'Stateless inference and PII minimisation',
    'UK/EU regulated AI deployment (GDPR Art. 83, EU AI Act Art. 99)',
  ],
  award: [
    'Whale Watch — 2024 DataIQ ESG Award (contributor, 4.7B data points)', // FND-03
    'UK Black Business Show 2024 — speaker', // FND-04
    'UK Global Talent visa — endorsed (Tech Nation track)',
  ],
  worksFor: 'Pocket Portfolio',
  sameAs: [
    'https://www.linkedin.com/in/abba-l-0395681b9/',
    'https://coderlegion.com/user/Pocket+Portfolio',
    'https://github.com/PocketPortfolio',
  ],
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// SDK + Packages (the substrate)
// ──────────────────────────────────────────────────────────────────────────────

export const SDK = {
  name: '@pocket-portfolio/importer', // SDK-01
  version: '1.1.0', // SDK-02
  license: 'MIT', // SDK-03
  /** SDK-04: 19+ broker adapters; floor anchored to in-repo registry test count. */
  brokerAdapterCount: 19,
  registry: 'https://www.npmjs.com',
  repo: 'https://github.com/PocketPortfolio/Financialprofilenetwork',
  homepage: 'https://www.pocketportfolio.app/architecture',
} as const;

/**
 * The eleven canonical npm packages that comprise the Sovereign Ingestion substrate.
 * Order MUST match `app/api/npm-stats/route.ts` so the live aggregate stays consistent.
 * Adapter aliases re-export the same core SDK under broker-discovery-friendly names.
 */
export const PACKAGES: ReadonlyArray<{
  name: string;
  category: 'core' | 'adapter';
  description: string;
}> = [
  {
    name: '@pocket-portfolio/importer',
    category: 'core',
    description:
      'Sovereign ingestion SDK: 19+ broker CSV/Excel adapters, local-first parsing, zero PII egress.',
  },
  {
    name: '@pocket-portfolio/fidelity-csv-export',
    category: 'adapter',
    description: 'Fidelity broker CSV export adapter — re-exports the core importer for discovery.',
  },
  {
    name: '@pocket-portfolio/coinbase-transaction-parser',
    category: 'adapter',
    description: 'Coinbase transaction-history parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/etoro-history-importer',
    category: 'adapter',
    description: 'eToro account-history importer — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/robinhood-csv-parser',
    category: 'adapter',
    description: 'Robinhood CSV parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/trading212-to-json',
    category: 'adapter',
    description: 'Trading 212 CSV → JSON normalizer — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/koinly-csv-parser',
    category: 'adapter',
    description: 'Koinly tax-export CSV parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/turbotax-csv-parser',
    category: 'adapter',
    description: 'TurboTax 1099-format CSV parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/ghostfolio-csv-parser',
    category: 'adapter',
    description: 'Ghostfolio CSV-format parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/sharesight-csv-parser',
    category: 'adapter',
    description: 'Sharesight CSV-export parser — re-exports the core importer.',
  },
  {
    name: '@pocket-portfolio/universal-csv-importer',
    category: 'adapter',
    description: 'Universal broker-agnostic CSV importer — re-exports the core importer.',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// NUMBERS_SNAPSHOT — frozen artifact-backed numeric receipts
// ──────────────────────────────────────────────────────────────────────────────
//
// Every row tags its NUMBERS-PACK ID (e.g. TRAC-01) so the resolution-rule test
// can verify each numeric public claim resolves back to a primary artifact.

export interface SnapshotRow {
  /** Display label for human surfaces (press page, llms.txt). */
  label: string;
  /** The numeric or string value as it appears on public surfaces. */
  value: number | string;
  /** NUMBERS-PACK row ID (e.g. TRAC-01, REG-03). Mandatory — used by resolution test. */
  numbersPackRowId: string;
  /** Date the row was last sourced from the primary artifact. */
  asOf: string;
}

export const NUMBERS_SNAPSHOT: ReadonlyArray<SnapshotRow> = [
  {
    label: 'Aggregate all-time downloads · 11 @pocket-portfolio/* packages',
    value: 9389,
    numbersPackRowId: 'TRAC-01',
    asOf: '2026-04-20',
  },
  {
    label: 'Aggregate last-30-day downloads',
    value: 484,
    numbersPackRowId: 'TRAC-02',
    asOf: '2026-04-20',
  },
  {
    label: 'GA4 Monthly Active Users · 28-day window',
    value: 4669,
    numbersPackRowId: 'TRAC-07',
    asOf: '2026-04-20',
  },
  {
    label: 'Google Search Console impressions · 3-month window',
    value: 176_000,
    numbersPackRowId: 'TRAC-09',
    asOf: '2026-04-20',
  },
  {
    label: 'Orchestrated content-engine entries · 3 calendars · 246 published / 576 queued',
    value: 822,
    numbersPackRowId: 'TRAC-12',
    asOf: '2026-04-24',
  },
  {
    label: 'Production launch · soft anchor',
    value: 'October 2025',
    numbersPackRowId: 'TRAC-11',
    asOf: '2026-04-20',
  },
  {
    label: 'Broker adapter floor in @pocket-portfolio/importer',
    value: 19,
    numbersPackRowId: 'SDK-04',
    asOf: '2026-04-20',
  },
  {
    label: 'GDPR Art. 83(5) maximum administrative fine',
    value: '€20M or 4% of worldwide annual turnover',
    numbersPackRowId: 'REG-01',
    asOf: '2026-04-20',
  },
  {
    label: 'EU AI Act Art. 99 Tier 1 maximum fine',
    value: '€35M or 7% of worldwide annual turnover',
    numbersPackRowId: 'REG-03',
    asOf: '2026-04-20',
  },
  {
    label: 'IBM Cost-of-a-Data-Breach 2025 · Financial Services vertical',
    value: '£4.45M (~$5.56M USD)',
    numbersPackRowId: 'CODB-01',
    asOf: '2026-04-20',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Articles (canonical owned content for AEO citation)
// ──────────────────────────────────────────────────────────────────────────────

export interface CanonicalArticle {
  headline: string;
  url: string;
  description: string;
  datePublished: string;
}

export const CANONICAL_ARTICLES: ReadonlyArray<CanonicalArticle> = [
  {
    headline: 'The architecture of sovereign intelligence',
    url: 'https://www.pocketportfolio.app/architecture',
    description:
      'Plain-language map of how Pocket Portfolio combines local-first storage, optional sync, and bounded AI so search engines and answer engines can quote us accurately.',
    datePublished: '2026-03-15',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Public URL constants
// ──────────────────────────────────────────────────────────────────────────────

export const URLS = {
  home: 'https://www.pocketportfolio.app',
  architecture: 'https://www.pocketportfolio.app/architecture',
  press: 'https://www.pocketportfolio.app/press',
  personAbba: 'https://www.pocketportfolio.app/press/abba-lawal',
  privacy: 'https://www.pocketportfolio.app/privacy',
  blog: 'https://www.pocketportfolio.app/blog',
  npmAggregateApi: 'https://www.pocketportfolio.app/api/npm-stats',
  npmOrg: 'https://www.npmjs.com/org/pocket-portfolio',
  github: 'https://github.com/PocketPortfolio/Financialprofilenetwork',
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Sovereign Thresholds (machine-checked invariants — see tests/canonical-claims.spec.ts)
// ──────────────────────────────────────────────────────────────────────────────

export const SOVEREIGN_THRESHOLDS = {
  /** #1 — One-liner discipline: primary or secondary appears verbatim on every public substrate. */
  oneLinerCandidates: [POSITIONING.primary, POSITIONING.secondary] as const,
  /** #2 — Signal floor: minimum claims the substrate must publish. */
  minPackages: 11,
  minBrokerAdapters: 19,
  /** #3 — Resolution rule: every NUMBERS_SNAPSHOT row must carry a NUMBERS-PACK row ID. */
  numbersPackIdPattern: /^[A-Z]+-\d+[a-z]?$/,
  /** #4 — Recency rule: LAST_HUMAN_VERIFIED must be within this window before a production build. */
  maxAgeDays: 30,
} as const;
