/**
 * Pocket Portfolio landing — SOTA plate SSOT (B2C).
 * Copy lives in HTML overlays only; claims per claims-vs-codebase-calibration.md.
 */

import { plateSrc } from '@/lib/pocket-landing-plate-cache';

export type PocketLandingVisualId =
  | 'portalTerminal'
  | 'portalStorage'
  | 'portalFounders'
  | 'whyChoose'
  | 'adFreeInvariant'
  | 'finPillars'
  | 'community'
  | 'newsRegulatory'
  | 'newsInfra'
  | 'newsWealthTech'
  | 'newsMarket';

export type PocketLandingOverlayVariant =
  | 'none'
  | 'metrics'
  | 'adFreeInvariant'
  | 'portal';

export type PocketLandingVisualMeta = {
  id: PocketLandingVisualId;
  /** Baked 16:9 plate under public/pocket/landing/plates/ */
  plateFile: string;
  alt: string;
  /** HTML overlay variant (HUD) */
  overlay: PocketLandingOverlayVariant;
  /** Portal card key when overlay === 'portal' */
  portalKey?: 'terminal' | 'storage' | 'founders';
  /** Optional figcaption (section-level only) */
  caption?: string;
  /** CSS aspect-ratio for layout shell */
  aspectRatio: string;
  /** object-position for plate crop emphasis */
  objectPosition?: string;
  /** Prefer loading="eager" + priority for above-fold slots */
  priority?: boolean;
  /** Text alignment for overlay dock */
  headlineAlign?: 'left' | 'center';
  /** Subtle motion on plate (landing sections only) */
  motion?: 'none' | 'drift';
};

export const POCKET_LANDING_VISUALS: Record<PocketLandingVisualId, PocketLandingVisualMeta> = {
  portalTerminal: {
    id: 'portalTerminal',
    plateFile: 'web-portal-terminal.png',
    alt: 'Pocket Analyst dashboard render — candlestick chart, portfolio matrix with sparklines, and analyst command console',
    overlay: 'portal',
    portalKey: 'terminal',
    aspectRatio: '4 / 3',
    objectPosition: '50% 38%',
    priority: true,
    headlineAlign: 'left',
    motion: 'drift',
  },
  portalStorage: {
    id: 'portalStorage',
    plateFile: 'web-portal-storage.png',
    alt: 'Sovereign storage render — encrypted vault with amber cipher dial linking a local device to a Drive folder tree via an amber data pipeline',
    overlay: 'portal',
    portalKey: 'storage',
    aspectRatio: '4 / 3',
    objectPosition: '50% 50%',
    headlineAlign: 'left',
    motion: 'drift',
  },
  portalFounders: {
    id: 'portalFounders',
    plateFile: 'web-portal-founders.png',
    alt: 'Founders Club render — hex insignia with circuit-crest, holographic roadmap blueprint, and metallic access key',
    overlay: 'portal',
    portalKey: 'founders',
    aspectRatio: '4 / 3',
    objectPosition: '50% 48%',
    headlineAlign: 'left',
    motion: 'drift',
  },
  whyChoose: {
    id: 'whyChoose',
    plateFile: 'web-why-choose.png',
    alt: 'Obsidian micro-grid texture for Why Choose metrics band',
    overlay: 'metrics',
    aspectRatio: '21 / 9',
    objectPosition: '50% 50%',
    headlineAlign: 'center',
    motion: 'none',
  },
  adFreeInvariant: {
    id: 'adFreeInvariant',
    plateFile: 'web-ad-free-invariant.png',
    alt: 'Invariant ledger plate for ad-free product promise',
    overlay: 'adFreeInvariant',
    aspectRatio: '16 / 9',
    objectPosition: '50% 40%',
    headlineAlign: 'center',
    motion: 'none',
  },
  finPillars: {
    id: 'finPillars',
    plateFile: 'web-fin-pillars.png',
    alt: 'Volumetric FIN fiber pipeline render',
    overlay: 'none',
    caption: 'Future • Investment • Now — open core, human-centered execution, shipped insight.',
    aspectRatio: '16 / 10',
    objectPosition: '50% 45%',
    headlineAlign: 'center',
    motion: 'none',
  },
  community: {
    id: 'community',
    plateFile: 'web-community-nodes.png',
    alt: 'Decentralized community node mesh render',
    overlay: 'none',
    aspectRatio: '16 / 9',
    objectPosition: '50% 50%',
    headlineAlign: 'center',
    motion: 'drift',
  },
  newsRegulatory: {
    id: 'newsRegulatory',
    plateFile: 'web-news-regulatory.png',
    alt: 'Abstract regulatory geometry for news briefing cards',
    overlay: 'none',
    aspectRatio: '16 / 9',
    objectPosition: '50% 50%',
    motion: 'none',
  },
  newsInfra: {
    id: 'newsInfra',
    plateFile: 'web-news-infra.png',
    alt: 'Abstract network sphere for infrastructure news cards',
    overlay: 'none',
    aspectRatio: '16 / 9',
    objectPosition: '50% 50%',
    motion: 'none',
  },
  newsWealthTech: {
    id: 'newsWealthTech',
    plateFile: 'web-news-wealth-tech.png',
    alt: 'Abstract scaling geometry for wealth-tech news cards',
    overlay: 'none',
    aspectRatio: '16 / 9',
    objectPosition: '50% 50%',
    motion: 'none',
  },
  newsMarket: {
    id: 'newsMarket',
    plateFile: 'web-news-market.png',
    alt: 'Abstract market geometry for market news cards',
    overlay: 'none',
    aspectRatio: '16 / 9',
    objectPosition: '50% 50%',
    motion: 'none',
  },
};

