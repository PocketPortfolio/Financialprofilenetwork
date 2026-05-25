'use client';

import React from 'react';
import {
  POCKET_AD_FREE_COPY,
  POCKET_FIN_NODES,
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

function FiberConnector() {
  return (
    <div
      aria-hidden
      style={{
        alignSelf: 'center',
        width: 'clamp(24px, 4vw, 40px)',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
        boxShadow: `0 0 8px ${ACCENT}`,
        flexShrink: 0,
      }}
    />
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

function FinPipelineOverlay() {
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
        padding: 'clamp(8px, 2vw, 16px)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 'clamp(4px, 1vw, 8px)',
          width: '100%',
          maxWidth: '920px',
        }}
      >
        {POCKET_FIN_NODES.map((node, i) => (
          <React.Fragment key={node.key}>
            {i > 0 && <FiberConnector />}
            <div
              style={{
                flex: '1 1 160px',
                maxWidth: '280px',
                padding: 'clamp(10px, 1.8vw, 16px)',
                background: OBSIDIAN,
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                fontFamily: MONO,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: ACCENT,
                  marginBottom: '4px',
                }}
              >
                {node.key} — {node.title.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 'clamp(11px, 1.5vw, 13px)',
                  fontWeight: 700,
                  color: TEXT,
                  marginBottom: '6px',
                }}
              >
                {node.subtitle}
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  fontSize: 'clamp(9px, 1.3vw, 10px)',
                  color: MUTED,
                  lineHeight: 1.45,
                }}
              >
                {node.bullets.map((b) => (
                  <li key={b} style={{ marginBottom: '3px' }}>
                    <span style={{ color: ACCENT }}>›</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          </React.Fragment>
        ))}
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
  if (variant === 'finPipeline') return <FinPipelineOverlay />;
  if (variant === 'portal' && visual.portalKey) {
    return <PortalOverlay portalKey={visual.portalKey} />;
  }
  return null;
}
