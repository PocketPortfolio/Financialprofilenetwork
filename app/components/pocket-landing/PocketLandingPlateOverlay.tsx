'use client';

import React from 'react';
import {
  POCKET_AD_FREE_COPY,
  POCKET_METRICS_HUD,
  POCKET_PORTAL_HUD,
  type PocketLandingOverlayVariant,
  type PocketLandingVisualMeta,
} from '@/lib/pocket-landing-visuals';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const ACCENT = '#f59e0b';
const OBSIDIAN = 'rgba(9, 9, 11, 0.82)';
const TEXT = '#e2e8f0';
const MUTED = '#a1a1aa';

function LockGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="11" rx="2" stroke={ACCENT} strokeWidth="1.5" />
      <path
        d="M8 10V8a4 4 0 0 1 8 0v2"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.5" fill={ACCENT} />
    </svg>
  );
}

function MetricsOverlay() {
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vw, 24px)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'clamp(12px, 2vw, 24px)',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {POCKET_METRICS_HUD.map((m) => (
          <div
            key={m.label}
            style={{
              textAlign: 'center',
              padding: 'clamp(8px, 1.5vw, 14px)',
              background: OBSIDIAN,
              border: '1px solid rgba(245, 158, 11, 0.28)',
              borderRadius: '8px',
              fontFamily: MONO,
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                fontWeight: 700,
                color: ACCENT,
                marginBottom: '4px',
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontSize: 'clamp(9px, 1.4vw, 11px)',
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdFreeOverlay() {
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 3vw, 28px)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: 'clamp(16px, 2.5vw, 24px)',
          background: OBSIDIAN,
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderLeft: `3px solid ${ACCENT}`,
          borderRadius: '8px',
          fontFamily: MONO,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '10px',
            color: ACCENT,
            fontSize: 'clamp(11px, 1.8vw, 13px)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <LockGlyph />
          Ad-Free Invariant
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(11px, 1.6vw, 13px)', color: TEXT, lineHeight: 1.55 }}>
          {POCKET_AD_FREE_COPY}
        </p>
      </div>
    </div>
  );
}

function PortalOverlay({ portalKey }: { portalKey: 'terminal' | 'storage' | 'founders' }) {
  const hud = POCKET_PORTAL_HUD[portalKey];
  const align = 'left';

  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'clamp(10px, 2vw, 16px)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.92) 55%)',
        pointerEvents: 'none',
        zIndex: 4,
        textAlign: align,
      }}
    >
      <div style={{ fontFamily: MONO, paddingLeft: '4px' }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: ACCENT,
            marginBottom: '4px',
          }}
        >
          {hud.kicker}
        </div>
        <div
          style={{
            fontSize: 'clamp(14px, 2.2vw, 18px)',
            fontWeight: 800,
            color: TEXT,
            letterSpacing: '-0.02em',
          }}
        >
          {hud.title}
        </div>
      </div>
    </div>
  );
}

export default function PocketLandingPlateOverlay({
  variant,
  visual,
}: {
  variant: PocketLandingOverlayVariant;
  visual: PocketLandingVisualMeta;
}) {
  if (variant === 'none') return null;
  if (variant === 'metrics') return <MetricsOverlay />;
  if (variant === 'adFreeInvariant') return <AdFreeOverlay />;
  if (variant === 'portal' && visual.portalKey) {
    return <PortalOverlay portalKey={visual.portalKey} />;
  }
  return null;
}
