'use client';

import React, { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

function FinStepCard({
  node,
  active,
}: {
  node: (typeof POCKET_FIN_NODES)[number];
  active: boolean;
}) {
  return (
    <div
      style={{
        flex: '0 0 min(94%, 520px)',
        scrollSnapAlign: 'center',
        padding: 'clamp(16px, 2.5vw, 22px) clamp(18px, 3vw, 24px)',
        background: active ? 'rgba(9, 9, 11, 0.92)' : 'rgba(9, 9, 11, 0.78)',
        border: `1px solid ${active ? 'rgba(245,158,11,0.55)' : 'rgba(245,158,11,0.28)'}`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '8px',
        fontFamily: MONO,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${ACCENT}`,
            color: ACCENT,
            fontSize: 16,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {node.key}
        </span>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(11px, 1.8vw, 12px)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: ACCENT,
              textTransform: 'uppercase',
            }}
          >
            {node.title}
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 'clamp(15px, 2.4vw, 18px)',
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.25,
            }}
          >
            {node.subtitle}
          </p>
        </div>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.55, color: MUTED }}>
        {node.body}
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          fontSize: 'clamp(11px, 1.6vw, 13px)',
          color: MUTED,
          lineHeight: 1.5,
        }}
      >
        {node.bullets.map((b) => (
          <li key={b} style={{ marginBottom: '4px' }}>
            <span style={{ color: ACCENT }}>›</span> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full-width bottom dock — horizontal scroll carousel (mirrors Open moat HUD). */
function FinPipelineOverlay() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const steps = POCKET_FIN_NODES;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const cardWidth = el.firstElementChild?.clientWidth ?? el.offsetWidth * 0.94;
    const idx = Math.round(el.scrollLeft / (cardWidth + 12));
    setActive(Math.min(steps.length - 1, Math.max(0, idx)));
  }, [steps.length]);

  return (
    <div
      role="region"
      aria-label="The FIN pillars — Future, Investment, Now"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        padding: '14px 16px 16px',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.88) 18%, rgba(9,9,11,0.98) 100%)',
        pointerEvents: 'auto',
      }}
    >
      <p
        style={{
          margin: '0 0 10px 4px',
          fontSize: 'clamp(9px, 1.6vw, 11px)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ACCENT,
          fontFamily: MONO,
        }}
      >
        The FIN pillars: open core → shipped insight
      </p>
      <div
        onScroll={onScroll}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: '3%',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 6,
          scrollbarWidth: 'thin',
        }}
      >
        {steps.map((node, i) => (
          <FinStepCard key={node.key} node={node} active={active === i} />
        ))}
      </div>
      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}
        >
          {steps.map((node, i) => (
            <span
              key={node.key}
              style={{
                width: active === i ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: active === i ? ACCENT : 'rgba(161,161,170,0.45)',
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
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
  if (variant === 'finPipeline') return <FinPipelineOverlay />;
  if (variant === 'portal' && visual.portalKey) {
    return <PortalOverlay portalKey={visual.portalKey} />;
  }
  return null;
}
