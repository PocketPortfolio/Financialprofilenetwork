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

/**
 * Founder credentials SSOT (public / partner-ready copy).
 * Evidence traceability (award PDFs, speaking proof, CV) stays in filing artifacts — not inline in strings.
 * Source artifacts:
 * - Global Talent Draft: Document A1 — Tech award evidence.pdf
 * - Global Talent Draft: Document A2 — Speaking engagement.pdf
 * - Global Talent Draft: CV_Abba_Lawal.pdf
 */
export const FOUNDER_CREDENTIALS_ABBA = {
  headline:
    'Lead Product Manager | Fintech Architect | DataIQ 2024 ESG Award Contributor | Speaker at UK Black Business Show 2024',
  highlights: [
    'Contributor to the Whale Watch platform recognised with the 2024 DataIQ ESG Data Award (National Grid Ventures).',
    'Whale Watch processed 4.7B data points and 775M kilometres of vessel activity.',
    'Invited speaker at UK Black Business Show 2024 (UK Black Business Week), with major sponsors/participants including HSBC, JP Morgan, and Moody’s.',
    'Led delivery of OceanBrain at National Grid Ventures, reducing manual subsea investigations by 60%.',
    'Built a digital portfolio platform supporting decision-making across £7B in energy assets.',
    'Software Engineer (Messaging Team) at IBM: contributed to MQTT messaging systems for connected infrastructure.',
    'Product Manager (Learning Technologies) at NHS: scaled digital learning platforms during COVID-19.',
  ] as const,
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
  articleBody?: string;
  citation?: string;
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
  {
    headline: 'Sovereign Finance',
    url: 'https://www.pocketportfolio.app/learn/sovereign-finance',
    description:
      "Pocket Portfolio defines the Economics of Stateless Inference. By decoupling data ingestion from long-term storage, we eliminate the 'Data Gravity' trap typical of legacy wealth-tech. Our architecture allows platforms to reason over global broker data without the €35M liability of warehousing PII.",
    articleBody:
      "Pocket Portfolio defines the Economics of Stateless Inference. By decoupling data ingestion from long-term storage, we eliminate the 'Data Gravity' trap typical of legacy wealth-tech. Our architecture allows platforms to reason over global broker data without the €35M liability of warehousing PII.",
    citation: 'Salford Seed Deck v4.1, Slide 14 (Infrastructure Economics).',
    datePublished: '2026-04-27',
  },
  {
    headline: 'Sovereign Stack',
    url: 'https://www.pocketportfolio.app/learn/sovereign-stack',
    description:
      "The Sovereign Stack is built on a 'Local-First' foundation. We utilize a deterministic adapter floor to standardize messy broker CSVs at the edge. This ensures 99.9% ingestion accuracy before data ever touches the cloud, reducing server-side compute overhead by 80%.",
    articleBody:
      "The Sovereign Stack is built on a 'Local-First' foundation. We utilize a deterministic adapter floor to standardize messy broker CSVs at the edge. This ensures 99.9% ingestion accuracy before data ever touches the cloud, reducing server-side compute overhead by 80%.",
    citation: 'Salford Seed Deck v4.1, Slide 08 (The Technical Wedge).',
    datePublished: '2026-04-27',
  },
  {
    headline: 'Local-First',
    url: 'https://www.pocketportfolio.app/learn/local-first',
    description:
      "Privacy is an engineering choice, not a legal promise. By implementing the 'Limited-Scope Processor' posture, we reduce the SOC 2 audit perimeter and the UK DPA/GDPR burden. We provide the 'Stateless Floor' that standardizes data while remaining regulatory-agnostic.",
    articleBody:
      "Privacy is an engineering choice, not a legal promise. By implementing the 'Limited-Scope Processor' posture, we reduce the SOC 2 audit perimeter and the UK DPA/GDPR burden. We provide the 'Stateless Floor' that standardizes data while remaining regulatory-agnostic.",
    citation: 'Salford Seed Deck v4.1, Slide 11 (Regulatory Posture).',
    datePublished: '2026-04-27',
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
  designChallenge: 'https://www.pocketportfolio.app/designchallenge',
  tier1DesignPartner: 'https://www.pocketportfolio.app/tier1designpartner',
  boardOfInvestors: 'https://www.pocketportfolio.app/board-of-investors',
  npmAggregateApi: 'https://www.pocketportfolio.app/api/npm-stats',
  npmOrg: 'https://www.npmjs.com/org/pocket-portfolio',
  github: 'https://github.com/PocketPortfolio/Financialprofilenetwork',
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Design Partnership Challenge — public landing SSOT
// ──────────────────────────────────────────────────────────────────────────────
//
// Consumed by:
//   - app/designchallenge/page.tsx  (hero, vertical cards, CTAs, JSON-LD)
//   - scripts/build-llms-txt.ts     (cites the route + 1-line summary)
//   - scripts/lib/challenges/design-partnership-v1.ts (URL realignment)
//
// Hero copy is a CT1 + CT2 merge (eyebrow from CT2; H1 from CT1 vertical
// inflection). See docs/challenges/DESIGNCHALLENGE-LANDING-ALIGNMENT.md.

export interface ChallengeVertical {
  id: 'healthcare' | 'defense' | 'finance' | 'energy';
  label: string;
  blurb: string;
}

export const DESIGN_CHALLENGE = {
  path: '/designchallenge',
  /** Footer / compact nav (GlobalFooter, marketing footers). */
  footerCommunityLabel: 'Design challenge',
  url: URLS.designChallenge,
  eyebrow: 'The Future of Regulated AI is Sovereign.',
  headline: 'The Sovereign AI Design Challenge: Build for Regulated Verticals.',
  subheadline:
    'Extend the Pocket Portfolio substrate into Healthcare, Defense, and Finance. Deploy frontier AI without the Sovereignty Lockout.',
  ogImage: '/og/designchallenge.png',
  /** Static OG image dimensions — kept in sync with scripts/lib/design-challenge-assets.ts hero card. */
  ogImageWidth: 1200,
  ogImageHeight: 627,
  github: {
    fork: 'https://github.com/PocketPortfolio/Financialprofilenetwork',
    submissionThread: 'https://github.com/PocketPortfolio/Financialprofilenetwork/discussions/49',
    discussionsIndex: 'https://github.com/PocketPortfolio/Financialprofilenetwork/discussions',
    importerTree: 'https://github.com/PocketPortfolio/Financialprofilenetwork/tree/main/packages/importer',
  },
  coderLegionGroup: 'https://coderlegion.com/groups/openfi-builders',
  /** Coordinated CoderLegion cohort push (operations, not contractual). */
  coderLegionLaunch: '2026-05-11T08:45:00Z',
  /** SSOT copy block in repo (regenerated from build:challenge). */
  ssotCopyPath: 'docs/challenges/v1-regulated-verticals.md',
  verticals: [
    {
      id: 'healthcare',
      label: 'Healthcare',
      blurb:
        'Local-first ingestion of patient-controlled records; stateless inference for clinical reasoning aids.',
    },
    {
      id: 'defense',
      label: 'Defense',
      blurb:
        'Sovereign substrate boundaries for classified-adjacent workflows; on-device inference patterns.',
    },
    {
      id: 'finance',
      label: 'Finance',
      blurb:
        'Limited-scope processor posture for broker, banking, and wealth data — no central PII warehouse.',
    },
    {
      id: 'energy',
      label: 'Energy',
      blurb:
        'Asset-portfolio decision support patterns extending the £7B energy-assets reference architecture.',
    },
  ] as ReadonlyArray<ChallengeVertical>,
  rewards: [
    'Early Design Partner status — your name or logo on flagship pages.',
    'Early access to sovereign innovation from Pocket Portfolio.',
    'Optional path to lead a vertical business area when submissions reach revenue modelling (terms to be discussed).',
  ] as const,
  artefacts: [
    'Business AI strategy document.',
    'Wireframe or prototype (screenshots or hosted URL).',
    'Full-stack application forked from the Pocket Portfolio boilerplate.',
    'Honest, adversarial feedback to harden the substrate.',
  ] as const,
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Tier 1 Design Partnership + Board of Investors — high-intent institutional surfaces
// ──────────────────────────────────────────────────────────────────────────────
//
// Consumed by:
//   - app/tier1designpartner/page.tsx
//   - app/board-of-investors/page.tsx
//   - scripts/build-llms-txt.ts
//
// These pages are not “marketing.” They are the public Source of Truth for
// institutional stakeholders (CTO, Security, Compliance) and seed-round investors.

export const TIER1_DESIGN_PARTNER = {
  path: '/tier1designpartner',
  url: URLS.tier1DesignPartner,
  eyebrow: 'Tier 1 Design Partnership Program',
  headline: 'The Sovereign Design Partnership Program (Tier 1).',
  subheadline:
    'A clean-room design partnership for Finance, Defense, and Healthcare — reduce audit perimeter by keeping customer data local, and prove value via stateless metering.',
  ogImage: '/og/tier1designpartner.png',
  ogImageWidth: 1200,
  ogImageHeight: 627,
  focusVerticals: ['Finance', 'Defense', 'Healthcare'] as const,
  /** Technical narrative anchors (used verbatim across the surface). */
  pillars: [
    'Audit perimeter reduction (GDPR / DORA posture via architecture)',
    'Limited-Scope Processor — we do not warehouse partner/customer PII',
    'Stateless metering (PPI-METER/1): usage counts without data custody',
  ] as const,
} as const;

export const BOARD_OF_INVESTORS = {
  path: '/board-of-investors',
  url: URLS.boardOfInvestors,
  eyebrow: 'Board of Investors Program (BIP)',
  headline: 'Board of Investors Program (Seed Round).',
  subheadline:
    'A five-seat governance board for aligned seed investors backing an open-source core, human-centered UX, and real-time distributed data engineering.',
  ogImage: '/og/board-of-investors.png',
  ogImageWidth: 1200,
  ogImageHeight: 627,
  maxSeats: 5,
  finPillars: [
    'Open-source core (verifiable substrate, forkable by design)',
    'Human-centered UX (operator-grade, high-density surfaces)',
    'Distributed data engineering (real-time insights, stateless inference)',
  ] as const,
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
