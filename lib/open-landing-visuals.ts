/**
 * Open Portfolio landing — SOTA cinematic plates (SSOT).
 * Plates: public/open/landing/plates/ · sync: npm run sync:open-web-plates
 * Brief: docs/seed/open-portfolio-web-sota-brief.md
 *
 * Each slot has a physically unique baked PNG (sharp crop at sync time).
 * Headline ↔ art alignment documented per slot below.
 */

import { plateSrc } from './open-landing-plate-cache';

export type OpenLandingVisualId =
  | 'hero'
  | 'subHero'
  | 'threat'
  | 'bridge'
  | 'pillars'
  | 'tracks'
  | 'packages'
  | 'contact';

export type OpenLandingOverlay = 'exposure' | 'moat';

export type OpenLandingMotion =
  | 'sovereign-grid'
  | 'digital-footprint'
  | 'package-terminal'
  | 'briefing-console'
  | 'pocket-analyst-harness';

export interface OpenLandingVisualMeta {
  id: OpenLandingVisualId;
  src: string;
  alt: string;
  caption: string;
  aspectRatio: '16/9' | '16/10';
  objectPosition: 'center';
  objectFit?: 'cover' | 'contain';
  overlay?: OpenLandingOverlay;
  /** Client-side motion layer over plate (procurement-grade storytelling). */
  motion?: OpenLandingMotion;
  plateSource: 'deck-reuse' | 'net-new';
  headlineAlign: string;
}

export const OPEN_LANDING_VISUALS: Record<OpenLandingVisualId, OpenLandingVisualMeta> = {
  hero: {
    id: 'hero',
    src: plateSrc('web-hero-glass-vault.png'),
    alt: 'Client-edge glass nodes on an obsidian frontier — sovereign perimeter for regulated AI.',
    caption: 'Finance proved the substrate — regulated verticals inherit the same perimeter.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    motion: 'sovereign-grid',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-01 right — frosted glass cubes / edge sovereignty',
  },
  subHero: {
    id: 'subHero',
    src: plateSrc('web-boundary-split-brain.png'),
    alt: 'Split-brain edge processing — raw rows compressed client-side before stateless inference.',
    caption: 'Privacy decided in architecture — before the auditor asks.',
    aspectRatio: '16/10',
    objectPosition: 'center',
    overlay: 'moat',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-02 left — ingest + client node pipeline',
  },
  threat: {
    id: 'threat',
    src: plateSrc('web-boundary-frontier.png'),
    alt: 'Legacy cloud monolith versus the compliance boundary — regulatory exposure zone.',
    caption: 'The bill for warehousing PII has arrived.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    overlay: 'exposure',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-01 left — legacy cloud density / board risk',
  },
  bridge: {
    id: 'bridge',
    src: plateSrc('web-traction-dual-pane.png'),
    alt: 'Pocket Analyst streaming on the live consumer harness — stateless inference under production load.',
    caption: 'Pocket Analyst on the live harness — streaming inference before your audit.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    objectFit: 'contain',
    motion: 'pocket-analyst-harness',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-03 → live Pocket Analyst demo (replaces static footprint map)',
  },
  pillars: {
    id: 'pillars',
    src: plateSrc('web-split-brain-pillars.png'),
    alt: 'Stateless inference path — ingestion, compression, and zero persistence.',
    caption: 'One substrate. Three guarantees your board can name.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-02 right — server dissipation / audit perimeter',
  },
  tracks: {
    id: 'tracks',
    src: plateSrc('web-traction-dual-pane.png'),
    alt: 'Global night-lights footprint — mandate paths stress-tested across production harness.',
    caption: 'Pick the door that matches your mandate.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    objectFit: 'contain',
    motion: 'digital-footprint',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-03 full — global footprint map + firefly overlay',
  },
  packages: {
    id: 'packages',
    src: plateSrc('web-substrate-matrix.png'),
    alt: 'FIN control matrix — MIT importer and broker adapter packages on npm.',
    caption: 'Built in the open. Metered without surveillance.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    objectFit: 'contain',
    motion: 'package-terminal',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-05 — control matrix grid / OSS package substrate (interim; Epic 3.2 wafer pending)',
  },
  contact: {
    id: 'contact',
    src: plateSrc('web-clean-room-console.png'),
    alt: 'Executive FIN glass console — interactive architecture demonstrations before briefing.',
    caption: 'Thirty minutes to shorten your audit perimeter.',
    aspectRatio: '16/9',
    objectPosition: 'center',
    objectFit: 'contain',
    motion: 'briefing-console',
    plateSource: 'deck-reuse',
    headlineAlign: 'slide-05 — FIN console + IAD mount (chess / sort / router)',
  },
} as const;
