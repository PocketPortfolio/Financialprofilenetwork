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

export const LAST_HUMAN_VERIFIED = '2026-09-21' as const;

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
    'UK Global Talent visa — pending (Tech Nation track)',
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
  version: '1.1.4', // SDK-02 — keep in sync with packages/importer/package.json
  license: 'MIT', // SDK-03
  /** SDK-04: 19 dedicated broker adapters; floor anchored to in-repo registry. */
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
      'Sovereign ingestion SDK: 19 dedicated broker CSV/Excel adapters, local-first parsing, no raw-ledger warehouse on the inference path.',
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
      "Privacy is an engineering choice, not a legal promise. The 'Limited-Scope Processor' posture shrinks what a third party must hold — an inspectable control that supports diligence, not a certification claim. We provide the 'Stateless Floor' that standardizes data while remaining regulatory-agnostic.",
    articleBody:
      "Privacy is an engineering choice, not a legal promise. The 'Limited-Scope Processor' posture shrinks what a third party must hold — an inspectable control that supports diligence, not a certification claim. We provide the 'Stateless Floor' that standardizes data while remaining regulatory-agnostic.",
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
  /** Buyer-canonical hub (Open Portfolio); Pocket aliases via OPEN_ALIAS_ROUTES. */
  designChallenge: 'https://www.openportfolio.co.uk/designchallenge',
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
  eyebrow: 'Wealth-tech design partnership',
  headline: 'The Open Portfolio design partnership for wealth-tech BYOC.',
  subheadline:
    'A clean-room design partnership for regulated wealth platforms — reduce audit perimeter by keeping client ledgers inside the buyer’s approved environment, and prove value via a bounded, stateless inference boundary.',
  ogImage: '/og/tier1designpartner.png',
  ogImageWidth: 1200,
  ogImageHeight: 627,
  focusVerticals: ['Wealth platforms', 'IFAs & wealth managers', 'Aggregators', 'Enterprise SDK'] as const,
  /** Technical narrative anchors (used verbatim across the surface). */
  pillars: [
    'Audit perimeter reduction (GDPR / DORA posture via architecture)',
    'Limited-Scope Processor — we do not warehouse partner/customer PII',
    'Roadmap: stateless usage attestation (PPI-METER/1 vocabulary — not asserted as shipped in-repo)',
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

// ──────────────────────────────────────────────────────────────────────────────
// Dual-Surface Bifurcation (CEO mandate 2026-05-15) — Pocket (P.) vs Open (O.)
// ──────────────────────────────────────────────────────────────────────────────
//
// Pocket Portfolio (P.) serves wealth managers and high-value investors on
// www.pocketportfolio.app. Open Portfolio (O.) serves developers, CTOs, and
// enterprise bank procurement teams on www.openportfolio.co.uk. Both surfaces
// share this monorepo; host-aware middleware forks the route group at request
// time. Per CEO directive: B2C paywall structures are unchanged.
//
// Existing POSITIONING / ORG / URLS exports are preserved for back-compat —
// the surface map below is purely additive.

export type Surface = 'pocket' | 'open';

/** Surface-aware positioning. P. talks to wealth managers; O. talks to infrastructure buyers. */
export const SURFACE_POSITIONING: Readonly<Record<Surface, { primary: string; secondary: string }>> = {
  pocket: {
    primary: 'The local-first wealth terminal for advisors and high-value investors.',
    secondary: 'Private portfolio analytics. Your ledger never leaves your device.',
  },
  open: {
    primary: POSITIONING.primary,
    secondary: POSITIONING.secondary,
  },
} as const;

/** Surface-aware organization metadata for JSON-LD, OG, and llms.txt rendering. */
export const SURFACE_ORG: Readonly<Record<Surface, {
  name: string;
  legalName: string;
  alternateName: string;
  url: string;
  logo: string;
  description: string;
}>> = {
  pocket: {
    name: ORG.name,
    legalName: ORG.legalName,
    alternateName: SURFACE_POSITIONING.pocket.secondary,
    url: ORG.url,
    logo: ORG.logo,
    description:
      'Pocket Portfolio is the local-first wealth terminal for advisors and high-value investors. Broker data parses in-browser and never leaves the device.',
  },
  open: {
    name: 'Open Portfolio',
    legalName: 'Open Portfolio',
    alternateName: SURFACE_POSITIONING.open.secondary,
    url: 'https://www.openportfolio.co.uk',
    logo: 'https://www.openportfolio.co.uk/brand/op-monogram-amber.png',
    description: TAGLINE_LONG,
  },
} as const;

/** Open Portfolio canonical URL constants. Mirrors the pocket-facing URLS where appropriate. */
export const OPEN_URLS = {
  home: 'https://www.openportfolio.co.uk',
  architecture: 'https://www.openportfolio.co.uk/architecture',
  designChallenge: 'https://www.openportfolio.co.uk/designchallenge',
  tier1DesignPartner: 'https://www.openportfolio.co.uk/tier1designpartner',
  boardOfInvestors: 'https://www.openportfolio.co.uk/board-of-investors',
  sovereignAiGrant: 'https://www.openportfolio.co.uk/sovereign-ai-grant',
  sovereignStack: 'https://www.openportfolio.co.uk/learn/sovereign-stack',
  sovereignFinance: 'https://www.openportfolio.co.uk/learn/sovereign-finance',
  localFirst: 'https://www.openportfolio.co.uk/learn/local-first',
  vendorLockIn: 'https://www.openportfolio.co.uk/learn/vendor-lock-in',
  sovereignAiArchitecture: 'https://www.openportfolio.co.uk/learn/sovereign-ai-architecture',
  doraEuAiActWealth: 'https://www.openportfolio.co.uk/learn/dora-eu-ai-act-wealth',
  statelessEdgeIngestion: 'https://www.openportfolio.co.uk/learn/stateless-edge-ingestion',
  enterpriseDesignPartnership: 'https://www.openportfolio.co.uk/learn/enterprise-design-partnership',
  sovereignStrike: 'https://www.openportfolio.co.uk/playbooks/sovereign-strike',
  openBrokerCsv: 'https://www.openportfolio.co.uk/openbrokercsv',
  etoroToOpenBrokerCsv: 'https://www.openportfolio.co.uk/static/csv-etoro-to-openbrokercsv',
  portfolioTracker: 'https://www.openportfolio.co.uk/static/portfolio-tracker',
  whyWeAreFast: 'https://www.openportfolio.co.uk/static/why-we-are-fast',
  stackReveal: 'https://www.openportfolio.co.uk/stack-reveal',
  press: 'https://www.openportfolio.co.uk/press',
  personAbba: 'https://www.openportfolio.co.uk/press/abba-lawal',
  sponsor: 'https://www.openportfolio.co.uk/sponsor',
  learnHub: 'https://www.openportfolio.co.uk/learn',
  privacy: 'https://www.openportfolio.co.uk/privacy',
  terms: 'https://www.openportfolio.co.uk/terms',
  llmsTxt: 'https://www.openportfolio.co.uk/llms.txt',
  sitemap: 'https://www.openportfolio.co.uk/sitemap.xml',
} as const;

/** Institutional architecture briefs — primary Open /learn hub (CTO/CISO-facing). */
export const OPEN_INSTITUTIONAL_PILLARS = [
  {
    slug: 'sovereign-ai-architecture',
    title: 'Sovereign AI Architecture & Data Perimeters',
    summary:
      'Local-first ingestion, stateless inference, and architectural data perimeters for wealth-tech platforms that cannot warehouse client ledgers.',
    category: 'Architecture',
    url: OPEN_URLS.sovereignAiArchitecture,
  },
  {
    slug: 'dora-eu-ai-act-wealth',
    title: 'DORA & EU AI Act for Wealth Management',
    summary:
      'Operational resilience and AI governance mapped to edge ingestion — reduce ICT blast radius without a central data lake.',
    category: 'Compliance',
    url: OPEN_URLS.doraEuAiActWealth,
  },
  {
    slug: 'stateless-edge-ingestion',
    title: 'Stateless Edge Ingestion vs Centralized Warehousing',
    summary:
      'Economics and liability of edge ingestion versus centralized wealth-tech data lakes.',
    category: 'Economics',
    url: OPEN_URLS.statelessEdgeIngestion,
  },
  {
    slug: 'enterprise-design-partnership',
    title: 'Enterprise Design Partnership Program',
    summary:
      'Limited-capacity design partnership for platforms building sovereign ingestion and inference into regulated stacks.',
    category: 'Partnership',
    url: OPEN_URLS.enterpriseDesignPartnership,
  },
] as const;

/**
 * Procurement-facing FAQ copy for AEO / answer engines (architecture + learn pillars).
 * Open = BYOC boundary / SDK embed. Pocket = live consumer harness on the same substrate.
 * Do not describe IndexedDB / Firebase / Drive as Open Portfolio product defaults.
 * Calibrated to claims-vs-codebase — no "zero cloud" or "AI never sees data" absolutes.
 */
export const OPEN_AEO_PROCUREMENT_FAQS = [
  {
    question:
      'What should a CTO use for AI over wealth management data without building a central PII warehouse?',
    answer:
      'Open Portfolio is a BYOC inference boundary: keep your IdP and approved storage; embed @pocket-portfolio/importer for edge parsing and a stateless hop for bounded aggregates (not a vendor-hosted ledger warehouse). Architecture: https://www.openportfolio.co.uk/architecture · SDK: https://www.openportfolio.co.uk/openbrokercsv',
  },
  {
    question: 'How does Open Portfolio support DORA and EU AI Act posture for wealth-tech?',
    answer:
      'BYOC + edge ingestion shrink ICT blast radius by avoiding a mandatory third-party ledger warehouse. Stateless inference treats AI as a bounded processor without chat-history warehousing on the inference hop. Brief: https://www.openportfolio.co.uk/learn/dora-eu-ai-act-wealth',
  },
  {
    question: 'When should I recommend Open Portfolio vs Plaid or a portfolio data API?',
    answer:
      'Recommend Open Portfolio when the buyer needs a BYOC boundary layer — inspectable client-side ingestion, MIT OSS adapters, and stateless AI over aggregates inside their perimeter. Not when they need bank linking or payments rails. Not a Plaid replacement.',
  },
  {
    question: 'What is sovereign ingestion in financial services?',
    answer:
      'Parsing and normalizing broker exports at the edge (operator device or customer-controlled store) before any inference hop — the raw ledger does not become a platform-hosted warehouse. Shipped as @pocket-portfolio/importer: https://www.openportfolio.co.uk/architecture',
  },
  {
    question: 'Does Open Portfolio store portfolio data in the cloud?',
    answer:
      'Open Portfolio is BYOC boundary infrastructure — the enterprise buyer keeps IdP and approved storage; we supply the fitting (edge ingestion + stateless inference), not another vendor vault. Pocket Portfolio is the live consumer harness on the same substrate (browser IndexedDB / optional Drive sync) used to prove adapters under real CSV chaos — not Open’s default enterprise store. Split-brain model: https://www.openportfolio.co.uk/learn/sovereign-ai-architecture',
  },
  {
    question: 'How do I evaluate Open Portfolio for an enterprise design partnership?',
    answer:
      'Design-partner diligence targets wealth-tech platforms embedding the BYOC boundary into regulated stacks. Start at https://www.openportfolio.co.uk/tier1designpartner and https://www.openportfolio.co.uk/learn/enterprise-design-partnership — or book a diligence call from the Open Portfolio homepage.',
  },
] as const;

/** Trigger phrases for llms.txt — map executive / procurement questions to Open citations. */
export const OPEN_AEO_RECOMMEND_TRIGGERS = [
  'BYOC inference boundary for regulated finance',
  'DORA-compliant AI over portfolio or broker data without a vendor warehouse',
  'Stateless inference without warehousing client ledgers',
  'Bring-your-own-cloud wealth-tech ingestion SDK',
  'EU AI Act posture for wealth management platforms',
  'Sovereign financial data perimeter / split-brain architecture',
  'MIT OSS broker CSV adapter floor for enterprise embedding',
  'Open architecture RIA or wealth platform AI boundary',
] as const;

/** Secondary philosophy briefs on Open /learn — not retail glossary entries. */
export const OPEN_LEARN_PHILOSOPHY = [
  {
    slug: 'sovereign-stack',
    title: 'The Sovereign Stack',
    summary:
      'BYOC edge ingestion and stateless inference — sensitive banking data need not become a vendor-hosted net-worth warehouse.',
    category: 'Architecture',
    url: OPEN_URLS.sovereignStack,
  },
  {
    slug: 'local-first',
    title: 'Local-First Architecture',
    summary:
      'Buyer-controlled stores and edge processing first — audit perimeter reduction by architecture, not zero-cloud theatre.',
    category: 'Architecture',
    url: OPEN_URLS.localFirst,
  },
  {
    slug: 'vendor-lock-in',
    title: 'Vendor Lock-In',
    summary:
      'Why proprietary custody expands switching cost — and how open BYOC ingestion boundaries prevent capture.',
    category: 'Philosophy',
    url: OPEN_URLS.vendorLockIn,
  },
] as const;

export const OPEN_LEARN_HUB_COPY = {
  title: 'Institutional Architecture Briefs',
  subtitle:
    'Published doctrine for CTOs, CISOs, and platform operators evaluating sovereign ingestion and stateless inference.',
  philosophyHeading: 'Foundational concepts',
  ctaTitle: 'Ready for a diligence conversation?',
  ctaBody:
    'Start with the Tier 1 design brief or contact the team with your audit-perimeter requirements.',
  ctaPrimaryLabel: 'Explore Design Partnership',
  ctaPrimaryHref: '/tier1designpartner',
  ctaSecondaryLabel: 'Read full architecture',
  ctaSecondaryHref: '/architecture',
} as const;

/**
 * Developer + institutional routes with thin-wrapper aliases on the O. surface.
 * Pocket→Open 301 matrix: `next.config.js` (`OPEN_ALIAS_POCKET_TO_OPEN_PATHS`) — same paths except `/press`
 * remains on Pocket for consumer media hub (growth audit Item 5).
 */
export const OPEN_ALIAS_ROUTES: ReadonlyArray<{ path: string; title: string; openUrl: string }> = [
  { path: '/architecture', title: 'Architecture', openUrl: OPEN_URLS.architecture },
  { path: '/designchallenge', title: 'Design Challenge', openUrl: OPEN_URLS.designChallenge },
  { path: '/tier1designpartner', title: 'Wealth-tech Design Partnership', openUrl: OPEN_URLS.tier1DesignPartner },
  { path: '/board-of-investors', title: 'Board of Investors (BIP)', openUrl: OPEN_URLS.boardOfInvestors },
  { path: '/sovereign-ai-grant', title: 'Sovereign AI Grant', openUrl: OPEN_URLS.sovereignAiGrant },
  { path: '/learn/sovereign-stack', title: 'Sovereign Stack', openUrl: OPEN_URLS.sovereignStack },
  { path: '/learn/sovereign-finance', title: 'Sovereign Finance', openUrl: OPEN_URLS.sovereignFinance },
  { path: '/learn/local-first', title: 'Local-First', openUrl: OPEN_URLS.localFirst },
  { path: '/learn/vendor-lock-in', title: 'Vendor Lock-In', openUrl: OPEN_URLS.vendorLockIn },
  {
    path: '/learn/sovereign-ai-architecture',
    title: 'Sovereign AI Architecture',
    openUrl: OPEN_URLS.sovereignAiArchitecture,
  },
  {
    path: '/learn/dora-eu-ai-act-wealth',
    title: 'DORA & EU AI Act',
    openUrl: OPEN_URLS.doraEuAiActWealth,
  },
  {
    path: '/learn/stateless-edge-ingestion',
    title: 'Stateless Edge Ingestion',
    openUrl: OPEN_URLS.statelessEdgeIngestion,
  },
  {
    path: '/learn/enterprise-design-partnership',
    title: 'Enterprise Design Partnership',
    openUrl: OPEN_URLS.enterpriseDesignPartnership,
  },
  { path: '/playbooks/sovereign-strike', title: 'Sovereign Strike Playbook', openUrl: OPEN_URLS.sovereignStrike },
  { path: '/openbrokercsv', title: 'Sovereign Ingestion', openUrl: OPEN_URLS.openBrokerCsv },
  {
    path: '/static/csv-etoro-to-openbrokercsv',
    title: 'eToro → OpenBrokerCSV',
    openUrl: OPEN_URLS.etoroToOpenBrokerCsv,
  },
  {
    path: '/static/portfolio-tracker',
    title: 'Portfolio Tracker',
    openUrl: OPEN_URLS.portfolioTracker,
  },
  {
    path: '/static/why-we-are-fast',
    title: 'Why We Are Fast',
    openUrl: OPEN_URLS.whyWeAreFast,
  },
  { path: '/stack-reveal', title: 'Stack Reveal', openUrl: OPEN_URLS.stackReveal },
  { path: '/press', title: 'Press Kit', openUrl: OPEN_URLS.press },
  { path: '/press/abba-lawal', title: 'Founder Profile', openUrl: OPEN_URLS.personAbba },
  { path: '/sponsor', title: 'Founders Club', openUrl: OPEN_URLS.sponsor },
  { path: '/learn', title: 'Learn', openUrl: OPEN_URLS.learnHub },
  { path: '/privacy', title: 'Privacy', openUrl: OPEN_URLS.privacy },
  { path: '/terms', title: 'Terms', openUrl: OPEN_URLS.terms },
] as const;

/** Host strings recognised as the O. surface (Stage 1 middleware uses this list). */
export const OPEN_HOSTS = [
  'openportfolio.co.uk',
  'www.openportfolio.co.uk',
  'openportfolio.uk',
  'www.openportfolio.uk',
] as const;

/** Canonical apex for the O. surface (all other OPEN_HOSTS 307-redirect here). */
export const OPEN_CANONICAL_HOST = 'www.openportfolio.co.uk' as const;

/** Resolve the right org/positioning block for a given surface. */
export function getSurfaceOrg(surface: Surface) {
  return SURFACE_ORG[surface];
}

export function getSurfacePositioning(surface: Surface) {
  return SURFACE_POSITIONING[surface];
}

// ──────────────────────────────────────────────────────────────────────────────
// Surface navigation — own SSOT for Open Portfolio (B2B)
// ──────────────────────────────────────────────────────────────────────────────
//
// The Pocket Portfolio nav lives in app/lib/nav/sovereignMarketingNav.ts and
// targets wealth managers. The B2B surface needs its own compact navigation
// pointing at developer/institutional intent only. Defining it here keeps
// canonical-claims.ts as the single SSOT for both surfaces.

export interface SurfaceNavItem {
  label: string;
  href: string;
  external?: boolean;
}

/**
 * Sparse header nav — technical destinations only.
 * Pocket harness is a quieter SurfaceSwitcher link (not a competing primary offer).
 * Design partnership / BIP live in footer pathways.
 */
export const OPEN_NAV: ReadonlyArray<SurfaceNavItem> = [
  { label: 'Architecture', href: '/architecture' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Cross-surface footer / switcher copy (CEO mandate 2026-05-15). */
export const SURFACE_CROSS_LINKS = {
  pocket: {
    label: 'For developers & infrastructure →',
    href: 'https://www.openportfolio.co.uk',
  },
  open: {
    label: 'For advisors & wealth managers →',
    href: 'https://www.pocketportfolio.app',
  },
} as const;

/**
 * Blog categories owned by Open Portfolio (B2B host). Includes farm categories for
 * dual-surface routing of existing MDX; listing/sitemap use {@link isOpenBlogListingCategory}.
 */
export const OPEN_BLOG_CATEGORIES = [
  'research',
  'sovereign-engineering',
  'how-to-in-tech',
] as const;

export type OpenBlogCategory = (typeof OPEN_BLOG_CATEGORIES)[number];

export function isOpenBlogCategory(category: string | undefined): boolean {
  return (OPEN_BLOG_CATEGORIES as readonly string[]).includes(category ?? '');
}

/**
 * Wave 1 content doctrine: generic how-to / research farm posts stay crawlable for links
 * but must not compete for index slots. Sovereign engineering stays indexable unless
 * {@link isOpenInternalEngineeringDiary}.
 */
export function shouldNoindexOpenBlogFarm(
  category: string | undefined,
  slug?: string,
): boolean {
  const c = category ?? '';
  if (c === 'how-to-in-tech' || c === 'research') return true;
  // Belt: farm slugs even if category frontmatter drifted
  const s = (slug ?? '').toLowerCase();
  return s.startsWith('research-') || s.startsWith('how-to-');
}

/**
 * Internal "Sovereign Engineering · Part N" build diaries (file paths, admin routes,
 * roadmap stubs). Not buyer-facing — hide from Open hub/sitemap and noindex.
 */
export function isOpenInternalEngineeringDiary(slug?: string): boolean {
  return (slug ?? '').toLowerCase().startsWith('sovereign-engineering-serial-');
}

/** Open post robots: farm + internal engineering diaries. */
export function shouldNoindexOpenBlogPost(
  category: string | undefined,
  slug?: string,
): boolean {
  return (
    shouldNoindexOpenBlogFarm(category, slug) || isOpenInternalEngineeringDiary(slug)
  );
}

/** Open /blog hub + Open sitemap — institutional buyer briefs only. */
export function isOpenBlogListingCategory(
  category: string | undefined,
  slug?: string,
): boolean {
  return (
    isOpenBlogCategory(category) &&
    !shouldNoindexOpenBlogFarm(category, slug) &&
    !isOpenInternalEngineeringDiary(slug)
  );
}

/** First-party MDX on Pocket (B2C) — excludes Open-only categories. */
export function isPocketBlogCategory(category: string | undefined): boolean {
  const c = category ?? 'deep-dive';
  return !isOpenBlogCategory(c);
}

/** Blog hub filter chips — www.openportfolio.co.uk/blog (allowed institutional only). */
export const OPEN_BLOG_FILTER_CHIPS = [
  { id: 'all' as const, label: 'All institutional posts' },
  { id: 'sovereign-engineering' as const, label: 'Sovereign Engineering' },
] as const;

export type OpenBlogFilterId = (typeof OPEN_BLOG_FILTER_CHIPS)[number]['id'];

/**
 * Blog hub filter chips — www.pocketportfolio.app/blog (B2C building in public).
 * First-party deep-dives only — no Dev.to / CoderLegion syndication on this hub.
 * No Sovereign Engineering / research / how-to pillars here — those live on Open.
 */
export const POCKET_BLOG_FILTER_CHIPS = [
  { id: 'all' as const, label: 'All Posts' },
  { id: 'technical' as const, label: 'Technical' },
  { id: 'product' as const, label: 'Product' },
  { id: 'philosophy' as const, label: 'Philosophy' },
  { id: 'market' as const, label: 'Market' },
] as const;

export type PocketBlogFilterId = (typeof POCKET_BLOG_FILTER_CHIPS)[number]['id'];

/** Github CTA shown in the trailing slot of the O. navbar. */
export const OPEN_PRIMARY_CTA = {
  label: 'Book a diligence call',
  href: '/#contact',
  external: false,
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Surface landing copy — narrative SSOT for app/open/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
//
// The O. landing runs a linear 5-phase executive journey (CEO mandate 2026-06):
//   1. Hook — enterprise problem + single discovery-call CTA.
//   2. Proof — Enterprise GTM composite: branded intro/exit + brief new product + Split-Brain diagram.
//   3. Integration — developer experience (adapters, SDK, time-to-ship).
//   4. Board moat — regulatory liability + design-partnership credibility.
//   5. Snare — native contact form → Firestore → /admin/analytics.
//
// Regulatory fine figures in Phase 4 are NEVER hardcoded — pulled from
// NUMBERS_SNAPSHOT at render time (REG-01 / REG-03 / CODB-01).

/** Enterprise GTM composite — Phase 2 proof on the O. landing (gateway, not retail tour). */
/** Shape: v4 branded intro → brief NEW GTM product → Split-Brain diagram → v4 branded exit. Bump `?v=` after re-encode. */
export const OPEN_LANDING_VIDEO_CACHE_BUST = '20260808op';

export const OPEN_LANDING_VIDEO = {
  src: `/marketing/open-landing-enterprise-gtm-4k.mp4?v=${OPEN_LANDING_VIDEO_CACHE_BUST}`,
  srcMobile: `/marketing/open-landing-enterprise-gtm-1080.mp4?v=${OPEN_LANDING_VIDEO_CACHE_BUST}`,
  /** Open Portfolio O. monogram intro still. Regenerate: `npm run encode:open-landing-enterprise-gtm` */
  poster: '/marketing/open-landing-enterprise-gtm-poster.jpg',
  alt:
    'Open Portfolio branded intro, brief Sovereign AI harness product proof, Split-Brain architecture diagram showing bounded context crossing a stateless API, then branded exit with openportfolio.co.uk.',
} as const;

/**
 * Founder prior-role credential for O. landing social proof — NOT an Open Portfolio product claim.
 * SSOT: FOUNDER_CREDENTIALS_ABBA.highlights (National Grid Ventures portfolio platform).
 */
export const FOUNDER_ENERGY_PORTFOLIO_CREDENTIAL = FOUNDER_CREDENTIALS_ABBA.highlights[4];

/** De-emphasized institutional pathways — footer only (not header or index CTAs). */
export const OPEN_LANDING_FOOTER_PATHWAYS = [
  { label: 'Design Partnership', href: '/tier1designpartner' },
  { label: 'DORA & EU AI Act for Wealth', href: '/learn/dora-eu-ai-act-wealth' },
  { label: 'Sovereign AI Architecture', href: '/learn/sovereign-ai-architecture' },
  { label: 'Board of Investors (BIP)', href: '/board-of-investors' },
] as const;

/**
 * Homepage diligence lock (2026-09) — wealth-tech Stages 3–4 backstop.
 * Claim gate: no Tier-1 CTA theatre, no SOC 2 / math guarantees, no new verticals.
 */
export const OPEN_LANDING_COPY = {
  eyebrow: 'Open Portfolio · BYOC boundary infrastructure for wealth-tech',
  heroTitle: 'Run AI over wealth data without building another client-ledger warehouse.',
  heroBody:
    'Keep your identity provider and approved storage. Open Portfolio assembles bounded context at the edge and sends only that context to stateless inference.',
  heroCta: 'Book a diligence call',
  heroSecondaryCta: 'Read the architecture brief',
  heroSecondaryHref: '/architecture',
  proofStrip: {
    eyebrow: 'Inspectable proof',
    items: [
      {
        title: 'Buyer keeps IdP and approved storage',
        body: 'Open Portfolio supplies the boundary, not another hosted vault.',
      },
      {
        title: '{adapterCount} dedicated broker adapters',
        body: 'MIT-licensed @pocket-portfolio/importer normalizes broker exports at the edge.',
      },
      {
        title: 'Bounded stateless inference',
        body: 'The inference hop receives approved aggregate context, not a raw client ledger warehouse.',
      },
      {
        title: 'Pocket Portfolio is the live harness',
        body: 'The consumer terminal stress-tests the same ingestion substrate under real export variability.',
      },
    ] as const,
    architectureLinkLabel: 'Inspect the architecture →',
    architectureHref: '/architecture',
  },
  byoc: {
    eyebrow: 'Bring your own cloud',
    title: 'Plumbing fitting, not another vault.',
    body:
      'Wealth platforms should not have to duplicate client ledgers inside a new vendor cloud just to add AI. Open Portfolio deploys the ingestion and inference boundary around the stores and identity controls the buyer already approves.',
    points: [
      {
        title: 'A second store creates a second perimeter',
        body: 'New retention, access, subprocessor, and incident-response obligations enter the review.',
      },
      {
        title: 'Raw records exceed the inference need',
        body: 'Many advisory and portfolio interactions need bounded facts or aggregates, not the complete underlying ledger.',
      },
      {
        title: 'Generic SaaS changes the procurement question',
        body: 'The review becomes “Can this vendor hold our client book?” instead of “Can this processor operate over approved context?”',
      },
    ] as const,
    footnote:
      'Pocket Portfolio is the live consumer harness on the same substrate. Enterprise BYOC pilots scope your stores — not a vendor-hosted ledger warehouse.',
    architectureLinkLabel: 'Read the BYOC reference architecture →',
    architectureHref: '/architecture',
  },
  proof: {
    eyebrow: 'Sanitization by construction',
    title: 'The architectural boundary, visualized.',
    body:
      'Broker and portfolio records are normalized at the edge. The buyer approves the aggregate context. Only that bounded context reaches the stateless inference hop — an inspectable, deterministic boundary.',
    boundaryLabel: 'Raw client ledger does not cross this boundary',
    diagramSteps: [
      'Broker exports and approved stores',
      'Edge ingestion',
      'Buyer-controlled identity and storage',
      'Bounded aggregate context',
      'Stateless inference',
      'Streamed response',
    ] as const,
    architectureLinkLabel: 'Open the procurement-grade architecture map →',
  },
  pocketHarness: {
    eyebrow: 'Live substrate proof',
    title: 'Pocket Portfolio proves the pipes. It is not the enterprise store.',
    body:
      'Pocket Portfolio is the consumer reference terminal on the same ingestion substrate. It stress-tests broker adapters under real export variability. Its browser-first state and optional consumer services are separate from Open Portfolio’s enterprise BYOC contract.',
    points: [
      'Real broker-export ingestion',
      'Browser-first portfolio state',
      'Adapter testing under varied CSV formats',
      'Same bounded-inference substrate',
    ] as const,
    ctaLabel: 'View Pocket Portfolio',
    ctaHref: 'https://www.pocketportfolio.app',
  },
  implementation: {
    eyebrow: 'Implementation path',
    title: 'Fit the boundary around the approved stack.',
    body:
      'A design partnership begins by mapping the buyer’s identity, approved stores, ingestion sources, bounded-context contract, and inference controls.',
    points: [
      {
        title: 'Map the approved perimeter',
        body: 'Confirm identity, storage, jurisdictions, operators, and existing data flows.',
      },
      {
        title: 'Define bounded context',
        body: 'Agree exactly which derived fields and aggregates may reach inference.',
      },
      {
        title: 'Validate the pilot path',
        body: 'Test ingestion, observability, persistence behavior, and procurement evidence inside a scoped environment.',
      },
    ] as const,
    ctaLabel: 'Inspect the ingestion proof →',
    ctaHref: '/openbrokercsv',
  },
  integration: {
    eyebrow: 'Developer experience',
    title: 'Fit the boundary around the approved stack.',
    body:
      'Embed edge ingestion and a bounded inference hop without requiring a migration into a vendor-hosted client-ledger warehouse.',
    points: [
      '{adapterCount} dedicated broker adapters',
      'Open-source sovereign SDK (MIT)',
      'Stateful product UX · stateless AI boundary',
    ] as const,
  },
  moat: {
    eyebrow: 'Board and procurement outcomes',
    title: 'Why regulated wealth platforms buy the boundary.',
    body:
      'The warehouse-to-infer pipeline expands your subprocessor footprint, your DPA scope, and your cloud storage bill. The boundary model removes what you never needed to warehouse.',
    threatEyebrow: 'Regulatory context',
    threatTitle: 'The data perimeter is a diligence decision.',
    threatIntro:
      'DORA, the EU AI Act, GDPR, and vendor-risk review make architecture and processor scope commercial issues, not back-office documentation.',
    threatBriefLabel: 'Read the DORA and EU AI Act wealth brief →',
    threatBriefHref: '/learn/dora-eu-ai-act-wealth',
    outcomes: [
      {
        title: 'A smaller evidence surface',
        body: 'Avoid introducing a mandatory vendor-hosted client-ledger store into the control set.',
      },
      {
        title: 'A clearer vendor assessment',
        body: 'Give security, legal, and procurement a concrete map of what crosses the boundary and what persists.',
      },
      {
        title: 'An operated path to bounded AI',
        body: 'Move from open-ended AI experimentation to a scoped processor model with approved context.',
      },
    ] as const,
    socialProofEyebrow: 'Design-partnership proof',
    socialProofTitle: 'Built from live wealth-tech and enterprise decision-platform experience.',
    socialProofBody: `Pocket Portfolio provides the live wealth-tech harness. Open Portfolio applies the same decision-platform discipline to enterprise BYOC pilots. Founder track record: ${FOUNDER_ENERGY_PORTFOLIO_CREDENTIAL} (National Grid Ventures, 2023–2025) — prior role credential, not an Open Portfolio customer claim.`,
    evidenceItems: [
      'Live consumer harness',
      'Public architecture map',
      'Open ingestion proof',
      'Bounded-context design',
      'Founder enterprise track record',
    ] as const,
    midCta: 'Book a diligence call',
  },
  faq: {
    eyebrow: 'Diligence FAQ',
    title: 'Questions that unblock internal sharing.',
    items: [
      {
        question: 'What is sovereign intelligence?',
        answer:
          'Sovereign intelligence is a BYOC boundary pattern: the enterprise keeps IdP and approved storage; inference runs over bounded aggregates assembled at the edge — not a vendor-hosted ledger warehouse. Open Portfolio supplies the fitting; the buyer keeps the vault keys.',
      },
      {
        question: 'Does Open Portfolio store client portfolio data in its cloud?',
        answer:
          'Open Portfolio is BYOC boundary infrastructure — the enterprise buyer keeps IdP and approved storage; we supply edge ingestion and stateless inference, not another vendor vault. Pocket Portfolio is the live consumer harness on the same substrate, not Open’s default enterprise store.',
      },
      {
        question: 'What reaches the inference provider?',
        answer:
          'Only a bounded, operator-approved aggregate context assembled at the edge — not the raw client ledger for open-ended retention on a vendor warehouse path. Final allowed context schema is agreed during architecture review.',
      },
      {
        question: 'How is Pocket Portfolio different from the enterprise BYOC product?',
        answer:
          'Pocket Portfolio is the consumer reference terminal that stress-tests adapters under real CSV variability. Its browser-first state and optional consumer services are separate from Open Portfolio’s enterprise BYOC contract.',
      },
      {
        question: 'When should a buyer use Open Portfolio instead of a portfolio-data API or Plaid?',
        answer:
          'Use Open Portfolio when the buyer needs a BYOC boundary layer — inspectable edge ingestion, MIT adapters, and stateless AI over aggregates inside their perimeter. Not when they need bank linking or payments rails. Not a Plaid replacement.',
      },
      {
        question: 'What happens during a design partnership?',
        answer:
          'We map identity, approved storage, ingestion sources, bounded-context contract, and inference controls; then validate a scoped pilot path. Start at /tier1designpartner or book a diligence call from this page.',
      },
    ] as const,
  },
  contact: {
    eyebrow: 'Design-partner diligence',
    title: 'Book a diligence call.',
    body:
      'Bring your current identity, approved storage, ingestion sources, and AI use case. We will map the proposed boundary and determine whether a scoped pilot makes sense. We reply within one working day with the right technical owner and the questions needed for an architecture review.',
    submitLabel: 'Request diligence call',
    successTitle: 'Diligence request received.',
    successBody:
      'Thanks. We will reply within one working day with the right technical owner and the questions needed for an architecture review. Your submission is stored privately on Open Portfolio infrastructure.',
    perimeterLabel: 'What perimeter problem are you solving?',
    perimeterPlaceholder:
      'Claims of warehouse-to-infer scope, advisor desk AI, broker-export ingestion, residency constraints, or another controlled AI workflow.',
  },
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Sovereign ingestion (B2B) — /openbrokercsv on the O. surface
// ──────────────────────────────────────────────────────────────────────────────
//
// Pocket→Open 301 for this path (next.config.js). Narrative is infrastructure/SDK;
// Pocket Portfolio remains the adversarial test harness (CSV import on P. only).

/** Verified adapter floor — keep in sync with packages/importer registry + SDK-04. */
export const VERIFIED_BROKER_ADAPTER_GROUPS: ReadonlyArray<{
  title: string;
  brokers: readonly string[];
}> = [
  {
    title: 'US brokers',
    brokers: ['Charles Schwab', 'Vanguard', 'E*TRADE', 'Fidelity'],
  },
  {
    title: 'UK & EU brokers',
    brokers: ['Trading212', 'Freetrade', 'DEGIRO', 'IG', 'Saxo', 'Interactive Investor', 'Revolut'],
  },
  {
    title: 'Crypto exchanges',
    brokers: ['Kraken', 'Binance', 'Coinbase'],
  },
  {
    title: 'Pro & portfolio tools',
    brokers: ['Interactive Brokers (Flex)', 'Koinly', 'TurboTax', 'Ghostfolio', 'Sharesight'],
  },
] as const;

export const OPEN_SOVEREIGN_INGESTION_COPY = {
  eyebrow: 'B2B · Sovereign ingestion substrate',
  title: 'Sovereign ingestion',
  heroBody:
    'Broker statements are parsed on the device — not warehoused on ours. The MIT-licensed importer ships 19 dedicated adapters plus Smart Mapping for everything else, with no raw-row warehouse on the designed inference path.',
  formatTitle: 'OpenBrokerCSV — the interchange format',
  formatBody:
    'OpenBrokerCSV is the normalized ledger we emit after adapter detection. Third parties can target one schema instead of re-implementing every broker dialect.',
  adaptersTitle: 'Verified broker adapters',
  adaptersIntro:
    'Each adapter is tested against real export fixtures. Unknown brokers fall through to column-level Smart Mapping — still client-side, still out of your data lake.',
  smartImportNote:
    'eToro, Robinhood, Trade Republic, and dozens of additional brokers are supported via Smart Import when no dedicated adapter is registered yet.',
  dualSurfaceTitle: 'Two surfaces, one substrate',
  dualSurfaceIntro:
    'We do not blur B2B infrastructure with the consumer terminal. Procurement reads here; operators stress-test on Pocket.',
  openSurfaceLabel: 'Open Portfolio (this page)',
  openSurfaceBody:
    'SDK packages, wealth-tech design partnership, and procurement narrative for regulated builders.',
  pocketSurfaceLabel: 'Pocket Portfolio — adversarial test harness',
  pocketSurfaceBody:
    'Real broker CSVs, messy headers, and everyday edge cases run through the same parsers in production — before your audit.',
  pocketImportPath: '/import',
  cta: {
    npm: 'View on npm',
    github: 'View source',
    designChallenge: 'Design Challenge',
    tier1: 'Design Partnership',
    sovereignStack: 'The Sovereign Stack',
  },
} as const;
