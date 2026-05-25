export const OBSIDIAN = '#09090b';
export const ACCENT = '#f59e0b';
export const TEXT = '#e2e8f0';
export const MUTED = '#a1a1aa';
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Calibrated exposure — matches OpenLandingPlateOverlay threat HUD. */
export const COMPLIANCE_LOCKOUT = 'EUR 20M or 4% · GDPR Art. 83(5) ceiling';

export type IadId = 'chess' | 'sort' | 'router';

export const IAD_META: Record<
  IadId,
  { title: string; subtitle: string; takeaway: string }
> = {
  chess: {
    title: 'Stateless Chess',
    subtitle: 'Zero-memory inference demo',
    takeaway: 'Each turn sends only a compressed FEN string — no game memory on server.',
  },
  sort: {
    title: 'Perimeter Sort',
    subtitle: 'Edge sanitization demo',
    takeaway: 'Burn raw PII at the edge. Only bounded aggregates pass the inference gate.',
  },
  router: {
    title: 'Node Router',
    subtitle: 'Deflationary edge demo',
    takeaway: 'Route around the centralized cloud — client-side nodes keep budget at zero.',
  },
};
