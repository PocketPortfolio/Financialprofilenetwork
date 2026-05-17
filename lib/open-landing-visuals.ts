/**
 * Open Portfolio landing — editorial visuals (SSOT).
 * Policy-maker & enterprise storytelling; not technical diagrams.
 * Run: node scripts/generate-open-landing-visuals.mjs
 */

export type OpenLandingVisualId =
  | 'hero'
  | 'subHero'
  | 'threat'
  | 'bridge'
  | 'pillars'
  | 'tracks'
  | 'packages'
  | 'contact';

export interface OpenLandingVisualMeta {
  id: OpenLandingVisualId;
  /** Public path (PNG preferred for photo-real gradients; SVG fallback). */
  src: string;
  srcSvg: string;
  alt: string;
  /** Short editorial caption under the frame — human, not legal. */
  caption: string;
  aspectRatio: '16/10' | '4/3' | '21/9';
}

export const OPEN_LANDING_VISUALS: Record<OpenLandingVisualId, OpenLandingVisualMeta> = {
  hero: {
    id: 'hero',
    src: '/open/landing/hero-sovereign-layer.png',
    srcSvg: '/open/landing/svg/hero-sovereign-layer.svg',
    alt: 'Open Portfolio as the privacy layer for deploying AI in regulated environments — on-device data and session-forgetful inference.',
    caption: 'Finance proved the substrate — regulated verticals inherit the same perimeter.',
    aspectRatio: '16/10',
  },
  subHero: {
    id: 'subHero',
    src: '/open/landing/privacy-architecture.png',
    srcSvg: '/open/landing/svg/privacy-architecture.svg',
    alt: 'A protected vault of personal data with no warehouse in the cloud.',
    caption: 'Privacy decided in architecture — before the auditor asks.',
    aspectRatio: '16/10',
  },
  threat: {
    id: 'threat',
    src: '/open/landing/regulatory-stakes.png',
    srcSvg: '/open/landing/svg/regulatory-stakes.svg',
    alt: 'Regulatory pressure rising over legacy data warehouses.',
    caption: 'The bill for warehousing PII has arrived.',
    aspectRatio: '21/9',
  },
  bridge: {
    id: 'bridge',
    src: '/open/landing/live-proof-bridge.png',
    srcSvg: '/open/landing/svg/live-proof-bridge.svg',
    alt: 'Open Portfolio substrate validated daily through production consumer workloads.',
    caption: 'Stress-tested in the wild — hardened before your audit.',
    aspectRatio: '16/10',
  },
  pillars: {
    id: 'pillars',
    src: '/open/landing/substrate-pillars.png',
    srcSvg: '/open/landing/svg/substrate-pillars.svg',
    alt: 'Three pillars: ingestion, inference, and audit perimeter.',
    caption: 'One substrate. Three guarantees your board can name.',
    aspectRatio: '4/3',
  },
  tracks: {
    id: 'tracks',
    src: '/open/landing/partner-tracks.png',
    srcSvg: '/open/landing/svg/partner-tracks.svg',
    alt: 'Four paths for engineers, institutions, investors, and grant teams.',
    caption: 'Pick the door that matches your mandate.',
    aspectRatio: '16/10',
  },
  packages: {
    id: 'packages',
    src: '/open/landing/open-packages.png',
    srcSvg: '/open/landing/svg/open-packages.svg',
    alt: 'Open packages orbiting a sovereign core SDK.',
    caption: 'Built in the open. Metered without surveillance.',
    aspectRatio: '16/10',
  },
  contact: {
    id: 'contact',
    src: '/open/landing/briefing-room.png',
    srcSvg: '/open/landing/svg/briefing-room.svg',
    alt: 'A briefing room ready for procurement and policy conversations.',
    caption: 'Thirty minutes to shorten your audit perimeter.',
    aspectRatio: '16/10',
  },
} as const;
