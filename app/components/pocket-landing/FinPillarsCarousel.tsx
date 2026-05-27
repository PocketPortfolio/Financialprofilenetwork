'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { POCKET_FIN_NODES } from '@/lib/pocket-landing-visuals';
import {
  pocketLandingMono,
  pocketLandingPanelStyle,
  pocketPlateHud,
} from '@/lib/pocket-landing-theme';

function FinStepCard({
  node,
  active,
}: {
  node: (typeof POCKET_FIN_NODES)[number];
  active: boolean;
}) {
  return (
    <div
      data-pocket-fin-card={node.key}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(18px, 3vw, 24px) clamp(20px, 3.5vw, 28px)',
        background: active
          ? 'color-mix(in srgb, var(--surface) 96%, var(--accent-warm) 4%)'
          : 'var(--surface)',
        border: `1px solid ${active ? pocketPlateHud.borderStrong : pocketPlateHud.border}`,
        borderLeft: `3px solid var(--accent-warm)`,
        borderRadius: '10px',
        fontFamily: pocketLandingMono,
        boxShadow: active ? 'var(--shadow-md)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1px solid var(--accent-warm)`,
            color: 'var(--accent-warm)',
            fontSize: 17,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {node.key}
        </span>
        <div style={{ minWidth: 0, textAlign: 'left' }}>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--accent-warm)',
              textTransform: 'uppercase',
            }}
          >
            {node.title}
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.25,
            }}
          >
            {node.subtitle}
          </p>
        </div>
      </div>
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 'clamp(13px, 1.9vw, 15px)',
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
          textAlign: 'left',
        }}
      >
        {node.body}
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          fontSize: 'clamp(12px, 1.7vw, 14px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          textAlign: 'left',
        }}
      >
        {node.bullets.map((b) => (
          <li key={b} style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--accent-warm)' }}>›</span> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full-width FIN carousel — one card per viewport, centered in section container. */
export default function FinPillarsCarousel() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const steps = POCKET_FIN_NODES;

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const slideWidth = el.offsetWidth;
      if (slideWidth <= 0) return;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setActive(Math.min(steps.length - 1, Math.max(0, idx)));
    },
    [steps.length],
  );

  return (
    <div
      data-pocket-fin-carousel="v2"
      role="region"
      aria-label="The FIN pillars — Future, Investment, Now"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        marginTop: 'clamp(16px, 3vw, 20px)',
        padding: 'clamp(16px, 3vw, 20px) clamp(14px, 2.5vw, 18px) clamp(18px, 3vw, 22px)',
        ...pocketLandingPanelStyle,
        fontFamily: pocketLandingMono,
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontSize: 'clamp(10px, 1.7vw, 12px)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          textAlign: 'center',
        }}
      >
        The FIN pillars: open core → shipped insight
      </p>
      <div
        onScroll={onScroll}
        style={{
          display: 'flex',
          width: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          touchAction: 'pan-x',
          scrollbarWidth: 'thin',
          cursor: 'grab',
        }}
      >
        {steps.map((node, i) => (
          <div
            key={node.key}
            style={{
              flex: '0 0 100%',
              width: '100%',
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              boxSizing: 'border-box',
              padding: '0 2px',
            }}
          >
            <FinStepCard node={node} active={active === i} />
          </div>
        ))}
      </div>
      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}
        >
          {steps.map((node, i) => (
            <span
              key={node.key}
              style={{
                width: active === i ? 24 : 8,
                height: 8,
                borderRadius: 999,
                background:
                  active === i
                    ? 'var(--accent-warm)'
                    : 'color-mix(in srgb, var(--text-secondary) 45%, transparent)',
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