export function pocketVisual(id: PocketLandingVisualId): PocketLandingVisualMeta {
  return POCKET_LANDING_VISUALS[id];
}

export function pocketPlateUrl(meta: PocketLandingVisualMeta): string {
  return plateSrc(meta.plateFile);
}

/** Portal card HUD copy — not baked into PNGs */
export const POCKET_PORTAL_HUD: Record<
  'terminal' | 'storage' | 'founders',
  { title: string; kicker: string }
> = {
  terminal: {
    kicker: 'PRODUCT PORTAL',
    title: 'The Terminal',
  },
  storage: {
    kicker: 'SOVEREIGN SYNC',
    title: 'Sovereign Storage',
  },
  founders: {
    kicker: 'FOUNDERS CLUB',
    title: 'Founders Access',
  },
};

export const POCKET_METRICS_HUD = [
  { value: '100%', label: 'Free & Open Source' },
  { value: '0', label: 'Sign-up Required' },
  { value: 'Privacy', label: 'First Design' },
  { value: 'Community', label: 'Led Development' },
] as const;

export const POCKET_TRANSPARENCY_ROW = [
  'Open Source',
  'Public Roadmap',
  'Community Feedback',
  'No Vendor Lock-in',
] as const;

export const POCKET_AD_FREE_COPY =
  'We will always be ad-free and will never sell ads on the platform. The only exception is educational tools and resources that help users learn about investing.';

export const POCKET_FIN_NODES = [
  {
    key: 'F',
    title: 'Future',
    subtitle: 'Open-source core',
    body: 'Community-owned primitives and transparent evolution — capability you can fork, audit, and extend.',
    bullets: ['Open-source core', 'Insight-first design', 'Public roadmap'],
  },
  {
    key: 'I',
    title: 'Investment',
    subtitle: 'Human-centered UX + data engineering',
    body: 'Design and pipelines that respect attention: evidence in, noise out, serious portfolios in focus.',
    bullets: ['Human-centered UX', 'Robust data engineering', 'Evidence-based decisions'],
  },
  {
    key: 'N',
    title: 'Now',
    subtitle: 'Real-time insight + delivery',
    body: 'Shipped learning loops: fast iteration, honest telemetry on the product (not your ledger), transparent delivery.',
    bullets: ['Real-time insights', 'Fast iterative delivery', 'Transparent roadmap'],
  },
] as const;
