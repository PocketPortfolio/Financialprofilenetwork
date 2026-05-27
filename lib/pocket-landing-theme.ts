import type { CSSProperties } from 'react';

/** Theme-aware panel chrome for landing SOTA sections (no hardcoded obsidian). */
export const pocketLandingPanelStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid color-mix(in srgb, var(--accent-warm) 20%, var(--border))',
  borderRadius: '12px',
};

export const pocketLandingCardStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid color-mix(in srgb, var(--accent-warm) 18%, var(--border))',
  borderRadius: '16px',
};

/** Letterbox / plate frame behind cinematic PNG art. */
export const pocketPlateFrameStyle: CSSProperties = {
  background: 'var(--surface)',
};

/** HUD overlays on dark plate artwork — tokens flip in light theme for contrast. */
export const pocketPlateHud = {
  bg: 'var(--on-plate-surface)',
  fg: 'var(--on-plate-text)',
  muted: 'var(--on-plate-muted)',
  accent: 'var(--on-plate-accent)',
  border: 'color-mix(in srgb, var(--accent-warm) 28%, transparent)',
  borderStrong: 'color-mix(in srgb, var(--accent-warm) 55%, transparent)',
  borderSubtle: 'color-mix(in srgb, var(--accent-warm) 12%, transparent)',
  gradientFade: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--on-plate-surface) 92%, transparent) 55%)',
} as const;

export const pocketLandingHeadingStyle: CSSProperties = {
  color: 'var(--text)',
};

export const pocketLandingMono = 'var(--font-mono)';
